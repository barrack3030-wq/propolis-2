import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Ensure directories exist
const dirs = [
  'assets/images/image-logo',
  'assets/images/bpregular',
  'assets/images/bpbiru',
  'assets/images/bphijau',
  'assets/icons'
];

dirs.forEach(d => {
  fs.mkdirSync(d, { recursive: true });
});

// Helper SVG renderers
function createLogoSvg() {
  return `
  <svg width="500" height="150" viewBox="0 0 500 150" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#14833B"/>
        <stop offset="100%" stop-color="#2BBE63"/>
      </linearGradient>
      <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F3E081"/>
        <stop offset="50%" stop-color="#D4AF37"/>
        <stop offset="100%" stop-color="#AA7C11"/>
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#14833B" flood-opacity="0.15"/>
      </filter>
    </defs>
    
    <g filter="url(#shadow)">
      <!-- Hexagon / Honeycomb Base -->
      <polygon points="60,25 95,45 95,85 60,105 25,85 25,45" fill="url(#grad1)"/>
      <polygon points="60,32 88,48 88,82 60,98 32,82 32,48" fill="none" stroke="url(#gold)" stroke-width="2.5"/>
      
      <!-- Propolis Droplet Icon inside Hexagon -->
      <path d="M60 42 C60 42, 45 65, 45 75 A15 15 0 0 0 75 75 C75 65, 60 42, 60 42 Z" fill="url(#gold)" />
      
      <!-- Crown / British Emblem Crest -->
      <path d="M50 34 L54 38 L60 31 L66 38 L70 34 L68 40 L52 40 Z" fill="url(#gold)"/>
    </g>
    
    <!-- Brand Typography -->
    <text x="115" y="62" font-family="'Poppins', sans-serif" font-weight="800" font-size="28" fill="#14833B" letter-spacing="1">BRITISH PROPOLIS</text>
    <text x="115" y="92" font-family="'Poppins', sans-serif" font-weight="700" font-size="22" fill="#D4AF37" letter-spacing="4">TOILI</text>
    <text x="115" y="112" font-family="'Poppins', sans-serif" font-weight="500" font-size="11" fill="#2BBE63" letter-spacing="2">PREMIUM SUPPLEMENT • 100% ORIGINAL</text>
  </svg>
  `;
}

