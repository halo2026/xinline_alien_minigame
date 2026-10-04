# 氪石矿脉出口、开场和桥梁 — 0.9.27.1419

删除外侧偷袭路的纯灰色144宽实线覆盖，保留原地面镜像、纹理渐变衔接。两条左翼路径的起点x从-240移到-130，使用已有hive-cave-side.png；地面背景与前景遮挡分别绘制，出口朝地图内。加载器和浏览器视图均加载该已有素材。

战车出生点改为中央矿厂右上方(1083,1307)，与矿厂共同从620高度按2.3秒时序降落。恢复中央矿厂的推进焰/落地尘土，镜头照顾两者，侧边矿厂不参与隐藏。4.5秒原开场结束机制不变。

两座工兵桥总长度改为原来的84%，保持原中心、桥宽、导航和道路禁建规则。

37/37相关测试通过（greenstar-campaign、greenstar-visuals、greenstar-borders-and-squads、campaign-respawn、packaged-startup、cave-loader、battle-intro）。新增检查出口与出生点、60宽战车导航、侧向素材打包加载、联合降落时序。实际Canvas检查两处出口、四个降落时间点、全图短桥。未进行手机端全30波通关。

额外运行的旧spawn-caves.test.js其中一条仍按原始单位HP断言，遇到既有大型虫族突破加成30000/10000失败；与本次改动无关，保留原测试未改动。

构建2026-09-27T14:19:43+08:00，总包20454556字节，主包2090163字节。存档epoch未变。
Release verified: 0.9.27.1419 Upload Successfully; same-package Preview 19813 KB, expires 2026-09-27 14:47. Both complete.
