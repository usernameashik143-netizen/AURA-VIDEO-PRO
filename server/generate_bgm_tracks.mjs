import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEEDS_DIR = path.resolve(__dirname, '../../storage/seeds');

if (!fs.existsSync(SEEDS_DIR)) {
  fs.mkdirSync(SEEDS_DIR, { recursive: true });
}

const SAMPLE_RATE = 44100;
const DURATION = 30; // 30 seconds
const TOTAL_SAMPLES = SAMPLE_RATE * DURATION;

// Helper to write standard 16-bit PCM stereo WAV
function writeWavFile(filePath, leftChannel, rightChannel) {
  const bytesPerSample = 2;
  const numChannels = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = SAMPLE_RATE * blockAlign;
  const dataSize = TOTAL_SAMPLES * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // subchunk1size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // audioFormat (1 = PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bytesPerSample * 8, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    // Clamp to -1.0 .. 1.0
    const l = Math.max(-1, Math.min(1, leftChannel[i]));
    const r = Math.max(-1, Math.min(1, rightChannel[i]));
    buffer.writeInt16LE(Math.round(l * 32767), offset);
    buffer.writeInt16LE(Math.round(r * 32767), offset + 2);
    offset += 4;
  }

  fs.writeFileSync(filePath, buffer);
}

// 1. TRACK 1: CINEMATIC HORIZON (Taiko impacts, Sub-bass, Orchestral Strings, Chimes)
function generateCinematicHorizon() {
  const L = new Float32Array(TOTAL_SAMPLES);
  const R = new Float32Array(TOTAL_SAMPLES);
  const bpm = 90;
  const beatSec = 60 / bpm;

  const chords = [
    [110, 130.81, 164.81, 220],
    [87.31, 110, 130.81, 174.61],
    [65.41, 98.00, 130.81, 196.00],
    [98.00, 123.47, 146.83, 196.00],
  ];

  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    const currentBar = Math.floor(t / (beatSec * 4)) % chords.length;
    const chord = chords[currentBar];

    let pad = 0;
    for (let c = 0; c < chord.length; c++) {
      const freq = chord[c];
      const phase = 2 * Math.PI * freq * t;
      const saw = 2 * ((freq * t) % 1) - 1;
      const sin = Math.sin(phase);
      pad += (saw * 0.3 + sin * 0.7) * 0.12;
    }
    const swell = 0.7 + 0.3 * Math.sin(2 * Math.PI * 0.25 * t);
    pad *= swell;

    const barTime = t % (beatSec * 4);
    let drum = 0;
    const hitTimes = [0, beatSec * 2];
    for (const ht of hitTimes) {
      const dt = barTime - ht;
      if (dt >= 0 && dt < 0.6) {
        const drumFreq = 40 + 80 * Math.exp(-dt * 15);
        const drumEnv = Math.exp(-dt * 5);
        drum += Math.sin(2 * Math.PI * drumFreq * dt) * drumEnv * 0.7;
        drum += (Math.random() * 2 - 1) * Math.exp(-dt * 12) * 0.25;
      }
    }

    const arpNoteIdx = Math.floor((t / (beatSec * 0.5)) % 4);
    const arpNotes = [440, 523.25, 659.25, 523.25];
    const arpDt = (t % (beatSec * 0.5));
    const arpEnv = Math.exp(-arpDt * 8);
    const chime = Math.sin(2 * Math.PI * arpNotes[arpNoteIdx] * t) * arpEnv * 0.15;

    L[i] = pad * 0.9 + drum * 0.9 + chime * 0.7;
    R[i] = pad * 0.9 + drum * 0.9 + chime * 0.3;
  }
  return { L, R };
}

