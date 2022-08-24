https://webpack.js.org/concepts/

[toc]

## 概念

Webpack 的核心， 是一个现代JS 应用的静态资源打包器。 
在其内部，它以一个或者多个入口 构建了一个 依赖图 [dependency gragh](https://webpack.js.org/concepts/dependency-graph/), 并且将你的项目所需要的每个模块打包成一个或者多个包。 

从4.0.0 版本，**webpack 不再需要强行一个配置文件以打包你的项目**，但是尽管如此，为了更好地满足你的需求，它具有[不可思议的配置能力](https://webpack.js.org/configuration)。 

开始 webpack ， 你仅需要知道它的核心概念：

- [Entry](https://webpack.js.org/concepts/#entry)
- [Output](https://webpack.js.org/concepts/#output)
- [Loaders](https://webpack.js.org/concepts/#loaders)
- [Plugins](https://webpack.js.org/concepts/#plugins)
- [Mode](https://webpack.js.org/concepts/#mode)
- [Browser Compatibility](https://webpack.js.org/concepts/#browser-compatibility)

本文档不会过于深入这些概念的背后原理， 如有需要可以参考一下资源：

- [Manually Bundling an Application](https://www.youtube.com/watch?v=UNMkLHzofQI)
- [Live Coding a Simple Module Bundler](https://www.youtube.com/watch?v=Gc9-7PBqOC8)
- [Detailed Explanation of a Simple Module Bundler](https://github.com/ronami/minipack)

### Entry

入口（#entry point）指明了webpack 要从哪个地方开始构建内部的依赖图，WebPack 会找出其他入口文件直接或间接依赖的模块和库(#modules & libraries) 。

默认的， 该值为 `./src/index.js`, 但是你可以指定一个或者多个入口，通过 webpack 的`entry` 配置属性。例如：

**webpack.config.js** 

```json
module.exports = {
    entry: './path/to/my/entry/file.js'
}
```

> ###### Tip
>
> Learn more in the [entry points](https://webpack.js.org/concepts/entry-points) section.

### OutPut

Output 属性，告诉webpack如何命名，以及如何存放打包后的文件。 默认值主打包文件为 `./dist/main.js`， 其他的关联生成文件，将会放置在 `./dist` 目录下。 

你可以通过 `output` 配置属性，自定义配置。 

**webpack.config.js**

```javascript
const path = require('path');

module.exports = {
    entry: './path/to/my/entry/file.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'my-first-webpack.bundle.js',
    },
}
```

> ###### Tip
>
> The `output` property has [many more configurable features](https://webpack.js.org/configuration/output). If you want to learn about the concepts behind it, you can [read more in the output section](https://webpack.js.org/concepts/output).

### Loaders

webpack 本身仅理解 JavaScript 和 JSON 文件， **Loaders** 允许webpack 处理其他类型的文件， 并将它们转换为 有效的 modules （有效指的是，能够被你的应用所理解， 并且被添加到依赖图）。

**Loaders** 有两个webpack 配置属性：

1. `test` :  用于匹配待转换的目标文件类型。
2. `use` : 用于指定使用那个或者哪些 loaders 用于去做转换处理。

**webpack.config.js**

```javascript
const path = require('path');

module.exports = {
    output: {
        filename: 'my-first-webpack.bundle.js',
    },
    module:{
        rules:[{ test:/\.txt$/, use:'raw-loader' }],
    }
}
```

以上的配置种定义了 `rules` 属性， 并有两个必须提供的属性 : `test` 和 `use`。 这将会告诉webpack 的编译器：

> 嘿， webpack 编译器， 当你在 `require() / import` 语句中遇到了扩展名为 ".txt" 的文件，在你将他添加到 bundle 之前， 你要先使用  `raw-loader` 去转换一下它。

>Warning
>
>`test` 属性指定的是一个正则表达式，而不是 字符串。 



### Plugins

Loaders 用于将特定类型的文件转换成为 moduels, 而 plugins  则能够用于执行更广泛的任务， 如打包优化， 静态资源管理，和环境变量注入等。

> ###### Tip
>
> Check out the [plugin interface](https://webpack.js.org/api/plugins) and how to use it to extend webpack's capabilities.

要使用一个插件，你需要 `require()` 它，并将它添加到 `plugins` 数组。 大多数的插件，都是**支持通过 options 进行自定义配置**。

你可以在一个配置中多次使用同一个插件，用于达成不同的目的。 也正因为如此，所以你需要在使用插件的时候，先通过`new` 操作符生成插件的实例。

**webpack.config.js**

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');// to access built-in plugins

module.exports = {
    module: {
        rules:[{test: /\.txt$/, use: 'raw-loader'}],
    },
    plugins: [new HtmlWebpackPlugin({ template: './src/index.html' })],
}
```

在上例中，`html-webpack-plugin` 为你的应用生成了一个HTML 文件，并且自动引入了所有生成的 bundles。

> ###### Tip
>
> There are many plugins that webpack provides out of the box! Check out the [list of plugins](https://webpack.js.org/plugins).
> webpack 提供了很多开箱即用的插件。

### Mode

为 `mode` 属性，指定 `development`, `production`, `none` 这些参数. 可以开启 webpack 内置对应的优化功能。默认值为 `production` .

```javascript
module.exports = {
    mode: 'production',
}
```

> Tip
>
> Learn more about the [mode configuration here](https://webpack.js.org/configuration/mode) and what optimizations take place on each value.

### Browser Compatibility #浏览器兼容

Webpack支持所有兼容es5的浏览器(不支持IE8及以下浏览器)。Webpack需要Promise用于import()和require.ensure()。如果你想支持旧的浏览器，你需要在使用这些表达式之前加载一个polyfill。



### Environment

Webpack 5 runs on Node.js version 10.13.0+.
