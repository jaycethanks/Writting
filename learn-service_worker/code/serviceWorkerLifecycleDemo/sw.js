// sw.js
console.log("service worker 注册成功");

self.addEventListener("install", (event) => {
  // 引入 event.waitUntil 方法
  event.waitUntil(
    new Promise((resolve, reject) => {
      // 模拟 promise 返回错误结果的情况
      // reject("安装出错");
      resolve("安装成功");
    }),
  );
});

self.addEventListener("activate", (event) => {
  // 激活回调的逻辑处理
  console.log("service worker 激活成功");
});
console.log("发生了改变", "--line19");

console.log(self, "--line28");
self.addEventListener("fetch", (event) => {
  console.log("service worker 抓取请求成功: " + event.request.url);
});
