#!/usr/bin/env python3
"""
Aura Video Pro — Production AI Background Removal Service
Features:
1. Genuine Neural Subject Segmentation (rembg u2netp lightweight ONNX session)
2. Robust Computer Vision GrabCut fallback (cv2.grabCut)
3. Transparent alpha output (RGBA PNG)
4. Solid color background replacement with custom hex
5. Blurred original background bokeh depth
6. Custom library image backdrop composite
7. Controls: Feathering / Edge Softness, Subject Scale, Subject Position, Background Opacity
8. Real frame-by-frame Video Background Removal with original audio preservation
"""

import sys
import os
import json
import argparse
import time
import subprocess
import shutil
import tempfile

# Register MSVC runtime DLL paths for ONNX Runtime on Windows
try:
    if sys.platform == 'win32':
        os.add_dll_directory(sys.prefix)
        scripts_dir = os.path.join(sys.prefix, 'Scripts')
        if os.path.exists(scripts_dir):
            os.add_dll_directory(scripts_dir)
        capi_dir = os.path.join(sys.prefix, 'Lib', 'site-packages', 'onnxruntime', 'capi')
        if os.path.exists(capi_dir):
            os.add_dll_directory(capi_dir)
except Exception:
    pass

def parse_args():
    parser = argparse.ArgumentParser(description="Aura Video Pro Background Removal Engine")
    parser.add_argument("--input", required=True, help="Path to input image or video")
    parser.add_argument("--output", required=True, help="Path to output image or video")
    parser.add_argument("--mode", default="transparent", choices=["transparent", "solid", "color", "blur", "image", "custom_image"], help="Replacement mode")
    parser.add_argument("--color", default="#000000", help="Solid background color in hex (e.g. #000000, #10b981)")
    parser.add_argument("--bg-image", default=None, help="Path to custom replacement background image")
    parser.add_argument("--feather", type=int, default=5, help="Edge feathering radius (0-30)")
    parser.add_argument("--iterations", type=int, default=5, help="Segmentation iterations (3-10)")
    parser.add_argument("--scale", type=float, default=1.0, help="Subject scale multiplier (0.5 - 2.0)")
    parser.add_argument("--pos-x", type=int, default=0, help="Subject X offset in pixels")
    parser.add_argument("--pos-y", type=int, default=0, help="Subject Y offset in pixels")
    parser.add_argument("--bg-opacity", type=float, default=1.0, help="Background opacity (0.0 - 1.0)")
    parser.add_argument("--max-video-duration", type=float, default=5.0, help="Max video duration to process in seconds")
    return parser.parse_args()

def hex_to_bgr(hex_str):
    hex_clean = hex_str.lstrip("#")
    if len(hex_clean) == 3:
        hex_clean = "".join([c*2 for c in hex_clean])
    if len(hex_clean) != 6:
        return (0, 0, 0)
    r = int(hex_clean[0:2], 16)
    g = int(hex_clean[2:4], 16)
    b = int(hex_clean[4:6], 16)
    return (b, g, r)

