const test = require('node:test');
const assert = require('node:assert/strict');

for (const campaign of ['alien-zerg2-wechat', 'alien-wolf-wechat']) {
  const P = require(`../../${campaign}/shared/progression`);
  const { Game } = require(`../../${campaign}/shared/core`);
  function equip(items) {
    const g = new Game();
    g.progress.level = 20;
    g.progress.inventory = items.map((item, i) => ({ uid: i + 1, ...item }));
    g.progress.equipped = items.map((_, i) => i + 1);
    g.applyEquipment(true);
    return g;
  }

  test(`${campaign}: fire wheel grants real wheel damage at all tiers even during flame cooldown`, () => {
    for (let tier = 1; tier <= 4; tier++) {
      const item = { id: 41020 + tier };
      const g = equip([item]);
      const u = g.player;
      g.time = 11;
      u.fireCycleStart = 0;
      const ground = { id: 12500, x: u.x + 50, y: u.y, hp: 10000, maxHp: 10000 };
      const air = { ...ground, air: true };
      g.enemies = [ground, air];
      for (let i = 0; i < 4; i++) g.updateEquipmentEffects(.25);
      assert.equal(u.fireActive, false);
      assert.equal(10000 - ground.hp, 200 + tier * 200);
      assert.equal(air.hp, 10000);
      assert.equal(P.equipmentInfo(item).rows.find(r => r.key === 'melee_fight').value, '+' + tier * 200);
      assert.equal(u.vehicleGear.fire.stats.trail_dps, tier * 200);
      g.progress.equipped = [];
      g.applyEquipment();
      assert.equal(u.wheelDamage, 200);
    }
  });

  test(`${campaign}: distinct wheel bonuses sum regardless of order; duplicates and saves remain compatible`, () => {
    const items = [{ id: 41021 }, { id: 41024, fusionStats: { trail_dps: 1000, melee_fight: 1000 } }, { id: 41013 }];
    for (const list of [items, [...items].reverse()]) {
      const g = equip(list);
      assert.equal(g.player.wheelDamage, 1800);
      g.applyEquipment();
      assert.equal(g.player.wheelDamage, 1800);
      const restored = new Game({ progress: P.restore(g.progress) });
      assert.equal(restored.player.wheelDamage, 1800);
    }
    assert.equal(P.equipmentStats({ id: 41024, fusionStats: { trail_dps: 1000 } }).melee_fight, 800);
  });
}
