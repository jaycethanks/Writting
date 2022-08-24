[toc]

## 1. Service Worker 简介

### **1.1  主线程 与 工作线程**

通常所讲的 Service Worker 指的是 Service Worker 线程。 浏览器中执行的 JavaScript 文件是运行在一个单一的线程上，称之为 **主线程**。 而 Service Worker 是一种独立于浏览器主线程的 **工作线程**， 它与当前浏览器主线程是完全隔离的，且<u>有着自己独立的执行上下文</u>。

### **1.2  PWA 重要技术**

Service Worker 能提供一种良好的统筹机制对资源缓存和网络请求进行缓存和处理，是PWA 实现离线访问，稳定访问，静态资源缓存的一项重要技术。 



### **1.3  通过demo快速认识下 Service Worker**

借由一个简单的demo 了解下什么是 Service Worker。

```bash
$ mkdir serviceWorkerDemo
$ touch serviceWorkerDemo/index.html serviceWorkerDemo/sw.js
$ tree
.
└── serviceWorkerDemo
    ├── index.html
    └── sw.js
```

**index.html**

```html
<!DOCTYPE html>
  <head>
    <title>Service Worker Demo</title>
  </head>
  <body>
    <script>
      navigator.serviceWorker.register('./sw.js')
    </script>
  </body>
</html>
```

H5 提供了一个 Service Worker API ， 能够进行 Service Worker 线程的注册、注销等工作，在该实例中，通过 `navigator.serviceWorker.register()`方法，就能够注册一个 Service Worker, 在当前的浏览器主线程的基础上新起一个 Service Worker 线程。

Service Worker 文件可以任意命名，这个的实例为 `sw.js`, 其内容就是在 Service Worker 线程 上下文（Context）中执行的内容（如果文件为空，那么worker 线程什么也不会做），由于 Service Worker 线程是独立于主线程的工作线程， 所以在  `sw.js` 中的任何操作都不会影响到主线程。 

> 利用 `lite-server` 、`local-web-server` 等web服务工具启动 页面， 或者使用 VS code 中的 `live-server` 插件，启动页面。在Chrome 浏览器中，可以 在 `Applications > Service Worker` 面板中看到当前 Service Worker 线程的状态。
>
> ![image-20220720103412063](Service_Worker指南-1.assets/image-20220720103412063.png)

如果调节当前网络状态为 [离线]， Service Worker 依然能够正常工作，所以通过这个例子可以发现， Service Worker 不仅是一个独立于主线程的工作线程，并且还是一个可以在离线环境下运行的工作线程。这也正是 PWA 的离线与缓存功能实现的可行性基础。



### 1.4 为什么会出现 Service Worker ?

Service Worker 的来历可以从两个方面来介绍：

一方面，由于浏览器中 JavaScript 单线程执行的特性，随着 Web 技术更迭，业务也在不断的复杂化，在 JavaScript 中往往会出现很多耗资源，耗时间的复杂运算过程。所以 W3C 先是提出了 **Web Worker** API 来解放主线程， 开发者可以将耗时任务放在 Web Worker 中进行，工作完成后，通过 `postMessage` 告诉主线程结果，主线程则通过 `onMessage` 接收 Web Worker 的执行结果，从而释放主线程的性能压力。

但是， Web Worker 是临时存在的，每次做的事情的结果不能被持久存下来，下次访问 Web App 同样的复杂工作还需要被 Web Worker 重新处理一遍，这同样也是一件消耗资源的事情，只不过不在主线程消耗而已。 

那能不能有一个 Worker 线程是一直可以持久存在的，并且随时准备接收主线程的命令呢？ 基于这样的需求， W3C 推出了最初版本的 Service Worker， **Service Worker 在 Web Worker 的基础上加了持久离线缓存能力**，可以通过自身的 **生命周期** 特性保证复杂的工作只处理一次，并且持久缓存处理结果。



而另一方面，为了结果 Web 网络连接不稳定的问题， W3C 很早就推出了  ApplicationCache 机制来解决离线缓存的问题， 做法是在 HTML 页面中指定一个 清单文件 `manifest.appcache`, 清单中指定需要离线缓存的静态资源， ApplicationCache 能够解决离线可访问的问题。 

**一个示例：**

假设存在这么一个项目目录：

```bash
.
└── applicationCacheDemo/
    ├── index.html
    └── manifest.appcache
```

**index.html**

```html
<!DOCTYPE html>
<html manifest="./manifest.appcache">
</html>
```

**manifest.appcache**

```yaml
CACHE MANIFEST
# version xx.xx.xx
CACHE:
cached.png
cached.js

NETWORK:
noCached.html
noCached.css

FALLBACK:
/ 404.html
```

`CACHE` 字段配置了需要在当前页面离线缓存的静态资源，`NETWORK` 字段配置了当前页面不需要离线缓存的静态资源， `FALLBACK` 字段制定了一个后备页面，当资源无法访问时，浏览器会使用该页面。 该段落的每条记录都列出了两个 URI， 第一个表示资源，第二个表示后备页面。两个URI都必须使用相对路径并且与清单文件同源。 可以使用通配符。

虽然通过 ApplicationCache 机制能够解决 Web App 的离线缓存问题，但是同时也带来了不小的问题：

- 在 manifest.appcache 文件中定义的资源全部被成功加载后，这些资源文件连同引用 manifest.appcache 文件的 HTML 文档一并被移动到永久离线缓存中。 所以如果只想缓存 JS、CSS、Image 等文件，而不希望缓存 HTML 文档以保持最新内容的情况来说，是个非常大的问题。
- 根据 ApplicaionCache 的加载机制，<u>如果仅仅修改被缓存资源文件的内容（没有修改资源文件的路径或者名称），浏览器将直接从本地离线缓存中获取资源文件。</u> 所以每次修改资源文件的同时，需要修改manifest.appcache 文件，以触发资源文件的重新加载和缓存，维护成本太高。
- 靠一个 manifest.appcache 配置文件来维护一个复杂的站点的缓存策略实在是一件非常艰难的工作，毕竟单纯靠配置是非常不灵活的。 
- 对动态请求无法处理。

通过一段时间的实践后， W3C 决定废弃 ApplicationCache。



Service Worker 就很好的解决了 ApplicationCache 的痛点问题，它能够通过非常多的缓存策略来灵活的管理 Web App 的离线缓存，大大降低维护成本。
基于 Worker 的工作线程的离线能力，和离线缓存机制的双重迫切需求， W3C 最终提出的 Service Worker API 可以以独立工作线程的方式运行，结合持久缓存调度策略，能够很好的解决离线缓存问题，并且剋以非侵入的方式与现存的 Web App 结合使用，从而实现 PWA 渐进式的离线与缓存的效果。



### 1.5  Service Worker 的特点

Service Worker 功能虽然强大，但是使用 Service Worker 还是有一定的条件以及一些专用的特点的。

1. 必须运行在 HTTPS 协议下
   出于安全的考虑， Service Worker 必须运行在 HTTPS 协议下， Git pages 是一个用来测试 Service Worker 的好地方，因为它就支持 HTTPS， 直接就可以测试静态页面和静态资源，为了便于本地开发测试，`localhost`， `127.0.0.1` 这种非 HTTPS 协议也被浏览器认为是安全源。

2. 有自己完全独立的执行上下文

   Service Worker 线程有自己完全独立的执行上下文，一旦被安装成功就永远存在，除非线程被程序主动解除，而且 Service Worker 在访问页面的时候可以直接被激活，如果关闭浏览器或者浏览器的标签的时候， 会自动睡眠，以减少资源损耗。

3. 不能直接操作 DOM

   Service Worker 是完全异步实现的，内部的接口的异步化都是通过 Promise 实现，并且在 Service Worker 中不能直接操作 DOM， 出于安全和体验的考虑， UI 的渲染工作必须且只能在主线程中完成。

4. 可以拦截并代理请求，可以处理请求的返回内容

   Service Worker **可以拦截并代理请求，可以处理请求的返回内容**，可以持久化缓存静态资源达到离线访问的效果，和 ApplicationCache 不同， Service Worker 的所有离线内容<u>开发者完全可控</u>，甚至是可以控制动态请求，第三方静态资源等。