def is_video_file(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    return ext in [".mp4", ".mov", ".avi", ".mkv", ".webm"]

# Initialize global neural model session once
_REMBG_SESSION = None

def get_rembg_session():
    global _REMBG_SESSION
    if _REMBG_SESSION is not None:
        return _REMBG_SESSION
    try:
        from rembg import new_session
        _REMBG_SESSION = new_session("u2netp")
        return _REMBG_SESSION
    except Exception as e:
        return None

def segment_frame(img, args):
    """
    Generate clean subject mask using u2netp or GrabCut.
    Returns: (mask_uint8, method_used)
    """
    import cv2
    import numpy as np

    h, w = img.shape[:2]
    mask = None
    method_used = "opencv-grabcut"

    # 1. Try neural network segmentation with lightweight u2netp
    session = get_rembg_session()
    if session is not None:
        try:
            from rembg import remove
            from PIL import Image
            # Convert OpenCV BGR to PIL RGB
            rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            pil_img = Image.fromarray(rgb)
            res_pil = remove(pil_img, session=session)
            res_np = np.array(res_pil)
            if len(res_np.shape) == 3 and res_np.shape[2] == 4:
                mask = res_np[:, :, 3]
                method_used = "rembg-u2netp (Neural AI)"
        except Exception:
            mask = None

    # 2. Robust Computer Vision GrabCut fallback
    if mask is None:
        margin_x = max(10, int(w * 0.08))
        margin_y = max(10, int(h * 0.08))
        rect = (margin_x, margin_y, max(1, w - 2 * margin_x), max(1, h - 2 * margin_y))

        grab_mask = np.zeros((h, w), np.uint8)
        bgd_model = np.zeros((1, 65), np.float64)
        fgd_model = np.zeros((1, 65), np.float64)

        iters = max(3, min(args.iterations, 8))
        cv2.grabCut(img, grab_mask, rect, bgd_model, fgd_model, iters, cv2.GC_INIT_WITH_RECT)
        mask = np.where((grab_mask == 2) | (grab_mask == 0), 0, 255).astype("uint8")
        method_used = "opencv-grabcut (Computer Vision)"

    # Apply edge feathering / softness
    feather_radius = max(0, min(args.feather, 31))
    if feather_radius > 0:
        ksize = feather_radius * 2 + 1
        mask = cv2.GaussianBlur(mask, (ksize, ksize), 0)

    return mask, method_used

def composite_frame(img, mask, args):
    """
    Apply background replacement mode (transparent, solid, blur, image),
    including subject scale, offset, and background opacity.
    """
    import cv2
    import numpy as np

    h, w = img.shape[:2]

    # Subject transform: scale and position offset
    scale = max(0.5, min(args.scale, 2.0))
    pos_x = args.pos_x
    pos_y = args.pos_y

    if scale != 1.0 or pos_x != 0 or pos_y != 0:
        new_w = max(10, int(w * scale))
        new_h = max(10, int(h * scale))
        img_scaled = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_LINEAR)
        mask_scaled = cv2.resize(mask, (new_w, new_h), interpolation=cv2.INTER_LINEAR)

        # Place onto canvas of original size (w, h)
        transformed_img = np.zeros((h, w, 3), dtype=np.uint8)
        transformed_mask = np.zeros((h, w), dtype=np.uint8)

        # Calculate bounding placement
        start_x = (w - new_w) // 2 + pos_x
        start_y = (h - new_h) // 2 + pos_y

        src_x1 = max(0, -start_x)
        src_y1 = max(0, -start_y)
        src_x2 = min(new_w, w - start_x)
        src_y2 = min(new_h, h - start_y)

        dst_x1 = max(0, start_x)
        dst_y1 = max(0, start_y)
        dst_x2 = min(w, start_x + new_w)
        dst_y2 = min(h, start_y + new_h)

        if dst_x2 > dst_x1 and dst_y2 > dst_y1 and src_x2 > src_x1 and src_y2 > src_y1:
            transformed_img[dst_y1:dst_y2, dst_x1:dst_x2] = img_scaled[src_y1:src_y2, src_x1:src_x2]
            transformed_mask[dst_y1:dst_y2, dst_x1:dst_x2] = mask_scaled[src_y1:src_y2, src_x1:src_x2]

        img = transformed_img
        mask = transformed_mask

    alpha_norm = mask.astype(float) / 255.0
    alpha_3d = np.dstack([alpha_norm, alpha_norm, alpha_norm])
    bg_alpha = max(0.0, min(args.bg_opacity, 1.0))

    if args.mode == "transparent":
        b, g, r = cv2.split(img)
        return cv2.merge([b, g, r, mask]), True

    elif args.mode in ["solid", "color"]:
        bgr_color = hex_to_bgr(args.color)
        bg_canvas = np.full((h, w, 3), bgr_color, dtype=np.uint8)
        composite = (img.astype(float) * alpha_3d + bg_canvas.astype(float) * ((1.0 - alpha_3d) * bg_alpha)).astype(np.uint8)
        return composite, False

    elif args.mode == "blur":
        blurred_bg = cv2.GaussianBlur(img, (51, 51), 0)
        composite = (img.astype(float) * alpha_3d + blurred_bg.astype(float) * ((1.0 - alpha_3d) * bg_alpha)).astype(np.uint8)
        return composite, False

    elif args.mode in ["image", "custom_image"] and args.bg_image and os.path.exists(args.bg_image):
        bg_img = cv2.imread(os.path.abspath(args.bg_image))
        if bg_img is not None:
            bg_resized = cv2.resize(bg_img, (w, h), interpolation=cv2.INTER_LINEAR)
            composite = (img.astype(float) * alpha_3d + bg_resized.astype(float) * ((1.0 - alpha_3d) * bg_alpha)).astype(np.uint8)
            return composite, False

    # Default: transparent
    b, g, r = cv2.split(img)
    return cv2.merge([b, g, r, mask]), True

