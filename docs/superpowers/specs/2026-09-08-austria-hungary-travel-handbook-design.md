# 旅行手册设计

目标：一个面向两位旅行者的单文件、零外部依赖旅行手册；移动端快速、离线可读，并用 Cloudflare Workers 从 GitHub 自动发布。

公开页面必须按顺序包括倒计时、手绘 SVG 总览路线、已确认订单、逐日行程、不可勾选待办、实用贴士。地点使用用户点击触发的 Google Maps 链接；每天有可展开路线图和多点导航。系统深浅色自动适配。所有时间显示时区，并用带 UTC 偏移的绝对 ISO 时间计算倒计时。

已确认：CA1566 上海虹桥 T2 2026-09-30 22:30 CST 至北京首都 T3 00:55 CST；CA719 北京首都 T3 10-01 03:00 CST 至布达佩斯 T2B 07:00 CEST；CA618 维也纳 T3 10-09 19:00 CEST 至北京首都 T3 10-10 10:20 CST；CA1533 北京首都 T3 12:30 至上海虹桥 T2 14:45 CST。酒店：Hotel GIN Budapest（10/01–02）、Strandhotel Margaretha（10/03）、Hotel Villa Carlton（10/04–06）、MAXX by Steigenberger Vienna（10/07–08）。

待购买/预约：10/03 Budapest-Keleti 07:30 至 St. Wolfgang 14:38 火车；10/07 萨尔茨堡至维也纳下午火车；国会、美泉宫、沙夫山、沃尔夫冈湖船、国王湖船。绝不公开确认号、证件号、房间号、价格或修改日志。