// 2. TRACK 2: LO-FI NIGHT DRIVE (Rhodes chords, Boom-Bap Drums, Vinyl crackle)
function generateLofiNightDrive() {
  const L = new Float32Array(TOTAL_SAMPLES);
  const R = new Float32Array(TOTAL_SAMPLES);
  const bpm = 82;
  const beatSec = 60 / bpm;

  const chords = [
    [146.83, 220.00, 261.63, 329.63, 349.23],
    [98.00, 196.00, 246.94, 293.66, 329.63],
    [130.81, 196.00, 246.94, 293.66, 392.00],
    [110.00, 174.61, 220.00, 277.18, 329.63],
  ];

  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    const currentBar = Math.floor(t / (beatSec * 4)) % chords.length;
    const chord = chords[currentBar];

    let piano = 0;
    for (let c = 0; c < chord.length; c++) {
      const f = chord[c];
      const ph = 2 * Math.PI * f * t;
      piano += (Math.sin(ph) + Math.sin(ph * 2) * 0.25 + Math.sin(ph * 3) * 0.08) * 0.08;
    }
    piano *= (0.85 + 0.15 * Math.sin(2 * Math.PI * 4 * t));

    const barTime = t % (beatSec * 4);
    let drum = 0;
    const kickTimes = [0, beatSec * 2.5];
    for (const kt of kickTimes) {
      const dt = barTime - kt;
      if (dt >= 0 && dt < 0.35) {
        const kFreq = 48 + 90 * Math.exp(-dt * 20);
        drum += Math.sin(2 * Math.PI * kFreq * dt) * Math.exp(-dt * 7) * 0.75;
      }
    }
    const snareTimes = [beatSec * 1, beatSec * 3];
    for (const st of snareTimes) {
      const dt = barTime - st;
      if (dt >= 0 && dt < 0.25) {
        drum += Math.sin(2 * Math.PI * 180 * dt) * Math.exp(-dt * 15) * 0.35 + (Math.random() * 2 - 1) * Math.exp(-dt * 12) * 0.45;
      }
    }
    const hatDt = barTime % (beatSec * 0.5);
    if (hatDt < 0.08) {
      drum += (Math.random() * 2 - 1) * Math.exp(-hatDt * 50) * 0.18;
    }

    const bass = Math.sin(2 * Math.PI * (chord[0] * 0.5) * t) * 0.35;
    const vinyl = (Math.random() < 0.003 ? (Math.random() * 2 - 1) * 0.2 : 0);

    L[i] = piano * 0.8 + bass * 0.8 + drum * 0.85 + vinyl;
    R[i] = piano * 0.75 + bass * 0.8 + drum * 0.85 + vinyl;
  }
  return { L, R };
}

// 3. TRACK 3: ENERGETIC REEL BEAT (128 BPM Club Kick, Clap, Open Hat, Synth Hook)
function generateEnergeticReelBeat() {
  const L = new Float32Array(TOTAL_SAMPLES);
  const R = new Float32Array(TOTAL_SAMPLES);
  const bpm = 128;
  const beatSec = 60 / bpm;

  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    const beatTime = t % beatSec;

    let kick = 0;
    if (beatTime < 0.3) {
      const kFreq = 45 + 140 * Math.exp(-beatTime * 30);
      kick = Math.sin(2 * Math.PI * kFreq * beatTime) * Math.exp(-beatTime * 8) * 0.9;
    }

    const barTime = t % (beatSec * 4);
    let clap = 0;
    const clapTimes = [beatSec * 1, beatSec * 3];
    for (const ct of clapTimes) {
      const dt = barTime - ct;
      if (dt >= 0 && dt < 0.2) {
        clap += (Math.random() * 2 - 1) * Math.exp(-dt * 18) * 0.65 + Math.sin(2 * Math.PI * 240 * dt) * Math.exp(-dt * 25) * 0.3;
      }
    }

    let hat = 0;
    const offbeatTime = (t - beatSec * 0.5) % beatSec;
    if (offbeatTime >= 0 && offbeatTime < 0.15) {
      hat = (Math.random() * 2 - 1) * Math.exp(-offbeatTime * 25) * 0.28;
    }

    const bassBar = Math.floor(t / (beatSec * 4)) % 4;
    const bassRoots = [65.41, 77.78, 87.31, 98.00];
    const bFreq = bassRoots[bassBar];
    const rawBass = (2 * ((bFreq * t) % 1) - 1) * 0.25;
    const sidechain = Math.min(1.0, beatTime / 0.25);
    const bass = rawBass * sidechain;

    const sixteenth = beatSec * 0.25;
    const arp16Idx = Math.floor((t / sixteenth) % 8);
    const hookFreqs = [523.25, 622.25, 783.99, 622.25, 932.33, 783.99, 622.25, 783.99];
    const arpDt = t % sixteenth;
    const lead = Math.sin(2 * Math.PI * hookFreqs[arp16Idx] * t) * Math.exp(-arpDt * 14) * 0.22;

    L[i] = kick + clap * 0.9 + hat * 0.8 + bass + lead * 0.8;
    R[i] = kick + clap * 0.9 + hat * 0.8 + bass + lead * 0.5;
  }
  return { L, R };
}

