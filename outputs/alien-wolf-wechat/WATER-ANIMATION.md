# 原作水面复原
原作资源：cema-reference/terrain/water_ani.plist、water_ani.pvr.ccz，xlobj/xlobjs_water.png 的 lake02 与 lake02_mask。
同引擎原生源码 XLCharacter.cpp 使用湖底、水波、岸线三层，water opacity=150/255；XLTerrain.cpp 20帧，每帧0.06秒。
小游戏离线合成20帧、1.2秒循环，以128像素图帧按原256像素范围绘制。岸线静止，水波被湖底alpha限制，不扩展到道路。
转换脚本 tools/import-water.py；湖塘位置 (1152,544)，场景ID50037。新增资源25940字节。未修改导航/碰撞。
