// Preserve the existing 128px frame layout and pivots; center the new native art.
const fs = require('node:fs');
const path = require('node:path');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const root = path.resolve(__dirname, '..');
const source = path.resolve(root, '../../source-art/mail-monsters-20261004/zerg-moth');
(async () => {
  const canvas = createCanvas(1024, 384), ctx = canvas.getContext('2d');
  for (let direction = 1; direction <= 17; direction++) {
    const image = await loadImage(path.join(source, `a${String(direction).padStart(2, '0')}001.png`));
    if (image.width !== 120 || image.height !== 120) throw Error('Unexpected moth frame size');
    ctx.drawImage(image, (direction - 1) % 8 * 128 + 4, Math.floor((direction - 1) / 8) * 128 + 4);
  }
  const png = canvas.toBuffer('image/png');
  for (const campaign of [root, path.resolve(root, '../alien-wolf-wechat')]) {
    fs.writeFileSync(path.join(campaign, 'assets/zerg-moth.png'), png);
  }
  console.log(`Updated 17 moth views; atlas ${png.length} bytes`);
})().catch(error => { console.error(error); process.exitCode = 1; });