5. 消息推送，后台同步

   由于 Service Worker 可以离线并且在后台工作，所以可以进行 **推送消息**， **后台同步** 资源等功能。



## 2. Service Worker 注册

本节会介绍如何注册一个 Service Worker、在不同项目架构下注册 Service Worker 的方法、 Service Worker 注册的一些细节和注意点等。

### 2.1 作用域

Service Worker 是有自己的作用域的， Service Worker 的作用域是一个 URL path 地址， 指的是 Service Worker 能够控制的页面的范围， 例如： 某个 Service Worker 的作用域为 `https://somehost/a/b`， 那这个 Service Worker 能控制 `https://somehost/a/b` 目录下的所有页面，可以包含下面列出的页面：

- `https://somehost/a/b/index.html`
- `https://somehost/a/b/c/index.html`
- `https://somehost/a/b/another./html`
- ...

所谓 “控制页面” 指的是， S二vice Worker 可以处理这些页面里面的资源请求和网络请求，然后通过 Service Worker 自身的调度机制构建离线缓存策略。 如果页面不在 Service Worker 的作用域范围内， Service Worker 就无法处理页面的任何资源或请求。

为了加深对 Service Worker 作用域的理解，接下来还是来看下 serviceWorkerDemo 这个示例：

**index.html**

```html
<!DOCTYPE html>
  <head>
    <title>Service Worker Demo</title>
  </head>
  <body>
    <script>
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
          .then(reg => {
            console.log(reg)
          })
      }
    </script>
  </body>
</html>
```

从上面的代码可以看出 `navigator.serviceWorker.register()` 方法返回的是一个 Promise ， 这个 Promise 中 resolve 返回的是 Service Worker 注册成功后返回的 ServiceWorkerRegistration 对象。 其打印结果如下：

![image-20220720135622492](Service_Worker指南-1.assets/image-20220720135622492.png)

ServiceWorkerRegistration 对象中的 scope 的值就是当前 Service Worker 的作用域，在这个示例中为 `http://127.0.0.1:5500/` 。

为了更直观的看到 Service Worker 作用域的工作原理，接下来新建一个 serviceWorkerScopeDemo项目：
```bash
$ mkdir serviceWorkerScopeDemo/a/b -p
$ touch serviceWorkerScopeDemo/index.html serviceWorkerScopeDemo/a/b/sw.js
$ tree serviceWorkerScopeDemo
serviceWorkerScopeDemo
├── a
│   └── b
│       └── sw.js
└── index.html
```

**index.html**

```html
<!DOCTYPE html>
  <head>
    <title>Service Worker Scope Demo</title>
  </head>
  <body>
    <script>
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./a/b/sw.js')
          .then(reg => {
            console.log(reg.scope)
            // http://127.0.0.1:5500/a/b/
          })
      }
    </script>
  </body>
</html>
```

将 `navigator.serviceWorker.register()` 方法的 Service Worker 文件 URL 改成 `./a/b/sw.js`，运行结果打印出来的 scope 结果为 `http://127.0.0.1:5500/a/b/`。通常情况下在注册 `sw.js` 的时候会忽略 Service Worker 作用域的问题，Service Worker 默认的作用域就是注册时候的 path, 例如：Service Worker 注册的 path 为 `/a/b/sw.js`，则 scope 默认为 `/a/b/`。

也可以通过在注册时候在 `navigator.serviceWorker.register()` 方法中传入 `{scope: '/some/scope/'}` 参数的方式自己指定作用域，如下代码所示：

```html
<!DOCTYPE html>
  <head>
    <title>Service Worker Scope Demo</title>
  </head>
  <body>
    <script>
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./a/b/sw.js', {
          // 手动指定一个作用域
          scope: '/a/b/c/'
        }).then(reg => {
          console.log(reg.scope)
          // http://127.0.0.1:5500/a/b/c/
        })
      }
    </script>
  </body>
</html>
```

将 scope 配置 `{scope: '/a/b/c/'}` 传入 `navigator.serviceWorker.register()` 方法，运行后打印出来的内容为 `http://127.0.0.1:8000/a/b/c/`。也就是说可以通过参数为 Service Worker 指定一个作用域。当然，这个自定义作用域是不可以随意指定的，可以通过如下代码修改 `index.html`：

```html
<!DOCTYPE html>
  <head>
    <title>Service Worker Scope Demo</title>
  </head>
  <body>
    <script>
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./a/b/sw.js', {
          scope: '/a/'
        }).then(reg => {
          console.log(reg.scope)
        })
      }
    </script>
  </body>
</html>
```

上面代码将作用域指定为 `/a/`，运行后浏览器会报错，报错的内容如下图所示。

![Service Worker 作用域报错信息](Service_Worker指南-1.assets/service_worker_scope_error.png)

通过报错信息知道 `sw.js` 文件所在的 URL 的 path 是 `/a/b/`，则默认的作用域和最大的作用域都是 `/a/b/`，不允许指定超过最大作用域范围的 `/a/` 为作用域。

通俗的讲，Service Worker 最多只能在 Service Worker 文件 URL path 范围内发挥作用，以上面代码为例，`/a/b/`，`/a/b/c/`，`/a/b/c/d/` 下的页面都可以被注册的 Service Worker 控制。但是 `/a/`、`/e/f/` 目录下面的页面是不受注册的 Service Worker 的控制的（当然浏览器也会抛出错误告知开发者）。也就是说，在最大作用域的基础上才能通过 scope 配置在注册 Service Worker 的时候指定自定义的作用域。

> 注意： 类似于 Ajax 的跨域请求可以通过对请求的 Access-Control-Allow-Origin 设置，我们也可以通过服务器对 sw.js 这个文件的请求头进行设置，就能够突破作用域的限制，只需要在服务端对 sw.js 请求设置 Service-Worker-Allowed 请求头为更大控制范围或者其他控制范围的 scope 即可。如：`Service-Worker-Allowed: /a/`。



### 2.2 Service Worker 作用域污染

通过对 Service Worker 作用域的了解会发现一个问题： **会不会存在国歌 Service Worker 控制一个页面的情况呢？ ** 接下来再创建 serviceWorkerScopeDemo1 项目来了解注册多个 ServiceWorker 的情况下会有些什么神奇的情况发生。
```bash
.
└── serviceWorkerScopeDemo1
    ├── a/
    │   ├── a-sw.js
    │   └── index.html
    ├── b/
    │   └── index.html
    └── root-sw.js
```

**a/index.html**

```html
<!DOCTYPE html>
  <head>
    <title>Service Worker Scope DEMO1 PageA</title>
  </head>
  <body>
    <script>
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./a-sw.js')
      }
    </script>
  </body>
</html>
```

**b/index.html**

```html
<!DOCTYPE html>
  <head>
    <title>Service Worker Scope DEMO1 PageB</title>
  </head>
  <body>
    <script>
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('../root-sw.js')
      }
    </script>
  </body>
</html>
```

`http://127.0.0.1:5500/a/index.html` 页面（称为 A 页面）在 `/a/` 作用域下注册了一个 Service Worker，而 `http://127.0.0.1:5500/b/index.html` 页面（称为 B 页面）在 `/` 作用域下注册了一个 Service Worker，这种情况下 B 页面的 Service Worker 就可以控制 A 页面，因为 B 页面的作用域是包含 A 页面的最大作用域的，这个时候这种情况就称之为**作用域污染**，这时候就会出现如下图所示的情况，A 页面被两个 Service Worker 所控制。

![image-20220720153551569](Service_Worker指南-1.assets/image-20220720153551569.png)

注意，需要分别用 live-server 启动这两个页面， 页面关闭，也不会自动清除。

再 Devtools 中，可以通过手动 “Unregister” 来清除指定的 Service Worker， 但是如果在线上环境被安装了 Service Worker 之后，这个就是个持久的过程。 除非用户手动清除存储的缓存（这个也是不可能的）。否则就会出现 Service Worker 交叉控制页面的问题。 

当然，线上出现作用域污染的情况也是有办法解决的，比较合理的一种做法就是在 A 页面新上线的 /a/index.html 版本中注册 Service Worker 之前，借助 `navigator.serviceWorker.getRegistrations()` 方法将污染的 Service Worker 先注销掉， 然后再注册自己的所在作用域的 Service Worker。 具体如下示例：

