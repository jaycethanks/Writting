[toc]

## plugin

**插件** 是webpack 的支柱功能。 webpack 自身也是构建于你在 webpack 配置中 用到的  **相同的插件系统** 之上。 

插件的目的在于解决 loader 无法实现的 **其他事**。 Webpack 提供很多开箱即用的 插件。

> Tip
>
> 如果在插件中使用了 webpack-sources 的 package， 请使用 `require('webpack').source` 替代 `require('webpack-source')`， 以避免持久缓存的版本冲突。 

### 刨析

webpack 插件是有一个具有 `apply` 方法的 JavaScript 对象。 apply 方法会被  webpack compiler 调用， 并且在 **整个** 编译生命周期都可以访问 compiler 对象。 

**ConsoleLogOnBuildWebpackPlugin.js**

```javascript
const pluginName = "ConsoleLogOnBuildWebpackPlugin";

class ConsoleLogOnBuildWebpackPlugin {
  constructor(obj) {
    this.obj = obj;
  }
  apply(compiler) {
    compiler.hooks.run.tap(pluginName, (compilation) => {
      for (const key in this.obj) {
        console.log(key, "--line10");
      }
      console.log("webpack 构建过程开始！");
    });
  }
}
module.exports = ConsoleLogOnBuildWebpackPlugin;
```

**webpack.config.js**

```javascript
const ConsoleLogOnBuildWebpackPlugin = require("./ConsoleLogOnBuildWebpackPlugin.js");

module.exports = {
  ...
  plugins: [
    new ConsoleLogOnBuildWebpackPlugin({
      key1: "hello world",
      key2: "hello webpack",
    }),
  ],
};
```

ConsoleLogOnBuildWebpackPlugin.js 中， compiler hook 的 tap 方法的第一个参数，应该是驼峰式命名的插件名称。建议为此使用一个常量，以便它可以在所有 hook 中服用。 

### 用法

由于 **插件** 可以携带参数/选项， 你必须在 webpack 配置中， 向 `plugins` 属性，传入 `new` 实例。 根据你的 webpack 用法，这里有很多方式使用插件。

### 配置：

**webpack.config.js**

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin'); // 通过npm 安装。 
const webpack = require('webpack'); // 访问内置的插件
const path = require('path');

const config = {
    entry: './path/to/my/entry/file.js',
    output: {
        filename: 'my-first-webpack.bundle.js',
        path: path.resolve(__dirname,'dist')
    },
    module:{
        rules:[
            {
                test:/\.(js|jsx)$/,
                use: 'babel-loader'
            }
        ]
    },
    plugins:[
        new webpack.optimize.UglifyJsPlugin(),
        new HtmlWebpackPlugin({ template: './src/index.html' })
    ]
};
module.exports = config;
```

### Node API

> [TODO]: 即使使用Node API, 用户也应该在配置中传入 `plugins` 属性， `complier.apply` 并不是推荐的使用方式。

**some-node-script.js**

```javascript
const webpack = require('webpack'); //访问 webpack 运行时(runtime)
const configuration = require('./webpack.config.js');

let compiler = webpack(configuration);
compiler.apply(new webpack.ProgressPlugin());
compiler.run(function(err,stats){
    //...
})
```

> *你知道吗：以上看到的示例和* [webpack 自身运行时(runtime)](https://github.com/webpack/webpack/blob/e7087ffeda7fa37dfe2ca70b5593c6e899629a2c/bin/webpack.js#L290-L292) *极其类似。*[wepback 源码](https://github.com/webpack/webpack)*中隐藏有大量使用示例，你可以用在自己的配置和脚本中。*