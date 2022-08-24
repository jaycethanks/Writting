[TOC]

Fetch API 是目前最新的异步请求解决方案，它在功能上与 XMLHttpRequest（XHR）类似，都是从服务器端异步获取数据或者资源的方法。 对于有过 AJAX 开发经验的读者应该深有体会，基于 XHR 的异步请求方法在实现上比较复杂。 下面简单演示如何通过 XHR 发送异步请求：

```javascript
// 实例化 XMLHttpRequest
let xhr = new XMLHttpRequest()
// 定义加载完成回调函数，打印结果
xhr.onload = function(){
  console.log("请求成功");
}
// 定义加载出错时的回调函数，打印错误
xhr.onerror = function(err){
  console.error("请求失败");
}
// 设置请求目标
xhr.open("GET","/path/to/text", true)
// 开始发起请求
xhr.send()
```

从上面的代码当中可以感受到，基于事件回调机制的 XHR 在编程实现的思路上非常反思维， 要实现这样一个简单的 GET 请求所需代码较多，一旦功能变得负责会很容易造成混乱。 因此在实际应用当中，一般会选择封装好的函数进行使用， 例如 jQuery 提供的 `$.ajax` 方法。

接下来使用 Fetch API 来实现上述功能：

```javascript
fetch("/path/to/text", { method: "GET" })
  .then((response) => {
    console.log("请求成功");
  })
  .catch((err) => {
    console.log("请求失败");
  });

```

 Fetch API 代码逻辑清晰，代码量少。

## 1. fetch()

Fetch API 提供了 `fetch()` 用来发起网络请求并获得资源响应。它的使用方法非常简单：

```javascript
fetch(request).then(response=>{/* 响应结果处理 */})
```

接受一个 Request 对象作为参数，`fetch()` 发起网络请求，由于网络请求是一个异步过程，因此 `fetch()` 返回一个 Promise 对象，当请求响应时 Promise 执行 resolve 并传回一个 Response 对象。

除了直接以 Request 对象作为参数之外， `fetch()` 还支持传入请求 URL 和请求配置项的方式， `fetch()` 会自动根据这些参数实例化 Request 对象之后再去发起请求，因此以下代码是等价的：

```javascript
fetch(new Request('/path/to/resource',{ method: "GET" }))
// 等价于
fetch('/path/to/resource',{ method: "GET" })
```

需要注意的是，`fetch()` 只有在网络请求终端的时候才会抛出异常，此时 Promise 对象会执行 reject 并返回错误信息。 因此对于 `fetch()` 来说，服务端返回的 HTTP 404、500 等状态码并不认为是网络错误，因此处理检查 Promise 是否 resolve 之外，还需要检查 Response.status、Response.ok 等对象属性以确保请求是否成功响应。 示例：

```javascript
fetch('/paht/to/resource/').then(response => {
  if (response.status === 200){
    // 请求成功
  }else{
    // 请求失败
  }
}).catch(err => {
  // 网络请求失败或者请求被中断
})
```

## 2. Request

Request 是一个用于描述资源请求的类，通过 `Request()` 构造函数，可以实例化一个 Request 对象：

```javascript
let request = new Request(input,init)
```

其中，`input` 代表想要请求的资源，可以是 URL， 或者是描述资源请求的 Request 对象；`init` 为可选参数，可以用来定义请求中的其他选项。 可以注意到，`Request` 构造函数所需要的参数和`fetch()` 方法的参数是一样的。 示例：

1. GET 请求， 请求参数需要写到 URL 中：

   ```javascript
   let getRequest = new Request("/api/hello?name=lilei", {
     method: "GET",
   });
   ```

2. POST 请求， 请求参数需要写到 body 中：

   ```javascript
   let postRequest = new Request("/api/hello", {
     method: "POST",
     body: JSON.stringify({
       name: "lilei",
     }),
   });
   ```

3. 自定义请求的 Headers 信息

   ```javascript
   let customeRequest = new Request("/api/hello", {
     headers: new Headers({
       "Content-Type": "text/plain",
     }),
   });
   ```

