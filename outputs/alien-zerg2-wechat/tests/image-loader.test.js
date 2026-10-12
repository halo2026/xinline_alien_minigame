const test = require('node:test');
const assert = require('node:assert/strict');

for (const root of ['../shared', '../../alien-wolf-wechat/shared']) {
  const {load} = require(root + '/view');
  test(root + ' image proxies retain identity without Promise assimilation', {timeout: 1000}, async () => {
    const created = [], progress = [];
    let assimilated = false;
    const images = await load(() => {
      const image = {then() { assimilated = true; }};
      Object.defineProperty(image, 'src', {set(value) {
        image.file = value;
        queueMicrotask(() => image.onload());
      }});
      created.push(image);
      return image;
    }, file => file, (done, total) => progress.push([done, total]));
    assert.equal(assimilated, false);
    assert.equal(images.portraits, created[0]);
    assert.equal(images.terrain, created[1]);
    assert.equal(images.pages[0], created[2]);
    assert.equal(progress.length, created.length);
    assert.deepEqual(progress.at(-1), [created.length, created.length]);
  });

  test(root + ' image failures reject with the failing filename', {timeout: 1000}, async () => {
    await assert.rejects(load(() => {
      const image = {};
      Object.defineProperty(image, 'src', {set(file) {
        queueMicrotask(() => file === 'terrain.png'
          ? image.onerror({errMsg: 'decode failed'}) : image.onload());
      }});
      return image;
    }, file => file), /terrain\.png.*decode failed/);
  });
}
