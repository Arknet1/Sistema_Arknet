const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const dir = path.join(process.cwd(), 'public', 'images', 'social')
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true })
}

const svgs = {
  'facebook.png': `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="30" fill="#1877F2"/>
    <path fill="#ffffff" d="M35.5 33.5h5.5l0.8-6.5h-6.3v-4.2c0-1.8 0.5-3 3.1-3h3.3v-5.8c-0.6-0.1-2.5-0.2-4.8-0.2-4.8 0-8.1 2.9-8.1 8.3v4.9h-5.6v6.5h5.6V50h6.5V33.5z"/>
  </svg>`,
  'instagram.png': `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <defs>
      <radialGradient id="ig" cx="30%" cy="105%" r="125%">
        <stop offset="0%" stop-color="#ffdb76"/>
        <stop offset="15%" stop-color="#f77737"/>
        <stop offset="40%" stop-color="#e1306c"/>
        <stop offset="65%" stop-color="#c13584"/>
        <stop offset="85%" stop-color="#833ab4"/>
        <stop offset="100%" stop-color="#5851db"/>
      </radialGradient>
    </defs>
    <rect x="2" y="2" width="60" height="60" rx="30" fill="url(#ig)"/>
    <path fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" d="M22 17h20a5 5 0 0 1 5 5v20a5 5 0 0 1-5 5H22a5 5 0 0 1-5-5V22a5 5 0 0 1 5-5z"/>
    <circle cx="32" cy="32" r="7" fill="none" stroke="#ffffff" stroke-width="3.5"/>
    <circle cx="40.5" cy="23.5" r="1.8" fill="#ffffff"/>
  </svg>`,
  'linkedin.png': `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="30" fill="#0A66C2"/>
    <path fill="#ffffff" d="M21 27.5h6v18.5h-6V27.5zm3-9.5c1.9 0 3.5 1.6 3.5 3.5s-1.6 3.5-3.5 3.5-3.5-1.6-3.5-3.5 1.6-3.5 3.5-3.5zm8 9.5h5.7v2.6h0.1c0.8-1.5 2.7-3.1 5.7-3.1 6.1 0 7.2 4 7.2 9.2V46h-6v-8.8c0-2.1 0-4.8-2.9-4.8s-3.4 2.3-3.4 4.7V46H32V27.5z"/>
  </svg>`,
  'whatsapp.png': `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="30" fill="#25D366"/>
    <path fill="#ffffff" d="M44.5 37.8c-0.7-0.3-4.1-2-4.7-2.3-0.6-0.2-1.1-0.3-1.6 0.4s-1.8 2.3-2.2 2.7c-0.4 0.5-0.8 0.5-1.5 0.2-0.7-0.3-2.9-1.1-5.6-3.5-2.1-1.8-3.5-4.1-3.9-4.8-0.4-0.7 0-1.1 0.3-1.4 0.3-0.3 0.7-0.8 1-1.2 0.3-0.4 0.4-0.7 0.6-1.1 0.2-0.5 0.1-0.9-0.1-1.2s-1.6-3.8-2.2-5.2c-0.6-1.4-1.2-1.2-1.6-1.2h-1.4c-0.5 0-1.3 0.2-2 0.9-0.7 0.8-2.6 2.5-2.6 6.2s2.7 7.2 3.1 7.7c0.4 0.5 5.3 8.1 12.8 11.4 1.8 0.8 3.2 1.2 4.3 1.6 1.8 0.6 3.5 0.5 4.8 0.3 1.5-0.2 4.1-1.7 4.7-3.3 0.6-1.6 0.6-3 0.4-3.3-0.2-0.3-0.6-0.5-1.3-0.8z"/>
  </svg>`,
}

async function run() {
  for (const [filename, svg] of Object.entries(svgs)) {
    await sharp(Buffer.from(svg))
      .resize(64, 64)
      .png()
      .toFile(path.join(dir, filename))
    console.log(`Generated ${filename}`)
  }
}

run().catch(console.error)