**serviceWorkerScopeDemo1/a/index.html**

```html
<!DOCTYPE html>
  <head>
    <title>Service Worker Scope DEMO1 PageA</title>
  </head>
  <body>
    <script>
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs=>{
          for(let reg of regs){
            // 注销掉不是当前作用域的所有 Service Worker
            if(reg.scope !== 'http://127.0.0.1:5500/a/'){
              reg.unregister()
            }
          }
          // 注销掉污染 Service Worker 之后再重新注册 自己作用域的 Service Worker
          navigator.serviceWorker.register('./a-sw.js')
        })
      }
    </script>
  </body>
</html>
```

通过这样的方式，运行 serviceWorkerDemo 项目会发现，A 页面只会有一个被自己注册的 Service Worker 生效，在复杂的项目架构中，Service Worker 的作用域污染问题会经常发生，在设计 Service Worker 注册逻辑的时候，尤其是大型的 Web App 项目的时候需要考虑到这点。

### 2.3  Service Worker 注册设计

由于 Service Worker 注册会有意想不到的作用域污染问题， 而 Web App 项目又有多种形式存在，有SPA （单页面应用）， MPA（多页面应用）等架构方式，那么到底怎么进行 Service Worker 注册才合适呢？

#### 2.3.1 SPA 注册 Service Worker

SPA 在工程架构上只有一个 `index.html` 的入口，站点的内容都是异步请求数据之后再前端渲染的，应用中的页面切换都是在前端路由控制的。 

通常会将这个 `index.html` 部署到 `https://somehost`， SPA 的 Service Worker 只需要在 `index.html` 中注册一次。 所以一般会将 `sw.js` 直接放在站点的根目录保证可访问，也就是说 Service Worker 的作用域通常就是 `/` ， 这样，Service Worker 能够控制 `index.html`， 从而控制整个 SPA 的缓存。

SPA 每次路由的切换都是前端渲染的，这个过程本质上还是在 `index.html` 上的前端交互。 <u>通常 Service Worker 会预先缓存 SPA 中的 AppShell 所需的静态资源 **以及 `index.html`**</u> 。 当然有一种情况比较特殊，当用户从 `https://somehost/a` 页面切换到 `https://somehost/b` 页面的时候，这时候刷新页面首先渲染的还是 `index.html` ，在执行 SPA 的路由逻辑之后，通过 SPA 前端路由的处理，继续在前端渲染相应的路由对应的渲染逻辑，这部分的逻辑都是在已经缓存的 JavaScript 中完成了。 



#### 2.3.2 MPA 注册 Service Worker

MPA 这种架构模式在现如今的大型 Web App 非常常见， 这种 Web App 相比较 SPA 能够承受更重的业务体量，并且利于大型 Web App 的后期维护和扩展。 MPA 可以理解为是有多个 HTML 文件对应着多个不同的服务端路由，也就是说 `https://somehost/a` 映射到 `a.html`, `https://somehost/b` 映射到 `b.html` 。

那么 MPA 架构下怎么去注册 Service Worker 呢？ 是不同的页面注册不同的 Service Worker，还是所有的页面都注册同一个 Service Worker ? 结论是：需要根据实际情况来定。

**MPA 注册单个 Service Worker**

在每个页面之间的业务相似度较高，或者每个页面之间的公共静态资源或者异步请求较多，这种 MBA 是非常适合在所有的页面只注册一个 Service Worker。

例如， `https://somehost/a` 和 `https://somehost/b` 之间的公共内容较多，则通常在 `/` 作用域下注册一个 Service Worker。 这样，这个Service Worker 就能控制 `https://somehost` 域下的所有页面。

MPA 维护单个 Service Worker 有如下特点：

- 可以统一管理整个站点的缓存
- 不会造成页面之间的作用域污染
- 后期维护成本相对较低

**MPA 注册多个 Service Worker**

MPA 注册多个 Service Worker 适用于主站非常庞大的 Web App, 并不是以 path 分隔的形式铺展垂类子站的大型 Web App, 这种情况下，就不适合只在 `/` 作用域下只注册一个 Service Worker 了。

例如 `https://somehost/a` 和  `https://somehost/b` 几乎是两个站点，其中公共使用的静态资源或者异步请求非常少，则比较适合每个子站注册维护自己的 Service Worker， `https://somehost/a` 注册 Service Worker 的作用域为 `/a/`， 最好是存在 `/a/sw.js` 对应的 Service Worker 文件 URL 可访问，尽量不要使用 某一个公用的 `/sw.js` 并使用 scope参数来自定义作用域， 这样会增加后期的维护成本以及增加出现 bug 的风险。

子站在实现上还需要考虑的一点是，放置其他页面的 Service Worker 对自身页面造成污染，需要在注册子站 Service Worker 之前将不是子站path 作用域的 Service Worker 先注销掉。

注册多个 Service Worker 有如下特点：

- 需要严格要求每个子站管理好自己的 `sw.js` 及作用域。
- 防止对其他子站的 Service Worker 造成影响。
- 相比较整个站点只注册一个 Service Worker， 这种维护多个 Service Worker 的方式更加灵活。
- 随着子站的增多，风险相对会更加大，也会更加难以维护。



### 2.4  Service Worker 更新

当在页面中通过 `sw.js` 注册了一个 Service Worker 之后，如果`sw.js` 内容发生了变更， Service Worker 该如何更新呢 ？

**那 SPA 为例， 作为 AppShell 的载体， `index.html` 是会被缓存起来的**， AppShell 的静态资源也都会被缓存起来的， 由于 Service Worker 的注册入口必须实在主线程完成，所以Service Worker 的注册必然是需要在 `index.html` 的 `script` 标签，或者被缓存住的 JavaScript 文件中来实现的。

如果 Web App 功能发生了升级更新，我们预期的结果是当用户刷新页面的时候希望浏览器立即更新当页面的缓存，并且立即加载最新的内容和资源，呈现最新的效果给用户看到。 可是用户在刷新页面的时候看到的还是之前缓存的老的内容，这时候该如何处理呢  ？

**通常在每次进行 Web App 升级的时候，都必须伴随着 Service Worker 文件 `sw.js` 的升级，当浏览器检测到 `sw.js` 的升级之后，就会重新触发注册，安装，激活，控制页面的流程。** 并且在这个过程中就会更新当前 Web App 的离线缓存为最新的上线内容。

在执行 `navigator.serviceWorker.register()` 方法注册 Service Worker 的时候，浏览器通过自身 diff 算法能够检测 `sw.js` 的更新包含两种方式：

- Service Worker 文件 URL 的更新
- Service Worker 文件内容的更新

在实际项目中，在 Web App 新上线的时候，通常是在注册 Service Worker 的时候，通过修改 Service Worker 文件的 URL 来进行 Service Worker 的更新，一般采用以下代码所示的方式处理：

```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js?v=20190401235959')
}
```

每次 Web App 上线构建的时候，维护一个最新的唯一构建版本号，将构建版本号写入 Service Worker 文件 URL 的版本号参数中，这样的话，就能够保证每次 Web App 有最新上线功能的时候，都能够有最新的 Service Worker 文件 diff 让浏览器能够检测到。 当然，除了改变 Service Worker 文件 URL， 还可以改变 Service Worker 文件的内容，如下代码所示：
```javascript
// sw.js
self.version = '20190401235959'
```

> 注意： 在 sw.js 中，`self` 为 Service Worker 线程的全局命名空间，类似于主线程的 `window`，在 sw.js 中是访问不到 `window` 命名空间的。

在 Web App 每次上线新的功能，项目进行构建的时候，可以将最新的唯一构建版本号写在 `sw.js` 文件内，这样也能保证每次 Web App 都能够有最新的 Service Worker 文件 diff 被浏览器检测到。



### 2.5 Service Worker 容错

由于 Service Worker 一旦上线就会永久生效， 如果发现线上 Service Worker 有 bug 该怎么办？ 有一种亡羊补牢的方法是重新上一次线，注销掉有 bug 的 Service Worker， 假如现在有一个现存的项目 serviceWorkerUnregisterDemo :
```bash
.
└── serviceWorkerUnregisterDemo/
    ├── index.html
    └── sw.js
```

