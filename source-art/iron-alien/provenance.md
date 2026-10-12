# 铁血与异形素材来源

道路拓扑：用户提供的road-reference.png，右端入口、上下绕行、左端保护目标；不复制参考图建筑/UI。
地面：outputs/alien-zerg2-wechat/source-art/airship-roads/desert.jpg，母舰Ⅲ原有地面取样烘焙。
山石与崖面：source-art/thunder-raid-asteroid/ridge.png、cliff-face-v2.png；真实alpha外缘，JPEG82+无损8位alpha遮罩。
角色：/Users/wangxin/Documents/projects/source/data/image/unit/alien_queen_{world,battle}.{png,plist}，tiexuezhanshi_{world,battle}.{png,plist}。
女王只提取方向2侧身，整套帧离线左右翻转成朝左；铁血方向2朝右。保留原版stand/attack/skill帧（女王各8、铁血4/8/8），没有AI生成或修改角色外观。仅用256色索引PNG压缩，无尺寸缩小。
工具：build-iron-alien-art.py提取角色；build-iron-alien.cjs烘焙地图；finish-iron-alien-assets.py无损编码mask并合成关卡图标。后两者须依次执行。

## 0044 upright north ridge
Generated with built-in imagegen from source-art/thunder-raid-asteroid/ridge.png as material reference. Source: north-ridge-upright.png. Prompt: wide continuous horizontal left-to-right charcoal mountain chain, upright peaks pointing to image top, foothills at bottom, cool cyan highlights and subdued mineral veins, elevated oblique game camera, transparent background, no rotated reference, no sideways peaks, no sky or ground rectangle. Original output: /Users/wangxin/.codex/generated_images/01a11b5f-0921-7d31-bf93-0cfa512b8823/exec-9cfbee71-8d79-45d2-b4c6-8bb31f1108fc.png. Alpha retained, rendered unrotated into terrain by build-iron-alien.cjs.
