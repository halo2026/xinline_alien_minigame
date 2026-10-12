# 本地开发

## 环境

- Python 3.9+：日常打包仅使用标准库，无需安装资源提取工具的依赖。
- Node.js 22+ 和 npm：运行内置测试以及 Canvas 渲染验证。
- 微信开发者工具：微信模拟器、扫码真机预览与云开发需要本人登录及该 AppID 的开发权限。

2026-10-04 本机验证环境：macOS、Python 3.10.17、Node.js 23.11.0、npm 10.9.2，微信开发者工具 Stable 1.06.2503300 已安装到 `/Applications/wechatwebdevtools.app`。

## 首次运行

在仓库根目录执行：

```sh
npm ci
npm run dev
```

打开 <http://127.0.0.1:8787/browser/>。服务仅监听本机；Ctrl+C 停止。若端口已占用，复用已有服务或停止它后重启。

本机 npm 曾出现 `UNABLE_TO_GET_ISSUER_CERT_LOCALLY`，使用 macOS 现有 CA 文件可正常安装，无需关闭 TLS 校验：

```sh
NODE_EXTRA_CA_CERTS=/etc/ssl/cert.pem npm ci --registry https://registry.npmjs.org
```

`npm run dev` 启动前构建一次，不是热更新服务器。修改主项目 shared 源码后刷新浏览器；修改狼关源码或验证微信包前执行 `npm run build`。构建更新 `shared/build-info.js` 的时间戳，这是正常的生成差异。

## 微信项目

扫码登录开发者工具后，导入 `outputs/alien-zerg2-wechat`，使用现有 `project.config.json`（AppID：`wx290826620512561a`）。小游戏入口为构建生成的 `minigame/`。不要直接修改其中的生成副本。

浏览器预览使用本地存档；微信云存档验收需要微信登录和云环境访问。此次没有部署云函数、上传体验版或清空存档；模拟器启动按项目现有逻辑访问独立的 simulator 云存档区。云函数部署说明见 `outputs/alien-zerg2-wechat/cloudfunctions/README.md`。

## 验证命令

| 命令 | 用途 |
| --- | --- |
| `npm run build` | 同步狼关、生成微信分包并检查包体上限 |
| `npm run test:smoke` | 构建后校验两套入口、原始资源字节、战役分包及云存档逻辑 |
| `npm run test:render` | 运行依赖真实 Canvas 的 6 个测试文件 |
| `npm test` | 构建后执行两项目全部 JavaScript 测试；保留失败退出码 |

`@napi-rs/canvas` 已在根目录声明并锁定版本。测试及相关资源工具通过标准模块解析加载它，不再依赖原机器的 `work/gear-render/node_modules`。重新提取原版素材仍需要仓库外的原工程与相应工具依赖；仓库已有资源足以完成日常构建。

## 2026-10-04 接续基线

完整克隆基于提交 `b9c3b22`（游戏版本 0.10.04.0337），共 1,387 个已跟踪文件，无子模块或 Git LFS 指针，`git fsck --full` 通过。开发分支为 `codex/dev-environment`。

- 构建成功：16 个分包，总大小 29,675,326 字节，主包 1,098,465 字节（约 1.05 MiB）。
- 启动/打包检查：31/31 通过（含新增图片加载和分包一致性检查）。
- Canvas 渲染检查：16/16 通过。
- Safari 实际加载第一关地图、HUD 和新手引导，本地入口 HTTP 200。
- 全量 JavaScript 测试：949 项，727 通过、222 失败、0 取消。尚未达到全量通过；原仓库已注明部分测试对应旧设计，其余失败需逐项排查，不应仅修改断言消除失败。其中 `page.test.js` 依赖未提交的旧 `miniprogram/pages/index/index.js`。
- 微信开发者工具已登录并导入项目，小游戏编译及模拟器第一关渲染通过；控制台显示 0 错误，存在灰度基础库、SharedArrayBuffer、平台 API 和模拟器方向传感器提示。真机验证尚未进行。

已将两关的图集元数据与地图数据移动至 `level-code` 分包；主包余量从 1,889 字节增加到 998,687 字节（约 975 KiB）。入口仍在所有分包加载后导入关卡。构建清理旧生成目录，避免陈旧文件继续占包。总包距离脚本 30 MiB 上限约剩 1.7 MiB。

本轮修复开发依赖路径、主关卡图片 Promise 等待不结束的问题，调整分包并增加统一命令，未调整游戏规则。新分包已在微信模拟器重新编译并进入第一关。失败分类见 [测试排查记录](outputs/alien-zerg2-wechat/audits/dev-test-triage-20261004.md)；后续优先处理真机验证和剩余测试失败。