如果需要紧急下线该项目的 Service Worker，则 `index.html` 代码如下所示：

**index.html**

```html
<!DOCTYPE html>
  <head>
    <title>Service Worker Unregister Demo</title>
  </head>
  <body>
    <script>
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations()
          .then(regs => {
            for (let reg of regs) {
              // 注销掉所有的 Service Worker
              reg.unregister()
            }
          })
      }
    </script>
  </body>
</html>
```

这种方法是在发现 Service Worker 出现问题之后，必须重新上线 Web App 来解决问题，这样的成本比较高。一般大型 Web App 上线的过程也非常复杂，上线周期长，所以这种止损效果较差，不是很可取。还有一种方法可以避免重新上线 Web App，只需要在 Service Worker 注册的时候通过一个 “**开关请求**” 做一个容错降级的处理，这个开关请求需要满足几个条件：

- 能够快速上线，和 Web App 的上线解耦
- 不能被缓存（无论是 HTTP 缓存还是 Service Worker 缓存）

在实际项目中，通常开关请求会维护成一个  JavaScript 文件（当然也可以是任何一种请求类型，只不过JavaScript 文件通常比较好维护，而且无需考虑请求跨域的问题），放在某一个可以快速上线的静态资源服务器，那么现在可以修改 serviceWorkerUnregisterDemo 项目 的 `index.html` ：

```html
<!DOCTYPE html>
  <head>
    <title>Service Worker Unregister Demo</title>
  </head>
  <body>
    <script>
      if ('serviceWorker' in navigator) {
        // 正常进行注册 Service Worker
        navigator.serviceWorker.register('./sw.js?v=20190401235959')
        let script = document.createElement('script')
        // 假设这个 JS 中存在 Service Worker 开关全局变量
        script.src = 'https://some-static-cdn-host/sw-on-off.js'
        script.async = true
        script.onload = () => {
          // Service Worker 开关全局变量的名称
          if (window.SW_TURN_OFF) {
            navigator.serviceWorker.getRegistrations()
              .then(regs => {
                for (let reg of regs) {
                  // 注销掉所有的 Service Worker
                  reg.unregister()
                }
              })
          }
        }
        document.body.appendChild(script)
      }
    </script>
  </body>
</html>
```

假如在 `https://some-static-cdn-host/sw-on-off.js` 静态资源服务器维护了一个开关 JavaScript 文件，那这个文件正常情况下的代码内容如下所示：

```javascript
/**
 * @file https://some-static-cdn-host/sw-on-off.js
 */

// 当 Web App 线上出现紧急问题的时候将值设为 true 并上线
window.SW_TURN_OFF = false
```

### 2.6 小结

本节从注册 Service Worker 的角度出发，详细的介绍了在注册 Service Worker 的过程中需要考虑哪些问题，在不同的项目架构或者不同的情况下，注册 Service Worker 的考量点都是不一样的，接来下将会详细介绍 Service Worker 的技术细节，了解 Service Worker 到底是如何进行 PWA 的离线缓存的。



## 3. Service Worker 工作原理

前面已经介绍 Service Worker 是一个工作线程的本质，也了解了 Service Worker 可以离线工作，还介绍了  Service Worker 在主线程中是如何被注册的。但是到现在为止还是不知道 Service Worker 具体怎么在实际项目中去应用。 也不知道如何去开发和维护一个Service Worker 文件。我们已经知道了 Service Worker 是可以对 Web App 的资源和请求进行离线缓存的，那它到底是如何进行离线缓存控制的呢？

在本节，我们会深入的介绍一下 Service Worker 的工作原理， Service Worker 的工作原理主要提现在它的生命周期上，一个 Service Worker 从被注册开始，就会经理自身的一些生命周期的节点，而在这些节点都可以去做一些特定的事情，比如，一些复杂的计算、缓存的写入、缓存的读取等操作。通过这些生命周期节点的联合调度， Service Worker 才能完成复杂的资源离线缓存的工作。 而开发者只有了解了 Service Worker 的生命周期，才能通过设计相关逻辑，并开发 Service Worker 文件 `sw.js` , 让 Service Worker 去完成 PWA 离线缓存策略。



### 3.1 生命周期

先来了解下，什么是 Service Worker 的生命周期， 每个 Service Worker 都有一个独立于 Web 页面的生命周期，其示意图如下：

![Service Worker 生命周期](Service_Worker指南-1.assets/service_worker_lifecycle.png)

1. 在主线程成功注册 Service Worker 之后，开始下载并解析执行 Service Worker 文件。执行过程中开始 安装 Service Worker， 在此过程中，会触发 worker 线程的 install 事件。
2. 如果 install 事件回调成功执行（在install 回调中通常会做一些缓存读写的工作，可能会存在失败的情况），则开始激活 Service Worker， 在此过程中会触发 worker 线程的 activate 事件，如果 install 事件回调执行失败，则生命周期进入 Error 终结状态，终止生命周期。
3. 完成激活之后，Service Worker 就能够控制作用域下的页面的资源请求，可以监听 fetch 事件。
4. 如果在激活之后，Service Worker 被 unregister 或者有新的 Service Worker 版本更新，则当前 Service Worker 生命周期完结，进入Terminated 终结状态。

Service Worker 生命周期是一个比较复杂的知识点，其中有较多二点细节需要深入理解，为了更加清楚的进行介绍，接下来新建一个项目  serviceWorkerLifecycleDemo :

```bash
.
└── serviceWorkerLifecycleDemo/
    ├── imgs/
    │   └── dog.jpg
    ├── index.html
    └── sw.js
```

**index.html**

```html
<!DOCTYPE html>
  <head>
    <title>Service Worker Lifecycle Demo</title>
  </head>
  <body>
    <img src="./imgs/dog.jpg" alt="demo image" />
    <script>
      if ('serviceWorker' in navigator) {
        // 由于 127.0.0.1:5500 是所有测试 Demo 的 host
        // 为了防止作用域污染，将安装前注销所有已生效的 Service Worker
        navigator.serviceWorker.getRegistrations()
          .then(regs => {
            for (let reg of regs) {
              reg.unregister()
            }
            navigator.serviceWorker.register('./sw.js')
          })
      }
    </script>
  </body>
</html>
```

> 注意： 由于 Service Worker 一旦注册后就会永久生效，而生效的控制范围是根据作用域来控制的，我们所有的测试 host 都为 `127.0.0.1:5500`，这样会导致新的项目还没注册 Service Worker 却已经被之前注册的 Service Worker 所控制，所以通常在注册新的 Service Worker 的时候，为了**彻底防止作用域污染**的做法就是在注册前将所有现存控制当前页面的 Service Worker 全部注销掉，或者在 Chrome Devtools 中每次都将老的 Service Worker 手动 unregister 掉。

这次在 serviceWorkerLifecycleDemo 项目的 HTML 文件中加入一个 `<img>` 标签来加载一张图片，主要是用来理解 Service Worker 如何在生命周期中进行离线与缓存处理的。

虽然空的 Service Worker 文件也是可以通过注册来新开一个 Service Worker 线程，但是通常 Service Worker 文件中需要编写一些 JavaScript 代码逻辑来完成 Web App 的离线与缓存的策略设计。接下来我们会一步步的详细讲解这些代码该如何编写，首先先给 `sw.js` 写入以下代码，用来理解 Service Worker 的生命周期：

**sw.js**

```javascript
// sw.js
console.log('service worker 注册成功')

self.addEventListener('install', () => {
  // 安装回调的逻辑处理
  console.log('service worker 安装成功')
})

self.addEventListener('activate', () => {
  // 激活回调的逻辑处理
  console.log('service worker 激活成功')
})

self.addEventListener('fetch', event => {
  console.log('service worker 抓取请求成功: ' + event.request.url)
})
```

这段代码一开始是直接通过 `console.log()` 打印输出一段内容，然后绑定了三个事件，分别是 `install`、`activate`、`fetch` 事件，用来响应 Service Worker 生命周期的事件触发。

