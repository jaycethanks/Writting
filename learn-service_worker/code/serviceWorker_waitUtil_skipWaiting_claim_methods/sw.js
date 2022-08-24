self.version = 6;

console.log(`service worker rigistered success!`);

self.addEventListener("install", (event) => {
  console.log("install hook executed success!");
});

self.addEventListener("activate", (event) => {
  console.log(
    `activate hook executed success!  current version is ${self.version}.`,
  );
});

class Router {
  constructor() {
    // 存放路由规则
    this.routes = [];
    // 注册 fetch 事件拦截
    this.initProxy();
  }
  initProxy() {
    self.addEventListener("fetch", (event) => {
      // 当拦截到资源请求时，会遍历已经注册的路由规则，并执行相应规则所对应的策略
      for (let route of this.routes) {
        // 使用前面封装好的 match 函数进行路由规则匹配
        if (match(route.rule, event.request)) {
          // 使用前面封装好的 respond 方法执行回调操作
          respond(event, route.handler);
          break;
        }
      }
    });
  }
  registerRoute(rule, handler) {
    this.routes.push({ rule, handler });
  }
}

self.addEventListener("fetch", (event) => {
  // 判断当前拦截到的请求为跨域图片资源
  if (event.request.url === "http://placeimg.com/640/480/nature") {
    event.respondWith(
      // 优先发送网络请求获取最新的资源
      fetch(event.request.url, { mode: "no-cors" })
        .then((response) => {
          throw Error();
          // 将请求得到的响应进行缓存
          // 此时缓存的资源是不透明的
          const cloneReq = response.clone();
          caches
            .open("cache-storage")
            .then((cache) => cache.put(event.request.url, cloneReq));

          // 返回请求响应结果
          return response;
        })
        .catch(
          // 请求失败时在使用缓存资源进行兜底
          () =>
            caches
              .open("cache-storage")
              .then((cache) => cache.match(event.request.url))
              .then((e) => e),
        ),
    );
  }
});

// console.log("service worker 抓取请求成功: " + event.request.url);
self.addEventListener("message", (event) => new Response("Hello World!"));
