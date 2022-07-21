self.version = 3;

console.log(`service worker rigistered success!`);

self.addEventListener("install", (event) => {
  console.log("install hook executed success!");
});

self.addEventListener("activate", (event) => {
  console.log(
    `activate hook executed success!  current version is ${self.version}.`,
  );
});

self.addEventListener("fetch", (event) => {
  console.log(location, "--line16");

  if (event.request.url === "http://127.0.0.1:8080/data.txt") {
    event.respondWith(new Response("Hello World"));
  }
  // 全等匹配
  if (event.request.url === "http://127.0.0.1:8080/data.txt") {
    // 匹配成功
  }
  // 正则匹配
  if (/\/data\.txt/.test(event.request.url)) {
    // 匹配成功
  }

  // 借助 URL 进行匹配
  let url = new URL(event.request.url);
  if (
    url.hostname === "127.0.01" &&
    url.port === "8080" &&
    url.pathname === "/data.txt"
  ) {
    // 匹配成功
  }

  // 匹配 POST 请求
  if (event.request.method === "POST") {
    // 匹配成功
  }

  // 匹配 text/html 资源类型请求
  if (event.request.headers.get("Content-Type") === "text/html") {
    // 匹配成功
  }

  function match(rule, request) {
    switch (Object.prototype.toString.call(rule)) {
      // url 文本匹配
      case "[object String]":
        // 使用 URL() 将匹配规则传入的路劲补全
        return request.url === new URL(rule, location).href;

      // url 正则匹配
      case "[object RegExp]":
        return request.url.match(rule);

      // 支持自定义匹配
      case "[object Function]":
        return rule(request);
    }
  }

  // 完整版 URL 匹配
  match("http://127.0.0.1:8080/data.txt", event.request);

  // 相对路径 URL 匹配
  // 假设当前页面网址为 http://127.0.0.1:8080/index.html
  // 那么 /data.txt  会自定补全为 http://127.0.0.1:8080/data.txt
  match("/data.txt", event.request);

  // 正则匹配
  match(/\/data\.txt/, event.request);

  // 自定义匹配方法
  match((request) => request.url.indexOf("/data.txt") > 0, event.request);

  // 1. 直接返回 Response 对象
  event.respondWith(new Response("Hello World"));

  // 2. 等待 1 秒钟后异步返回 Response 对象
  event.respondWith(
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(new Response("Hello World"));
      }, 1000);
    }),
  );

  // 错误用法
  self.addEventListener("fetch", (event) => {
    if (event.request.url === "http://127.0.0.1:8080/data.txt") {
      setTimeout(() => {
        event.respondWith(new Response("Hello World!"));
      }, 1000);

      // 错误原因: promise 返回结果非 Response 对象
      event.respondWith("Hello World!");
      event.respondWith(Promise.resolve());
      event.respondWith(Promise.resolve("Hello World!"));

      // 错误原因: 存在未处理的异步错误
      event.respondWith(Promise.reject(new Response("Hello World!")));

      function respond(event, handler) {
        try {
          // 执行响应处理方法，根据返回结果进行兜底
          let res = handler(event.request);
          // 异步的响应结果兜底
          if (res instanceof Promise) {
            let promise = res
              .then((response) => {
                // 如果返回结果非 Response 对象，抛出错误
                if (!(response instanceof Response)) {
                  throw Error("返回结果异常");
                }
                return response;
              }) // 异步响应错误处理，即直接返回状态码为 500 Response 对象
              .catch(
                () => new Response("Service Worker 出错", { status: 500 }),
              );
            event.respondWith(promise);
            return;
          }

          // 同步响应如果出现任何错误
          // 可以选择不调用 event.respondWith(r)
          // 让资源请求继续走浏览器默认的请求流程
          if (res instanceof Response) {
            event.respondWith(res);
          }
        } catch (e) {}
      }
    }
  });
});

// console.log("service worker 抓取请求成功: " + event.request.url);
self.addEventListener("message", (event) => {});