接下来用 Chrome 浏览器来测试一下 serviceWorkerLifecycleDemo 这个例子，为了更好的理解测试结果，在打开测试页面 `http://127.0.0.1:5500` 之前需要将所有的浏览器标签关闭（后面会详细解释为什么需要如此操作）。不出意外的话，**第一次**访问 `http://127.0.0.1:5500` 页面的时候 Chrome Devtools Console 控制台的打印结果如下：

```bash
service worker 注册成功
service worker 安装成功
service worker 激活成功
```

当我们**第二次**刷新页面的时候，这时候控制台的打印结果如下：

```bash
service worker 抓取请求成功：http://127.0.0.1:5500/imgs/dog.jpg
```

从这个执行结果来看，初步能够说明以下几点：

- Service Worker 文件只在首次注册的时候执行了一次
- 安装、激活流程也只是在首次执行 Service Worker 文件的时候进行了一次。
- 首次注册成功的 Service Worker 没能拦截当前页面的请求。
- 非首次注册的Service Worker 可以控制当前的页面并能拦截请求。

![2022-07-20 18-03-18](Service_Worker指南-1.assets/2022-07-20 18-03-18.gif)



Service Worker 在内部都有一系列的工作流程，这些工作流程决定了开发者可以在 Service Worker 文件中如何进行开发。下图展示的是 Service Worker 工作流程图。

![Service Worker 工作流程图](Service_Worker指南-1.assets/service_worker_process.png)

实际上， Service Worker 首次注册或者有新版本触发更新的时候，才会重新创建一个 worker 工作线程并解析执行 Service Worker 文件，在这之后并进入 Service Worker 的安装和激活生命周期。

而在首次注册、安装、激活之后， Service Worker 已经拿到了当前页面的控制权了，但是**为什么首次刷新却没有拦截到网络请求呢？ 主要是因为在 Service Worker 的注册是一个异步的过程，在激活完成后当前页面的请求都已经发送完成，因为时机太晚，此时是拦截不到任何请求的，只能等待下次访问再进行。** 

**而第二次刷新页面的时候**，由于当前站点的 Service Worker 是处于激活状态，所以不会再次创建 worker 工作线程并执行 Service Worker。 也就是说激活状态的 Service Worker 在一个站点只会存在一个 worker 工作线程，除非 Service Worker 文件发生了变化（手动unregister 也会注销掉worker 线程），触发了浏览器更新，才会重新开启生命周期。**而由于 Service Worker 工作线程的离线特性，只要处于激活状态，在后续的任何访问中，都会通过 fetch 事件监听器拦截当前页面的网络请求，并执行 `fetch` 事件的回调。**



### 3.2  waitUntil 机制

如果 Service Worker 安装失败，会导致Service Worker 生命周期终止。由于 Service Worker `install` 回调实在用户首次访问注册的时候才会触发，所以在项目设计的时候，会将 Web App 一些只有上线才会改变的静态资源会在 install 阶段进行缓存，让用户更快的体验到缓存加速的好处。 如果缓存成功了才算是 Service Worker 安装完成， 如果这些静态资源缓存失败了，那 Service Worker 安装就会失败， 生命周期终止。

什么情况下才算是 Service Worker 安装失败呢  ？ 如果在 Service Worker 文件中的 install 回调中写一段错误逻辑会不会导致安装失败呢？ 接下来修改以下 serviceWorkerLifecycleDemo 的 `sw.js` ，

```javascript
// sw.js
console.log('service worker 注册成功')

self.addEventListener('install', () => {
  // 一段一定会报错的代码
  console.log(a.undefined)
  console.log('service worker 安装成功')
})

self.addEventListener('activate', () => {
  // 激活回调的逻辑处理
  console.log('service worker 激活成功')
})

self.addEventListener('fetch', event => {
  console.log('service worker 抓取请求成功: ' + event.request.url)
})
```

在 install 事件回调中，插入了一段一定会报错的代码，看看是不是会导致 Service Worker 的安装失败呢？

> 注意： 前面介绍过，由于修改了 sw.js，所以会触发 Service Worker 更新机制，而这次测试是纯粹介绍首次安装失败的情况，为保证实验的纯粹性，需要在 Chrome DevTools 中将存在的 Service Worker 手动 unregister 掉，在后面介绍 Service Worker 更新机制的时候会详细解释其原理。

示例运行结果如下图所示：

![Service Worker install 回调中报错情况](Service_Worker指南-1.assets/service_worker_error_in_install.png)

从运行结果看，当 install 回调中的逻辑报错了，并不会影响 Service Worker 的生命周期继续向后推进，因为运行结果还是有 `激活成功`，甚至第二次刷新发现还能正常拦截请求。

所以说并不是 intall 回调中出错了就会导致生命周期中断。由于 **Service Worker 生命周期异步触发**的特性，并不是像同步执行模式，如果报错就会中断执行。Service Worker 事件回调的参数是一个 ExtendableEvent 对象，在 Service Worker 中需要使用 `ExtendableEvent.waitUntil()` 方法来保证生命周期的执行顺序。该方法接收一个 Promise 参数，开发者通常会将安装的回调执行逻辑（如缓存的写入）封装在一个 Promise 里，如果操作报错应该通过 Promise 来 reject 错误，这样 Service Worker 就知道了安装失败，然后 Service Worker 就能中断生命周期。接下来修改 `sw.js` 代码如下所示：

```javascript
// sw.js
console.log('service worker 注册成功')

self.addEventListener('install', event => {
  // 引入 event.waitUntil 方法
  event.waitUntil(new Promise((resolve, reject) => {
    // 模拟 promise 返回错误结果的情况
    reject('安装出错')
    // resolve('安装成功')
  }))
})

self.addEventListener('activate', () => {
  // 激活回调的逻辑处理
  console.log('service worker 激活成功')
})

self.addEventListener('fetch', event => {
  console.log('service worker 抓取请求成功: ' + event.request.url)
})
```

这时候运行刷新页面的时候发现 Service Worker 的生命周期中断，而且没有执行 activate 事件回调。当将 `reject('安装失败')` 改成 `resolve('安装成功')` 的时候，会发现 Service Worker 能够顺利激活。事实上，**`ExtendableEvent.waitUntil()` 方法扩展了事件的生命周期**。在服务工作线程中，延长事件的寿命能够阻止浏览器在事件中的异步操作完成之前终止 worker 工作线程。

在 install 事件回调被调用时，它把即将被激活的 worker 线程状态延迟为 installing 状态，直到传递的 Promise 被成功地 resolve。这主要用于确保：Service Worker 工作线程在所有依赖的核心 cache 被缓存之前都不会被安装。

不只是 install 事件回调可以调用这个方法，如果在 activate 事件回调被调用时，它把即将被激活的 worker 线程状态延迟为 activating 状态，直到传递的 Promise 被成功地 resolve。这主要用于确保：任何功能事件不会被分派到 ServiceWorkerGlobalScope 对象，直到它升级数据库模式并删除过期的缓存条目。

当 `ExtendableEvent.waitUntil()` 运行时，如果 Promise 是 resolved，任何事情都不会发生；如果 Promise 是 rejected，installing 或者 activating 的状态会被设置为 redundant。

> 注意： 如果在 ExtendableEvent 处理程序之外调用 `waitUntil()`，浏览器会抛出一个InvalidStateError 错误。 如果多个调用将会堆叠，所产生的所有 promise 将被添加到**延长生命周期的 promise** 等待执行完成。

### 3.3  终端

在运行 serviceWorkerLifecycleDemo 示例的时候，提到了需要关闭所有浏览器标签再打开测试页面，其中主要的原因是涉及到 Service Worker 的终端（clients）的概念。

最直接的解释是每一个打开 `http://127.0.0.1:8000` 页面的浏览器标签都是一个终端，如下图所示。

![Service Worker 终端](Service_Worker指南-1.assets/service_worker_clients.png)

在手机端或者 PC 端浏览器，每新打开一个已经激活了 Service Worker 的页面，那 Service Worker 所控制的终端就新增一个，每关闭一个包含已经激活了 Service Worker 页面的时候（不包含手机端浏览器进入后台运行的情况），则 Service Worker 所控制的终端就减少一个，如上图打开了三个浏览器标签，则当前 Service Worker 控制了三个终端，通过 Chrome 浏览器 Devtools 的 `Applications -> ServiceWorker` 标签可以查看如下图所示 Service Worker 控制的三个终端。

