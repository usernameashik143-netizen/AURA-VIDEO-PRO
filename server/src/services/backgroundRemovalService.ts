import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { UPLOADS_DIR, THUMBNAILS_DIR, MEDIA_FILE } from '../config.js';
import { FFmpegService } from './ffmpegService.js';
import { MediaItem } from './seedService.js';

export interface BackgroundRemovalOptions {
  inputPath: string;
  mode?: 'transparent' | 'solid' | 'blur' | 'image';
  color?: string;
  bgImagePath?: string;
  feather?: number;
  iterations?: number;
  scale?: number;
  posX?: number;
  posY?: number;
  bgOpacity?: number;
  maxVideoDuration?: number;
  originalName?: string;
}

export interface BackgroundRemovalResult {
  success: boolean;
  method: string;
  engine?: string;
  mode: string;
  width: number;
  height: number;
  durationSeconds: number;
  outputFile: string;
  filePath?: string;
  fileSize: number;
  url?: string;
  thumbnailUrl?: string;
  mediaId?: string;
  isVideo?: boolean;
  mediaItem?: MediaItem;
  error?: string;
}

export class BackgroundRemovalService {
  static getScriptPath(): string {
    const candidates = [
      path.resolve(process.cwd(), 'server/src/services/bgRemoval.py'),
      path.resolve(process.cwd(), 'src/services/bgRemoval.py'),
      path.resolve(__dirname, 'bgRemoval.py'),
      path.resolve(__dirname, '../src/services/bgRemoval.py'),
      path.resolve(__dirname, '../../src/services/bgRemoval.py'),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
    return candidates[0];
  }

  /**
   * Check environment status for segmentation
   */
  static async checkStatus(): Promise<{
    isAvailable: boolean;
    activeEngine: string;
    engineDescription: string;
    supportedModes: string[];
    hasNeuralModel: boolean;
  }> {
    const scriptPath = this.getScriptPath();
    const scriptExists = fs.existsSync(scriptPath);
    return {
      isAvailable: scriptExists,
      activeEngine: 'rembg Neural AI (u2netp) + OpenCV Computer Vision',
      engineDescription:
        'Dual-pipeline segmentation engine using lightweight Neural U2-Net with edge feathering and OpenCV GrabCut fallback for real-time subject isolation.',
      supportedModes: ['transparent', 'solid', 'blur', 'image'],
      hasNeuralModel: true,
    };
  }

  /**
   * Run background removal on an image or video file
   */
  static async process(options: BackgroundRemovalOptions): Promise<BackgroundRemovalResult> {
    const scriptPath = this.getScriptPath();
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`bgRemoval.py script not found at ${scriptPath}`);
    }
    const {
      inputPath,
      mode = 'transparent',
      color = '#000000',
      bgImagePath,
      feather = 5,
      iterations = 5,
      scale = 1.0,
      posX = 0,
      posY = 0,
      bgOpacity = 1.0,
      maxVideoDuration = 5.0,
      originalName = 'Segmented_Subject',
    } = options;

    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }

    const inputExt = path.extname(inputPath).toLowerCase();
    const isVideo = ['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(inputExt);

    const fileId = `bgrem-${uuidv4().slice(0, 8)}`;
    let outExt = '.jpg';
    if (isVideo) {
      outExt = mode === 'transparent' ? '.webm' : '.mp4';
    } else {
      outExt = mode === 'transparent' ? '.png' : '.jpg';
    }

    const outputFilename = `${fileId}${outExt}`;
    const outputFilePath = path.join(UPLOADS_DIR, outputFilename);

    const args = [
      scriptPath,
      '--input',
      inputPath,
      '--output',
      outputFilePath,
      '--mode',
      mode,
      '--color',
      color,
      '--feather',
      String(feather),
      '--iterations',
      String(iterations),
      '--scale',
      String(scale),
      '--pos-x',
      String(posX),
      '--pos-y',
      String(posY),
      '--bg-opacity',
      String(bgOpacity),
      '--max-video-duration',
      String(maxVideoDuration),
    ];

    if (bgImagePath && fs.existsSync(bgImagePath)) {
      args.push('--bg-image', bgImagePath);
    }

    return new Promise((resolve, reject) => {
      const proc = spawn('python', args);
      let stdoutData = '';
      let stderrData = '';

      proc.stdout.on('data', (chunk) => {
        stdoutData += chunk.toString();
      });

      proc.stderr.on('data', (chunk) => {
        stderrData += chunk.toString();
      });

      proc.on('close', async (code) => {
        if (code !== 0) {
          return reject(
            new Error(`Background removal process exited with code ${code}: ${stderrData || stdoutData}`)
          );
        }

        try {
          const parsed = JSON.parse(stdoutData.trim());
          if (!parsed.success) {
            return reject(new Error(parsed.error || 'Segmentation failed'));
          }

          // Generate thumbnail for the segmented asset
          const thumbFilename = `${fileId}.jpg`;
          const thumbPath = path.join(THUMBNAILS_DIR, thumbFilename);
          try {
            await FFmpegService.generateThumbnail(outputFilePath, thumbPath, 0);
          } catch {
            // fallback: copy if image
            try {
              fs.copyFileSync(outputFilePath, thumbPath);
            } catch {}
          }

          let probeDuration = 5;
          if (isVideo) {
            try {
              const probe = await FFmpegService.probeMedia(outputFilePath);
              probeDuration = probe.duration || 5;
            } catch {}
          }

          // Register in media library
          const newMedia: MediaItem = {
            id: fileId,
            name: `${originalName} (${mode.toUpperCase()})`,
            originalName: `${originalName}${outExt}`,
            type: isVideo ? 'video' : 'image',
            mimeType: isVideo
              ? (outExt === '.webm' ? 'video/webm' : 'video/mp4')
              : (mode === 'transparent' ? 'image/png' : 'image/jpeg'),
            size: parsed.fileSize,
            duration: probeDuration,
            width: parsed.width,
            height: parsed.height,
            fps: 30,
            filePath: outputFilePath,
            url: `/uploads/${outputFilename}`,
            thumbnailUrl: `/thumbnails/${thumbFilename}`,
            createdAt: new Date().toISOString(),
            aspectRatio: parsed.width > parsed.height ? '16:9' : '9:16',
          };

          try {
            const currentMedia: MediaItem[] = fs.existsSync(MEDIA_FILE)
              ? JSON.parse(fs.readFileSync(MEDIA_FILE, 'utf-8'))
              : [];
            currentMedia.unshift(newMedia);
            fs.writeFileSync(MEDIA_FILE, JSON.stringify(currentMedia, null, 2));
          } catch (e) {
            console.warn('Could not save new media item to media.json:', e);
          }

          resolve({
            ...parsed,
            url: `/uploads/${outputFilename}`,
            thumbnailUrl: `/thumbnails/${thumbFilename}`,
            filePath: outputFilePath,
            engine: parsed.method,
            mediaId: fileId,
            isVideo,
            mediaItem: newMedia,
          });
        } catch (err: any) {
          reject(new Error(`Failed to parse segmentation output: ${err.message}. Raw: ${stdoutData}`));
        }
      });

      proc.on('error', (err) => {
        reject(err);
      });
    });
  }
}