4. 设置发起资源请求时带上 cookie

   ```javascript
   let cookieRequest = new Request('/api/hello',{
       credentials:'include'
   })
   ```

init 对象还可配置其他参数，这里不展开讲，介绍以下 Request 对象常用的几个属性：

- url: String 类型，只读，请求的url;

- method: String 类型，只读，请求的方法；

- headers: Headers 类型，只读，请求的头部信息，可通过 `get()` 方法获取信息，例如：

  ```javascript
  if(request.headers.get('Content-Type') === 'text/html'){
    // ...  
  }
  ```

## 3. Response

Response 类，用于描述请求响应数据，通过  `Response()` 构造函数实例化，

```javascript
let response = new Response(body,init)
```

其中 body 参数代表请求响应的资源内容，可以是字符串，FormData, Blob 等等； init为可选参数对象，可以用来设置响应的 status、statusText、headers 等内容，示例：

```javascript
// 如何构造一个 iudex.js 的响应:
let jsResponse = new Response(
  // index.js 的内容
  'console.log("Hello World!)',
  {
    status: 200,
    headers: new Headers({
      "Content-Type": "application/x-javascript",
    }),
  },
);
```

在实际应用当中，我们一般会通过 `fetch()` 、Cache API 等等获得请求响应对象，然后再对响应对象进行操作。

### 3.1  读取响应体

Response 的 body 属性 暴露了一个 ReadableStream 类型的响应体内容，Response 提供了一些方法来读取响应体：

- `text()`: 解析为字符串；
- `json()`: 解析为 JSON 对象；
- `blob()`: 解析为 Blob 对象；
- `formData()` : 解析为 FormData 对象；
- `arrayBuffer()`: 解析为 ArrayBauffer 对象；

这些方法读取并解析响应体的数据流属于异步操作，因此这些方法均返回 Promise 对象，当读取数据流并解析完成时， Promise 对象将 resolve 并同时返回解析好的结果。 示例：

```javascript
// 沟槽 Response 对象
let response = new Response(JSON.stringify({ name: "lilei" }));

// 通过 response.json() 读取请求体
response.json().then((data) => {
  console.log(data.nam); //lilei
});
```

由于Response 的响应体是以数据流的形式存在的，因此只允许进行一次读取操作。 通过检查 bodyUsed 属性可以知道 当前的 Response 对象是否已经被读取：

```javascript
let response = new Response(JSON.stringify({ name: "lilei" }));
console.log(response.bodyUsed); //false
response.json().then((data) => {
  console.log(response.bodyUsed);// true
});
```

由于二次读取响应体内容会导致报错，因此为了保险起见，可以在进行响应体读取前首先判断 `bodyUsed`属性再决定下一步操作。

### 3.2 拷贝 Response

Response 提供了 `clone()` 方法来实现对 Response 对象的拷贝：

```javascript
let clonedResponse = response.clone()
```

**`clone()` 是一个同步方法，克隆得到的 新对象再所有方面与原对象都是相同的。 在这里需要注意的是，如果 Response 对象的响应体已经被读取， 那么在调用 `clone()` 方法的时候会报错，因此需要在读取响应体读取之前进行克隆操作。**

## 4. Fetch API 处理跨域请求

当涉及到前后端通信问题的时候，就不得不提请求跨域的情况。由于受到 Web 同源策略的影响，在使用 Fetch API 默认配置情况下发送异步请求，会受到跨域访问限制而导致资源请求失败。

我们通常采用跨域资源共享机制（CORS）来解决这个问题。在跨域服务端支持 CORS 的前提下，通过将 `fetch()` 的请求模式设置为“cors”，就可以简单地实现跨域请求。在这种请求模式下，返回的请求响应是完全可访问的：

```javascript
// 假设当前页面 URL 为 https://current.com
fetch('https://other.com/data.json', {
  mode: 'cors'
})
.then(response => {
  console.log(response.status) // 200
  console.log(response.type) // 'cors'
  console.log(response.bodyUsed) // false
  return response.json()
})
.then(data => {
  console.log(data.name) // 'lilei'
})
```

