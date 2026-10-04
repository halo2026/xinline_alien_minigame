# 战车成长与仓库实验版 · 2026-09-09

- 初始战车 Lv.7，沿用已读取的 iPhone 战车等级与五件装备选择。独立于关内武器强化等级。
- 击杀经验：12500=10，12501=20，12502=25，12503=30，12509=30，12504=300。这是本次实验配置，并非已核实的原版击杀经验。
- 升级经验改为 400+80×当前等级²，最高 40 级；7→8 需 4320，8→9 需 5520。八波共 10260 经验，全清从 7 级到 9 级、余 420。保留已达到等级与累计的当前级经验，不降级。每级增加 120 生命和 2.5% 枪伤，以当前 Lv.7 的 2780 生命为基准。此成长属性是实验数值。
- 升级满血、播放原版 3333/Summon_3 十帧特效，并显示两秒升级文字。
- 每隔随机 4 或 5 波，在该波第 1–30 次击杀中随机掉落一次装备。拾取后入库，不是每次击杀概率掉落。新局重新安排波次。
- 掉落池为装填电机Ⅰ、反应装甲Ⅰ/Ⅱ、装填电机Ⅲ、高级防毒装甲。每件拥有独立 UID，可换装、卸装、分页浏览。支持生命、护甲、枪伤、榴弹伤害基础属性；原版复杂词缀、轮毂/闪电等被动技能和元素抗性仍未完整移植。
- 换装保留生命比例，避免反复穿脱免费回满。关卡重开保留战车经验和仓库，武器强化仍属于关内状态。
- 微信使用 wx.getStorageSync/setStorageSync；浏览器使用 localStorage，键 alien-zerg2-progress-v1。运行中每秒保存修改，换装/关仓库/退到后台立即保存。写入失败保留脏标记并重试，仓库显示失败状态。不涉及云存档或跨设备同步；不修改原 iPhone App 存档。
- 战车/武器等级移至底部原战术卡槽位置，配原版图标和 32px 数字，经验条随之下移，战术卡按钮上移。点击右上方“装备 / 仓库”，打开时暂停战斗。选装备位、选择仓库物品、点击装入即可。
- 镜头缩放 .62 → .527（缩小 15%），HUD 与按钮尺寸不变。
- 残肢尺寸增大 20%，主要残骸停留至少 10 秒后用 4 秒淡出，血泊尺寸和中心叠层加深，尸体记录最多 128，避免无限累积。

验证：微信模拟器实际打开仓库、卸装与装回；卸下反应装甲Ⅱ后生命 2780→2480，护甲 11.7→7.7。自动检查包含升级满血、多级经验进位、等级上限、保存恢复、存档写失败重试、装备唯一穿戴、4–5 波掉落、退出后台保存。尚未完成 iPhone 长时间压力与平衡测试。

## 四大部位、64 格仓库与丢弃

- 装备栏改为炮塔、车身、机动、技能四列，每列 3 槽，共 12 个已装备位置。分别用橙/蓝/绿/紫槽底及“炮/甲/轮/技”标识，装备图标右上角使用同类角标。穿戴前强制校验类型，拒绝不匹配；同件物品不能重复占多个槽，同类不同件可同时装备。
- 当前目录：装填电机归炮塔；反应装甲、高级防毒装甲归车身；刀片轮毂归机动；量子水晶雷达、闪电发生器归技能。掉落池含全部四类，仍每 4–5 波一次。原版复杂被动技能的还原范围没有因此扩大。
- 仓库为 8×8 固定格，共 64 件未穿戴装备，已装备的 12 件不占仓库格。换装时旧件交换到新件腾出的仓库格，因此满仓可正常替换；满仓不能直接卸下或拾取新装备。
- “丢到地上”将选中物品从仓库/装备位移到战车附近，立即释放空间并保存。可重新拾取，保护 2 秒防止立即吸回；若附近无可达落点则放脚下，需先离开再回来。未拾取地面掉落属于当前对局，不随重开保存。
- 保留存储键，数据结构升级到 version 2；旧五槽装备自动分配到同类型槽，等级经验和全部已获装备保留。超出 64 格的旧仓库物品进入迁移待整理队列，腾出空格后补入，不截断删除。
- 56 项测试通过，覆盖分类限制、12 槽、64 格容量、满仓换装、丢弃与重新拾取、旧存档迁移和超额物品保留。


## 2026-09-09: Sketch equipment layout
Version 3: weapon 3, body 2, mobility 2, skill 2 (9 total); warehouse 6 x 4 (24). Original car/gun atlas art on brushed metal panels. Both warehouse and equipped items open contextual details; warehouse details select a compatible slot (replacement returns old gear to the vacated warehouse cell), equipped details allow unequip; both retain ground discard. Full warehouse prevents unequip. Versions 1 and 2 migrate by category with all excess items retained in overflow, automatically filling freed cells. Local renderer screenshots use seeded demonstration warehouse items; production saves are not modified. 57 automated tests pass; this change has not yet been verified on physical iPhone.