![Service Worker 终端列表](Service_Worker指南-1.assets/service_worker_clients_list.png)

当刷新其中一个浏览器标签的时候，会发现一个奇怪的现象，当前的浏览器标签的控制台打印了一条信息如下所示：

```bash
service worker 抓取请求成功: http://127.0.0.1:8000/imgs/dog.jpg
```

而并没有对其他的两个浏览器标签进行刷新，但是它们的控制台也出现了打印信息：

```bash
service worker 抓取请求成功: http://127.0.0.1:8000/
service worker 抓取请求成功: http://127.0.0.1:8000/imgs/dog.jpg
```

这主要是因为，所有的终端共用一个 worker 工作线程，当在 worker 线程中执行 `console.log()` 方法打印内容的时候，会作用到所有的终端，worker 工作线程和终端的关系如下图 4-12 所示。

![Service Worker 工作线程和终端的关系](Service_Worker指南-1.assets/service_worker_with_client.png)

`console.log` 是浏览器提供的一种特殊的 I/O 操作，并不是常规操作。通常开发者不会这样来应用这种终端机制，一般而是借助 postMessage 机制来通过 worker 工作线程控制终端，worker 线程在某个生命周期回调 postMessage 给各个终端，终端预先绑定 onmessage 事件，回调处理 worker 线程发送过来的指令，可以做一些后台统计的相关工作，甚至可以用这种机制在 Service Worker 线程中，集中对所有终端的 UI 进行统一处理。



### 3.4  Waiting 状态

创建一个新的 demo 项目

```bash
.
├── app.js
├── imgs
│   ├── animals.jpg
│   ├── city.jpg
│   ├── nature.jpg
│   └── sports.jpg
├── index.html
└── sw.js
```

**index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="./app.js"></script>
    <title>Document</title>
  </head>
  <body style="display: flex; flex-direction: column">
    <button>Add An Image</button>
    <img src="./imgs/animals.jpg" alt="" />
  </body>
</html>
```

**app.js**

```javascript
const APP = {
  sw: null,
  imgList: ["/imgs/city.jpg", "/imgs/nature.jpg", "/imgs/sports.jpg"],
  count: 0,
  init() {
    document.querySelector("button").addEventListener("click", APP.addTitle);
    APP.registerSW();
  },
  registerSW() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then(
        (reg) => {
          APP.SW = reg.installing || reg.waiting || reg.active;
        },
        (error) => {
          console.log("Service Worker Registration Fialed: ", error);
        },
      );
    }
  },
  addTitle() {
    if (APP.count < 3) {
      const img = document.createElement("img");
      img.src = APP.imgList[APP.count];
      APP.count++;
      document.body.appendChild(img);
    }
  },
};

document.addEventListener("DOMContentLoaded", APP.init);

```

**sw.js**

```javascript
self.version = 0;

console.log("service worker rigistered success! ");

self.addEventListener("install", (event) => {
  console.log("install hook executed success!");
});

self.addEventListener("activate", (event) => {
  console.log("activate hook executed success!");
});

self.addEventListener("fetch", (event) => {
  console.log("service worker 抓取请求成功: " + event.request.url);
});

self.addEventListener("message", (event) => {});
```

本示例项目，期望首次页面加载，会加载一张图片，而后每点击一次按钮，会新增加一张图片。 

此时页面首次 load :
![image-20220721134704376](Service_Worker指南-1.assets/image-20220721134704376.png)

可以看到，Service Worker 注册-安装-激活 的 `console` 都成功打印， 但是页面加载的这张图片的请求，没有被 `fetch` 监听器监听到，之前说了，这是由于 Service Worker 生命周期的异步执行的特点。 所以首次加载页面，加载了图片的同时，异步在执行 Service Worker 的初始化，所以就监听不到。 

当页面再次刷新时，页面就能够监听到 这张图片的请求了：

![image-20220721135055206](Service_Worker指南-1.assets/image-20220721135055206.png)

并且，不再重复打印之前的 Service Worker 的注册-安装-激活 `console`， 因为这个过程在页面刷新前，之前的首次加载页面就已经完成了。 也正是已经有 Service Worker 的存在，所以刷新后的页面 图片 fetch 才会被监听到。





如果有一个旧的 Service Worker, 当一个 Service Worker 被成功安装后，这个最新的 Service Worker 并不会立即生效，它会等待旧的 Service Worker 不再控制 `clients` （即各个页面）。这个 等待的过程，会被标记为 "waiting" 状态。这是浏览器为了确保在同一时间，始终仅有一个版本的 Service Worker 在工作。 

这个 `waiting`  状态何时被标记 ？

当 浏览器 diff 到 `sw.js` Service Worker 文件发生了变化，就会重新开始注册流程，

在上例中，我们在 `sw.js` 中设定了一个 Service Worker 的全局变量： `self.version=0`,  为了更加直观的看到变化，我们在 "activate" 监听器的回调中将这个全局变量打印出来。 

**sw.js**

```diff
self.version = 0;
console.log(`service worker rigistered success!`);
self.addEventListener("install", (event) => {
  console.log("install hook executed success!");
});

self.addEventListener("activate", (event) => {
- console.log("activate hook executed success!");
+ console.log(`activate hook executed success!  current version is ${self.version}.`);
});

self.addEventListener("fetch", (event) => {
  console.log("service worker 抓取请求成功: " + event.request.url);
});

self.addEventListener("message", (event) => {});
```

手动 Unregister 掉当前 Service Worker, 先看看初始状态：

![2022-07-21 15-05-58](Service_Worker指南-1.assets/2022-07-21 15-05-58.gif)



> 可以看到输出为：
>
> 

 现在我们将其修改为 `self.version=1`， 然后保存, 观察

![2022-07-21 15-07-33](Service_Worker指南-1.assets/2022-07-21 15-07-33.gif)

> ```bash
> # console 输出
> service worker rigistered success!
> sw.js:6 install hook executed success!
> ```

可以看到， 浏览器检测到了 Service Worker 文件 `sw.js` 改变，重新启动了一个 Service Worker （DevTools 中 Status 每个版本的 Service Worker 都被以 `#N` 标记） `#44 , 并且它在等待被激活。 从控制台中，我们也可以看到，仅打印了 `install .....`， 并没有执行到 activate, 当前新的 Service Worker 还没有被激活。 

这说明当前激活的 Service Worker 还是上个版本的，最新的 Service Worker 并没有更新。

默认的，需要用户关闭浏览器，再次打开浏览器访问页面，才会被更新。

![2022-07-21 15-32-51](Service_Worker指南-1.assets/2022-07-21 15-32-51.gif)



浏览器的这么做的目的是为了避免当前用户的关联操作受到影响， 这样即便 Service Worker 文件更新了，实际的 Service Worker 还是旧的版本，直到重新启动浏览器。 

但是这个机制在开发阶段会很难受，所以 DevTools 提供了便于开发的功能，

1. 可以在DevTools 中 点击 `skipWaiting` 手动触发 
2. 可以勾选 `Update on reload` 选项，页面刷新
3.  shift-reload 强制刷新

![2022-07-21 15-35-39](Service_Worker指南-1.assets/2022-07-21 15-35-39.gif)





### 3.5  skipWaiting

Service Worker 一旦更新，需要等所有的终端都关闭之后，再重新打开页面才能激活新的 Service Worker，这个过程太复杂了。通常情况下，开发者希望当 Service Worker 一检测到更新就直接激活新的 Service Worker。如果不想等所有的终端都关闭再打开的话，只能通过 skipWaiting 的方法了，但是总不能让用户自己去浏览器中点击 “skipWaiting” 按钮吧？

Service Worker 在全局提供了一个 `skipWaiting()` 方法，`skipWaiting()` 在 waiting 期间调用还是在之前调用并没有什么不同。一般情况下是在 install 事件中调用它，接下来验证一下效果，可以通过如下代码所示的方式修改 `sw.js` 代码。

