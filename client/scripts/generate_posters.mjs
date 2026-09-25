import fs from 'fs';
import path from 'path';

const THUMBNAILS_DIR = 'client/public/thumbnails';
const SERVER_THUMBNAILS_DIR = 'server/storage/thumbnails';

// Ensure directories exist
[THUMBNAILS_DIR, SERVER_THUMBNAILS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Helper for standard poster dimensions (600x800 for 3:4 portrait poster, 800x500 for 16:10 wide)
function createPoster(id, width, height, content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice">
  <defs>
    <filter id="grain-${id}" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" result="noise"/>
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.04 0" result="coloredNoise"/>
      <feComposite operator="in" in2="SourceGraphic"/>
    </filter>
    <linearGradient id="vignette-${id}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#000" stop-opacity="0.2"/>
      <stop offset="40%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.85"/>
    </linearGradient>
  </defs>
  ${content}
  <!-- Vignette & Grain Overlay -->
  <rect width="100%" height="100%" fill="url(#vignette-${id})" />
</svg>`;
}

const posters = {
  // 1. CINEMATIC — Dramatic night skyline, anamorphic Taiko flare, deep blue/violet grade
  'poster-cinematic': createPoster('cinematic', 600, 800, `
    <defs>
      <linearGradient id="bg-cine" x1="0%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stop-color="#050814"/>
        <stop offset="40%" stop-color="#0e172e"/>
        <stop offset="75%" stop-color="#1e153b"/>
        <stop offset="100%" stop-color="#090514"/>
      </linearGradient>
      <radialGradient id="light-cine" cx="50%" cy="45%" r="60%">
        <stop offset="0%" stop-color="#6366f1" stop-opacity="0.45"/>
        <stop offset="40%" stop-color="#3b82f6" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="streak-cine" x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" stop-color="#22d3ee" stop-opacity="0"/>
        <stop offset="30%" stop-color="#38bdf8" stop-opacity="0.8"/>
        <stop offset="50%" stop-color="#ffffff" stop-opacity="1"/>
        <stop offset="70%" stop-color="#818cf8" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#c084fc" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="600" height="800" fill="url(#bg-cine)"/>
    <rect width="600" height="800" fill="url(#light-cine)"/>
    <!-- Stars / Atmospheric Specks -->
    <circle cx="120" cy="140" r="1.5" fill="#fff" opacity="0.6"/>
    <circle cx="480" cy="90" r="1" fill="#fff" opacity="0.8"/>
    <circle cx="280" cy="70" r="1.5" fill="#38bdf8" opacity="0.7"/>
    <circle cx="510" cy="220" r="1" fill="#c084fc" opacity="0.5"/>
    <circle cx="80" cy="260" r="1.5" fill="#fff" opacity="0.5"/>
    <!-- Anamorphic Blue Flare Streak -->
    <rect x="0" y="375" width="600" height="4" fill="url(#streak-cine)" opacity="0.85"/>
    <ellipse cx="300" cy="377" rx="90" ry="24" fill="#38bdf8" opacity="0.35" filter="blur(6px)"/>
    <ellipse cx="300" cy="377" rx="30" ry="8" fill="#ffffff" opacity="0.75" filter="blur(2px)"/>
    <!-- Distant City Skyline Silhouettes -->
    <path d="M40 540 L40 480 L70 480 L70 450 L95 450 L95 500 L130 500 L130 430 L160 430 L160 420 L165 390 L170 420 L170 540 Z" fill="#0b1120" opacity="0.8"/>
    <path d="M190 540 L190 440 L230 440 L230 410 L260 410 L260 540 Z" fill="#0b1120" opacity="0.8"/>
    <path d="M340 540 L340 430 L380 430 L380 400 L395 360 L410 400 L410 460 L440 460 L440 540 Z" fill="#0e172a" opacity="0.9"/>
    <path d="M460 540 L460 470 L490 470 L490 440 L530 440 L530 540 Z" fill="#0b1120" opacity="0.8"/>
    <!-- Overlook Cliff with Solitary Person Silhouette -->
    <path d="M0 640 Q150 560 300 580 Q450 600 600 550 L600 800 L0 800 Z" fill="#030712"/>
    <!-- Person silhouette admiring horizon -->
    <path d="M295 545 C295 538 305 538 305 545 C305 550 295 550 295 545 Z" fill="#030712"/>
    <path d="M292 552 L308 552 L306 580 L294 580 Z" fill="#030712"/>
    <path d="M294 580 L292 605 L297 605 L300 585 L303 605 L308 605 L306 580 Z" fill="#030712"/>
    <!-- Atmospheric fog / mist at base -->
    <ellipse cx="300" cy="580" rx="350" ry="40" fill="#312e81" opacity="0.25" filter="blur(20px)"/>
  `),

  // 2. LOVE STORY — Gentle romantic sunset, warm rose gold embers, couple silhouette
  'poster-love': createPoster('love', 600, 800, `
    <defs>
      <linearGradient id="bg-love" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1e0b16"/>
        <stop offset="35%" stop-color="#4c0527"/>
        <stop offset="65%" stop-color="#831843"/>
        <stop offset="85%" stop-color="#be185d"/>
        <stop offset="100%" stop-color="#450a0a"/>
      </linearGradient>
      <radialGradient id="sun-love" cx="50%" cy="58%" r="45%">
        <stop offset="0%" stop-color="#fef08a" stop-opacity="0.95"/>
        <stop offset="25%" stop-color="#fb7185" stop-opacity="0.6"/>
        <stop offset="60%" stop-color="#e11d48" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="600" height="800" fill="url(#bg-love)"/>
    <rect width="600" height="800" fill="url(#sun-love)"/>
    <!-- Glowing romantic bokeh circles -->
    <circle cx="140" cy="220" rx="45" fill="#f43f5e" opacity="0.18" filter="blur(10px)"/>
    <circle cx="480" cy="180" rx="60" fill="#fb7185" opacity="0.15" filter="blur(15px)"/>
    <circle cx="220" cy="380" rx="25" fill="#fef08a" opacity="0.3" filter="blur(6px)"/>
    <circle cx="390" cy="330" rx="35" fill="#fda4af" opacity="0.25" filter="blur(8px)"/>
    <!-- Setting sun orb -->
    <circle cx="300" cy="460" r="65" fill="#fff1f2" opacity="0.85" filter="blur(3px)"/>
    <!-- Horizon water shimmer reflection -->
    <rect x="0" y="520" width="600" height="280" fill="#2a0614"/>
    <path d="M260 520 L340 520 L360 620 L240 620 Z" fill="#fda4af" opacity="0.3" filter="blur(12px)"/>
    <!-- Couple silhouette by the shoreline -->
    <path d="M0 600 Q300 580 600 600 L600 800 L0 800 Z" fill="#0f0207"/>
    <!-- Man & Woman close silhouette -->
    <circle cx="288" cy="520" r="9" fill="#0f0207"/>
    <circle cx="308" cy="524" r="8" fill="#0f0207"/>
    <path d="M278 535 C278 528 298 528 298 535 L295 590 L280 590 Z" fill="#0f0207"/>
    <path d="M300 537 C300 531 318 531 318 537 L315 590 L298 590 Z" fill="#0f0207"/>
    <!-- Heartfelt warm ambient rim -->
    <ellipse cx="300" cy="520" rx="50" ry="50" fill="#fb7185" opacity="0.2" filter="blur(14px)"/>
  `),

  // 3. TRAVEL DIARIES — Sun-drenched coastal highway, winding mountain road, azure sea
  'poster-travel': createPoster('travel', 600, 800, `
    <defs>
      <linearGradient id="bg-travel" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#082f49"/>
        <stop offset="35%" stop-color="#0369a1"/>
        <stop offset="60%" stop-color="#38bdf8"/>
        <stop offset="78%" stop-color="#fbbf24"/>
        <stop offset="100%" stop-color="#b45309"/>
      </linearGradient>
      <radialGradient id="sun-travel" cx="50%" cy="62%" r="40%">
        <stop offset="0%" stop-color="#fffbeb" stop-opacity="1"/>
        <stop offset="30%" stop-color="#fef08a" stop-opacity="0.8"/>
        <stop offset="70%" stop-color="#f59e0b" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="600" height="800" fill="url(#bg-travel)"/>
    <rect width="600" height="800" fill="url(#sun-travel)"/>
    <!-- Majestic Alpine Mountain Peaks in background -->
    <polygon points="60,500 170,320 280,500" fill="#0c4a6e" opacity="0.6"/>
    <polygon points="170,320 210,380 250,500 170,500" fill="#075985" opacity="0.7"/>
    <polygon points="220,500 350,280 480,500" fill="#082f49" opacity="0.85"/>
    <polygon points="350,280 390,340 440,500 350,500" fill="#0c4a6e" opacity="0.9"/>
    <!-- Snow peak highlight -->
    <polygon points="350,280 335,310 350,305 365,315" fill="#ffffff" opacity="0.9"/>
    <polygon points="170,320 158,342 170,338 182,346" fill="#ffffff" opacity="0.8"/>
    <!-- Coastal cliffs & Winding Highway -->
    <path d="M0 500 Q300 480 600 500 L600 800 L0 800 Z" fill="#1e293b"/>
    <!-- Winding road ribbon -->
    <path d="M-20 800 Q150 720 250 630 T360 550 T410 500" fill="none" stroke="#334155" stroke-width="48" stroke-linecap="round"/>
    <path d="M-20 800 Q150 720 250 630 T360 550 T410 500" fill="none" stroke="#cbd5e1" stroke-width="2.5" stroke-dasharray="14 10"/>
    <!-- Traveler vintage camper / SUV silhouette -->
    <rect x="235" y="605" width="45" height="26" rx="4" fill="#0f172a"/>
    <circle cx="245" cy="632" r="6" fill="#020617"/>
    <circle cx="270" cy="632" r="6" fill="#020617"/>
    <!-- Warm amber road glow -->
    <ellipse cx="255" cy="620" rx="60" ry="25" fill="#f59e0b" opacity="0.3" filter="blur(15px)"/>
  `),

  // 4. DARK AESTHETIC — Noir portrait silhouette, royal purple + crimson edge highlights
  'poster-dark': createPoster('dark', 600, 800, `
    <defs>
      <linearGradient id="bg-dark" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#050508"/>
        <stop offset="45%" stop-color="#0c0a17"/>
        <stop offset="80%" stop-color="#1e0b24"/>
        <stop offset="100%" stop-color="#060208"/>
      </linearGradient>
      <linearGradient id="rim-purple" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#c084fc"/>
        <stop offset="100%" stop-color="#6b21a8"/>
      </linearGradient>
      <linearGradient id="rim-crimson" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#f87171"/>
        <stop offset="100%" stop-color="#991b1b"/>
      </linearGradient>
    </defs>
    <rect width="600" height="800" fill="url(#bg-dark)"/>
    <!-- Volumetric light shaft -->
    <polygon points="180,0 260,0 420,800 280,800" fill="#a855f7" opacity="0.08" filter="blur(25px)"/>
    <!-- Cinematic Portrait Silhouette -->
    <path d="M220 300 C220 220 380 220 380 300 C380 360 360 400 360 440 L460 520 L480 800 L120 800 L140 520 L240 440 C240 400 220 360 220 300 Z" fill="#09090d"/>
    <!-- Neon royal purple rim light along left shoulder & head -->
    <path d="M220 300 C220 220 300 220 300 220" fill="none" stroke="url(#rim-purple)" stroke-width="4" filter="blur(1px)"/>
    <path d="M220 300 C220 360 240 400 240 440 L140 520 L120 800" fill="none" stroke="url(#rim-purple)" stroke-width="3.5" filter="blur(1.5px)"/>
    <!-- Neon crimson rim light along right cheek & shoulder -->
    <path d="M300 220 C380 220 380 300 380 300 C380 360 360 400 360 440 L460 520 L480 800" fill="none" stroke="url(#rim-crimson)" stroke-width="3" filter="blur(1.5px)"/>
    <!-- Sleek sunglasses specular bar -->
    <rect x="250" y="295" width="45" height="12" rx="3" fill="#ffffff" opacity="0.9" filter="blur(0.5px)"/>
    <rect x="305" y="295" width="45" height="12" rx="3" fill="#ffffff" opacity="0.9" filter="blur(0.5px)"/>
    <!-- Ambient moody bottom smoke -->
    <ellipse cx="300" cy="760" rx="300" ry="70" fill="#581c87" opacity="0.25" filter="blur(30px)"/>
  `),

  // 5. NATURE ESCAPE — Misty emerald pine forest, alpine glacial lake, soaring bird
  'poster-nature': createPoster('nature', 600, 800, `
    <defs>
      <linearGradient id="bg-nature" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#022c22"/>
        <stop offset="30%" stop-color="#064e3b"/>
        <stop offset="60%" stop-color="#0f766e"/>
        <stop offset="85%" stop-color="#115e59"/>
        <stop offset="100%" stop-color="#042f2e"/>
      </linearGradient>
      <radialGradient id="mist-nature" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#99f6e4" stop-opacity="0.35"/>
        <stop offset="60%" stop-color="#14b8a6" stop-opacity="0.1"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="600" height="800" fill="url(#bg-nature)"/>
    <rect width="600" height="800" fill="url(#mist-nature)"/>
    <!-- Dramatic mountain ridges in mist -->
    <path d="M0 380 L180 230 L360 360 L600 180 L600 500 L0 500 Z" fill="#042f2e" opacity="0.5"/>
    <path d="M0 430 L240 310 L450 420 L600 290 L600 560 L0 560 Z" fill="#022c22" opacity="0.75"/>
    <!-- Fog layer -->
    <ellipse cx="300" cy="410" rx="320" ry="30" fill="#ccfbf1" opacity="0.22" filter="blur(15px)"/>
    <!-- Layered Pine Forest Silhouettes -->
    <path d="M20 580 L40 500 L60 580 L90 480 L120 580 L160 510 L200 580 L250 490 L300 580 L350 480 L400 580 L460 500 L510 580 L560 490 L600 580 L600 800 L0 800 Z" fill="#021c17"/>
    <!-- Foreground towering pine trees -->
    <polygon points="80,420 50,680 110,680" fill="#011410"/>
    <polygon points="80,480 40,740 120,740" fill="#011410"/>
    <polygon points="520,380 480,680 560,680" fill="#011410"/>
    <polygon points="520,450 470,750 570,750" fill="#011410"/>
    <!-- Soaring eagle silhouette -->
    <path d="M280 200 Q295 190 310 200 Q325 190 340 200 Q310 208 280 200 Z" fill="#022c22"/>
    <!-- Tranquil glacial lake reflection at base -->
    <rect x="0" y="680" width="600" height="120" fill="#042f2e"/>
    <ellipse cx="300" cy="740" rx="200" ry="30" fill="#2dd4bf" opacity="0.18" filter="blur(16px)"/>
  `),

  // 6. SLOW MOTION — Prismatic fluid ribbons, droplet ripples, violet & cyan glow
  'poster-slowmo': createPoster('slowmo', 600, 800, `
    <defs>
      <linearGradient id="bg-slow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0a0518"/>
        <stop offset="35%" stop-color="#2e1065"/>
        <stop offset="70%" stop-color="#164e63"/>
        <stop offset="100%" stop-color="#083344"/>
      </linearGradient>
      <linearGradient id="ribbon-glow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#c084fc"/>
        <stop offset="50%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#2dd4bf"/>
      </linearGradient>
    </defs>
    <rect width="600" height="800" fill="url(#bg-slow)"/>
    <!-- Suspended fluid droplet ripples frozen in time -->
    <ellipse cx="300" cy="400" rx="220" ry="80" fill="none" stroke="#38bdf8" stroke-width="2" opacity="0.4"/>
    <ellipse cx="300" cy="400" rx="160" ry="58" fill="none" stroke="#a855f7" stroke-width="2.5" opacity="0.6"/>
    <ellipse cx="300" cy="400" rx="90" ry="32" fill="none" stroke="#22d3ee" stroke-width="3" opacity="0.8"/>
    <!-- Flowing silk ribbon suspended in mid-air -->
    <path d="M60 250 C180 180, 220 550, 340 380 C420 280, 480 600, 560 480" fill="none" stroke="url(#ribbon-glow)" stroke-width="24" stroke-linecap="round" opacity="0.85" filter="drop-shadow(0 0 18px rgba(56,189,248,0.5))"/>
    <path d="M60 250 C180 180, 220 550, 340 380 C420 280, 480 600, 560 480" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.9"/>
    <!-- Floating splash beads -->
    <circle cx="280" cy="310" r="7" fill="#ffffff" opacity="0.9" filter="drop-shadow(0 0 6px #38bdf8)"/>
    <circle cx="340" cy="270" r="5" fill="#c084fc" opacity="0.85"/>
    <circle cx="380" cy="350" r="8" fill="#38bdf8" opacity="0.85"/>
    <circle cx="210" cy="440" r="6" fill="#2dd4bf" opacity="0.75"/>
    <!-- Central suspended impact droplet spike -->
    <path d="M295 400 Q300 320 300 280 Q300 320 305 400 Z" fill="#ffffff" filter="drop-shadow(0 0 10px #38bdf8)"/>
  `),

  // 7. FASHION REEL — High-contrast editorial model silhouette, magenta studio rim, luxury spotlight
  'poster-fashion': createPoster('fashion', 600, 800, `
    <defs>
      <linearGradient id="bg-fashion" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#140612"/>
        <stop offset="40%" stop-color="#2d0628"/>
        <stop offset="75%" stop-color="#4a044e"/>
        <stop offset="100%" stop-color="#110314"/>
      </linearGradient>
      <radialGradient id="spot-fashion" cx="50%" cy="35%" r="45%">
        <stop offset="0%" stop-color="#f472b6" stop-opacity="0.4"/>
        <stop offset="60%" stop-color="#c026d3" stop-opacity="0.15"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="600" height="800" fill="url(#bg-fashion)"/>
    <rect width="600" height="800" fill="url(#spot-fashion)"/>
    <!-- Studio backdrop geometry lines -->
    <line x1="120" y1="0" x2="120" y2="800" stroke="#f472b6" stroke-width="1" opacity="0.15"/>
    <line x1="480" y1="0" x2="480" y2="800" stroke="#f472b6" stroke-width="1" opacity="0.15"/>
    <!-- High-fashion model runway pose silhouette -->
    <path d="M300 180 C280 180 280 215 300 215 C320 215 320 180 300 180 Z" fill="#090209"/>
    <!-- Elegant neck & angular high-fashion dress -->
    <path d="M295 215 L305 215 L315 250 L345 320 L370 450 L390 620 L420 800 L180 800 L210 620 L230 450 L255 320 L285 250 Z" fill="#090209"/>
    <!-- Haute-couture rim light (hot pink) -->
    <path d="M315 250 L345 320 L370 450 L390 620 L420 800" fill="none" stroke="#f43f5e" stroke-width="3" filter="blur(1px)"/>
    <path d="M285 250 L255 320 L230 450 L210 620 L180 800" fill="none" stroke="#e879f9" stroke-width="2.5" filter="blur(1px)"/>
    <!-- Runway reflection floor -->
    <rect x="0" y="700" width="600" height="100" fill="#18041d"/>
    <ellipse cx="300" cy="740" rx="140" ry="30" fill="#f43f5e" opacity="0.3" filter="blur(18px)"/>
  `),

  // 8. SPORTS MOTION — High-energy stadium, electric orange & cyan speed streaks, dynamic athlete
  'poster-sports': createPoster('sports', 600, 800, `
    <defs>
      <linearGradient id="bg-sports" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f0702"/>
        <stop offset="35%" stop-color="#431407"/>
        <stop offset="70%" stop-color="#7c2d12"/>
        <stop offset="100%" stop-color="#172554"/>
      </linearGradient>
      <linearGradient id="streak-orange" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffedd5"/>
        <stop offset="40%" stop-color="#fb923c"/>
        <stop offset="100%" stop-color="#ea580c"/>
      </linearGradient>
    </defs>
    <rect width="600" height="800" fill="url(#bg-sports)"/>
    <!-- Stadium Floodlight Beams -->
    <polygon points="50,0 120,0 260,800 120,800" fill="#ffedd5" opacity="0.12" filter="blur(20px)"/>
    <polygon points="550,0 480,0 340,800 480,800" fill="#38bdf8" opacity="0.1" filter="blur(20px)"/>
    <!-- Dynamic diagonal speed streaks -->
    <line x1="80" y1="180" x2="380" y2="480" stroke="url(#streak-orange)" stroke-width="6" stroke-linecap="round" opacity="0.85"/>
    <line x1="140" y1="140" x2="480" y2="480" stroke="#38bdf8" stroke-width="4" stroke-linecap="round" opacity="0.75"/>
    <line x1="40" y1="260" x2="280" y2="500" stroke="#fbbf24" stroke-width="3" stroke-linecap="round" opacity="0.9"/>
    <!-- Powerful sprinter / jumper silhouette -->
    <circle cx="340" cy="300" r="14" fill="#0b0603"/>
    <path d="M330 315 L360 350 L380 340 L430 320 L425 335 L385 365 L360 410 L395 480 L440 500 L435 515 L380 495 L345 425 L320 460 L290 530 L275 520 L305 445 L325 390 L315 360 L275 375 L260 365 L310 335 Z" fill="#0b0603"/>
    <!-- High-impact orange ground glow -->
    <ellipse cx="340" cy="520" rx="180" ry="35" fill="#f97316" opacity="0.4" filter="blur(20px)"/>
  `),

  // 9. BIRTHDAY SPECIAL — Joyous party warm gold & pink celebration bokeh, confetti glints
  'poster-birthday': createPoster('birthday', 600, 800, `
    <defs>
      <linearGradient id="bg-bday" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1e0a2e"/>
        <stop offset="35%" stop-color="#4a044e"/>
        <stop offset="70%" stop-color="#831843"/>
        <stop offset="100%" stop-color="#311306"/>
      </linearGradient>
    </defs>
    <rect width="600" height="800" fill="url(#bg-bday)"/>
    <!-- Floating celebration bokeh spheres -->
    <circle cx="160" cy="200" r="60" fill="#f43f5e" opacity="0.22" filter="blur(16px)"/>
    <circle cx="440" cy="260" r="75" fill="#f59e0b" opacity="0.25" filter="blur(20px)"/>
    <circle cx="280" cy="340" r="90" fill="#ec4899" opacity="0.2" filter="blur(24px)"/>
    <circle cx="360" cy="160" r="45" fill="#fbbf24" opacity="0.3" filter="blur(12px)"/>
    <!-- Colorful floating confetti specks -->
    <rect x="180" y="140" width="8" height="12" rx="2" fill="#38bdf8" transform="rotate(25 180 140)"/>
    <rect x="420" y="190" width="9" height="14" rx="2" fill="#f43f5e" transform="rotate(-35 420 190)"/>
    <rect x="250" y="240" width="7" height="10" rx="2" fill="#fbbf24" transform="rotate(45 250 240)"/>
    <rect x="330" y="110" width="8" height="12" rx="2" fill="#a855f7" transform="rotate(15 330 110)"/>
    <rect x="470" y="320" width="10" height="14" rx="2" fill="#34d399" transform="rotate(-20 470 320)"/>
    <rect x="120" y="300" width="8" height="11" rx="2" fill="#fb7185" transform="rotate(50 120 300)"/>
    <!-- Festive Cake & Candles silhouette -->
    <rect x="200" y="520" width="200" height="90" rx="8" fill="#180424"/>
    <rect x="230" y="440" width="140" height="80" rx="6" fill="#180424"/>
    <!-- Candle glow flame -->
    <ellipse cx="300" cy="405" rx="7" ry="15" fill="#fef08a" filter="drop-shadow(0 0 10px #f59e0b)"/>
    <!-- Champagne warmth at base -->
    <ellipse cx="300" cy="640" rx="220" ry="40" fill="#fbbf24" opacity="0.3" filter="blur(20px)"/>
  `),

  // 10. WEDDING MOMENTS — Champagne gold, cathedral soft focus, ivory floral elegance
  'poster-wedding': createPoster('wedding', 600, 800, `
    <defs>
      <linearGradient id="bg-wed" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1c130d"/>
        <stop offset="35%" stop-color="#3d2616"/>
        <stop offset="70%" stop-color="#593b20"/>
        <stop offset="100%" stop-color="#140c06"/>
      </linearGradient>
      <radialGradient id="sun-wed" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="#fef3c7" stop-opacity="0.6"/>
        <stop offset="50%" stop-color="#fde68a" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="600" height="800" fill="url(#bg-wed)"/>
    <rect width="600" height="800" fill="url(#sun-wed)"/>
    <!-- Elegant archway floral outline -->
    <path d="M140 700 L140 380 Q300 240 460 380 L460 700" fill="none" stroke="#d4af37" stroke-width="3" opacity="0.4"/>
    <!-- Soft golden sparkles -->
    <circle cx="200" cy="320" r="3" fill="#fff" opacity="0.8" filter="blur(1px)"/>
    <circle cx="400" cy="300" r="2.5" fill="#fff" opacity="0.85" filter="blur(0.5px)"/>
    <circle cx="300" cy="260" r="3.5" fill="#fde68a" opacity="0.9"/>
    <!-- Bride & Groom silhouette inside floral arch -->
    <path d="M280 430 C280 422 292 422 292 430 L292 470 L280 470 Z" fill="#0c0703"/>
    <path d="M308 433 C308 426 320 426 320 433 L320 470 L308 470 Z" fill="#0c0703"/>
    <path d="M270 470 L300 470 L295 620 L275 620 Z" fill="#0c0703"/>
    <path d="M300 470 L330 470 L360 620 L295 620 Z" fill="#0c0703"/>
    <!-- Veil flowing breeze -->
    <path d="M312 430 Q360 480 390 560" fill="none" stroke="#fef9c3" stroke-width="1.5" opacity="0.7"/>
    <!-- Warm champagne ground reflection -->
    <ellipse cx="300" cy="620" rx="160" ry="25" fill="#d4af37" opacity="0.3" filter="blur(18px)"/>
  `),

  // 11. URBAN BEAT SYNC — Electric neon equalizer pulse, sub-bass concentric rings
  'poster-beatsync': createPoster('beatsync', 600, 800, `
    <defs>
      <linearGradient id="bg-beat" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#070714"/>
        <stop offset="40%" stop-color="#13092c"/>
        <stop offset="80%" stop-color="#1e1b4b"/>
        <stop offset="100%" stop-color="#020617"/>
      </linearGradient>
    </defs>
    <rect width="600" height="800" fill="url(#bg-beat)"/>
    <!-- Concentric bass shockwaves -->
    <circle cx="300" cy="420" r="70" fill="none" stroke="#818cf8" stroke-width="2" opacity="0.8"/>
    <circle cx="300" cy="420" r="130" fill="none" stroke="#c084fc" stroke-width="1.8" opacity="0.6"/>
    <circle cx="300" cy="420" r="200" fill="none" stroke="#22d3ee" stroke-width="1.5" opacity="0.4"/>
    <circle cx="300" cy="420" r="280" fill="none" stroke="#ec4899" stroke-width="1" opacity="0.25"/>
    <!-- Vertical Equalizer Visualizer Bars -->
    <g fill="#22d3ee" opacity="0.85">
      <rect x="140" y="380" width="12" height="80" rx="4"/>
      <rect x="165" y="320" width="12" height="140" rx="4"/>
      <rect x="190" y="270" width="12" height="190" rx="4"/>
      <rect x="215" y="350" width="12" height="110" rx="4"/>
      <rect x="240" y="220" width="12" height="240" rx="4" fill="#818cf8"/>
      <rect x="265" y="180" width="12" height="280" rx="4" fill="#a855f7"/>
      <rect x="290" y="140" width="12" height="320" rx="4" fill="#c084fc"/>
      <rect x="315" y="160" width="12" height="300" rx="4" fill="#a855f7"/>
      <rect x="340" y="230" width="12" height="230" rx="4" fill="#818cf8"/>
      <rect x="365" y="300" width="12" height="160" rx="4"/>
      <rect x="390" y="260" width="12" height="200" rx="4"/>
      <rect x="415" y="340" width="12" height="120" rx="4"/>
      <rect x="440" y="390" width="12" height="70" rx="4"/>
    </g>
    <!-- Center pulse core -->
    <circle cx="300" cy="420" r="25" fill="#ffffff" filter="drop-shadow(0 0 25px #22d3ee)"/>
  `),

  // 12. FESTIVAL LIGHTS — Night celebration, shimmering bokeh lanterns, golden warmth
  'poster-festival': createPoster('festival', 600, 800, `
    <defs>
      <linearGradient id="bg-fest" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0a0512"/>
        <stop offset="40%" stop-color="#210826"/>
        <stop offset="70%" stop-color="#451229"/>
        <stop offset="100%" stop-color="#14060b"/>
      </linearGradient>
    </defs>
    <rect width="600" height="800" fill="url(#bg-fest)"/>
    <!-- Shimmering night festival bokeh orbs -->
    <circle cx="120" cy="160" r="55" fill="#f59e0b" opacity="0.3" filter="blur(16px)"/>
    <circle cx="480" cy="180" r="70" fill="#f43f5e" opacity="0.25" filter="blur(20px)"/>
    <circle cx="280" cy="260" r="85" fill="#fbbf24" opacity="0.2" filter="blur(24px)"/>
    <circle cx="380" cy="380" r="50" fill="#ec4899" opacity="0.35" filter="blur(14px)"/>
    <!-- Floating sky lanterns -->
    <polygon points="170,360 190,360 185,385 175,385" fill="#fef08a" opacity="0.85" filter="drop-shadow(0 0 10px #f59e0b)"/>
    <polygon points="310,240 335,240 330,270 315,270" fill="#fef08a" opacity="0.9" filter="drop-shadow(0 0 14px #f59e0b)"/>
    <polygon points="430,310 450,310 445,335 435,335" fill="#fef08a" opacity="0.85" filter="drop-shadow(0 0 10px #f59e0b)"/>
    <!-- Festival crowd silhouette at base with raised hands -->
    <path d="M0 640 Q150 620 300 640 Q450 620 600 640 L600 800 L0 800 Z" fill="#080206"/>
    <circle cx="180" cy="620" r="10" fill="#080206"/>
    <circle cx="240" cy="615" r="11" fill="#080206"/>
    <circle cx="300" cy="610" r="12" fill="#080206"/>
    <circle cx="360" cy="615" r="11" fill="#080206"/>
    <circle cx="420" cy="620" r="10" fill="#080206"/>
  `),

  // 13. VLOG / URBAN LIFESTYLE — Golden hour street skyline, creator aesthetic
  'poster-vlog': createPoster('vlog', 600, 800, `
    <defs>
      <linearGradient id="bg-vlog" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#111827"/>
        <stop offset="40%" stop-color="#1f2937"/>
        <stop offset="70%" stop-color="#7c2d12"/>
        <stop offset="100%" stop-color="#180e07"/>
      </linearGradient>
    </defs>
    <rect width="600" height="800" fill="url(#bg-vlog)"/>
    <!-- Golden sunset streak -->
    <rect x="0" y="440" width="600" height="70" fill="#ea580c" opacity="0.35" filter="blur(25px)"/>
    <!-- Urban building blocks silhouette -->
    <rect x="80" y="320" width="70" height="300" fill="#0b0f19"/>
    <rect x="170" y="260" width="90" height="360" fill="#070a10"/>
    <rect x="280" y="200" width="80" height="420" fill="#030508"/>
    <rect x="380" y="290" width="85" height="330" fill="#070a10"/>
    <rect x="480" y="350" width="65" height="270" fill="#0b0f19"/>
    <!-- Creator camera frame corners overlay -->
    <path d="M50 80 L90 80 M50 80 L50 120" stroke="#f97316" stroke-width="2.5" fill="none"/>
    <path d="M550 80 L510 80 M550 80 L550 120" stroke="#f97316" stroke-width="2.5" fill="none"/>
    <path d="M50 720 L90 720 M50 720 L50 680" stroke="#f97316" stroke-width="2.5" fill="none"/>
    <path d="M550 720 L510 720 M550 720 L550 680" stroke="#f97316" stroke-width="2.5" fill="none"/>
    <!-- REC dot -->
    <circle cx="95" cy="105" r="5" fill="#ef4444"/>
    <text x="110" y="110" fill="#ffffff" font-family="monospace" font-size="12" font-weight="bold" letter-spacing="2">REC 4K</text>
  `),

  // 14. DOCUMENTARY — Panoramic Nordic landscape, wide anamorphic crop
  'poster-documentary': createPoster('documentary', 600, 800, `
    <defs>
      <linearGradient id="bg-doc" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="45%" stop-color="#1e293b"/>
        <stop offset="80%" stop-color="#334155"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
    </defs>
    <rect width="600" height="800" fill="url(#bg-doc)"/>
    <!-- Atmospheric mountain ridges -->
    <path d="M0 450 L180 340 L380 440 L600 280 L600 600 L0 600 Z" fill="#090d16" opacity="0.8"/>
    <!-- Lone explorer with tripod silhouette -->
    <path d="M295 440 C295 432 305 432 305 440 L305 470 L295 470 Z" fill="#030712"/>
    <line x1="320" y1="440" x2="310" y2="475" stroke="#030712" stroke-width="2"/>
    <line x1="320" y1="440" x2="330" y2="475" stroke="#030712" stroke-width="2"/>
    <!-- Documentary crosshair reticle -->
    <circle cx="300" cy="400" r="40" fill="none" stroke="#94a3b8" stroke-width="1" opacity="0.4"/>
    <line x1="300" y1="350" x2="300" y2="450" stroke="#94a3b8" stroke-width="1" opacity="0.4"/>
    <line x1="250" y1="400" x2="350" y2="400" stroke="#94a3b8" stroke-width="1" opacity="0.4"/>
  `),

  // 15. BUSINESS / PRODUCT SHOWCASE — Sleek titanium & neon cyan architectural lines
  'poster-business': createPoster('business', 600, 800, `
    <defs>
      <linearGradient id="bg-biz" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#090d16"/>
        <stop offset="50%" stop-color="#111827"/>
        <stop offset="100%" stop-color="#030712"/>
      </linearGradient>
    </defs>
    <rect width="600" height="800" fill="url(#bg-biz)"/>
    <!-- Sleek isometric architectural glass grid -->
    <path d="M100 250 L300 150 L500 250 L300 350 Z" fill="none" stroke="#0284c7" stroke-width="2" opacity="0.4"/>
    <path d="M100 400 L300 300 L500 400 L300 500 Z" fill="none" stroke="#38bdf8" stroke-width="2" opacity="0.5"/>
    <path d="M100 550 L300 450 L500 550 L300 650 Z" fill="none" stroke="#0284c7" stroke-width="2" opacity="0.4"/>
    <!-- Glowing core prism -->
    <polygon points="300,280 340,320 300,360 260,320" fill="#38bdf8" opacity="0.8" filter="drop-shadow(0 0 20px #0ea5e9)"/>
  `)
};

// Write SVGs to disk
console.log('Writing themed poster SVGs...');
for (const [name, svg] of Object.entries(posters)) {
  const p1 = path.join(THUMBNAILS_DIR, `${name}.svg`);
  const p2 = path.join(SERVER_THUMBNAILS_DIR, `${name}.svg`);
  fs.writeFileSync(p1, svg);
  fs.writeFileSync(p2, svg);
  console.log(`Created: ${p1}`);
}

// Also create mapped versions for existing project references:
// proj-vacation -> poster-travel
// proj-birthday -> poster-birthday
// proj-product -> poster-business
// proj-vlog -> poster-vlog
// proj-short -> poster-cinematic
const projectMappings = {
  'proj-vacation.svg': 'poster-travel',
  'proj-birthday.svg': 'poster-birthday',
  'proj-product.svg': 'poster-business',
  'proj-vlog.svg': 'poster-vlog',
  'proj-short.svg': 'poster-cinematic',
  // Also provide trending-* fallbacks
  'trending-cinematic.svg': 'poster-cinematic',
  'trending-love.svg': 'poster-love',
  'trending-travel.svg': 'poster-travel',
  'trending-dark.svg': 'poster-dark',
  'trending-nature.svg': 'poster-nature',
  'trending-slowmo.svg': 'poster-slowmo',
};

for (const [targetName, sourceKey] of Object.entries(projectMappings)) {
  const content = posters[sourceKey];
  if (content) {
    fs.writeFileSync(path.join(THUMBNAILS_DIR, targetName), content);
    fs.writeFileSync(path.join(SERVER_THUMBNAILS_DIR, targetName), content);
  }
}

console.log('All themed posters generated successfully.');
