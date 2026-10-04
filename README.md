# 异星要塞 · 微信小游戏

当前开发版本包含「异虫」「护矿使者」「双头蛇窟」「母舰」「氪石矿脉」「母巢护卫」等战役及「扫除虫患」。游戏代码、打包所需资源、测试与制作记录保存在本仓库。

## 构建与运行

使用 Python 3.9+：

```sh
python3 outputs/alien-zerg2-wechat/tools/package-game.py
```

在微信开发者工具中导入 `outputs/alien-zerg2-wechat`，入口是生成后的 `minigame/`。开发者工具个人设置不入库。

浏览器预览：

```sh
python3 -m http.server 8787 --directory outputs/alien-zerg2-wechat
```

打开 http://127.0.0.1:8787/browser/ 。

## 目录

- `outputs/alien-zerg2-wechat/shared`：主游戏逻辑、渲染与养成。
- `outputs/alien-wolf-wechat/shared`：「扫除虫患」关卡源码，由构建脚本同步至主项目。
- 两个项目的 `assets`：当前运行资源。
- `tests`：Node.js 自动化测试；部分历史测试对应旧设计，以当前变更相关测试为准。
- `tools`：构建与原版资源提取脚本。日常打包使用已提交资源；重新提取原版素材另需本地原工程与相应 Python 依赖。

本仓库不包含本地 SDK、原版完整工程、工具运行时、个人存档、登录凭据或重复生成的资源分包。

当前同步基线：体验版和开发版 0.10.04.0337（风火轮灼烧伤害翻倍）。资源不附加开源授权。
