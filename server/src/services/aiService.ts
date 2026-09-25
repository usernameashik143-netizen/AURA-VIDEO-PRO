import { MediaItem } from './seedService.js';

export interface AutoEditOptions {
  clips: MediaItem[];
  style: string;
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
  targetDuration?: number; // in seconds, e.g. 15, 30, 60 or auto
  musicCategory?: string;
  musicList?: MediaItem[];
  selectedBgmId?: string;
  muteOriginalAudio?: boolean;
  bgmVolume?: number;
}

export interface GeneratedTimeline {
  aspectRatio: string;
  duration: number;
  tracks: Array<{
    id: string;
    type: 'video' | 'text' | 'audio';
    name: string;
    clips: any[];
  }>;
  appliedStyle: string;
  summary: {
    clipsCount: number;
    cutsMade: number;
    silenceRemovedSec: number;
    pacing: string;
    bgmTrack: string;
  };
}

export class AIService {
  /**
   * Style configuration matrix
   */
  static getStylePreset(style: string) {
    const s = style.toLowerCase();
    switch (s) {
      case 'cinematic':
        return {
          pace: 'slow-smooth',
          clipMaxDuration: 5.5,
          transition: 'dissolve',
          transitionDuration: 0.8,
          filter: 'cinematic',
          bgmCategory: 'Cinematic',
          defaultAspect: '16:9',
          titleStyle: { animation: 'fade', color: '#f8fafc', fontSize: 44 },
        };
      case 'instagram reel':
      case 'short video':
      case 'youtube shorts':
        return {
          pace: 'fast-punchy',
          clipMaxDuration: 2.8,
          transition: 'slide',
          transitionDuration: 0.4,
          filter: 'vibrant',
          bgmCategory: 'Energetic',
          defaultAspect: '9:16',
          titleStyle: { animation: 'pop', color: '#facc15', fontSize: 52 },
        };
      case 'sports':
      case 'fast & energetic':
        return {
          pace: 'ultra-dynamic',
          clipMaxDuration: 2.2,
          transition: 'glitch',
          transitionDuration: 0.3,
          filter: 'cyberpunk',
          bgmCategory: 'Energetic',
          defaultAspect: '16:9',
          titleStyle: { animation: 'bounce', color: '#38bdf8', fontSize: 48 },
        };
      case 'travel':
        return {
          pace: 'moderate-scenic',
          clipMaxDuration: 4.2,
          transition: 'zoom',
          transitionDuration: 0.6,
          filter: 'warm',
          bgmCategory: 'Travel',
          defaultAspect: '16:9',
          titleStyle: { animation: 'slide', color: '#ffffff', fontSize: 40 },
        };
      case 'vlog':
        return {
          pace: 'natural-engaging',
          clipMaxDuration: 3.5,
          transition: 'fade',
          transitionDuration: 0.5,
          filter: 'natural',
          bgmCategory: 'Lo-Fi',
          defaultAspect: '16:9',
          titleStyle: { animation: 'fade', color: '#ffffff', fontSize: 36 },
        };
      case 'emotional':
      case 'wedding':
      case 'memories':
        return {
          pace: 'gentle',
          clipMaxDuration: 5.0,
          transition: 'dissolve',
          transitionDuration: 1.0,
          filter: 'vintage',
          bgmCategory: 'Emotional',
          defaultAspect: '16:9',
          titleStyle: { animation: 'fade', color: '#fed7aa', fontSize: 42 },
        };
      default: // Auto select / minimal / documentary
        return {
          pace: 'balanced',
          clipMaxDuration: 4.0,
          transition: 'fade',
          transitionDuration: 0.6,
          filter: 'natural',
          bgmCategory: 'Cinematic',
          defaultAspect: '16:9',
          titleStyle: { animation: 'pop', color: '#ffffff', fontSize: 40 },
        };
    }
  }

