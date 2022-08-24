## Critical rendering path

Critical Render Path (关键渲染路径，***下文简称 CRP***) 就是浏览器，将HTML,CSS,JavaScript转换成屏幕上像素的一系列有序的步骤。 

关键渲染路径 包括了 DOM (Document Object Model)， CSSOM(CSS Object Model), Render 树，以及Layout。

DOM 在 HTML 被解析的时候被创建。 HTML 可能会请求 JavaScript，而这些请求反过来又有可能会改变 DOM。 HTML 中还有可能含有 样式内容，或者会请求外部样式表，这些样式则会被构建成 CSSOM。

**浏览器引擎，将 DOM + CSSOM 结合在一起变作 Render Tree.** 而 Layout 决定了页面上一切元素的大小和位置， 一旦布局过程完成，紧接着就是将这些元素逐像素绘制到屏幕。

优化 CRP 将提升渲染性能，进而缩短首次渲染的时间。 因此理解并优化 CRP 对于

1. 保证 reflows 和 repaints 能够以60帧的频率执行；
2. 确保用户交互性能
3. 避免 [jank](https://developer.mozilla.org/en-US/docs/Glossary/Jank)

来说，是关键。



### Understanding CRP

Web 性能包括了 ：服务器请求与响应、loading、scripting、rendering、layout、painting。

1. 一个网页渲染，以一次 HTML 请求开始；
2. 服务器返回 HTML —— 响应 header + data；
3. 浏览器开始解析 HTML， 将接收的字节数据，转化为 DOM tree；
   1. 当在解析过程中，每当浏览器发现了有链接到外部的资源，如 样式表，js脚本文件，或者内嵌的图片，就会发起请求。有些请求会阻塞，这就意味着，余下的 HTML 将暂停解析，直到请求的资源被处理完。这个 <u>解析HTML + 请求资源 + 构建DOM</u> 的过程。直到最后浏览器构建了 CSSOM。 
   2. 当 DOM + CSSOM 构建完成，浏览器会将二者结合为 Render Tree, 计算所有可见内容的样式。
   3. Render Tree 构建完成，就开始执行 layout，即布局步骤， 这期间，将会定义 Render Tree 上每个节点元素的大小和位置。 这个过程类似在构建 "蓝图"。 
   4. 一但 布局 完成，浏览器就会将，所有元素节点绘制到 屏幕。



#### Document Object Model (DOM)

**注意：** DOM 结构式渐进式的。 HTML 响应 -- tokens -- nodes -- DOM Tree。 单个 DOM 节点以 startTag token 开始， 以 endTag token 结束。节点包含了 HTML 元素所有相关的信息。  这些信息以tokens 描述。 Nodes 被关联到 一个基于 token 层级的 DOM tree，即如果 一组 startTag 和 endTag tokens 被嵌置于 另一组 startTag 和 endTags，那么就会得到一个嵌套的 Node, 这就是 DOM tree 的层级结构如何被定义的。 

节点的数量越多，那么 CRP 接下来的处理就会越耗时，也就意味着性能会受影响。 



#### CSS Onject Model (CSSOM)

DOM 包含了页面的所有内容， CSSOM则包含了DOM 所有的样式。 CSSOM 和 DOM 很近似，但是又不同。 DOM是渐进式的， 但是 CSSOM 不是。 CSS 阻塞渲染(#css is render blocking) : 浏览器阻塞页面渲染直到接收并处理完了所有的 CSS。 **而之所以CSS 会阻塞渲染，是因为 css 规则会被覆写， 因此 CSSOM还没有 完成之前，内容无法被正确渲染。**



CSS 有它自己的一套规则去识别有效的 tokens。 别忘了 "CSS" 中的 "C" 表示 "Cascade(#级联)" 。当解析器将 tokens 转化为 nodes 的时候，后代节点将会继承父节点的部分样式， 所以HTML 的渐进(#incremental) 特性不会应用于 CSS。 CSSOM 在 CSS 被解析的时候得以创建， 但是直到 CSS 被完全解析完成之前，还无法构建 Render Tree。 因为后续的解析可能会覆盖之前解析的样式结果，被覆盖掉的样式不应该被渲染到屏幕。

当谈及 样式选择器的性能， 更少的选择器规则会比更复杂的快。 例如， `.foo{}` 会比 `.bar .foo{}` 要快。 因为，当浏览器找到了 `.foo` ， 它还要去 DOM 中检查 `.foo` 是不是有一个名为 `.bar` 的祖先。 



不过，如果你去测量 CSS 的解析时间，你会发现起始浏览器在CSS 的解析上的处理是非常快的。虽然 更多的选择器规则，意味着浏览器需要在 DOM tree 中遍历更多的 节点，但是这个开销通常是很小的。 所以针对选择器的优化通常是毫秒级别的提升。

> 这里有一些其他的 CSS 优化，[ways to optimize CSS](https://developer.mozilla.org/en-US/docs/Learn/Performance/CSS)。



#### Render Tree

Render Tree 是 DOM + CSSOM 的结合，浏览器会检查每个节点， 从 DOM tree 的 root 开始，并检测附着了哪些 CSS 样式规则。 

Render Tree 只会捕获 可见的内容 (`visibility:hidden`会被捕获，但是`display:none` 不会)。

通常`<head>` 标签中的信息都是不可见的。 因此`display:none` 所应用的节点及其后代节点，和没有可见内容的`<head>` 元素，都不会被捕获进 Render Tree。



#### Layout

一旦渲染树被构建， 就可以进行 布局(#layout) 了。 布局是基于 屏幕的尺寸，布局步骤决定了元素该被如何定位，元素的宽高如何被定义，以及它们是如何相互关联的。 

> 什么是元素的 width ? 块级元素，**默认的有一个 `100%` 的宽度定义**

viewport 元数据标签，定义了 布局的视图区域宽度， 他将影响布局，如果没有定义，浏览器将会使用默认的宽度。 

节点的数量越多，也就意味布局耗时会越多，

为了减少布局事件的频率和持续时间，请批处理更新并避免使用box属性去实现动画。



#### Paint

这是 CRP 的最后一步，将像素点绘制到屏幕。 一旦渲染树被创建，开始布局，像素就可以被绘制到屏幕上。 在 `window.onload` 之后，整个屏幕已经被绘制完成。 因为浏览器通常被优化为最小区域重绘(#repaint)，因此在 `load` 之后，仅屏幕上被影响的区域 会被 repainted 。



## Optimizing for CRP

提高页面的加载速度可以通过以下tips :

1. 通过推迟(#defer) / 删除非关键资源的加载，以缩减关键资源的数量。
2. 优化请求资源的大小
3. 通过优化关键资源的下载顺序，从而缩短 the critical path length





> transate @from https://developer.mozilla.org/en-US/docs/Web/Performance/Critical_rendering_path