## Page Loader

[toc]

1. 页面的加载过程 ？
2. `$( document ).ready()` ? `window.onload` ? 等钩子函数的执行时机 ？
3. page loader 的执行周期 ？
4. page loader 通常是如何实现的 ？
5. 复杂 page loader 又是怎么实现的？
6. page loader 有哪些优化技巧 ？



## 一个页面加载过程，涉及到哪些事件 ？

### **Document 对象**

1. `readystatechange` 事件

   当 document 的 [`readyState`](https://developer.mozilla.org/en-US/docs/Web/API/Document/readyState)  属性变更时，触发。它有以下状态：

   - `loading`: dom 正在加载
   - `interactive` ： dom加载完毕，可以访问dom元素，但是子资源还在加载
   - `complete` ： 页面完全加载

   事件监听举例：

   ```javascript
   document.onreadystatechange = function () {
     if (document.readyState === 'complete') {
       initApplication();
     }
   }
   ```

2. `DOMContentLoaded`

   当初始化的 HTML 文档完全加载并解析的时候触发，并不会等到样式表，子窗口，或者图片等资源加载。不同于 `window.load()`， 那是页面加载完成，包括所有外部资源。

   > 同步Js 的执行，会阻塞DOM 的解析，如果你希望DOM尽快解析，可以让Js异步执行，并且优化样式表的加载。

   浏览器 自动填写记住的账号密码 的内部实现也是在在这个阶段去完成的。



### **Window 对象**

1. `load`

   浏览器完全加载了 HTML 同时，也加载了外部资源。

2. `beforeunload`

   在页面和资源卸载之前触发。您可以使用此事件显示一个确认对话框来确认您是否真的要离开该页。

   详细的见下方 [附属内容^1^](#附属内容^1^)

3. `unload`

   页面完全卸载的时候触发，你可以使用该事件发送分析数据，或者清理资源。更多详见下方 [附属内容^2^](#附属内容^2^)





### **事件的监听**

浏览器给了我们两种事件监听的方式，一种是直接访问window 上的钩子方法,另一种，是通过 window 上添加 Event Listener

```javascript
window.addEventListener('DOMContentLoaded',() => {
    // handle DOMContentLoaded event
});

window.addEventListener('load', (event) => {
    // handle load event
});
window.onload = function(){
    // handle load event
}

window.addEventListener('beforeunload',() => {
    // handle beforeunload event
});

window.addEventListener('unload',() => {
    // handle unload event
});
window.onunload = function(){
    // handle load event
}
```

> 虽然document 上也可能有相关load 方法，但是现在多被废弃了。注意。[link](https://stackoverflow.com/a/588048/12261182)

















**JQuery 相关事件**

- `.load(handler)` ：

  JQuery 中的[ `.load` 事件](https://api.jquery.com/load-event/)，是 `window.load` 的增强版。其大致用例如下：

  ```html
  <img src="book.png" alt="Book" id="book">
  <script>
  $( "#book" ).load(function() {
    // Handler for .load() called.
  });
  </script>
  ```

  > 当元素及其子元素完全加载，包括图片等各种资源加载完成后触发

  ```javascript
  $( window ).load(function() {
    // Run code
  });
  ```

  > 当传入window对象时，等同于 `window.load` ，会等页面完全加载完毕触发。

- `.ready()`

  ```javascript
  $( document ).ready(function() {
    // Handler for .ready() called.
  });
  
  // 等同于
  
  $(function() {
    // Handler for .ready() called.
  });
  ```

  > JQuery 中的 [`.ready()` 事件](https://api.jquery.com/ready/)，是基于`DOMContenLoaded` 事件实现的。[相关源码](https://github.com/jquery/jquery/blob/main/src/core/ready.js).





## **附属内容^1^**

**`window.onbeforeunload` 事件**

如果用户，尝试离开当前页面，或者关闭窗口。`beforeunload` handler 将会询问更多的额外信息。 

如果我们想要取消这个事件， 浏览器会询问用户是否取消。 

不同的浏览器，实现有所不同，行为也会有所差异。

*Chrome(当前测试版本：101.0.4951.64 )*

```javascript
window.addEventListener("beforeunload", (event) => {
    event.returnValue = "";
    // event.returnValue = "string";
});
```

`event.returnValue` 指定空或者非空字符串

*FireFox(当前测试版本：100.0.2 (64-bit)）*

```javascript
// 方式1 ，必须指定非空字符串
window.addEventListener("beforeunload", (event) => {
    event.returnValue = "non-empty String";
});

// 方式2： 如果要指定空字符串，可以结合 event.preventDefault();
window.addEventListener("beforeunload", (event) => {
    event.preventDefault();
    event.returnValue = "";
});
```

**注意：** 该事件的触发，都必须用户和页面交互 （例如用户输入，点击），否则 `beforeunload` 事件有可能被直接忽略。

> 具体的表现
>
> - Chrome：页面普通刷新，不会提示，用户F5 刷新提示， 关闭不会提示。
> - FireFox： 只要没有用户先交互，都不会触发提示



## **附属内容^2^**

**`window.unload` 事件**

当访问者离开页面时，该 `unload` 事件将会触发，我们可以在这里做一些不涉及延迟的操作，例如，相关的弹出窗口。

但是，注意，有一个延迟事件是例外的，那就是发送分析数据。

> 我们可以在用户浏览网页的时候，记录用户行为，例如 点击，卷动，视图区域的停留事件等。

有一个既存的特殊方法 `navigator.sendBeacon(url, data)`

他会在后台发送数据，且不会阻塞页面的关闭。如下使用：

```javascript
let analyticsData = { /* object with gathered data */ };

window.addEventListener("unload", function() {
  navigator.sendBeacon("/analytics", JSON.stringify(analyticsData));
});
```

有几个注意点：

- 是POST 请求
- 不仅可以发送字符串，还可以发送表单或者其他任意格式的数据。不过通常是一个对象字符串。 更多相关见 [这里](https://javascript.info/fetch) 。
- 数据的大小限制是 64kb

当`sendBeacon` 请求完成的时候，浏览器可能已经丢弃了之前的文档，所以没办法接收回调。

也有一个 `keepalive` 的 flag 

> There’s also a `keepalive` flag for doing such “after-page-left” requests in [fetch](https://javascript.info/fetch) method for generic network requests. You can find more information in the chapter [Fetch API](https://javascript.info/fetch-api).
>
> If we want to cancel the transition to another page, we can’t do it here. But we can use another event – `onbeforeunload`.





**References**

1. https://www.w3docs.com/snippets/css/how-to-create-animation-on-page-load.html
2. https://www.javascripttutorial.net/javascript-dom/javascript-page-load-events/
3. https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event
4. https://developers.google.com/speed/docs/insights/OptimizeCSSDelivery
5. https://github.com/jquery/jquery/blob/main/src/core/ready.js
6. https://api.jquery.com/load-event/
7. https://javascript.info/onload-ondomcontentloaded#domcontentloaded-and-styles
8. https://groups.google.com/a/chromium.org/g/chromium-discuss/c/VRzNnX0AJuo?pli=1
8. https://stackoverflow.com/a/588048/12261182