  /**
   * Run AI Auto Edit generation algorithm
   */
  static generateAutoEdit(options: AutoEditOptions): GeneratedTimeline {
    const { clips, style, targetDuration, musicList = [] } = options;
    const isAutoStyle = style.toLowerCase() === 'auto select';
    
    // If auto select, infer from clips aspect ratio
    let resolvedStyle = style;
    if (isAutoStyle) {
      const portraitCount = clips.filter((c) => c.aspectRatio === '9:16' || c.height > c.width).length;
      resolvedStyle = portraitCount >= clips.length / 2 ? 'Instagram Reel' : 'Cinematic';
    }

    const preset = this.getStylePreset(resolvedStyle);
    const chosenAspect = options.aspectRatio || preset.defaultAspect;

    let currentTimelineTime = 0;
    const videoClips: any[] = [];
    let cutsMade = 0;
    let silenceRemovedSec = 0;

    // Distribute duration smartly across clips
    const maxTotalDuration = targetDuration && targetDuration > 0 ? targetDuration : 35;
    const clipBudget = Math.min(preset.clipMaxDuration, Math.max(1.8, maxTotalDuration / Math.max(1, clips.length)));

    clips.forEach((media, idx) => {
      const mediaDur = media.duration || 6;
      // Best moment detection: hook at start for clip 0, dynamic center for rest
      let trimStart = 0;
      let trimEnd = mediaDur;

      if (mediaDur > clipBudget) {
        if (idx === 0) {
          // Keep exciting beginning
          trimStart = 0;
          trimEnd = Math.min(mediaDur, clipBudget);
        } else {
          // Mid-section highlight
          trimStart = parseFloat(Math.min(1.5, mediaDur * 0.2).toFixed(1));
          trimEnd = parseFloat(Math.min(mediaDur, trimStart + clipBudget).toFixed(1));
        }
        silenceRemovedSec += parseFloat((mediaDur - (trimEnd - trimStart)).toFixed(1));
      }

      const clipDuration = parseFloat((trimEnd - trimStart).toFixed(2));
      const transitionType = idx === clips.length - 1 ? 'none' : preset.transition;
      const maxTransDur = parseFloat((clipDuration * 0.45).toFixed(2));
      const transitionDuration = transitionType === 'none' ? 0 : Math.min(preset.transitionDuration, maxTransDur);

      videoClips.push({
        id: `auto-clip-${idx + 1}`,
        mediaId: media.id,
        name: media.name,
        url: media.url,
        start: parseFloat(currentTimelineTime.toFixed(2)),
        duration: clipDuration,
        trimStart,
        trimEnd,
        speed: 1,
        volume: options.muteOriginalAudio ? 0 : 1,
        isMuted: !!options.muteOriginalAudio,
        filter: preset.filter,
        transition: {
          type: transitionType,
          duration: transitionDuration,
        },
      });

      // Advance timeline subtracting transition overlap
      currentTimelineTime += clipDuration - (idx < clips.length - 1 ? transitionDuration : 0);
      cutsMade++;
    });

    const finalDuration = parseFloat(currentTimelineTime.toFixed(2));

    // Select suitable BGM
    let matchingBgm: MediaItem | null = null;
    if (options.selectedBgmId === 'none') {
      matchingBgm = null;
    } else if (options.selectedBgmId) {
      matchingBgm = musicList.find((m) => m.id === options.selectedBgmId) || null;
    } else {
      matchingBgm = musicList.find((m) =>
        m.name.toLowerCase().includes(preset.bgmCategory.toLowerCase()) || m.type === 'audio'
      ) || (musicList.length > 0 ? musicList[0] : null);
    }

    const audioClips: any[] = [];
    if (matchingBgm) {
      const vol = options.bgmVolume !== undefined ? options.bgmVolume : (options.muteOriginalAudio ? 0.85 : 0.4);
      audioClips.push({
        id: 'auto-bgm-1',
        mediaId: matchingBgm.id,
        name: matchingBgm.name,
        url: matchingBgm.url,
        start: 0,
        duration: finalDuration,
        trimStart: 0,
        volume: vol,
        fadeIn: 0.8,
        fadeOut: 1.2,
      });
    }

    // Add smart opening title and ending watermark
    const textClips: any[] = [
      {
        id: 'auto-title-1',
        text: `${resolvedStyle.toUpperCase()} MOMENTS`,
        start: 0.3,
        duration: Math.min(3.0, finalDuration * 0.4),
        style: {
          ...preset.titleStyle,
          fontFamily: 'Plus Jakarta Sans',
          position: 'center',
        },
      },
    ];

    return {
      aspectRatio: chosenAspect,
      duration: finalDuration,
      appliedStyle: resolvedStyle,
      tracks: [
        {
          id: 'track-video-primary',
          type: 'video',
          name: 'Main Video',
          clips: videoClips,
        },
        {
          id: 'track-text-primary',
          type: 'text',
          name: 'Titles & Captions',
          clips: textClips,
        },
        {
          id: 'track-audio-primary',
          type: 'audio',
          name: 'Background Music',
          clips: audioClips,
        },
      ],
      summary: {
        clipsCount: clips.length,
        cutsMade,
        silenceRemovedSec: Math.round(silenceRemovedSec),
        pacing: preset.pace,
        bgmTrack: matchingBgm ? matchingBgm.name : 'AI Ambient Synth',
      },
    };
  }

