# 安卓小游戏支付接入（尚未部署/真单验收）

本实现使用微信小游戏虚拟支付2.0道具直购 `wx.requestMidasPaymentGameItem`，不是小程序 `requestVirtualPayment` 或实物支付。

已实现：服务端固定价格/发货数量，wx.login 绑定 OPENID，双签名，服务端 queryOrder 查单，订单与云档在同一数据库事务中到账，重复查单不重复发货，修订号冲突不覆盖存档。前端回调不加币，取消/待确认/重新打开补给站补查；关闭本地模拟充值。

## 上线阻塞条件

目前只完成可测试的代码链路，不能视为可正式营业的支付系统：

- 待确认账号已开通虚拟支付2.0并发布分区、三个道具。缺少这些配置时云函数拒绝下单。
- 未部署 game-payment 云函数或创建 payment_orders_v1 集合。数据库规则应为所有客户端不可读、不可写。
- 发货推送端点、平台发货应答、退款通知/回收尚未接入。当前仅支持在线查单与重新进入商店补查，不可作为上线版。
- 现有 player-save 允许客户端提交完整游戏经济数据。支付发货已幂等，但整个氪石经济仍不是服务端权威；开放给真实玩家前必须把氪石消费/奖励等迁移到服务端校验，不能宣称已防作弊。
- 未进行安卓真单、断网重进、后台账单核对与退款验收。

## 云端配置（不要放入客户端或提交密钥）

`PAYMENT_ENABLED=false` 默认关闭；联调条件齐备后才开启。
`WECHAT_APP_ID=wx290826620512561a`
`WECHAT_APP_SECRET` 为小游戏服务端 Secret。
`MIDAS_OFFER_ID` 支付应用ID。
`MIDAS_APP_KEY` 与环境对应的支付密钥。
`MIDAS_ZONE_ID` 已发布分区ID。
`MIDAS_ENV=0` 正式 / `1` 沙箱；严格按后台和微信官方环境要求配置。
`MIDAS_PRODUCT_6`、`MIDAS_PRODUCT_30`、`MIDAS_PRODUCT_98` 为三个已发布道具ID。

三档固定：600分→60氪石；3000分→360氪石；9800分→1200氪石。每次购买1件，不接收客户端传价和数量。服务端 epoch 固定现有0028，测试档与手机档不互通；不得为上线清理现有档案。

微信 API 调用需符合服务端IP白名单配置。云函数运行时需支持 URLSearchParams 和 wx-server-sdk 事务。

## 已核对的官方文档

- https://developers.weixin.qq.com/minigame/dev/api/midas-payment/wx.requestMidasPaymentGameItem.html
- https://developers.weixin.qq.com/minigame/dev/guide/open-ability/virtual-payment/goods.html
- https://developers.weixin.qq.com/minigame/dev/guide/open-ability/virtual-payment/signature.html
- https://developers.weixin.qq.com/minigame/dev/api-backend/midas-payment/order/api_pay_v2.queryorder.html

查单URI `/wxa/game/queryorderinfo`；pay_state=2才到账，且校验业务订单号和product_id。signData原字节进行 HMAC-SHA256；session_key不落客户端。订单保留在服务端，客户端只取当前账号最多20笔待确认单；大量取消订单的分页归档仍需完善。