def process_video(input_path, output_path, args):
    """
    Process real frame-by-frame video background removal:
    1. Extract frames & audio with FFmpeg
    2. Segment each frame with u2netp/GrabCut
    3. Composite according to mode
    4. Recombine frames with original audio using FFmpeg
    """
    import cv2
    start_time = time.time()
    temp_dir = tempfile.mkdtemp(prefix="aura_vidbg_")

    try:
        frames_in_dir = os.path.join(temp_dir, "in_frames")
        frames_out_dir = os.path.join(temp_dir, "out_frames")
        os.makedirs(frames_in_dir, exist_ok=True)
        os.makedirs(frames_out_dir, exist_ok=True)
        audio_file = os.path.join(temp_dir, "audio.aac")

        # 1. Extract frames (limit to max duration for safety, 15 fps)
        max_dur = args.max_video_duration
        cmd_extract = [
            "ffmpeg", "-y",
            "-t", str(max_dur),
            "-i", input_path,
            "-r", "15",
            os.path.join(frames_in_dir, "frame_%04d.png")
        ]
        subprocess.run(cmd_extract, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

        # 2. Extract audio if present
        has_audio = False
        cmd_audio = [
            "ffmpeg", "-y",
            "-t", str(max_dur),
            "-i", input_path,
            "-vn", "-c:a", "aac",
            audio_file
        ]
        res_audio = subprocess.run(cmd_audio, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if res_audio.returncode == 0 and os.path.exists(audio_file) and os.path.getsize(audio_file) > 100:
            has_audio = True

        # 3. Process each frame sequentially
        frame_files = sorted([f for f in os.listdir(frames_in_dir) if f.endswith(".png")])
        if not frame_files:
            raise Exception("No video frames extracted")

        method_used = "rembg-u2netp"
        sample_w, sample_h = 1280, 720
        is_transparent = False

        for idx, f_name in enumerate(frame_files):
            f_in = os.path.join(frames_in_dir, f_name)
            img = cv2.imread(f_in)
            if img is None:
                continue
            sample_h, sample_w = img.shape[:2]

            mask, method = segment_frame(img, args)
            method_used = method
            comp, is_trans = composite_frame(img, mask, args)
            is_transparent = is_trans

            f_out = os.path.join(frames_out_dir, f"out_{idx+1:04d}.png")
            cv2.imwrite(f_out, comp)

        # 4. Recombine frames with FFmpeg
        is_webm = is_transparent and output_path.lower().endswith(".webm")
        if is_transparent and not is_webm:
            # If transparent MP4 requested, output high-compatibility green screen or keep .mp4 with solid black alpha
            pass

        cmd_assemble = [
            "ffmpeg", "-y",
            "-framerate", "15",
            "-i", os.path.join(frames_out_dir, "out_%04d.png")
        ]

        if has_audio:
            cmd_assemble.extend(["-i", audio_file])

        if is_webm:
            cmd_assemble.extend(["-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", "24"])
        else:
            cmd_assemble.extend(["-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "faster", "-crf", "22"])

        if has_audio:
            cmd_assemble.extend(["-c:a", "aac", "-b:a", "192k", "-shortest"])

        cmd_assemble.append(output_path)
        subprocess.run(cmd_assemble, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

        duration_sec = round(time.time() - start_time, 3)
        file_size = os.path.getsize(output_path) if os.path.exists(output_path) else 0

        result = {
            "success": True,
            "method": f"{method_used} (Video Pipeline)",
            "mode": args.mode,
            "width": sample_w,
            "height": sample_h,
            "durationSeconds": duration_sec,
            "outputFile": output_path,
            "fileSize": file_size,
            "isVideo": True,
            "framesProcessed": len(frame_files),
        }
        print(json.dumps(result))

    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

def main():
    start_time = time.time()
    args = parse_args()

    input_path = os.path.abspath(args.input)
    output_path = os.path.abspath(args.output)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    if not os.path.exists(input_path):
        print(json.dumps({"success": False, "error": f"Input file not found: {input_path}"}))
        sys.exit(1)

    import cv2

    # Check if input is a video file
    if is_video_file(input_path):
        process_video(input_path, output_path, args)
        return

    # Image processing pipeline
    img = cv2.imread(input_path)
    if img is None:
        print(json.dumps({"success": False, "error": f"Failed to decode image from: {input_path}"}))
        sys.exit(1)

    h, w = img.shape[:2]
    mask, method_used = segment_frame(img, args)
    comp, is_transparent = composite_frame(img, mask, args)

    if is_transparent and not output_path.lower().endswith(".png"):
        output_path = os.path.splitext(output_path)[0] + ".png"

    cv2.imwrite(output_path, comp)

    duration_sec = round(time.time() - start_time, 3)
    out_size = os.path.getsize(output_path) if os.path.exists(output_path) else 0

    result = {
        "success": True,
        "method": method_used,
        "mode": args.mode,
        "width": w,
        "height": h,
        "feather": args.feather,
        "scale": args.scale,
        "posX": args.pos_x,
        "posY": args.pos_y,
        "bgOpacity": args.bg_opacity,
        "durationSeconds": duration_sec,
        "outputFile": output_path,
        "fileSize": out_size,
        "isVideo": False,
    }
    print(json.dumps(result))

if __name__ == "__main__":
    main()
