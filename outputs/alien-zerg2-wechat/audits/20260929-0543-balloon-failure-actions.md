# 0.9.29.0543 原精度钢铁气球与失败选项

钢铁气球原图位于alien_source/data/image/unit/metal_balloon2_world/battle图集。旧导入density .65使典型帧100×110缩为65×72。upgrade-metal-balloon.py直接解旋转裁取原像素，174动画引用去重为36独立帧，使用独立256色PNG图集metal-balloon-native.png，56237字节。更新defense-art坐标，保留ow/oh/ox/oy和比例，战斗尺寸不变；同步两档图鉴帧坐标与previewSize、主项目/狼关数据。导入器针对metal_balloon2使用density1避免重新降采样。原有旧atlas未重采样，其他怪物图像不变。

任务失败界面已解锁战役选择时，将重新挑战/战役选择纳入同一failureLayout，等宽等高同一行、12px间隔、相同active样式。campaign按钮保存后调用onExitCampaign，绝不触发重试。主项目/狼关同步。去除小游戏外层lost独立入口，保留won入口；浏览器父页面在lost时隐藏重复浮动返回。原新手尚未解锁战役选择时保留原规则与上一幕重试。

24项图鉴/战役测试通过；8项失败结算及按钮操作测试通过，覆盖主项目与狼关390×844、844×390、320×568。174帧w/h均等于原始ow/oh。Canvas核验横竖失败界面、原精度图鉴。包20920131字节，主包2091281字节，存档保留。0542钢铁素材包未单独上传，合并在0543。
未上传：用户补充三项选项后，取消上传并合并到0545。
