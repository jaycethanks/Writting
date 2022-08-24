> https://bundlers.tooling.report/code-splitting/multi-entry/#webpack

## **引言：**

尽管每个页面有一个单独的 entry point 很常见， 但是其他的 models (#模型) 将这种关联松散化了。  例如，你可能 有一个单独用于 页面分析的 entry point 在 主 entry point 附近以不同的优先级加载。 又或者，可能你最终每个独立加载的组件都有一个 entry point。

取决于 不同的 工具和配置， 多个 entry bundles 所依赖的 modules 能够被解压到（#extracted） common bundles 用于多个页面共享。 也可能有些情况下，这些modules 被公用在很少的页面，这时达不到作为 shared bundle 的要求， 因此 bundler 可能将这些 module 内联（#inlined）加载到 每个单独的 entry point。

不论是 extracted 还是 inlined， 单个 mudule 都不应该被实例化多次，这一点很重要。

> ECMAScript 和 CommonJS Modules 都明确了 一个 module 必须在每个 JavaScript 上下文中只能被实例化一次。 

这点保证使得 一个 module 的顶层作用域本用于 全局状态 （#global state），并在该模块的所有使用中共享。（#shared across all usages of that module）。
很多库 都依靠这种假设来实施重要的跨切割问题，例如 momoization, queues 以及 plugin registries。 打破这个假设，并多次实例化在一个模块将会在技术上正确的代码中引入错误或者降低效率。 

## **测试：**

该测试，用于检查 两个不同的 entry bundls 所公用的 module 是否会仅被实例化一次。 该共享 module 导出一个对象，携带一个`count` 属性，且每个 entry module 都引入了这个 对象，并会加1。

**index.html**

```html
<script type="module" src="./component-1.js"></script>
<script type="module" src="./component-2.js"></script>
```

**component-1.js**

```javascript
import obj from "./obj.js";
obj.count++;
console.log("component-1 ", obj.count);

export default undefined;
```

**component-2.js**

```javascript
import obj from "./obj.js";
obj.count++;
console.log("component-2 ", obj.count);

export default undefined;
```

**obj.js**

```javascript
export default {count:0};
```

> @jayce:
> 测试输出结果：
>
> ```bash
> component-1  1
> component-1  2
> ```

如果 modules 被正确的实例化一次， 那么两个 entry modules 都会接收由该shared module 导出的同一个对象的索引。 则 该对象 的`.count` 属性也就会增加两次，也就是 结果为 `2` 。
否则，每个entry bundle 都会实例化一次这个 shared module, 那么就会实例化两个 shared module 对象， 这样，每次增加的都是各自的 `.count`, 那么结果就会是两个1。

