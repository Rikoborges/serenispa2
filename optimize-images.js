const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, 'src/assets');
const WEBP_QUALITY = 70;
const HERO_QUALITY = 60;
const HERO_MAX_WIDTH = 1280;

async function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const baseName = path.basename(filePath, ext);
  const outPath = path.join(ASSETS_DIR, baseName + '.webp');
  const isHero = baseName.includes('hero');

  const sizeBefore = fs.statSync(filePath).size;

  let pipeline = sharp(filePath);

  if (isHero) {
    pipeline = pipeline.resize({ width: HERO_MAX_WIDTH, withoutEnlargement: true });
  }

  await pipeline
    .webp({ quality: isHero ? HERO_QUALITY : WEBP_QUALITY })
    .toFile(outPath + '.tmp');

  const sizeAfter = fs.statSync(outPath + '.tmp').size;

  if (sizeAfter < sizeBefore || ext !== '.webp') {
    fs.renameSync(outPath + '.tmp', outPath);
    const saved = ((1 - sizeAfter / sizeBefore) * 100).toFixed(1);
    console.log(`✅ ${baseName}${ext} → ${baseName}.webp  ${kb(sizeBefore)} → ${kb(sizeAfter)} (-${saved}%)`);
    if (ext !== '.webp') fs.unlinkSync(filePath);
  } else {
    fs.unlinkSync(outPath + '.tmp');
    console.log(`⏭  ${baseName}${ext} déjà optimisé, ignoré`);
  }
}

function kb(bytes) {
  return (bytes / 1024).toFixed(0) + ' KB';
}

async function main() {
  const files = fs.readdirSync(ASSETS_DIR).filter(f =>
    ['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(f).toLowerCase())
  );

  console.log(`\n🔧 Optimisation de ${files.length} images...\n`);

  for (const file of files) {
    try {
      await optimizeImage(path.join(ASSETS_DIR, file));
    } catch (err) {
      console.error(`❌ Erreur sur ${file}:`, err.message);
    }
  }

  console.log('\n✨ Terminé !');
}

main();
