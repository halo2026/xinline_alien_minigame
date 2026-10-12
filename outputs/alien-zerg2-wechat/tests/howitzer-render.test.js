const test = require('node:test');
const assert = require('node:assert/strict');
const { createCanvas } = require('@napi-rs/canvas');
for (const root of ['../shared', '../../alien-wolf-wechat/shared']) {
  const { View } = require(root + '/view');
  const A = require(root + '/art-data');
  test(root + ': cluster texture is reused and unavailable offscreen Canvas retains vector drawing', () => {
    const previous = global.OffscreenCanvas;
    try {
      let allocations = 0;
      global.OffscreenCanvas = class { constructor(w, h) { allocations++; return createCanvas(w, h); } };
      const v = new View(createCanvas(100, 100).getContext('2d'), {}, 100, 100);
      let circles = 0;
      v.circle = () => circles++;
      for (let i = 0; i < 190; i++) v.drawClusterBody();
      assert.equal(allocations, 1);
      assert.equal(circles, 0);
      global.OffscreenCanvas = class { constructor() { throw Error('unavailable'); } };
      delete v.clusterBodyTexture;
      v.drawClusterBody();
      assert.equal(circles, 4);
    } finally { global.OffscreenCanvas = previous; }
  });
  test(root + ': explosion culling keeps edge-overlapping and rotated frames visible', () => {
    const v = new View({}, {}, 390, 844);
    v.worldVisible = (x, y, pad) => x + pad >= 0 && x - pad <= 390 && y + pad >= 0 && y - pad <= 844;
    const f = { x: -5, y: 100, age: .2, life: .6, scale: .42, angle: -Math.PI / 3 };
    assert.equal(v.effectFrameVisible(f, A.groups.grenadeboom), true);
    assert.equal(v.effectFrameVisible({ ...f, x: -5000 }, A.groups.grenadeboom), false);
    assert.equal(v.effectFrameVisible({ ...f, x: 195, y: 422 }, A.groups.crater), true);
  });
}