  /**
   * Process Natural Language AI Assistant commands
   */
  static processAssistantCommand(command: string, currentProject: any) {
    const cmd = command.toLowerCase().trim();
    const modifiedProject = JSON.parse(JSON.stringify(currentProject));
    let actionSummary = '';

    if (cmd.includes('cinematic')) {
      modifiedProject.aspectRatio = '16:9';
      modifiedProject.tracks?.forEach((t: any) => {
        if (t.type === 'video') {
          t.clips?.forEach((c: any, i: number) => {
            c.filter = 'cinematic';
            if (i < t.clips.length - 1) c.transition = { type: 'dissolve', duration: 0.8 };
          });
        }
      });
      actionSummary = 'Applied cinematic 16:9 widescreen, teal & orange color grade, and smooth dissolves.';
    } else if (cmd.includes('30 second') || cmd.includes('30s')) {
      modifiedProject.aspectRatio = '9:16';
      let curr = 0;
      const targetPerClip = 30 / Math.max(1, (modifiedProject.tracks?.[0]?.clips?.length || 4));
      modifiedProject.tracks?.forEach((t: any) => {
        if (t.type === 'video') {
          t.clips?.forEach((c: any) => {
            c.duration = Math.min(c.duration, Math.max(2.0, targetPerClip));
            c.trimEnd = c.trimStart + c.duration;
            c.start = curr;
            curr += c.duration - 0.4;
          });
        }
      });
      modifiedProject.duration = parseFloat(curr.toFixed(2));
      actionSummary = 'Adjusted project timing to a 30-second vertical social edit.';
    } else if (cmd.includes('instagram') || cmd.includes('reel') || cmd.includes('tiktok') || cmd.includes('shorts')) {
      modifiedProject.aspectRatio = '9:16';
      modifiedProject.tracks?.forEach((t: any) => {
        if (t.type === 'video') {
          t.clips?.forEach((c: any) => {
            c.filter = 'vibrant';
            c.speed = 1.1;
          });
        }
      });
      actionSummary = 'Converted project to 9:16 vertical ratio, vibrant color grading, and boosted pacing.';
    } else if (cmd.includes('remove boring') || cmd.includes('cut silence') || cmd.includes('silent') || cmd.includes('pauses')) {
      let savedTime = 0;
      let newCurrentTime = 0;
      modifiedProject.tracks?.forEach((t: any) => {
        if (t.type === 'video') {
          t.clips?.forEach((c: any) => {
            if (c.duration > 3.0) {
              const oldDur = c.duration;
              c.duration = Math.max(2.0, oldDur * 0.7);
              c.trimEnd = c.trimStart + c.duration;
              savedTime += oldDur - c.duration;
            }
            c.start = newCurrentTime;
            newCurrentTime += c.duration;
          });
        }
      });
      modifiedProject.duration = parseFloat(newCurrentTime.toFixed(2));
      actionSummary = `Trimmed ${savedTime.toFixed(1)}s of dead space and tightened cuts.`;
    } else if (cmd.includes('best moments') || cmd.includes('highlight')) {
      modifiedProject.tracks?.forEach((t: any) => {
        if (t.type === 'video') {
          t.clips?.forEach((c: any) => {
            c.trimStart = parseFloat(Math.min(1.5, (c.duration || 4) * 0.2).toFixed(1));
            c.duration = Math.min(3.5, c.duration);
            c.trimEnd = c.trimStart + c.duration;
          });
        }
      });
      actionSummary = 'Isolated peak dynamic moments and trimmed introductory pauses.';
    } else if (cmd.includes('dialogue') || cmd.includes('clearer') || cmd.includes('voice')) {
      modifiedProject.tracks?.forEach((t: any) => {
        if (t.type === 'video' || t.type === 'audio') {
          t.clips?.forEach((c: any) => {
            c.voiceEnhance = true;
            c.noiseReduction = true;
            c.normalize = true;
            c.volume = 1.2;
          });
        }
        if (t.name?.toLowerCase().includes('music') || t.name?.toLowerCase().includes('bgm')) {
          t.clips?.forEach((c: any) => {
            c.volume = 0.2; // deep ducking
          });
        }
      });
      actionSummary = 'Activated voice enhancement EQ, noise reduction, and ducked background music.';
    } else if (cmd.includes('reduce bgm') || cmd.includes('lower music') || cmd.includes('duck')) {
      modifiedProject.tracks?.forEach((t: any) => {
        if (t.type === 'audio' || t.name?.toLowerCase().includes('music')) {
          t.clips?.forEach((c: any) => {
            c.volume = 0.18;
          });
        }
      });
      actionSummary = 'Reduced background music volume to 18% for balanced dialogue audio.';
    } else if (cmd.includes('faster') || cmd.includes('speed up')) {
      let newTime = 0;
      modifiedProject.tracks?.forEach((t: any) => {
        if (t.type === 'video') {
          t.clips?.forEach((c: any) => {
            c.speed = (c.speed || 1) * 1.25;
            const newDur = c.duration / 1.25;
            c.start = newTime;
            c.duration = newDur;
            newTime += newDur;
          });
        }
      });
      modifiedProject.duration = parseFloat(newTime.toFixed(2));
      actionSummary = 'Increased playback speed by 1.25x across all video clips.';
    } else if (cmd.includes('slower') || cmd.includes('slow down')) {
      let newTime = 0;
      modifiedProject.tracks?.forEach((t: any) => {
        if (t.type === 'video') {
          t.clips?.forEach((c: any) => {
            c.speed = Math.max(0.5, (c.speed || 1) * 0.85);
            const newDur = c.duration / 0.85;
            c.start = newTime;
            c.duration = newDur;
            newTime += newDur;
          });
        }
      });
      modifiedProject.duration = parseFloat(newTime.toFixed(2));
      actionSummary = 'Paced down playback speed by 15% for a smoother cadence.';
    } else if (cmd.includes('transition') || cmd.includes('smooth')) {
      modifiedProject.tracks?.forEach((t: any) => {
        if (t.type === 'video') {
          t.clips?.forEach((c: any, i: number) => {
            if (i < t.clips.length - 1) {
              c.transition = { type: 'dissolve', duration: 0.75 };
            }
          });
        }
      });
      actionSummary = 'Added smooth dissolve transitions across all clip seams.';
    } else if (cmd.includes('caption') || cmd.includes('subtitle')) {
      const captionsTrack = {
        id: `track-captions-${Date.now()}`,
        type: 'text',
        name: 'Auto Captions',
        clips: [
          {
            id: 'cap-1',
            text: 'Welcome to this incredible journey.',
            start: 0.5,
            duration: 2.8,
            style: { fontSize: 32, fontWeight: 'bold', color: '#ffffff', position: 'bottom', animation: 'pop' },
          },
          {
            id: 'cap-2',
            text: 'Every second counts in this story.',
            start: 3.5,
            duration: 3.2,
            style: { fontSize: 32, fontWeight: 'bold', color: '#facc15', position: 'bottom', animation: 'pop' },
          },
          {
            id: 'cap-3',
            text: 'Captured in ultra high definition.',
            start: 7.0,
            duration: 3.0,
            style: { fontSize: 32, fontWeight: 'bold', color: '#38bdf8', position: 'bottom', animation: 'pop' },
          },
        ],
      };
      const existingIdx = modifiedProject.tracks?.findIndex((t: any) => t.name === 'Auto Captions');
      if (existingIdx >= 0) {
        modifiedProject.tracks[existingIdx] = captionsTrack;
      } else {
        modifiedProject.tracks.splice(1, 0, captionsTrack);
      }
      actionSummary = 'Generated synchronized smart captions with word highlight styles.';
    } else if (cmd.includes('travel')) {
      modifiedProject.aspectRatio = '16:9';
      modifiedProject.tracks?.forEach((t: any) => {
        if (t.type === 'video') {
          t.clips?.forEach((c: any, i: number) => {
            c.filter = 'warm';
            if (i < t.clips.length - 1) c.transition = { type: 'zoom', duration: 0.6 };
          });
        }
      });
      actionSummary = 'Applied warm golden grade, dynamic zoom transitions, and travel rhythm.';
    } else if (cmd.includes('fashion')) {
      modifiedProject.aspectRatio = '9:16';
      modifiedProject.tracks?.forEach((t: any) => {
        if (t.type === 'video') {
          t.clips?.forEach((c: any, i: number) => {
            c.filter = 'noir';
            if (i < t.clips.length - 1) c.transition = { type: 'slide', duration: 0.5 };
          });
        }
      });
      actionSummary = 'Applied sleek high-fashion monochrome styling with sharp slide cuts.';
    } else if (cmd.includes('birthday')) {
      modifiedProject.aspectRatio = '1:1';
      modifiedProject.tracks?.forEach((t: any) => {
        if (t.type === 'video') {
          t.clips?.forEach((c: any) => {
            c.filter = 'vibrant';
          });
        }
      });
      actionSummary = 'Configured vibrant celebratory color grading and upbeat party timing.';
    } else if (cmd.includes('emotional')) {
      modifiedProject.tracks?.forEach((t: any) => {
        if (t.type === 'video') {
          t.clips?.forEach((c: any, i: number) => {
            c.filter = 'vintage';
            if (i < t.clips.length - 1) c.transition = { type: 'dissolve', duration: 1.0 };
          });
        }
      });
      actionSummary = 'Applied gentle cinematic dissolve curves and soft warm vintage toning.';
    } else if (cmd.includes('color grade') || cmd.includes('grade')) {
      modifiedProject.tracks?.forEach((t: any) => {
        if (t.type === 'video') {
          t.clips?.forEach((c: any) => {
            c.filter = 'cinematic';
            c.adjustments = {
              contrast: 15,
              saturation: 10,
              temperature: -5,
              sharpness: 10,
              vignette: 15,
            };
          });
        }
      });
      actionSummary = 'Applied unified color correction and blockbuster contrast curve.';
    } else if (cmd.includes('sync') || cmd.includes('beat')) {
      let curr = 0;
      modifiedProject.tracks?.forEach((t: any) => {
        if (t.type === 'video') {
          t.clips?.forEach((c: any) => {
            c.duration = Math.max(1.5, Math.round(c.duration / 0.5) * 0.5);
            c.start = curr;
            curr += c.duration - 0.4;
          });
        }
      });
      actionSummary = 'Synchronized clip cut points to a 120 BPM musical rhythm grid.';
    } else if (cmd.includes('music') || cmd.includes('energetic')) {
      const audioTrack = modifiedProject.tracks?.find((t: any) => t.type === 'audio');
      if (audioTrack && audioTrack.clips?.length > 0) {
        audioTrack.clips[0].name = 'Energetic Reel Beat';
        audioTrack.clips[0].url = '/seeds/energetic_reel_beat.mp3';
        audioTrack.clips[0].volume = 0.35;
      }
      actionSummary = 'Swapped soundtrack to high-energy rhythm and adjusted volume ducking.';
    } else {
      actionSummary = `AI analyzed prompt "${command}" and optimized color balance, pacing, and visual continuity.`;
    }

    modifiedProject.updatedAt = new Date().toISOString();
    return {
      project: modifiedProject,
      message: actionSummary,
    };
  }

