const test = require('node:test');
const assert = require('node:assert/strict');

for (const campaign of ['alien-zerg2-wechat', 'alien-wolf-wechat']) {
  const P = require(`../../${campaign}/shared/progression`);
  const { Game } = require(`../../${campaign}/shared/core`);

  test(`${campaign}: ram armor reduces damage at every tier and is removed on unequip`, () => {
    for (let tier = 1; tier <= 4; tier++) {
      const g = new Game();
      const baseArmor = g.player.armor;
      g.progress.inventory = [{ id: 41040 + tier, uid: 1 }];
      g.progress.equipped = [1];
      g.applyEquipment(true);
      assert.equal(g.player.armor, baseArmor + tier * 20);
      g.applyEquipment();
      assert.equal(g.player.armor, baseArmor + tier * 20);
      const before = g.player.hp;
      g.hurt(g.player, 180);
      assert.ok(Math.abs(before - g.player.hp - 180 * 100 / (100 + baseArmor + tier * 20)) < 1e-8);
      assert.equal(P.equipmentInfo(g.progress.inventory[0]).rows.find(r => r.key === 'def_physic').value, '+' + tier * 20);
      g.progress.equipped = [];
      g.applyEquipment();
      assert.equal(g.player.armor, baseArmor);
    }
  });

  test(`${campaign}: duplicate ram armor uses the winning item and survives save restore`, () => {
    const g = new Game();
    g.progress.level = 20;
    g.progress.inventory = [
      { id: 41041, uid: 1 },
      { id: 41044, uid: 2, fusionStats: { ram_damage: 1000, def_physic: 100 } },
      { id: 41044, uid: 3 }
    ];
    g.progress.equipped = [1, 2, 3];
    g.applyEquipment();
    assert.equal(g.player.armor, 100);
    const restored = new Game({ progress: P.restore(g.progress) });
    assert.equal(restored.player.armor, 100);
    // Existing fused saves have no armor field; receive the new base armor.
    assert.equal(P.equipmentStats({ id: 41044, fusionStats: { ram_damage: 1000 } }).def_physic, 80);
  });
}
