import fs from 'fs';

const fetch = globalThis.fetch;

async function run() {
  console.log('--- TEST: REAL BROWSER WORKFLOW EXPORT ---');
  // 1 video, muted, 100% Energetic Reel BGM, Noir, Film Grain, Vignette
  const payload = {
    title: 'Final_Submission_Browser_Flow',
    aspectRatio: '16:9',
    resolution: '720p',
    fps: 30,
    format: 'mp4',
    quality: 'standard',
    clips: [
      {
        id: 'clip-user-1',
        url: '/uploads/8585dca4-b613-433e-a5de-f980e2a504d5.mp4',
        start: 0,
        trimStart: 0,
        trimEnd: 4,
        duration: 4,
        speed: 1,
        volume: 0,
        isMuted: true,
        filter: 'noir',
        effects: [
          { id: 'eff-grain', type: 'filmgrain', intensity: 50, enabled: true },
          { id: 'eff-vig', type: 'vignette', intensity: 50, enabled: true }
        ]
      }
    ],
    audioTracks: [
      {
        id: 'bgm-user-1',
        url: '/seeds/energetic_reel_beat.mp3',
        start: 0,
        trimStart: 0,
        duration: 4,
        volume: 1.0,
        isMuted: false
      }
    ]
  };

  const res = await fetch('http://localhost:5000/api/render', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  console.log('Render queued:', data);
  const jobId = data.data.jobId;

  while (true) {
    await new Promise(r => setTimeout(r, 800));
    const sRes = await fetch('http://localhost:5000/api/render/status/' + jobId);
    const sData = await sRes.json();
    console.log('Status:', sData.data.status, sData.data.stage, sData.data.progress + '%');
    if (sData.data.status === 'completed') {
      console.log('SUCCESS! Output file:', sData.data.outputFilePath);
      break;
    }
    if (sData.data.status === 'failed') {
      console.error('FAILED:', sData.data.error);
      process.exit(1);
    }
  }
}

run().catch(console.error);