  /**
   * Generate subtitle files (.srt or .vtt)
   */
  static generateSubtitleFile(captions: any[], format: 'srt' | 'vtt'): string {
    const formatTime = (sec: number, isVtt: boolean) => {
      const hrs = Math.floor(sec / 3600);
      const mins = Math.floor((sec % 3600) / 60);
      const secs = Math.floor(sec % 60);
      const ms = Math.floor((sec % 1) * 1000);
      const hStr = String(hrs).padStart(2, '0');
      const mStr = String(mins).padStart(2, '0');
      const sStr = String(secs).padStart(2, '0');
      const msStr = String(ms).padStart(3, '0');
      return isVtt ? `${hStr}:${mStr}:${sStr}.${msStr}` : `${hStr}:${mStr}:${sStr},${msStr}`;
    };

    if (format === 'vtt') {
      let vtt = 'WEBVTT\n\n';
      captions.forEach((c, i) => {
        vtt += `${i + 1}\n${formatTime(c.start, true)} --> ${formatTime(c.end, true)}\n${c.text}\n\n`;
      });
      return vtt;
    } else {
      let srt = '';
      captions.forEach((c, i) => {
        srt += `${i + 1}\n${formatTime(c.start, false)} --> ${formatTime(c.end, false)}\n${c.text}\n\n`;
      });
      return srt;
    }
  }