function createProductBottleSvg(type, variantNum) {
  // Configs based on type
  let mainColor = '#14833B';
  let accentColor = '#D4AF37';
  let labelBg = '#111827';
  let titleText = 'BRITISH PROPOLIS';
  let subText = 'REGULER';
  let badgeText = 'FOR ADULT';
  let capColor = '#1F2937';
  let bottleColor = '#8B4513'; // Amber glass
  let tag = 'PREMIUM QUALITY';

  if (type === 'hijau') {
    mainColor = '#2BBE63';
    accentColor = '#F97316';
    labelBg = '#064E3B';
    subText = 'GREEN';
    badgeText = 'FOR KIDS (1-12 THN)';
    tag = 'FORMULA KHUSUS ANAK';
  } else if (type === 'biru') {
    mainColor = '#0284C7';
    accentColor = '#D4AF37';
    labelBg = '#0F172A';
    subText = 'FAMILY BUNDLE';
    badgeText = 'PAKET HEMAT 3 BOTOL';
    tag = 'HERBAL KELUARGA';
  }

  return `
  <svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F0FDF4"/>
        <stop offset="100%" stop-color="#DCFCE7"/>
      </linearGradient>
      
      <linearGradient id="amberGlass" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#4A2500"/>
        <stop offset="25%" stop-color="#9C5200"/>
        <stop offset="70%" stop-color="#733B00"/>
        <stop offset="100%" stop-color="#301800"/>
      </linearGradient>

      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FEE180"/>
        <stop offset="50%" stop-color="#D4AF37"/>
        <stop offset="100%" stop-color="#9A7812"/>
      </linearGradient>

      <linearGradient id="mainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${mainColor}"/>
        <stop offset="100%" stop-color="${accentColor}"/>
      </linearGradient>

      <radialGradient id="sunburst" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#2BBE63" stop-opacity="0"/>
      </radialGradient>

      <filter id="shadow3d" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="25" stdDeviation="20" flood-color="#064E3B" flood-opacity="0.25"/>
        <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#000000" flood-opacity="0.15"/>
      </filter>
    </defs>

    <!-- Studio Background Plate -->
    <rect width="800" height="800" rx="32" fill="url(#bgGrad)"/>
    <circle cx="400" cy="350" r="300" fill="url(#sunburst)"/>
    
    <!-- Honeycomb Decorative Background -->
    <g opacity="0.08" stroke="#14833B" stroke-width="2" fill="none">
      <polygon points="150,100 180,118 180,154 150,172 120,154 120,118"/>
      <polygon points="210,100 240,118 240,154 210,172 180,154 180,118"/>
      <polygon points="180,154 210,172 210,208 180,226 150,208 150,172"/>
      <polygon points="650,600 680,618 680,654 650,672 620,654 620,618"/>
      <polygon points="710,600 740,618 740,654 710,672 680,654 680,618"/>
    </g>

    <g filter="url(#shadow3d)">
      <!-- Packaging Box (Behind or Beside) -->
      <g transform="translate(180, 220)">
        <rect x="0" y="0" width="180" height="380" rx="12" fill="${labelBg}" stroke="url(#goldGrad)" stroke-width="3"/>
        <rect x="10" y="10" width="160" height="360" rx="8" fill="none" stroke="${mainColor}" stroke-dasharray="6,4"/>
        
        <!-- Box Top Band -->
        <path d="M0 12 Q0 0 12 0 L168 0 Q180 0 180 12 L180 60 L0 60 Z" fill="url(#mainGrad)"/>
        <text x="90" y="38" font-family="'Poppins', sans-serif" font-weight="700" font-size="14" fill="#FFFFFF" text-anchor="middle">ENGLISH FORMULA</text>

        <!-- Flag Accent -->
        <rect x="65" y="75" width="50" height="25" rx="3" fill="#1D4ED8"/>
        <path d="M65 75 L115 100 M115 75 L65 100" stroke="#FFFFFF" stroke-width="3"/>
        <path d="M90 75 L90 100 M65 87.5 L115 87.5" stroke="#DC2626" stroke-width="4"/>

        <!-- Box Brand Titles -->
        <text x="90" y="130" font-family="'Poppins', sans-serif" font-weight="800" font-size="18" fill="url(#goldGrad)" text-anchor="middle">BRITISH</text>
        <text x="90" y="152" font-family="'Poppins', sans-serif" font-weight="800" font-size="18" fill="#FFFFFF" text-anchor="middle">PROPOLIS</text>
        <text x="90" y="175" font-family="'Poppins', sans-serif" font-weight="700" font-size="16" fill="${accentColor}" text-anchor="middle">${subText}</text>

        <!-- Center Propolis Seal -->
        <circle cx="90" cy="225" r="28" fill="url(#goldGrad)"/>
        <polygon points="90,205 105,215 105,235 90,245 75,235 75,215" fill="${labelBg}"/>
        <text x="90" y="230" font-family="'Poppins', sans-serif" font-weight="800" font-size="12" fill="url(#goldGrad)" text-anchor="middle">6ml</text>

        <text x="90" y="280" font-family="'Poppins', sans-serif" font-weight="600" font-size="11" fill="#9CA3AF" text-anchor="middle">SUPLEMEN KESEHATAN</text>
        <rect x="25" y="300" width="130" height="26" rx="13" fill="${mainColor}"/>
        <text x="90" y="317" font-family="'Poppins', sans-serif" font-weight="700" font-size="10" fill="#FFFFFF" text-anchor="middle">${badgeText}</text>
        <text x="90" y="350" font-family="'Poppins', sans-serif" font-weight="500" font-size="9" fill="#D1D5DB" text-anchor="middle">BPOM &amp; HALAL CERTIFIED</text>
      </g>

      <!-- Main Propolis Glass Dropper Bottle -->
      <g transform="translate(410, 240)">
        <!-- Rubber Bulb Pipette -->
        <path d="M60 0 C50 0 40 10 40 30 L80 30 C80 10 70 0 60 0 Z" fill="#1F2937"/>
        <rect x="35" y="28" width="50" height="8" rx="2" fill="#111827"/>
        <!-- Screw Cap -->
        <rect x="30" y="36" width="60" height="34" rx="4" fill="#374151"/>
        <!-- Gold Cap Ring -->
        <rect x="28" y="70" width="64" height="10" rx="2" fill="url(#goldGrad)"/>

        <!-- Glass Bottle Neck -->
        <rect x="36" y="80" width="48" height="20" fill="url(#amberGlass)"/>

        <!-- Bottle Body -->
        <rect x="15" y="100" width="90" height="240" rx="20" fill="url(#amberGlass)"/>
        
        <!-- Glass Highlight Refraction -->
        <rect x="22" y="105" width="12" height="220" rx="6" fill="#FFFFFF" opacity="0.25"/>

        <!-- Product Label on Bottle -->
        <rect x="20" y="140" width="80" height="170" rx="6" fill="${labelBg}" stroke="url(#goldGrad)" stroke-width="1.5"/>
        <text x="60" y="165" font-family="'Poppins', sans-serif" font-weight="800" font-size="11" fill="url(#goldGrad)" text-anchor="middle">BRITISH</text>
        <text x="60" y="180" font-family="'Poppins', sans-serif" font-weight="800" font-size="11" fill="#FFFFFF" text-anchor="middle">PROPOLIS</text>
        <text x="60" y="195" font-family="'Poppins', sans-serif" font-weight="700" font-size="10" fill="${accentColor}" text-anchor="middle">${subText}</text>
        
        <circle cx="60" cy="225" r="16" fill="url(#goldGrad)"/>
        <text x="60" y="229" font-family="'Poppins', sans-serif" font-weight="800" font-size="9" fill="#000000" text-anchor="middle">100%</text>

        <rect x="26" y="255" width="68" height="18" rx="9" fill="${mainColor}"/>
        <text x="60" y="267" font-family="'Poppins', sans-serif" font-weight="700" font-size="8" fill="#FFFFFF" text-anchor="middle">NETTO 6 ML</text>
        <text x="60" y="295" font-family="'Poppins', sans-serif" font-weight="600" font-size="7" fill="#9CA3AF" text-anchor="middle">MADE IN UK</text>
      </g>

      <!-- Golden Droplet Animation Highlight -->
      <g transform="translate(520, 480)">
        <path d="M0 0 C0 0 -15 25 -15 35 A15 15 0 0 0 15 35 C15 25 0 0 0 0 Z" fill="url(#goldGrad)"/>
        <circle cx="-3" cy="30" r="3" fill="#FFFFFF" opacity="0.6"/>
      </g>
    </g>

    <!-- Floating Badge -->
    <g transform="translate(80, 680)" filter="url(#shadow3d)">
      <rect x="0" y="0" width="280" height="60" rx="30" fill="#FFFFFF"/>
      <circle cx="30" cy="30" r="20" fill="${mainColor}"/>
      <path d="M22 30 L27 35 L38 23" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <text x="62" y="28" font-family="'Poppins', sans-serif" font-weight="700" font-size="14" fill="#111827">${tag}</text>
      <text x="62" y="46" font-family="'Poppins', sans-serif" font-weight="500" font-size="11" fill="#6B7280">Asli • BPOM TR183610771</text>
    </g>
    
    <g transform="translate(480, 80)" filter="url(#shadow3d)">
      <rect x="0" y="0" width="240" height="50" rx="25" fill="#14833B"/>
      <text x="120" y="30" font-family="'Poppins', sans-serif" font-weight="700" font-size="13" fill="#FFFFFF" text-anchor="middle">★ PREMIER QUALITY UK ★</text>
    </g>
  </svg>
  `;
}

