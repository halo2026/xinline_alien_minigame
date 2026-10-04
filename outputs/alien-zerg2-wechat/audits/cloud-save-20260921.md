# 云存档接入（待环境）

用户确认尚未开通微信云开发。未部署云函数、未上传体验版，env 保持空字符串；当前游戏仍走原本地存档，不清零。

新增 shared/cloud-save.js、cloud-config.js、cloudfunctions/player-save；项目声明 cloudfunctionRoot。原生入口接入启动账号读取、旧档迁移、前台检查、后台上传、冲突提示、读取云端后重建关卡。保存最近战役，复用每幕检查点，不保存完整战斗快照。云存档客户端代码置于现有 defense-code 分包以满足主包限制。

云函数依据平台上下文识别账号；请求绑定 owner 防止中途换微信导致写入另一账号；首次创建使用唯一文档 ID，后续使用事务检查 revision，operation ID 支持丢响应重试。数据库规则要求客户端拒绝读写。开发/体验版使用同一环境时共享存档。

10 项云存档模拟测试通过；加上方向菜单、音效预算、商城，总计 26 项通过。校验过 wx-server-sdk 3.0.1 源码中 runTransaction 与事务 doc.get 的结果结构。原生入口和云函数语法检查通过；打包体积检查通过。

实际云端部署、权限、双手机验收尚未完成。部署步骤及验收矩阵在 cloudfunctions/README.md。当前不提供付费余额防作弊，仍为模拟商店，真实支付必须服务器核验。


## 环境部署完成

用户提供环境 cloudbase-d8ggxav45ef39f6bb。已在开发工具云控制台核对属于异星要塞；创建 player_saves_v1，权限选择所有用户不可读写；本地 cloudfunctions 绑定 cloudbase 并完成 player-save 云端安装依赖部署。

配置启用云存档，打包通过（主包 2,093,780 字节，总计 20,199,242 字节）。11 项存档测试与 3 项屏幕方向测试通过。

真实小游戏运行时 wx.cloud.callFunction 只读验证：simulator 返回 status=ok、revision=146、level=4；player 返回 status=ok 且 record=null。服务器已有多次成功写入及事务更新。手机正式区用 phone-v1，初次接线过程留下的模拟器调试记录保留、不删除，且不用于手机存档。手机区保持空档，等待手机旧数据首次迁移。

开发工具平台必须使用 getDeviceInfo().platform，不能从 getWindowInfo() 读取 platform。模拟器区与手机区分开，手机开发版/体验版仍共享 phone-v1。

尚未两台手机真机验收；本轮没有上传小游戏体验版，没有清空手机或本地旧存档。发布后应先在有进度的旧手机打开完成迁移，再在另一手机验证。
