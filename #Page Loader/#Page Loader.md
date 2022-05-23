## Page Loader



1. 页面的加载过程 ？
2. document.ready ? window.onload ? 等钩子函数的执行时机 ？
3. page loader 的执行周期 ？
4. page loader 通常是如何实现的 ？
5. 复杂 page loader 又是怎么实现的？
6. page loader 有哪些优化技巧 ？





[REF_2]

页面加载卸载的相关事件：

1. `DOMContentLoaded`

   浏览器完全加载了 HTML 并且， 已经完成了 DOM 树的构建。 但是，没有加载如样式表、图片等外部资源。  在这个事件中， 你可以选中DOM 节点， 或者初始化接口。
   浏览器通常有内部实现，在这个阶段去 自动填写记住的账号密码。

2. `load`

   浏览器完全加载了 HTML 同时，也加载了外部资源。

3. `beforeunload`

   在页面和资源卸载之前触发。您可以使用此事件显示一个确认对话框来确认您是否真的要离开该页。

4. `unload`

   页面完全卸载的时候触发，你可以使用该事件发送分析数据，或者清理资源。

页面加载卸载的相关事件Handler：

```javascript
document.addEventListener('DOMContentLoaded',() => {
    // handle DOMContentLoaded event
});

document.addEventListener('load',() => {
    // handle load event
});

document.addEventListener('beforeunload',() => {
    // handle beforeunload event
});

document.addEventListener('unload',() => {
    // handle unload event
});
```



**window 相关的事件**

1. `window.onload`

   `window` 对象上的 `load` 事件，会在 整个页面，包括外部的样式，图片，等其他资源全部加载完成后，会被触发`

2. `window.onunload`

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

3. `window.onbeforeunload`

   如果用户，尝试离开当前页面，或者关闭窗口。`beforeunload` handler将会询问更多的额外信息。 

   如果我们想要取消这个事件， 浏览器会询问用户是否取消。 

   你可以这样去触发：

   ```javascript
   window.onbeforeunload = function() {
     return false;
   };
   ```

   由于一些历史因素， 返回一个非空的字符串，也将会被视作取消该事件， 

   ```javascript
   window.onbeforeunload = function() {
     return "There are unsaved changes. Leave now?";
   };
   ```

   

   

   

   

   

   

   





**References**

1. https://www.w3docs.com/snippets/css/how-to-create-animation-on-page-load.html
   将 少量html 元素放在 header 中
2. https://www.javascripttutorial.net/javascript-dom/javascript-page-load-events/
   [REF_2]