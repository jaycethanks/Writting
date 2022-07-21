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
  console.log("service worker 抓取请求成功: " + event.request.url);
});

self.addEventListener("message", (event) => {});