async function buildAllImages() {
  console.log('Generating logo.png...');
  const logoSvg = createLogoSvg();
  await sharp(Buffer.from(logoSvg))
    .png()
    .toFile('assets/images/image-logo/logo.png');

  // Generate bpregular 3 images
  console.log('Generating bpregular images...');
  for (let i = 1; i <= 3; i++) {
    const svg = createProductBottleSvg('regular', i);
    await sharp(Buffer.from(svg))
      .resize(800, 800)
      .png()
      .toFile(`assets/images/bpregular/bp-regular-${i}.png`);
  }

  // Generate bpbiru 5 images
  console.log('Generating bpbiru images...');
  for (let i = 1; i <= 5; i++) {
    const svg = createProductBottleSvg('biru', i);
    await sharp(Buffer.from(svg))
      .resize(800, 800)
      .png()
      .toFile(`assets/images/bpbiru/bp-biru-${i}.png`);
  }

  // Generate bphijau 5 images
  console.log('Generating bphijau images...');
  for (let i = 1; i <= 5; i++) {
    const svg = createProductBottleSvg('hijau', i);
    await sharp(Buffer.from(svg))
      .resize(800, 800)
      .png()
      .toFile(`assets/images/bphijau/bp-hijau-${i}.png`);
  }

  console.log('All image assets successfully generated!');
}

buildAllImages().catch(err => {
  console.error('Error generating image assets:', err);
  process.exit(1);
});
