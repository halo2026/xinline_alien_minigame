# 车载装备重做

替换旧装备目录、初始装备、宝箱及战斗装备掉落池。新装备共五类、四品质，白/蓝/金/红对应伤害等级1/2/3/4。内部品质索引保留1/2/3/5以兼容已有品质边框；游戏显示四档，不存在第五品质。

|装备|白|蓝|金|红|
|---|---:|---:|---:|---:|
|榴弹装填机：双雷，每颗手雷额外伤害|200|400|600|800|
|尖刺轮毂：100范围地面伤害/秒|200|400|600|800|
|风火轮：车辙燃烧伤害/秒|200|400|600|800|
|风火轮：沿路径最大长度|300|500|600|800|
|防空组件：每10秒一轮导弹数|1|2|4|6|
|防空组件：最低单发伤害|5000|6500|8000|10000|
|冲撞组件：单次伤害|200|400|600|800|
|冲撞组件：基础击退距离|100|200|300|400|

防空组件对普通/重型飞龙（12509/12516，排除boss）单发至少最大血量50%，红装至少100%；从而随关卡血量倍率保持两发/一发目标。仅锁定附近900范围空中敌人，每0.2秒发射一枚，有限转速形成弧线，飞行后期加强转向及近距离命中检查。目标死亡或隐藏后在最后空中坐标爆炸，碎片下落，不永久滞留。

轮刀每0.25秒结算一次，准确保持总DPS并降低特效负担。双轮车辙按实际走过路径限长，最多存活4秒，离开后继续燃烧2秒；停在车辙上刷新燃烧时间。使用现有火焰动画，屏外跳过绘制，不增加逐帧模糊滤镜。

冲撞仅行驶接触车头/侧面时触发，停车不刷伤害；小型地面单位（原始scale<0.85，排除boss），距离按clamp(1-scale,0.2,0.8)衰减，0.25秒内推开。岩石和太空边界阻挡推移。同一次接触只伤害一次、0.8秒保护间隔。撞死的残肢沿撞击方向散开。

同类仅最高品质生效，避免同件叠装超出设计数值。装备等级白1、蓝5、金7、红10。移除旧装备强化入口和旧随机属性；六个通用槽保留。旧装备按类型/品质映射到新装备，保留UID、等级、货币、宝箱、科技、战役记录；旧强化等级不延续。新手初始两件白装榴弹装填机/尖刺轮毂已装备，白风火轮入仓。

## 验证

- vehicle-gear.test.js：10项，新目录/存档迁移、四档DPS、车辙长度及2秒余火、冲撞方向/体型/障碍/死亡残肢、对空导弹间隔/数量/飞龙伤害/追踪/目标死亡、真实手雷爆炸、死亡停止攻击。
- store、app-resume、batch-chests、warehouse-materials合计17项通过，共27项针对性测试通过。
- check-vehicle-gear-campaigns.cjs：8个战役全装备运行最多60秒模拟，无异常；部分战役在44/48秒自然失败，模拟随结算停止。曾发现狼关无hasGround接口，已修复并重新跑通。
- Canvas实际资源截图检查装备详情横竖屏及战斗火焰、刀光、导弹。
- 历史run-loot.test.js含过时16波、掉落上限、9月17日存档键断言，3项失败；未按旧断言回退现行配置。旧装备专属测试（闪电链/三防/强化）不再适用于本次替换目录。
- 未做手机实机新装备测试，未上传本次改动。

## 图片

使用内置image_gen生成5张真实透明背景机械图标，原件保存于artwork/vehicle-equipment；引入assets/vehicle-equipment.png，四品质共用主体图并使用现有品质边框。为主包留空间，将启动封面JPEG重新编码至质量80，原始版本保存在artwork/launch-cover-before-gear.jpg。

通用提示词：Create a single polished game inventory icon: [subject]. Realistic painted 3D sci-fi military equipment, three-quarter isometric perspective, heavy worn gunmetal, strong clear silhouette readable at 64px. Centered isolated object, no humans, no letters, no numbers, no border, genuinely transparent background, generous empty margin. Square composition. Asset for vehicle combat game.

Subjects:
- grenade-loader: A heavy vehicle twin grenade autoloader, two squat steel mortar tubes, mechanical orange ammunition drum, visible two grenades
- spiked-hub: An armored vehicle wheel hub with six sharp radial steel knife blades, sturdy dark tire, cyan metal highlights
- fire-wheel: An armored vehicle wheel and hot orange turbine hub, blazing orange flames trailing off its tire
- anti-air: A compact armored vehicle anti-air missile pod with six angled rocket tubes and targeting radar, orange rocket noses, blue optics
- ram: A heavy armored vehicle front ram bumper, wedge-shaped reinforced steel plow, aggressive blunt spikes, yellow hazard stripes
