import fs from 'fs';

let code = fs.readFileSync('server/src/routes/templates.ts', 'utf8');

const map = {
  'tmpl-ready-cinematic-vibes': '/thumbnails/poster-cinematic.svg',
  'tmpl-ready-love-story': '/thumbnails/poster-love.svg',
  'tmpl-ready-travel-diaries': '/thumbnails/poster-travel.svg',
  'tmpl-ready-dark-aesthetic': '/thumbnails/poster-dark.svg',
  'tmpl-ready-nature-escape': '/thumbnails/poster-nature.svg',
  'tmpl-ready-slow-motion': '/thumbnails/poster-slowmo.svg',
  'tmpl-ready-fashion-reel': '/thumbnails/poster-fashion.svg',
  'tmpl-ready-birthday-special': '/thumbnails/poster-birthday.svg',
  'tmpl-ready-wedding-moments': '/thumbnails/poster-wedding.svg',
  'tmpl-ready-sports-motion': '/thumbnails/poster-sports.svg',
  'tmpl-ready-beat-sync': '/thumbnails/poster-beatsync.svg',
  'tmpl-ready-festival-lights': '/thumbnails/poster-festival.svg',
  'tmpl-edit-travel-cinematic': '/thumbnails/poster-travel.svg',
  'tmpl-edit-viral-reel': '/thumbnails/poster-beatsync.svg',
  'tmpl-edit-yt-shorts': '/thumbnails/poster-slowmo.svg',
  'tmpl-edit-8k-widescreen': '/thumbnails/poster-cinematic.svg',
  'tmpl-edit-fashion-lookbook': '/thumbnails/poster-fashion.svg',
  'tmpl-edit-golden-memories': '/thumbnails/poster-wedding.svg',
  'tmpl-edit-birthday-party': '/thumbnails/poster-birthday.svg',
  'tmpl-edit-product-showcase': '/thumbnails/poster-business.svg'
};

for (const [id, poster] of Object.entries(map)) {
  const regex = new RegExp(`(id:\\s*['"]${id}['"][\\s\\S]*?thumbnailUrl:\\s*['"])([^'"]+)(['"])`);
  code = code.replace(regex, `$1${poster}$3`);
}

fs.writeFileSync('server/src/routes/templates.ts', code);
console.log('Successfully updated server/src/routes/templates.ts');
