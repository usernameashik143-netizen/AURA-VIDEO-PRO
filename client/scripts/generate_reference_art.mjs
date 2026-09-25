import fs from 'fs';
import path from 'path';

const THUMBNAILS_DIR = 'client/public/thumbnails';
const SERVER_THUMBNAILS_DIR = 'server/storage/thumbnails';

[THUMBNAILS_DIR, SERVER_THUMBNAILS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Helper for standard SVGs
function saveSVG(filename, content) {
  const p1 = path.join(THUMBNAILS_DIR, filename);
  const p2 = path.join(SERVER_THUMBNAILS_DIR, filename);
  fs.writeFileSync(p1, content);
  fs.writeFileSync(p2, content);
  console.log(`Created: ${filename}`);
}

// 1. HERO BANNER — Traveler with backpack looking at sunset over purple/blue/orange mountains
// Exactly matching Panel 3 hero image
const heroTravelerSunset = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 500" width="1200" height="500" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0a071b"/>
      <stop offset="25%" stop-color="#1f0e38"/>
      <stop offset="50%" stop-color="#4c144a"/>
      <stop offset="70%" stop-color="#9a2848"/>
      <stop offset="85%" stop-color="#e05338"/>
      <stop offset="100%" stop-color="#fba138"/>
    </linearGradient>
    <radialGradient id="sunGlow" cx="68%" cy="58%" r="40%">
      <stop offset="0%" stop-color="#fff5db" stop-opacity="1"/>
      <stop offset="25%" stop-color="#fec84b" stop-opacity="0.8"/>
      <stop offset="55%" stop-color="#f04438" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="neonTextGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="40%" stop-color="#fda4af"/>
      <stop offset="100%" stop-color="#f43f5e"/>
    </linearGradient>
  </defs>
  <!-- Sky -->
  <rect width="1200" height="500" fill="url(#skyGrad)"/>
  <!-- Sun & Volumetric Dusk Glow -->
  <circle cx="820" cy="290" r="140" fill="url(#sunGlow)"/>
  <ellipse cx="820" cy="290" rx="300" ry="120" fill="#f04438" opacity="0.35" filter="blur(30px)"/>
  
  <!-- Distant Mountain Ridges (Purple / Indigo) -->
  <path d="M0 320 L160 210 L340 280 L520 180 L720 260 L920 190 L1100 270 L1200 230 L1200 500 L0 500 Z" fill="#1b092b" opacity="0.8"/>
  <path d="M0 350 L200 250 L420 330 L640 230 L850 310 L1040 240 L1200 300 L1200 500 L0 500 Z" fill="#140620" opacity="0.9"/>
  <!-- Foreground Ridge -->
  <path d="M0 400 Q300 370 600 410 Q850 380 1200 430 L1200 500 L0 500 Z" fill="#09020e"/>

  <!-- Dramatic Traveler / Hiker with Backpack Silhouette (Standing looking towards sunset) -->
  <g transform="translate(680, 160)" fill="#09020e">
    <!-- Head / Hair -->
    <circle cx="65" cy="55" r="14"/>
    <!-- Neck -->
    <rect x="62" y="68" width="8" height="8"/>
    <!-- Torso / Jacket -->
    <path d="M48 76 C48 72 82 72 82 76 L88 150 L42 150 Z"/>
    <!-- Backpack on back (facing left/3-quarter) -->
    <path d="M30 82 C28 80 46 80 48 85 L44 140 C42 144 32 144 30 138 Z"/>
    <!-- Legs -->
    <path d="M44 150 L42 220 L56 220 L58 150 Z"/>
    <path d="M72 150 L74 220 L88 220 L86 150 Z"/>
    <!-- Traveler Rim Light from sunset -->
    <path d="M78 52 C84 62 84 100 86 148" stroke="#fec84b" stroke-width="2.5" fill="none" opacity="0.85"/>
  </g>

  <!-- Glowing Neon Play Button & Handwritten Script Accent on Right (Matching Reference) -->
  <g transform="translate(860, 190)">
    <!-- Glowing Circular Play Button -->
    <circle cx="40" cy="40" r="32" fill="#ffffff" fill-opacity="0.18" stroke="#ffffff" stroke-width="2.5" stroke-opacity="0.8" filter="drop-shadow(0 0 15px rgba(255,255,255,0.6))"/>
    <polygon points="34,26 54,40 34,54" fill="#ffffff"/>
    
    <!-- Neon Script: Create Something Amazing -->
    <text x="90" y="32" font-family="'Brush Script MT', 'Dancing Script', 'Pacifico', cursive" font-size="28" font-style="italic" fill="url(#neonTextGlow)" filter="drop-shadow(0 0 12px rgba(244,63,94,0.8))">Create</text>
    <text x="85" y="62" font-family="'Brush Script MT', 'Dancing Script', 'Pacifico', cursive" font-size="28" font-style="italic" fill="url(#neonTextGlow)" filter="drop-shadow(0 0 12px rgba(244,63,94,0.8))">Something</text>
    <text x="85" y="92" font-family="'Brush Script MT', 'Dancing Script', 'Pacifico', cursive" font-size="28" font-style="italic" fill="url(#neonTextGlow)" filter="drop-shadow(0 0 12px rgba(244,63,94,0.8))">Amazing</text>
  </g>
</svg>`;

saveSVG('hero-traveler-sunset.svg', heroTravelerSunset);

// 2. RECENT PROJECTS THUMBNAILS (Exact 5 cards matching Panel 3)
// Card 1: Travel Vlog — Coastal beach backpacker at sunset
saveSVG('recent-travel-vlog.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
  <defs>
    <linearGradient id="tvSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#082f49"/>
      <stop offset="40%" stop-color="#0284c7"/>
      <stop offset="70%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#ea580c"/>
    </linearGradient>
  </defs>
  <rect width="600" height="400" fill="url(#tvSky)"/>
  <!-- Distant cliffs -->
  <polygon points="0,260 120,180 260,270 0,270" fill="#0c4a6e" opacity="0.8"/>
  <polygon points="380,270 480,200 600,270 380,270" fill="#0c4a6e" opacity="0.8"/>
  <!-- Sun & Ocean water -->
  <circle cx="300" cy="220" r="45" fill="#fef08a" opacity="0.9"/>
  <rect x="0" y="260" width="600" height="140" fill="#0369a1"/>
  <ellipse cx="300" cy="300" rx="180" ry="25" fill="#fbbf24" opacity="0.4" filter="blur(10px)"/>
  <!-- Shoreline & Traveler standing on rock looking at waves -->
  <path d="M180 400 Q300 340 420 400 Z" fill="#082f49"/>
  <circle cx="300" cy="315" r="9" fill="#082f49"/>
  <path d="M292 324 L308 324 L305 365 L295 365 Z" fill="#082f49"/>
</svg>`);

