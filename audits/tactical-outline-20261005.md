# 战术卡原版描边

原版调用：source/data/scripts/util/ui/sysmenu.lua 的 bolder_amin，MODEL_EFFECT:TacticUsing，原始偏移 y=-6（Canvas 对应向下 6），按卡牌比例缩放。
定义：source/data/tabs/model/tab_model_effect.lua 模型 9133，effect/tactic.plist + tactic.png，4 帧，120ms/帧，中心锚点。

通过 tools/import-tactical-hint.cjs 读取原始 plist，还原旋转和裁切区域，导出 328×81 图集。图像未重绘；现有 atlas 内容已与修改前打包数据逐项核对，除新增页面和四帧外完全一致。两套游戏共用此表现。

移除 Canvas strokeRect 方框提示。按用户要求对每个卡牌种类分别判断 tacticalIntroSeen，首次使用后关闭该卡提示；冷却/玩家失效时不显示。原版四帧逐帧合成检查确认轮廓对齐。

验证：描边与战斗提示 8/8、打包启动 31/31 通过。

版本 0.10.05.0051 已上传成功（✔ upload），沿用体验版配置。
