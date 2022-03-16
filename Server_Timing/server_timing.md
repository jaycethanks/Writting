## #Server Timing #Chrome #devTools Network tab

- Queueing: 排队等候，当以下情况出现时，浏览器会将请求进行排队
	- 有更高优先级的请求
	- 当前服务器连接已经有6个TCP连接，这是HTTP/1.0 和 HTTP/1.1 的限制
	- 浏览器正在磁盘缓存分配空间

- Stalled: 延缓， 请求可能被 Queueing 中描述的情况延缓
- DNS Lookup: DNS 查询， 浏览器正在解析请求的 IP 地址
- Initial Connection: 初始化连接， 浏览器正在建立连接，包括 TCP 三次握手/重试，以及SSL协商。
- Proxy Negotiation：浏览器正在和代理服务器协商请求。
- Request Sent: 发送请求， 请求已被发送。
- ServiceWorker Preparation: ServiceWorker 准备， 浏览器正在开启 service worker（工作线程）
- Request to ServiceWorker: 请求被发送到 service worker
- Waiting(TTFB): 浏览器正在等待响应的第一个字节，TTFB 是 "Time To First Byte" 的缩写，此时间包括 1 次往返延迟和服务器准备响应所需的时间
- Content Download: 内容下载， 浏览器从服务器或者service worker接收响应。 这个值是响应体解析所消耗的所有时间，这个值如果太大，可能意味着网络太慢，或者浏览器正在忙于其他工作因而延迟了响应的解析。
- Receiving Push: 浏览器通过 HTTP/2 接收来自Server Push的响应。
- Reading Push: 浏览器正在读取之前接收的本地数据。