// Card 2: Product Promo — Neon purple/blue studio product with glass pedestal
saveSVG('recent-product-promo.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
  <defs>
    <linearGradient id="ppBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#080312"/>
      <stop offset="50%" stop-color="#24083a"/>
      <stop offset="100%" stop-color="#090514"/>
    </linearGradient>
    <radialGradient id="ppSpot" cx="50%" cy="40%" r="45%">
      <stop offset="0%" stop-color="#c084fc" stop-opacity="0.4"/>
      <stop offset="60%" stop-color="#9333ea" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="600" height="400" fill="url(#ppBg)"/>
  <rect width="600" height="400" fill="url(#ppSpot)"/>
  <!-- Neon cyan / magenta rim lights -->
  <line x1="140" y1="50" x2="140" y2="350" stroke="#22d3ee" stroke-width="2" opacity="0.3"/>
  <line x1="460" y1="50" x2="460" y2="350" stroke="#f472b6" stroke-width="2" opacity="0.3"/>
  <!-- Floating luxury tech cylinder / cosmetics bottle -->
  <rect x="260" y="110" width="80" height="170" rx="12" fill="#180c26" stroke="#c084fc" stroke-width="2" filter="drop-shadow(0 0 20px rgba(192,132,252,0.4))"/>
  <rect x="280" y="85" width="40" height="25" rx="4" fill="#a855f7"/>
  <!-- Specular sheen -->
  <path d="M270 120 L276 120 L276 270 L270 270 Z" fill="#ffffff" opacity="0.7"/>
  <!-- Glowing pedestal base -->
  <ellipse cx="300" cy="305" rx="110" ry="25" fill="#3b0764" stroke="#a855f7" stroke-width="1.5"/>
</svg>`);

// Card 3: Wedding Story — Golden hour couple in meadow
saveSVG('recent-wedding-story.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
  <defs>
    <linearGradient id="wsSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1f1008"/>
      <stop offset="40%" stop-color="#451a03"/>
      <stop offset="70%" stop-color="#9a3412"/>
      <stop offset="90%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#fbbf24"/>
    </linearGradient>
  </defs>
  <rect width="600" height="400" fill="url(#wsSky)"/>
  <!-- Warm romantic sun flare -->
  <circle cx="420" cy="180" r="70" fill="#fef08a" opacity="0.85" filter="blur(15px)"/>
  <!-- Distant hill ridges -->
  <path d="M0 290 Q300 240 600 280 L600 400 L0 400 Z" fill="#291204"/>
  <!-- Couple in golden meadow -->
  <circle cx="280" cy="225" r="9" fill="#140602"/>
  <circle cx="300" cy="230" r="8" fill="#140602"/>
  <path d="M272 238 L288 238 L286 310 L272 310 Z" fill="#140602"/>
  <path d="M292 240 L310 240 L325 310 L295 310 Z" fill="#140602"/>
  <!-- Soft flowing veil -->
  <path d="M302 230 Q330 260 345 305" stroke="#fef3c7" stroke-width="2" fill="none" opacity="0.75"/>
</svg>`);

