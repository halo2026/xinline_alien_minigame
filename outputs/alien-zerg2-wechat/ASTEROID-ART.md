# 采矿陨石岩层美术
使用内置 imagegen 生成专用岩层贴图，非第三方商业素材。
资产：assets/asteroid-rock.jpg。原始生成图：/Users/ryan/.codex/generated_images/01a07f39-05d4-72a1-8992-65be187d5ad1/exec-bfe4291a-18d9-4c2c-b844-0f19b53598bd.png
提示词：seamless square terrain texture, realistic sci-fi mining asteroid, orthographic top-down rocky surface, dark charcoal basalt and warm brown iron-rich fractured rock, layered jagged plates, dusty regolith, deep fissures, small impact pits, sparse subtle cyan mineral seams, upper-left soft lighting, no text/UI.
替换纯灰边缘；增加纹理侧壁及外围碎石。仅渲染装饰，不改变关卡碰撞、道路和建造规则。
以 768px JPEG 编码接入 browser 与 minigame，共享纹理重复使用。总包体保持在 20 MiB 内。

## 2026-09-14 原版随机迷宫漂浮物
`space-debris.png` 来自原版 `image/maze/mazeskin_highwall_001.png`，裁切坐标对应 `scripts/util/public/randmaproom_config.lua` 第一主题 nearobj 的十个矩形。包含碎裂陨石、金属飞船残骸；由 `tools/import-space-debris.py` 可重建，10×64像素格，保留透明背景。
`shared/space-scene.js` 在地形之前绘制远近两层（视差 .12/.32），缓慢漂移与旋转，远层缩小淡化；每11秒有1.6秒渐显渐隐流星。纯背景，不参与命中或寻路。浏览器和小游戏均加载同一图集。
验证：小游戏异步资源加载测试通过；已用真实素材渲染 `outputs/space-debris-preview.png` 检查边缘、残骸及流星。打包总大小20,927,437字节，低于20MiB限制。