Detail action correction: second button is 放回仓库. Worn items are unequipped into a free warehouse cell; full warehouse keeps the item equipped and displays the existing error. Warehouse items remain in place and close the detail. First button equips warehouse items; already worn items display 已装备. Detail no longer triggers ground discard.

Warehouse drag: tap opens details on release; movement over 8 px starts drag. Compatible slots highlight; drop equips or swaps old equipment into the same warehouse cell. Wrong category/outside/cancel retains inventory. Touch end coordinates and cancellation wired for browser, Mini Game and Mini Program. Detail second action is 放回仓库 only for worn items, otherwise 关闭. 58 tests pass; physical-device drag not yet verified.

Worn gear now supports drag back to warehouse: empty target receives it directly; occupied target uses first free cell; full warehouse refuses without changing gear. Cancel/outside preserves state, tap still opens detail. Detail panel uses 76% opacity with lighter backdrop, text/buttons retain full opacity. 59 tests pass and local render inspected; previous QR predates this change.

Current growth: v4 four allocated attributes and eight derived stats replace automatic per-level stats and weapon level. See ATTRIBUTE-DESIGN.md for formulas, migration and energy rules.

Armory layout per second sketch: upper-left seven combat stats in two columns, upper-right original vehicle and 3+2+2+2 equipment slots, horizontal four-attribute allocation controls, bottom 6x4 warehouse. Allocation saves and updates derived stats in-place. Existing detail transparency and bidirectional drag retained. 66 tests pass including integrated allocation and viewport bounds. Local rendered image uses demonstration warehouse items; no user save modified.

Third sketch revision: vehicle level in title; upper-left combat stats, lower-left 2x2 allocation with available points directly above; right full-height vehicle and 9 slots; warehouse unchanged 24 cells. Matching hit areas updated and all four allocation buttons tested. 67 tests pass.

Armory refinement: 36 px available-point numeral intrudes into lower stats blank area; warehouse count/capacity/supply captions removed; three turret slots now vertical with matching hit targets. 67 regression tests pass, actual local render checked.

Assembly sketch update: body upper-left, turret upper-right, turbine lower-right, chip lower-left around vehicle. Equipment categories mobility/skill renamed 轮机/芯片 (internal IDs unchanged); primary attribute 机动 stays unchanged. Each category has two slots (8 total), schema v5 remaps old slots by item category; excess third turret preserved in warehouse or overflow. Level/allocation/XP preserved. 68 tests pass including nine-slot migration.

Slots tightened around vehicle: turret above gun, two body slots vertical along left, turbine beside wheels, chips raised closer at lower-left. Slot hit targets share the same geometry. Local render inspected; 68 tests pass.

Title now contains vehicle level and large available-point count; four primary attributes form a horizontal allocation row immediately beneath. Combat stats and assembly panels moved below that row. Shared click geometry updated; 68 tests pass and actual local render inspected.

Equipment presentation: orange/blue/green/purple translucent category panels for equipped slots, warehouse items, drag ghost and detail icon; assembly labels and item corner badges removed. Empty warehouse slots remain neutral. Corrected standalone attribute hints to current separated roles. Local render inspected; 70 tests pass.

Allocation now requires a modal confirmation from both armory and growth screen. Preview uses an isolated Game with current saved equipment; lists only changed stats and before/after values. Cancel does not spend/save; confirm spends one point through existing validated allocation and saves. 72 tests pass; rendered computing preview checked.

Combat HUD: removed upper-right equipment button and hit target. Compact bottom lv.N【装备/属性】 opens inventory; grenade uses 2 energy from original scripts/var.lua GrenadeMana, no quantity cap or display. 73 tests pass. Tactical-card source audit still pending completion.

Original UI artwork imported from misc/chariotconfig: di_skillupinfo for armory sections and title, dk_upgrade_1 for details and allocation dialogs. Nine-slice rendering; category colors remain on equipment. Sources recorded in art-provenance.json, regeneration import hook added.

Cargo warehouse now has heavy sill, recessed ribbed cells, hinges, bolts and latch; grid positions and type tint preserved. Attribute plus buttons have metal relief, highlights and dark disabled state. Local render inspected, 73 tests pass.

Equipment category colors now use beveled 4px borders only; neutral dark interiors across assembly, warehouse, detail icon and drag ghost. Warehouse ribbed base retained. Local render verified.

Unified metal UI panels across armory, modals, combat controls, construction menu and start/pause/result panel. Equipment sockets now have recessed mounts, contacts, retaining clips, occupied lights and rear-layer wiring to vehicle. 73 tests pass, local armory/modal renders inspected.