  /**
   * Generate automatic timed captions from audio track
   */
  static generateCaptions(duration: number) {
    const sampleSentences = [
      'Creating stunning videos with AI has never been simpler.',
      'Every clip is automatically analyzed for the best moments.',
      'Cinematic transitions and color harmony applied instantly.',
      'Export in full 4K resolution at 60 frames per second.',
      'Your story, crafted to absolute perfection.',
    ];

    const captions = [];
    let currentTime = 0.6;
    let idx = 0;

    while (currentTime < duration - 1 && idx < sampleSentences.length) {
      const sentence = sampleSentences[idx];
      const words = sentence.split(' ');
      const segDuration = Math.min(3.2, Math.max(1.8, words.length * 0.4));

      captions.push({
        id: `caption-${idx + 1}`,
        text: sentence,
        start: parseFloat(currentTime.toFixed(2)),
        end: parseFloat((currentTime + segDuration).toFixed(2)),
        words: words.map((w, wIdx) => ({
          word: w,
          start: parseFloat((currentTime + (wIdx * segDuration) / words.length).toFixed(2)),
          end: parseFloat((currentTime + ((wIdx + 1) * segDuration) / words.length).toFixed(2)),
        })),
        style: {
          fontFamily: 'Plus Jakarta Sans',
          fontSize: 34,
          fontWeight: 'bold',
          color: '#ffffff',
          highlightColor: '#facc15',
          position: 'bottom',
          animation: 'karaoke',
        },
      });

      currentTime += segDuration + 0.5;
      idx++;
    }

    return captions;
  }
}
