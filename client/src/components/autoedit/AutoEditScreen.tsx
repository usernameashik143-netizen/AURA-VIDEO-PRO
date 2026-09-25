import React, { useState, useRef } from 'react';
import {
  Wand2,
  UploadCloud,
  CheckCircle2,
  Music,
  Sliders,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Film,
  Play,
  Pause,
  Layers,
  Globe,
  Flame,
  Zap,
  Check,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.js';
import { AspectRatio } from '../../types/index.js';
import { formatDuration } from '../../utils/time.js';

const STYLES = [
  { id: 'Cinematic', label: 'Cinematic', desc: 'Teal & orange grading with dramatic dissolves', icon: Film },
  { id: 'Travel', label: 'Travel', desc: 'Vibrant scenic cuts and adventurous pacing', icon: Globe },
  { id: 'Vlog', label: 'Vlog', desc: 'Natural colors and balanced storytelling', icon: Sliders },
  { id: 'Instagram Reel', label: 'Instagram Reel', desc: '9:16 vertical hook cuts for mobile feeds', icon: Sparkles },
  { id: 'YouTube Shorts', label: 'YouTube Shorts', desc: 'Fast-paced punchy cuts with high retention', icon: Wand2 },
  { id: 'Fashion', label: 'Fashion', desc: 'High-contrast luxury editorial aesthetic', icon: Layers },
  { id: 'Birthday', label: 'Birthday', desc: 'Upbeat celebrations and festive rhythms', icon: Sparkles },
  { id: 'Wedding', label: 'Wedding', desc: 'Soft romantic glow and heartfelt acoustics', icon: Sparkles },
  { id: 'Sports', label: 'Sports', desc: 'High-octane action cuts with impact strobes', icon: Flame },
  { id: 'Fast & Energetic', label: 'Fast & Energetic', desc: 'Ultra-quick cuts matched to high BPM beats', icon: Zap },
  { id: 'Minimal', label: 'Minimal', desc: 'Clean unobtrusive cuts with subtle acoustic tones', icon: Sliders },
];

const TRACKS = [
  { id: 'auto', name: 'Auto Match (AI Recommends)', desc: 'AI selects the best soundtrack for your style', bpm: 120 },
  { id: 'cinematic_horizon', name: 'Cinematic Horizon', desc: 'Orchestral swell & taiko drums (100 BPM)', bpm: 100, url: '/seeds/cinematic_horizon.mp3' },
  { id: 'dramatic_trailer', name: 'Dramatic Trailer', desc: 'Epic brass stabs & cinematic tension (110 BPM)', bpm: 110, url: '/seeds/dramatic_trailer.mp3' },
  { id: 'energetic_reel_beat', name: 'Energetic Reel Beat', desc: 'Club kick, 808 bass & snappy claps (128 BPM)', bpm: 128, url: '/seeds/energetic_reel_beat.mp3' },
  { id: 'chill_travel_breeze', name: 'Chill Travel Breeze', desc: 'Acoustic guitar strum with shaker groove (105 BPM)', bpm: 105, url: '/seeds/chill_travel_breeze.mp3' },
  { id: 'lofi_night_drive', name: 'Lo-Fi Night Drive', desc: 'Boom-bap beat with warm Rhodes piano (82 BPM)', bpm: 82, url: '/seeds/lofi_night_drive.mp3' },
  { id: 'acoustic_joy', name: 'Acoustic Joy', desc: 'Uplifting fingerpicked guitar & cajon (95 BPM)', bpm: 95, url: '/seeds/acoustic_joy.mp3' },
  { id: 'creator_vlog', name: 'Creator Vlog', desc: 'Modern indie pop with clean synth pads (108 BPM)', bpm: 108, url: '/seeds/creator_vlog.mp3' },
  { id: 'documentary_ambient', name: 'Documentary Ambient', desc: 'Atmospheric pads & soft piano (72 BPM)', bpm: 72, url: '/seeds/documentary_ambient.mp3' },
  { id: 'emotional_piano', name: 'Emotional Piano', desc: 'Delicate solo piano with string swells (78 BPM)', bpm: 78, url: '/seeds/emotional_piano.mp3' },
  { id: 'fashion_runway', name: 'Fashion Runway', desc: 'High-fashion electronic pulse & claps (120 BPM)', bpm: 120, url: '/seeds/fashion_runway.mp3' },
  { id: 'none', name: 'No Music', desc: 'Keep original video audio only', bpm: 0 },
];

export const AutoEditScreen: React.FC = () => {
  const {
    mediaLibrary,
    uploadFiles,
    runAIAutoEdit,
    isAnalyzingAI,
    aiProgressStage,
    aiProgressPercent,
  } = useAppStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState('Cinematic');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [targetDuration, setTargetDuration] = useState<number>(30);
  const [selectedBgmId, setSelectedBgmId] = useState<string>('auto');
  const [muteOriginalAudio, setMuteOriginalAudio] = useState<boolean>(true);
  const [bgmVolume, setBgmVolume] = useState<number>(0.85);
  const [isDragging, setIsDragging] = useState(false);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  const videoMedia = mediaLibrary.filter((m) => m.type === 'video');

  const toggleSelectMedia = (id: string) => {
    if (selectedMediaIds.includes(id)) {
      setSelectedMediaIds(selectedMediaIds.filter((item) => item !== id));
    } else {
      setSelectedMediaIds([...selectedMediaIds, id]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const toggleAudioPlay = (track: typeof TRACKS[0]) => {
    if (!track.url) return;
    if (playingTrackId === track.id) {
      audioPreviewRef.current?.pause();
      setPlayingTrackId(null);
    } else {
      if (!audioPreviewRef.current) {
        audioPreviewRef.current = new Audio(track.url);
      } else {
        audioPreviewRef.current.src = track.url;
      }
      audioPreviewRef.current.play().catch(() => {});
      setPlayingTrackId(track.id);
      audioPreviewRef.current.onended = () => setPlayingTrackId(null);
    }
  };

  const handleGenerate = () => {
    const clipsToUse = selectedMediaIds.length > 0 ? selectedMediaIds : videoMedia.map((m) => m.id);
    runAIAutoEdit({
      mediaIds: clipsToUse,
      style: selectedStyle,
      aspectRatio,
      targetDuration,
      selectedBgmId: selectedBgmId === 'auto' ? undefined : selectedBgmId,
      muteOriginalAudio,
      bgmVolume,
    });
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[#09090b] p-6 md:p-10 space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">AI Auto Edit</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            4 simple steps to transform raw footage into an edited video
          </p>
        </div>

        {/* 4-Step Indicator */}
        <div className="flex items-center gap-2 bg-[#121215] border border-zinc-800 p-1.5 rounded-2xl self-start sm:self-auto">
          {[
            { step: 1, label: 'Clips' },
            { step: 2, label: 'Style' },
            { step: 3, label: 'Music' },
            { step: 4, label: 'Generate' },
          ].map(({ step, label }) => (
            <button
              key={step}
              onClick={() => setCurrentStep(step as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                currentStep === step
                  ? 'bg-gradient-to-r from-cyan-300 to-cyan-200 text-zinc-950 shadow-[0_0_10px_rgba(34,211,238,0.25)]'
                  : currentStep > step
                  ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/40'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center text-[10px] font-mono font-bold">
                {step}
              </span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================== */}
      {/* STEP 1: UPLOAD & SELECT CLIPS */}
      {/* ========================================================== */}
      {currentStep === 1 && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Upload Drop Zone */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && uploadFiles(e.target.files)}
            multiple
            accept="video/*"
            className="hidden"
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-8 sm:p-12 rounded-3xl border-2 border-dashed text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-zinc-300 bg-zinc-800/60'
                : 'border-zinc-750 hover:border-zinc-500 bg-[#121215]/60 hover:bg-[#121215]'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto mb-3 text-zinc-200 shadow-sm">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">Upload Your Video Footage</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              Drag and drop MP4, MOV, or WebM video clips here, or click to browse files
            </p>
          </div>

          {/* Media Selection Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold text-white">
                Select Clips ({selectedMediaIds.length > 0 ? selectedMediaIds.length : videoMedia.length} of {videoMedia.length})
              </span>
              <button
                onClick={() => {
                  if (selectedMediaIds.length === videoMedia.length) {
                    setSelectedMediaIds([]);
                  } else {
                    setSelectedMediaIds(videoMedia.map((m) => m.id));
                  }
                }}
                className="text-zinc-400 hover:text-white underline"
              >
                {selectedMediaIds.length === videoMedia.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {videoMedia.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#121215] border border-zinc-800 text-center">
                <p className="text-xs text-zinc-400">No videos uploaded yet. Upload clips above to continue.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {videoMedia.map((item) => {
                  const isSelected =
                    selectedMediaIds.length === 0 || selectedMediaIds.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleSelectMedia(item.id)}
                      className={`p-2.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-zinc-300 bg-zinc-800/80 shadow-sm'
                          : 'border-zinc-800 bg-[#121215] opacity-50 hover:opacity-100'
                      }`}
                    >
                      <div className="aspect-video rounded-xl bg-black overflow-hidden relative mb-2">
                        {item.thumbnailUrl ? (
                          <img src={item.thumbnailUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600">
                            <Film className="w-6 h-6" />
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 text-[9px] font-mono px-1 py-0.5 rounded bg-black/80 text-zinc-200">
                          {formatDuration(item.duration)}
                        </span>
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white text-zinc-950 flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-white truncate">{item.name}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Next Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={() => setCurrentStep(2)}
              disabled={videoMedia.length === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs text-zinc-950 bg-gradient-to-r from-cyan-300 to-cyan-200 hover:from-cyan-200 hover:to-white border border-cyan-400/40 disabled:opacity-40 shadow-[0_0_10px_rgba(34,211,238,0.2)] transition-all"
            >
              <span>Next: Choose Style</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* STEP 2: CHOOSE STYLE */}
      {/* ========================================================== */}
      {currentStep === 2 && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Aspect Ratio & Duration Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Aspect Ratio */}
            <div className="p-4 rounded-2xl bg-[#121215] border border-zinc-800 space-y-2">
              <label className="text-xs font-bold text-zinc-300">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-2">
                {(['16:9', '9:16', '1:1'] as AspectRatio[]).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      aspectRatio === ratio
                        ? 'bg-gradient-to-r from-cyan-300 to-cyan-200 text-zinc-950 shadow-[0_0_8px_rgba(34,211,238,0.2)]'
                        : 'bg-zinc-800 text-zinc-300 hover:text-white'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Duration */}
            <div className="p-4 rounded-2xl bg-[#121215] border border-zinc-800 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-zinc-300">Target Video Length</label>
                <span className="text-xs font-mono font-bold text-white">{targetDuration}s</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[15, 30, 60].map((dur) => (
                  <button
                    key={dur}
                    onClick={() => setTargetDuration(dur)}
                    className={`py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                      targetDuration === dur
                        ? 'bg-gradient-to-r from-cyan-300 to-cyan-200 text-zinc-950 shadow-[0_0_8px_rgba(34,211,238,0.2)]'
                        : 'bg-zinc-800 text-zinc-300 hover:text-white'
                    }`}
                  >
                    {dur}s
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 11 Visual Style Cards */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">Visual Editing Styles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {STYLES.map((style) => {
                const Icon = style.icon;
                const isSelected = selectedStyle === style.id;

                return (
                  <div
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-cyan-500/60 bg-cyan-950/30 shadow-[0_0_16px_rgba(34,211,238,0.1)] scale-[0.99]'
                        : 'border-zinc-800 bg-[#121215] hover:border-zinc-600'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-gradient-to-br from-cyan-300 to-cyan-500 text-zinc-950' : 'bg-zinc-800 text-zinc-300'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white">{style.label}</h4>
                        {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">{style.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Nav Buttons */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs text-zinc-950 bg-gradient-to-r from-cyan-300 to-cyan-200 hover:from-cyan-200 hover:to-white border border-cyan-400/40 shadow-[0_0_10px_rgba(34,211,238,0.2)] transition-all"
            >
              <span>Next: Choose Music</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* STEP 3: CHOOSE MUSIC & AUDIO CONTROLS */}
      {/* ========================================================== */}
      {currentStep === 3 && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Mute Original Video Audio Toggle */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#121215] border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-200">
                {muteOriginalAudio ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-zinc-200" />}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Mute Original Video Audio</h4>
                <p className="text-[11px] text-zinc-400">Removes camera mic hiss, windy noise, and keeps clean BGM</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={muteOriginalAudio}
              onChange={(e) => setMuteOriginalAudio(e.target.checked)}
              className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-zinc-200 cursor-pointer accent-zinc-200"
            />
          </div>

          {/* BGM Volume Slider */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#121215] border border-zinc-800 space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-zinc-300">Background Music Volume</label>
              <span className="text-xs font-mono font-bold text-white">{Math.round(bgmVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1.2}
              step={0.05}
              value={bgmVolume}
              onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-200"
            />
          </div>

          {/* Soundtrack Selection List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">Select Royalty-Free Soundtrack</h3>
            <div className="space-y-2">
              {TRACKS.map((track) => {
                const isSelected = selectedBgmId === track.id;
                const isPlaying = playingTrackId === track.id;

                return (
                  <div
                    key={track.id}
                    onClick={() => setSelectedBgmId(track.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-zinc-300 bg-zinc-850 shadow-sm'
                        : 'border-zinc-800 bg-[#121215] hover:border-zinc-600'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {track.url ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAudioPlay(track);
                          }}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isPlaying ? 'bg-zinc-100 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                          }`}
                        >
                          {isPlaying ? <Pause className="w-4 h-4 text-zinc-950" /> : <Play className="w-4 h-4 ml-0.5 text-zinc-200" />}
                        </button>
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-400">
                          <Music className="w-4 h-4" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{track.name}</div>
                        <div className="text-[11px] text-zinc-400 truncate">{track.desc}</div>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                      isSelected ? 'border-cyan-400 bg-cyan-400 text-zinc-950' : 'border-zinc-700 bg-zinc-900'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Nav Buttons */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs text-zinc-950 bg-gradient-to-r from-cyan-300 to-cyan-200 hover:from-cyan-200 hover:to-white border border-cyan-400/40 shadow-[0_0_10px_rgba(34,211,238,0.2)] transition-all"
            >
              <span>Next: Review &amp; Generate</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* STEP 4: REVIEW & GENERATE */}
      {/* ========================================================== */}
      {currentStep === 4 && (
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* Summary Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#121215] border border-zinc-800 space-y-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
              <Sparkles className="w-4 h-4 text-zinc-300" />
              <span>Review AI Edit Configuration</span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-[10px] uppercase font-mono text-zinc-500">Source Clips</span>
                <div className="text-sm font-bold text-white mt-0.5">
                  {selectedMediaIds.length > 0 ? selectedMediaIds.length : videoMedia.length} Clips Selected
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-[10px] uppercase font-mono text-zinc-500">Editing Style</span>
                <div className="text-sm font-bold text-white mt-0.5">{selectedStyle}</div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-[10px] uppercase font-mono text-zinc-500">Soundtrack</span>
                <div className="text-sm font-bold text-white mt-0.5 truncate">
                  {TRACKS.find((t) => t.id === selectedBgmId)?.name || 'Auto Match'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-[10px] uppercase font-mono text-zinc-500">Audio Muting</span>
                <div className="text-sm font-bold text-white mt-0.5">
                  {muteOriginalAudio ? 'Muted (Clean BGM)' : 'Mixed Original'}
                </div>
              </div>
            </div>

            {/* Big Violet Generate Button (AI Magic Accent) */}
            <button
              onClick={handleGenerate}
              disabled={isAnalyzingAI}
              className="w-full py-4 px-6 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-violet-500 via-purple-500 to-violet-600 hover:from-violet-400 hover:to-purple-500 shadow-[0_0_24px_rgba(167,139,250,0.35)] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 border border-violet-400/30"
            >
              <Wand2 className="w-5 h-5 text-white" />
              <span>{isAnalyzingAI ? 'Generating Video...' : 'GENERATE AI VIDEO NOW'}</span>
            </button>
          </div>

          {/* Back Button */}
          <div className="flex justify-start">
            <button
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Music</span>
            </button>
          </div>
        </div>
      )}

      {/* AI Generating Modal */}
      {isAnalyzingAI && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md p-8 rounded-3xl bg-[#121215] border border-zinc-700 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-600 flex items-center justify-center mx-auto text-white animate-pulse">
              <Wand2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Director Editing Video</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {aiProgressStage || 'Analyzing rhythm beats and matching cuts...'}
            </p>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-purple-400 transition-all duration-300"
                style={{ width: `${aiProgressPercent || 35}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoEditScreen;
