# 氪石矿脉图标与旧底座清理 — 0.9.28.0246

用内置image_gen生成独立透明关卡图标：金色/琥珀色氪石矿山、深色岩体、采矿金属支架、前景虫族甲壳头部与利爪。完整源图和提示词在artwork/greenstar/kryptonite-mine-icon.png、PROMPT.md。将缩略图加入campaign-nodes第7格，保留原6格；mission-menu的greenstar art=6，选中时矿脉金色流光，禁用原机械图位的引擎尾焰。更新导入脚本防止重建丢失图标。

用户追加移除旧雇佣宠物底座。核对原版15505宠物台使用MODEL_EFFECT:ditai2；母舰仍有同造型campaign-prop/11009蓝色圆形底座(960,2384)。移除此场景prop和单位记录，原blocks为空，不改变导航。排查所有当前战役及wolf/base，没有其他渲染该底座的prop。导入脚本跳过ditai2以防恢复。

验证：35/35关卡、母舰技能、复活、分包启动相关检查；全部关卡底座缺席与新图位断言通过。Canvas星图420×900及900×420视觉检查。旧campaign-menu/mission-menu共4项历史断言仍针对7关/2关和旧初始状态，未为本次改动修改。未进行完整真机关卡通关。

包体20,705,317字节，主包2,091,348字节，符合限制。存档保留。

发布验证：体验版Upload Successfully；同包开发版Preview20057KB，9/28 03:15有效期，确认已刷新。
