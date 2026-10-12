# 0050 干净肖像重新生成（本地完成）

用户拒绝0049局部去星补图留下的黑框。全部11角色×2个星级逐张重新生成，共22张，保存到 source-art/operator-stars/clean-v2。manifest.json记录每张完整提示词、原参考和生成输出。保留旧原图。

build-operator-stars.py只打包clean-v2，并移除remove-operator-stars.cjs调用，不再贴补片。主版与wolf运行时图集同步；保留0048头部留白和0049取消图内代码星标，下方正式星级保持。

已人工检查22张完整图和实际operatorPortrait+portraitEdgeFade渲染。头顶完整，无UI星标、黑色角框和边框。实际科技确认界面验证星级仅在肖像下方。预览：work/0050-all-operator-stars.jpg、work/0050-portraits.png、work/0050-detail.png。

图集366038字节，2112×576。打包31274516字节，主包1299803字节，预算通过。35 smoke及10 operator-stars检查全部通过。日志work/0050-smoke.log和work/0050-portraits-test.log。

存档KEY/epoch0028保留。未上传；最新体验版仍0.10.12.0049，下次版本0050。原生“更多游戏”未解决，本次未改动该逻辑。
