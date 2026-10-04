# 风火轮原版特效对照

原版 tab_skill.lua 32045 调用 EffectOnGrid_Damage_TD_FireACT / 特效3167；tab_effect.lua 3167指定fireball8_x_Fire、随机帧和角度、起始缩放0.25/结束0.6，并叠加3468轮胎印。tab_model_effect.lua模型8703使用fireball8.png四行32帧、每帧50ms；8704使用ice_explosion3.png八帧。

本次引入原始火焰32帧及8张轮印，打包wheel-fire-native.png。按双轮位置绘制，确定性随机错帧与轻微偏角，出生渐显并长大，尾端0.8秒渐隐，暗色轮印垫底。Canvas柔和加色保留亮焰与半透明边缘，绿色通道210/255轻微偏暖。保持原有4秒最长显示期、品质路径长度和伤害，不改变存档键。

不增加逐帧模糊或粒子对象；离屏剔除。主关及狼关同步，实际Canvas战斗截图已查看；vehicle-gear.test.js 10项通过。生成脚本tools/import-native-wheel-fire.cjs可复现。未上传体验版。