:star: 对于图片、JS、CSS 等等这些类型的静态资源，如果通过对应的 HTML 标签加载这类跨域资源，是不会受到同源策略限制的，因此一般来说，存放静态资源的服务器并不需要设置 CORS。这就会对 Fetch API 请求这类静态资源带来影响。**在默认情况下 `fetch()` 的请求模式为“no-cors”，在这种模式下请求跨域资源并不会报错，但是返回的 Response 对象将变得不透明**，type 属性将变成“opaque”，**无论服务端所返回的真实 status 是多少，在这种情况下都会变成 0，其他属性也都无法正常访问**：

```javascript
// 假设当前页面 URL 为 https://current.com
fetch('https://other.com/data.json', {
  mode: 'no-cors'
})
.then(response => {
  console.log(response.status) // 0
  console.log(response.type) // 'opaque'
  console.log(response.headers) // Headers {}
  console.log(response.body) // null
})
```

此时唯一能正常工作的方法是 clone()，即实现对 Response 对象的拷贝，当然拷贝得到的新对象也同样是不透明的。这种模式比较适用于在 Service Worker 线程中拦截静态资源请求并复制一份缓存到本地，**只要将这类不透明的请求响应返回主线程，依然是能够正常工作的**。下面的代码演示了 Service Worker 拦截跨域图片资源并将资源缓存到本地，然后在 `fetch()` 出错的时候再从缓存中读取资源：

```javascript
self.addEventListener("fetch", (event) => {
  // 判断当前拦截到的请求为跨域图片资源
  if (event.request.url === "https://other-site.com/pic.jpg") {
    event.respondWith(
      // 优先发送网络请求获取最新的资源
      fetch(event.request.url, { mode: "no-cors" })
        .then((response) => {
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
```

> @jayce 原文这里写的有点问题，`cache.match(event.request.url)` 返回的不是 Response 对象，而是一个 Promise ,所以要进一步处理。加一个 `.then()`

在这种情况下，图片资源的 Response 对象是不透明的，因此整个操作过程无法对图片资源响应做任何检查判断，只能直存直取。这就有可能将真实状态码为 404、500 等错误响应给缓存下来，因此在“no-cors”模式下缓存的跨域资源的可信度不高，最好作为各类请求策略的兜底资源进行使用。



上面这段代码，具体在做什么？

实际上它希望，我先拦截三方站点的 图片 请求，然后尝试去请求，然后缓存下来。但是，如果请求不到， `fetch()` 会报错，这时候 被 `catch` 到后，会从先前的缓存中去取出缓存。 注意，缓存的是一个 Response 对象，所以在取得时候直接返回对应的 Response 对象即可。 

为了更加清楚以上的原理，下面用一个实例来说明。 

> 关于Service Worker 的内容，后面有介绍，这里提前用一下，为了说明这个地方在做什么，为什么要这么做，有什么效果。

有这样一个页面，

```html
<img src="http://placeimg.com/640/480/nature" alt="" />
```

为了直观的观察，这个 API 也有特殊的地方，每次刷新，都会去加载不同的图片：

![170359](https://img2022.cnblogs.com/blog/1735896/202207/1735896-20220722171750528-1488479965.gif)

这个API 是一个三方站点的 API， 它并不会触发跨域。 但是会被下面的 Service Worker 拦截：

```javascript
self.addEventListener("fetch", (event) => {
  // 判断当前拦截到的请求为跨域图片资源
  if (event.request.url === "http://placeimg.com/640/480/nature") {
    event.respondWith(
      // 优先发送网络请求获取最新的资源
      fetch(event.request.url, { mode: "no-cors" })
        .then((response) => {
          throw Error()
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
```

注意，为了触发 `catch` 中的方法，这里刻意通过 `throw Error()` 抛出了异常，

![171527](https://img2022.cnblogs.com/blog/1735896/202207/1735896-20220722171745018-547873924.gif)

可以看到，现在，请求被拦截并且由错误处理，返回了缓存中的资源。 