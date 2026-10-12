# 微信原生“更多游戏”遮挡核查（未修复）

2026-10-11，接续开发5。未修改运行代码、未构建、未上传；最新体验版仍0.10.11.0047，0048未使用。存档KEY/epoch0028保持。

## 已核实

- 已查看用户截图：左边黑色“〈 更多游戏 + 手柄”与右上微信菜单同时存在，遮住装备属性。不能据此判断是游戏圈按钮，也不能确认由横屏触发。
- tools/package-game.py保留minigame/game.js，该文件确为维护入口；打包重写game.json和shared等副本。game.json为portrait/showStatusBar:false。
- 主/wolf shared与入口搜索没有createGameClubButton、MoreGame、GamePortal或“更多游戏”创建逻辑。responsive.managementSafeRight只使用右上菜单矩形避让，与截图左侧入口不同。
- 入口通过加速度在稳定900ms后切方向，切换间隔2秒；onShow/resize更新画布。无足够证据表明这些代码导致原生入口偏移。未盲目强制旋转或添加虚构隐藏API。
- 已查本机微信开发工具3.8.21游戏API类型，以及官方https://github.com/wechat-miniprogram/minigame-api-typings 的master/types/wx/lib.wx.api.d.ts；未找到对应“更多游戏”入口的位置/隐藏接口。setMenuStyle仅light/dark。类型中未找到不等于平台绝无其他机制。
- 官方文档直连浏览工具失败；多次检索没有找到能准确对应截图的官方说明，不以第三方推测作结论。
- 通过cua选择当前com.github.Electron，确认alien-zerg2窗口和正确项目路径。屏幕仍是0047遗留的“代码上传成功”；本轮没有执行上传，不得报告0048成功。未关闭/重启App。

## 缺少证据

已向用户询问出现问题的手机型号、系统版本、微信版本，待答。用户此前已确认刚进入即出现、进游戏前横屏看视频、反复横竖屏或保持竖屏不恢复，不重复问这些问题。下一步依设备信息核对平台行为或真机调试；必须有可验证修复再发布0048。