```javascript
// sw.js
console.log('service worker 注册成功')

self.addEventListener('install', event => {
  // 跳过等待
  self.skipWaiting()
  // 引入 event.waitUntil 方法
  event.waitUntil(new Promise((resolve, reject) => {
    // 模拟 promise 返回错误结果的情况
    // reject('安装出错')
    resolve('安装成功')
    console.log('service worker 安装成功')
  }))
})

self.addEventListener('activate', () => {
  // 激活回调的逻辑处理
  console.log('service worker 激活成功')
})

self.addEventListener('fetch', event => {
  console.log('service worker 抓取请求成功: ' + event.request.url)
})
```

通过调用 `skipWaiting()` 方法，运行 Demo 之后刷新任何一个页面都会发现，新的 Service Worker 被激活了。这种方式也被普遍应用在 Service Worker 的更新策略中，主要是为了让用户能够最快的体验到站点的升级和变化。

> 注意： skipWaiting() 意味着新 Service Worker 可能会控制使用较旧 Service Worker 控制的页面。这意味着页面提取的部分数据将由旧 Service Worker 处理，而新 Service Worker 处理后来提取的数据。如果预期到缓存数据不一致的现象会导致问题，则不要使用 skipWaiting() 跳过 waiting 状态。
>
> @https://lavas-project.github.io/pwa-book/chapter04/3-service-worker-dive.html
>
> 
>
> **Caution**
>
> `skipWaiting()` means that your new service worker is likely controlling pages that were loaded with an older version. This means some of your page's fetches will have been handled by your old service worker, but your new service worker will be handling subsequent fetches. If this might break things, don't use `skipWaiting()`.
>
> @https://web.dev/service-worker-lifecycle/#devtools





### 3.6 Service Worker 更新原理

在运行 serviceWorkerLifecycleDemo 的时候，之前提到过，在每次修改 Service Worker 文件的时候，如果需要刷新页面验证效果，都应提前在 Chrome Devtools 中手动 unregister 当前的 Service Worker，主要是因为修改 Service Worker 文件都会触发其更新，而 Service Worker 的更新过程比较复杂，为了区分首次安装、激活和更新触发的安装、激活，保证效果的一致性，所以才有此建议。那接下来重点地讲解一下 Service Worker 的更新原理，看看里面到底有什么门道。

修改 serviceWorkerLifecycleDemo 的 `index.html` 中注册 `sw.js` 部分的逻辑，用于触发 Service Worker 的更新（当然也可以修改 Service Worker 文件的某些内容），如下所示：

```javascript
// 触发 Service Worker 的更新
navigator.serviceWorker.register('./sw.js?v=20190401235959')
```

刷新页面之后控制台打印的内容只有 `注册成功`，说明更新 Service Worker 会重新解析执行 Service Worker 的 JavaScript 代码，会触发安装回调，但是没有完成激活。查看 Chrome Devtools 的 Service Worker 面板发现 Service Worker 确实卡在激活状态了，状态为 `waiting to activate`，如下图所示：

![Service Worker 更新 waiting 状态](Service_Worker指南-1.assets/service_worker_update_waiting.png)

这就是更新 Service Worker 和首次安装 Service Worker 的一个区别所在。下面通过下图了解一下 Service Worker 更新的原理。

![Service Worker 更新原理](Service_Worker指南-1.assets/service_worker_update_process.png)

当浏览器监测到新的 Service Worker 更新之后，会重新进行注册、安装，当检测到当前的页面被激活态的 Service Worker 控制着的话，会进入 waiting 状态，之后可以有两种选择：

1. 通过 skipWaiting 跳过 waiting 状态
2. 在所有终端保持 waiting 状态，直到 Service Worker 对**所有**终端失去控制（关闭所有终端的时候）

通过运行 serviceWorkerLifecycleDemo 可以发现，将之前启动的三个终端全部关闭掉，然后再新开一个浏览器标签打开 `http://127.0.0.1:8000` 之后，会发现新的 Service Worker 已经激活成功。

还可以有另外一种方法，就是在 Chrome Devtools 中点击 “**skipWaiting**” 按钮，这样就会发现 Service Worker 直接进入了激活状态（反复测试 Demo，记得修改 Service Worker 内容或 URL 以触发 Service Worker 的更新）。

### 3.7  clients.claim() 方法

如果使用了 skipWaiting 的方式跳过 waiting 状态，直接激活了 Service Worker，可能会出现其他终端还没有受当前终端激活的 Service Worker 控制的情况，切回其他终端之后，Service Worker 控制页面的效果可能不符合预期，尤其是如果 Service Worker 需要动态拦截第三方请求的时候。

为了保证 Service Worker 激活之后能够马上作用于所有的终端，通常在激活 Service Worker 后，通过在其中调用 `self.clients.claim()` 方法控制未受控制的客户端。`self.clients.claim()` 方法返回一个 Promise，可以直接在 `waitUntil()` 方法中调用，如下代码所示：\

```javascript
self.addEventListener('activate', event => {
  event.waitUntil(
    self.clients.claim()
      .then(() => {
        // 返回处理缓存更新的相关事情的 Promise
      })
  )
})
```

> 注意： 很多开发者默认就在 Service Worker 文件中使用 `self.clients.claim()`。不建议这么绝对，还是要根据具体项目而定，主要看是否有激活 Service Worker 之后马上控制所有终端的需求。

### 3.8  手动更新

当刷新页面重新执行 register 方法的时候，浏览器检测到 Service Worker 文件更新就会触发 Service Worker 更新，但是如果站点在浏览器后台长时间没有被刷新，则浏览器将自动检查更新，通常是每隔 24 小时检查一次，但是 24 小时也太长了，所以也可以在代码中手动触发更新，通常做法如下代码所示：

```javascript
navigator.serviceWorker.register('/sw.js')
  .then(reg => {
    setInterval(() => {
      reg.update()
    }, 60 * 60 * 1000)
  })
```

如果开发者期望用户可以长时间使用您的网站而不必重新加载，您需要按一定间隔（如每小时）调用 `update()` 方法。





###  3.9 小结

本节介绍了 Service Worker 的生命周期以及更新机制，了解了 Service Worker 具体的运作方式。虽然目前对 Service Worker 技术点有了全面的了解，但是还是没有涉及到任何离线与缓存相关的东西，为了更加系统深入了解 PWA 离线缓存机制，在下一章中会对 Service Worker 缓存管理进行详细介绍。





## 4.  Service Worker 调试

在开发 Service Worker 文件的过程中，如何调试呢？怎么才能确保线下开发的 Service Worker 文件在经过注册后到线上去运行是符合预期的呢？在这小节中将详细介绍如何调试 Service Worker。

Service Worker 作为独立于主线程的独立线程，在调试方面其实和常规的 JavaScript 开发类似，通常开发者关注的点大概有如下几点：

- Service Worker 文件 JavaScript 代码是否有报错。
- Service Worker 能否顺利安装、激活或者更新。
- 在不同机型上的兼容性是不是有问题。
- 不同类型资源和请求的缓存策略的验证。

### 4.1 debug 环境下的开发跳过等待状态

根据 Service Worker 生命周期的特性，如果浏览器还在使用旧的 Service Worker 版本，即使有 Service Worker 新的版本也不会立即被浏览器激活，只能进行安装并进入等待状态，直到浏览器 Tab 标签被重新关闭打开。

在开发调试 Service Worker 时，肯定希望重新加载后立即激活，通常开发者不希望每次都重新打开当前页面调试，为此可以在 `install` 事件发生时通过 `skipWaiting()` 来跳过 Service Worker 的 waiting 状态。这样每次 Service Worker 安装后就会被立即激活，通常在 `sw.js` 中实现如下代码所示：

```js
self.addEventListener('install', () => {
  if (ENV === 'development') {
    self.skipWaiting()
  }
})
```

### 4.2 借助 Chrome Devtool 进行调试

使用 Chrome 浏览器，可以通过进入控制台 `Application -> Service Workers` 面板查看和调试。其效果如下图所示：

![Chrome Devtools Service Worker 调试面板](Service_Worker指南-1.assets/chrome_debug.png)

如果 Service Worker 线程已安装到当前打开的页面上，接下来会看到它将列示在此窗格中。例如：在上图中，展示的是在 `https://lavas-project.github.io/lavas-demo/news-v2/#/` 的作用域内安装了一个 Service Worker 线程。