// Card 4: Nature Escape — Aerial emerald alpine lake surrounded by pine forest
saveSVG('recent-nature-escape.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
  <defs>
    <linearGradient id="neBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#022c22"/>
      <stop offset="40%" stop-color="#064e3b"/>
      <stop offset="80%" stop-color="#0f766e"/>
      <stop offset="100%" stop-color="#14b8a6"/>
    </linearGradient>
  </defs>
  <rect width="600" height="400" fill="url(#neBg)"/>
  <!-- Glacial Turquoise Lake -->
  <ellipse cx="300" cy="240" rx="220" ry="90" fill="#2dd4bf" opacity="0.6" filter="blur(8px)"/>
  <ellipse cx="300" cy="240" rx="180" ry="70" fill="#0d9488"/>
  <ellipse cx="300" cy="240" rx="140" ry="50" fill="#115e59"/>
  <!-- Surrounding Pine Forest Clusters -->
  <path d="M40 280 L60 210 L80 280 L110 190 L140 280 L180 220 L220 280 Z" fill="#021c17"/>
  <path d="M380 280 L420 200 L460 280 L500 180 L540 280 L570 210 L600 280 Z" fill="#021c17"/>
  <path d="M0 310 Q300 290 600 310 L600 400 L0 400 Z" fill="#011410"/>
</svg>`);

// Card 5: Gaming Highlight — Cyberpunk character with glowing cyan/purple headset
saveSVG('recent-gaming-highlight.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
  <defs>
    <linearGradient id="ghBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#050614"/>
      <stop offset="40%" stop-color="#0e1338"/>
      <stop offset="80%" stop-color="#1f0933"/>
      <stop offset="100%" stop-color="#05010a"/>
    </linearGradient>
  </defs>
  <rect width="600" height="400" fill="url(#ghBg)"/>
  <!-- Cyberpunk grid lines -->
  <line x1="0" y1="320" x2="600" y2="320" stroke="#22d3ee" stroke-width="1.5" opacity="0.4"/>
  <line x1="0" y1="360" x2="600" y2="360" stroke="#a855f7" stroke-width="2" opacity="0.5"/>
  <!-- Gamer silhouette -->
  <circle cx="300" cy="180" r="45" fill="#080b18"/>
  <path d="M230 250 C230 220 370 220 370 250 L390 380 L210 380 Z" fill="#080b18"/>
  <!-- Glowing Cyan Headset -->
  <path d="M255 180 C255 140 345 140 345 180" fill="none" stroke="#22d3ee" stroke-width="6" stroke-linecap="round" filter="drop-shadow(0 0 10px #22d3ee)"/>
  <rect x="246" y="165" width="16" height="32" rx="6" fill="#22d3ee"/>
  <rect x="338" y="165" width="16" height="32" rx="6" fill="#22d3ee"/>
  <!-- Magenta visor glow -->
  <rect x="275" y="175" width="50" height="14" rx="4" fill="#f43f5e" filter="drop-shadow(0 0 12px #f43f5e)"/>
</svg>`);

// Also save aliases so existing paths resolve cleanly
const aliases = {
  'proj-vacation.jpg': 'recent-travel-vlog.svg',
  'proj-birthday.jpg': 'recent-product-promo.svg',
  'proj-product.jpg': 'recent-wedding-story.svg',
  'proj-vlog.svg': 'recent-travel-vlog.svg',
  'proj-vacation.svg': 'recent-travel-vlog.svg',
  'proj-birthday.svg': 'recent-product-promo.svg',
  'proj-product.svg': 'recent-product-promo.svg',
  'proj-short.svg': 'recent-gaming-highlight.svg',
};

for (const [alias, target] of Object.entries(aliases)) {
  const content = fs.readFileSync(path.join(THUMBNAILS_DIR, target));
  fs.writeFileSync(path.join(THUMBNAILS_DIR, alias), content);
  fs.writeFileSync(path.join(SERVER_THUMBNAILS_DIR, alias), content);
}

console.log('Reference art generation completed.');
