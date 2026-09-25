import React, { useState, useEffect, useRef } from 'react';
import {
  Music,
  Play,
  Pause,
  Plus,
  Volume2,
  Sparkles,
  Clock,
  Radio,
  Sliders,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.js';
import { AudioTrackItem } from '../../types/index.js';
import { formatDuration } from '../../utils/time.js';

const DEFAULT_TRACKS: AudioTrackItem[] = [
  { id: 'audio-1', name: 'Cinematic Horizon Pulse', category: 'Cinematic', duration: 30, url: '/seeds/cinematic_horizon.mp3', artist: 'Aura Studio', bpm: 120 },
  { id: 'audio-2', name: 'Lo-Fi Night Drive', category: 'Lo-Fi', duration: 30, url: '/seeds/lofi_night_drive.mp3', artist: 'Chill Beats', bpm: 85 },
  { id: 'audio-3', name: 'Energetic Reel Beat', category: 'Energetic', duration: 30, url: '/seeds/energetic_reel_beat.mp3', artist: 'BeatMaster', bpm: 140 },
  { id: 'audio-4', name: 'Chill Travel Breeze', category: 'Travel', duration: 30, url: '/seeds/chill_travel_breeze.mp3', artist: 'Aura Acoustic', bpm: 95 },
  { id: 'audio-5', name: 'Emotional Piano Reflection', category: 'Memories', duration: 30, url: '/seeds/emotional_piano.mp3', artist: 'Pianist', bpm: 80 },
  { id: 'audio-6', name: 'Fashion Runway House', category: 'Fashion', duration: 30, url: '/seeds/fashion_runway.mp3', artist: 'Studio House', bpm: 124 },
  { id: 'audio-7', name: 'Creator Vlog Ukulele', category: 'Vlog', duration: 30, url: '/seeds/creator_vlog.mp3', artist: 'Sunny Vibes', bpm: 110 },
  { id: 'audio-8', name: 'Documentary Ambient Pulse', category: 'Documentary', duration: 30, url: '/seeds/documentary_ambient.mp3', artist: 'Soundtrack', bpm: 75 },
  { id: 'audio-9', name: 'Dramatic Trailer Impact', category: 'Cinematic', duration: 30, url: '/seeds/dramatic_trailer.mp3', artist: 'Cinema Score', bpm: 130 },
  { id: 'audio-10', name: 'Acoustic Joy Strum', category: 'Acoustic', duration: 30, url: '/seeds/acoustic_joy.mp3', artist: 'Aura Acoustic', bpm: 100 },
];

export const SoundLibraryScreen: React.FC = () => {
  const {
    audioLibrary,
    audioCategories,
    selectedAudioCategory,
    fetchAudioLibrary,
    fetchAudioCategories,
    setSelectedAudioCategory,
    addAudioToTimeline,
    setActiveSection,
    addToast,
  } = useAppStore();

  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchAudioCategories();
    fetchAudioLibrary();
  }, [fetchAudioCategories, fetchAudioLibrary]);

  const allAvailableTracks = audioLibrary.length > 0 ? audioLibrary : DEFAULT_TRACKS;

  const filteredTracks =
    selectedAudioCategory === 'all'
      ? allAvailableTracks
      : allAvailableTracks.filter((t) => t.category.toLowerCase() === selectedAudioCategory.toLowerCase());

  const validCategories = (audioCategories || []).filter(
    (c: any) => c && c.name && typeof c.name === 'string' && c.name.trim().length > 0
  );

  const categoriesToDisplay =
    validCategories.length > 0
      ? validCategories
      : [
          { id: 'cinematic', name: 'Cinematic', icon: '🎬', count: 2 },
          { id: 'lo-fi', name: 'Lo-Fi', icon: '☕', count: 1 },
          { id: 'energetic', name: 'Energetic', icon: '⚡', count: 1 },
          { id: 'travel', name: 'Travel', icon: '✈️', count: 1 },
          { id: 'memories', name: 'Memories', icon: '🤍', count: 1 },
          { id: 'fashion', name: 'Fashion', icon: '✨', count: 1 },
          { id: 'vlog', name: 'Vlog', icon: '📹', count: 1 },
          { id: 'acoustic', name: 'Acoustic', icon: '🎸', count: 1 },
        ];

  const handleTogglePlay = (track: AudioTrackItem) => {
    if (playingId === track.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = track.url;
        audioRef.current.play().catch((err) => console.warn('Audio play err:', err));
        setPlayingId(track.id);
      }
    }
  };

  const handleAddToTimeline = (track: AudioTrackItem) => {
    addAudioToTimeline(track);
    addToast({
      type: 'success',
      title: 'Music Added!',
      description: `Added "${track.title || track.name}" to your background audio track.`,
    });
    setActiveSection('editor');
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[#070709] text-white p-6 md:p-8 space-y-6 select-none">
      <audio
        ref={audioRef}
        onEnded={() => setPlayingId(null)}
        onError={() => setPlayingId(null)}
      />

      {/* Top Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#0d0d12] via-[#14141d] to-[#0a0a0f] border border-white/10 p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-600/70 text-zinc-200 text-xs font-semibold mb-3">
            <Music className="w-3.5 h-3.5 text-zinc-300" />
            <span>Royalty-Free High-Fidelity BGM</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Sound Library & Beat Sync
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
            10 genuinely distinct acoustic and electronic compositions synthesized with custom harmonics, drum transients, and beat grids. Perfect for rhythm-matched video editing.
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedAudioCategory('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
            selectedAudioCategory === 'all'
              ? 'bg-zinc-800 text-white border-zinc-600 shadow-sm'
              : 'bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:text-zinc-200 hover:border-zinc-700'
          }`}
        >
          All Tracks ({allAvailableTracks.length})
        </button>

        {categoriesToDisplay.map((cat: any) => (
          <button
            key={cat.id}
            onClick={() => setSelectedAudioCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedAudioCategory === cat.id
                ? 'bg-zinc-800 text-white border-zinc-600 shadow-sm'
                : 'bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            {cat.icon} {cat.name} ({cat.count ?? 1})
          </button>
        ))}
      </div>

      {/* Tracks Table / List */}
      <div className="rounded-2xl bg-[#111116] border border-zinc-800 overflow-hidden shadow-xl">
        <div className="divide-y divide-zinc-800/60">
          {filteredTracks.map((track, idx) => {
            const isThisPlaying = playingId === track.id;
            return (
              <div
                key={track.id}
                className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                  isThisPlaying ? 'bg-zinc-900/80 border-l-2 border-white' : 'hover:bg-[#15151c]'
                }`}
              >
                {/* Left: Play/Pause Button + Number */}
                <div className="flex items-center gap-3.5">
                  <span className="text-xs font-mono text-zinc-500 w-4 text-center">
                    {idx + 1}
                  </span>

                  <button
                    onClick={() => handleTogglePlay(track)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      isThisPlaying
                        ? 'bg-white text-black shadow-lg shadow-white/30 scale-105'
                        : 'bg-zinc-800 text-white hover:bg-zinc-700 hover:scale-105'
                    }`}
                  >
                    {isThisPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white hover:text-zinc-200 cursor-pointer transition-colors">
                        {track.title || track.name}
                      </span>
                      {track.bpm && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                          {track.bpm} BPM
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                      <span>{track.category}</span>
                      <span>•</span>
                      <span>{track.artist || 'Aura BGM'}</span>
                    </span>
                  </div>
                </div>

                {/* Middle: Simulated Waveform Bars */}
                <div className="hidden sm:flex items-center gap-1 flex-1 max-w-xs px-4">
                  {(track.peaks || [0.3, 0.6, 0.8, 0.4, 0.7, 0.9, 0.5, 0.8, 0.3, 0.6, 0.7, 0.4, 0.8, 0.5, 0.9, 0.6]).slice(0, 32).map((bar: number, bIdx: number) => (
                    <div
                      key={bIdx}
                      className={`w-1 rounded-full transition-all ${
                        isThisPlaying
                          ? 'bg-white shadow-[0_0_6px_rgba(255,255,255,0.6)]'
                          : 'bg-zinc-750'
                      }`}
                      style={{ height: `${Math.max(4, bar * 24)}px` }}
                    />
                  ))}
                </div>

                {/* Right: Duration & Add Action */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs font-mono text-zinc-400">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{formatDuration(track.duration)}</span>
                  </div>

                  <button
                    onClick={() => handleAddToTimeline(track)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-white hover:text-black text-white text-xs font-bold transition-all shadow-sm"
                    title="Add to background music"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Use Track</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default SoundLibraryScreen;