// 4. TRACK 4: CHILL TRAVEL BREEZE (105 BPM Upbeat Acoustic Guitar, Shaker, Melody)
function generateChillTravelBreeze() {
  const L = new Float32Array(TOTAL_SAMPLES);
  const R = new Float32Array(TOTAL_SAMPLES);
  const bpm = 105;
  const beatSec = 60 / bpm;

  const chords = [
    [261.63, 329.63, 392.00, 523.25],
    [196.00, 246.94, 293.66, 392.00],
    [220.00, 261.63, 329.63, 440.00],
    [174.61, 220.00, 261.63, 349.23],
  ];

  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    const currentBar = Math.floor(t / (beatSec * 4)) % chords.length;
    const chord = chords[currentBar];

    const sixteenth = beatSec * 0.25;
    const strumIdx = Math.floor((t / sixteenth) % 16);
    const strumHits = [0, 4, 6, 8, 12, 14];
    let guitar = 0;

    if (strumHits.includes(strumIdx)) {
      const strumDt = t % sixteenth;
      const gEnv = Math.exp(-strumDt * 10);
      for (let s = 0; s < chord.length; s++) {
        guitar += Math.sin(2 * Math.PI * chord[s] * t) * gEnv * 0.12;
      }
    }

    const sDt = t % sixteenth;
    const shaker = (Math.random() * 2 - 1) * Math.exp(-sDt * 45) * 0.15;
    const bass = Math.sin(2 * Math.PI * (chord[0] * 0.5) * t) * 0.3;

    const melStep = Math.floor((t / (beatSec * 0.5)) % 8);
    const melNotes = [523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 392.00];
    const melDt = t % (beatSec * 0.5);
    const melody = Math.sin(2 * Math.PI * melNotes[melStep] * t) * Math.exp(-melDt * 6) * 0.18;

    L[i] = guitar * 0.8 + bass * 0.7 + shaker * 0.7 + melody * 0.7;
    R[i] = guitar * 0.7 + bass * 0.7 + shaker * 0.7 + melody * 0.4;
  }
  return { L, R };
}

async function buildAllTracks() {
  console.log('Generating high-quality, rich musical BGM tracks...');
  const tracks = [
    { filename: 'cinematic_pulse.mp3', fn: generateCinematicHorizon, name: 'Cinematic Horizon' },
    { filename: 'lofi_night_drive.mp3', fn: generateLofiNightDrive, name: 'Lo-Fi Night Drive' },
    { filename: 'energetic_reel_beat.mp3', fn: generateEnergeticReelBeat, name: 'Energetic Reel Beat' },
    { filename: 'chill_travel_breeze.mp3', fn: generateChillTravelBreeze, name: 'Chill Travel Breeze' },
  ];

  for (const tr of tracks) {
    console.log(`Synthesizing ${tr.name}...`);
    const { L, R } = tr.fn();
    const tempWav = path.join(SEEDS_DIR, `temp_${tr.filename}.wav`);
    const finalMp3 = path.join(SEEDS_DIR, tr.filename);

    writeWavFile(tempWav, L, R);
    const ffmpegCmd = `ffmpeg -y -i "${tempWav}" -af "loudnorm=I=-14:TP=-0.5:LRA=7" -c:a mp3 -b:a 192k "${finalMp3}"`;
    execSync(ffmpegCmd, { stdio: 'inherit' });
    fs.unlinkSync(tempWav);
    console.log(`✓ Mastered ${finalMp3} successfully!`);
  }
  console.log('All 4 BGM tracks generated and mastered to professional broadcast loudness!');
}

buildAllTracks().catch(console.error);