为了更熟练的运用 Chrome Devtools 调试 Service Worker，首先需要熟悉以下这些选项：

- **Offline**： 复选框可以将 DevTools 切换至离线模式。它等同于 Network 窗格中的离线模式。
- **Update on reload**：复选框可以强制 Service Worker 线程在每次页面加载时更新。
- **Bypass for network**：复选框可以绕过 Service Worker 线程并强制浏览器转至网络寻找请求的资源。
- **Update**：按钮可以对指定的 Service Worker 线程执行一次性更新。
- **Push**：按钮可以在没有负载的情况下模拟推送通知。
- **Sync**：按钮可以模拟后台同步事件。
- **Unregister**：按钮可以注销指定的 Service Worker 线程。
- **Source**：告诉当前正在运行的 Service Worker 线程的安装时间，链接是 Service Worker 线程源文件的名称。点击链接会将定向并跳转至 Service Worker 线程来源。
- **Status**：告诉 Service Worker 线程的状态。此行上的数字指示 Service Worker 线程已被更新的次数。如果启用 `update on reload` 复选框，接下来会注意到每次页面加载时此数字都会增大。在状态旁边会看到 `start` 按钮（如果 Service Worker 线程已停止）或 `stop` 按钮（如果 Service Worker 线程正在运行）。Service Worker 线程设计为可由浏览器随时停止和启动。 使用 stop 按钮明确停止 Service Worker 线程可以模拟这一点。停止 Service Worker 线程是测试 Service Worker 线程再次重新启动时的代码行为方式的绝佳方法。它通常可以揭示由于对持续全局状态的不完善假设而引发的错误。
- **Clients**：告诉 Service Worker 线程作用域的原点。如果已启用 `show all` 复选框，`focus` 按钮将非常实用。 在此复选框启用时，系统会列出所有注册的 Service Worker 线程。如果这时候点击正在不同标签中运行的 Service Worker 线程旁的 `focus` 按钮，Chrome 会聚焦到该标签。

如果 Service Worker 文件在运行过程中出现了任何的错误，将显示一个 `Error` 新标签，如下图所示。

![Chrome Devtools 中的 Service Worker 报错信息](Service_Worker指南-1.assets/chrome_debug_error.png)

当然也可以直接访问 `Chrome://serviceworker-internals` 来打开 serviceWorker 的配置面板，查看所有注册的 Service Worker 情况。

> 注意： 如无必要，不要选中顶部的 `Open DevTools window and pause javaScript execution on Service Worker startup for debugging` 复选框，否则每当刷新页面调试时都会弹出一个开发者窗口来。

在 Firefox 中，可以通过 `Tools -> Web Developer -> Service Workers` 打开调试面板。也可以访问 `about:debugging#workers` 直接进入该面板。

### 4.3 查看 Service Worker 缓存内容

通过前面的章节已经了解过，Service Worker 使用 Cache API 进行缓存的读写，同样可以在 Chrome DevTools 上查看缓存的资源列表。

Cache Storage 选项卡提供了一个已使用（Service Worker 线程）Cache API 缓存的只读资源列表，如下图所示。

![Chrome Devtools 中展示的缓存列表](Service_Worker指南-1.assets/sw_cache.png)

如果打开了两个或多个缓存，那在 Application 标签下的 Caches 面板将看到它们会陈列在 Cache Storage 下拉菜单下方，如下图所示。

![Chrome Devtools  中展示多个缓存列表](Service_Worker指南-1.assets/multiple_caches.png)



当然，Cache Storage 提供清除 Cache 列表的功能，在选择 `Cache Storage` 选项卡后在 Cache Storge 缓存的 key 的 item 上右键点击出现 `delete` ，点击 `delete` 就可以清除该缓存了，如下图所示。

![Chrome Devtools 中清楚缓存内容](Service_Worker指南-1.assets/clear_caches.png)

也可以选择 `Clear Storage` 选项卡进行清除缓存。

### 4.4 网络跟踪

此外经过 Service Worker 的 `fetch` 请求 Chrome 都会在 Chrome DevTools Network 标签页里标注出来，其中：

- 来自 Service Worker 的内容会在 Size 字段中标注为 `from ServiceWorker`
- Service Worker 发出的请求会在 Name 字段中添加 ⚙ 图标。

如下图所示，第一个名为 `300` 的请求是一张 jpeg 图片， 其 URL 为 `https://unsplash.it/200/300`，该请求是由 Service Worker 代理的， 因此被标注为 `from ServiceWorker`。

为了响应页面请求，Service Worker 也发出了名为 `300` 的请求（这是下图中第二个请求），但 Service Worker 把 URL 改成了 `https://unsplash.it/g/200/300`，因此返回给页面的图片是灰色的。

![Service Worker 网络跟踪情况](Service_Worker指南-1.assets/service_worker_network.png)

### 4.5 真机调试

由于 Service Worker 必须要在 HTTPS 环境下才能被注册成功，所以在真机调试的过程中还需要解决 HTTPS 调试问题，当然 `127.0.0.1` 和 `localhost` 是被允许的 host，但是在真机调试上无法指定为到 PC 上的本地服务器，所以真机 debug 必须要求是已经部署好的 https PWA 站点。

#### Android inspect 远程调试

对于 Android 设备，可以借助于 Chrome 的 inspect 方法进行调试 PWA，其中有几个事项是需要提前准备的：

- PC 上已安装 Chrome 32 或更高版本。
- PC 上已安装 USB 驱动程序（如果使用 Windows），确保设备管理器报告正确的 USB 驱动程序。
- 一根可以将 Android 设备连接至开发计算机的 USB 线。
- 一台 Android 4.0 或更高版本的 Android 设备。

接下来可以通过以下步骤进行调试：

1. 将 Android 设备通过 USB 线与 PC 连接。
2. 在 Android 设备上进行一些设置，选择 `设置 > 开发者选项 > 开启 USB 调试`。
3. 在 PC 上打开 Chrome，使用一个 Google 帐户登录到 Chrome。（远程调试在隐身模式或访客模式下无法运行）。
4. 在 PC 的 Chrome 浏览器地址栏输入 `chrome://inspect`。
5. 在 `Remote Target` 下找到对应的 Android 设备。
6. 点击远程设备链接进入 Chrome Devtools。

这样的话就可以在 Chrome 的 Devtools 直接调试运行在 Android 手机端 Chrome 的 PWA 站点，体验完全和在本地 PC 电脑上 debug 一摸一样。

#### iOS 远程真机调试

对于 iOS 设备运行的 PWA，真机 debug 有点麻烦，好在 Apple Safari 也提供了一套远程调试的方案，可以借助于 Web Inspector（web 检查器）机制来完成真机调试。在开始调试之前需要准备以下工具：

- 一台 Mac 电脑。
- 一个 icloud 账号。
- 一个 Apple 的移动设备（iPhone）。
- 用 iCloud 账号登陆 Mac 和 iPhone。
- 对 iPhone 进行设置：`设置 > Apple ID 用户中心入口 > iCloud > 打开 Safari`。
- 对 iPhone 进行设置：`设置 > Safari浏览器 > 高级 > 打开 Web Inspector`。
- 对 Mac 进行设置：` > 系统偏好设置 > iCloud > 勾上 Safari`。
- 对 Mac 进行设置：`打开 Safari > Safari 菜单 > 偏好设置 > 高级 > 勾选“在菜单栏中显示开发菜单”`（这时候 Safari 的系统菜单栏多了一个 `开发` 标签）。

当完成了准备工作后，下面可以开始调试了，调试步骤如下：

1. 用 USB 线连接 iPhone 和 Mac。
2. 在 iPhone 上打开 PWA 站点。
3. 打开 Mac 上 Safari 菜单栏的 `开发` 标签，就可以点击进 `我的 iPhone`。
4. 接下来会发现 `我的 iPhone` 子菜单里有在 iphone 上打开的 PWA 站点，这时候就可以用 Safari 的 Devtools 进行调试。





**参考**

- https://web.dev/service-worker-lifecycle/
- https://lavas-project.github.io/pwa-book/chapter04/3-service-worker-dive.html
- https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/skipWaiting