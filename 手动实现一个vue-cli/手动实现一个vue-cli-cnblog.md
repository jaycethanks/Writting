[toc]

## 手动实现一个vue cli

### 1.  思考准备

最一开始：创建一个web项目，所以需要一个html 文件，又是一个Vue 项目，所以需要一个div，并指明一个id. 

我们使用webpack 打包后的文件，需要被引入，bundle.js, 应该把它放在dist （分发）文件夹。

---->  指明id 的 div 的html 文件
---->  dist 文件夹

目前结构为：

```bash
.
└── dist
    └── index.html
```

index.html 内容为：

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>VueStarter</title>
  </head>
  <body>
    <div id="app"></div>
    <script src="bundle.js"></script>
  </body>
</html>

```



### 2. 我们组织源码将会放在名为src的目录，webpack 打包需要一个入口文件，我们取作 main.js 

   ```bash
   .
   ├── dist
   │   └── index.html
   └── src
       └── main.js
   ```

### 3.  先预想以下会用到哪些基本依赖，第一个容易想到的是Vue, 然后是我们假设项目需要使用elementUI , 还有axios ，先就这些：

   ```bash
   npm i vue element-ui axios
   ```

   最终我们需要的核心文件是打包后的bundle.js , 接下来需要用到的核心是webpack , 所以安装 webpack

   以及想到， 需要引入vue 的代码 vue-loader 以及 .vue 文件的解析依赖 vue-template-compiler

   样式sass-loader  以及sass 本体

   处理后的css 文件需要通过css-loader 加载，然后被style 标签解析，需要用到 style-loader

   还需要babel 来处理es6的新语法，所以需要安装

   babel babel-loader @babel/core babel 的预设配置 @babel/preset-env(env 代表兼容最新的语法)

   ```bash
   # -D 指的是开发环境
   npm i -D webpack webpack-cli vue-loader vue-template-compiler sass-loader sass css-loader style-loader babel-loader @babel/core @babel/preset-env
   ```

### 4.  我们的目标是要把src 中的从main.js 开始去编译-打包，到dist 文件夹中去， 所以我们需要配置文件，进行配置。 所以创建webpack 的配置文件， webpack.config.js

   > 发现没有自动生成 package.json 文件， 命令 npm init 手动生成， 将入口文件指定为main.js
   >
   > ```bash
   > .
   > ├── README.md# 手动生成的
   > ├── dist
   > ├── node_modules
   > ├── package-lock.json
   > ├── package.json
   > ├── src
   > └── webpack.config.js
   > ```

### 5.  编写配置：

   基本结构熟悉：

   ```json
   module.exports = {
     entry:'',//入口文件
     output:{//出口文件，
       path:'',
       filename:'',
     },
     module:{//webpack 中一切皆模块
       rules:[
         { test:/\.vue$/,use:'vue-loader'},
         ....
       ]
     },
     plugins:[//插件用于增强webpack
       new PluginsA(),//每一个插件就是一个实例
       new PluginsB(),
       ...
     ]
   }
   ```

   开始填充内容：

   ```json
   const path = require("path");
   const { VueLoaderPlugin } = require("vue-loader");
   module.exports = {
     entry: "./src/main.js", //入口文件 绝对路径 / 相对路径
     output: {
       //出口文件，
       path: path.resolve(__dirname, "dist") + "", //绝对路径 __dirname 是node "当前所在路径pwd" , 由于window 的目录分隔符是 '\', 而类nix是 '/'， 为了保持灵活性，使用了node 内置的path 对象方法,将自动将当前系统目录分隔符和目录名拼接
       filename: "bundle.js",
     },
     module: {
       //webpack 中一切皆模块
       rules: [
         { test: /\.vue$/, use: "vue-loader" },
         /**
          * 处理.vue 文件的加载, 写法可以指定
          * 单个依赖 - String，
          * 单个带配置的依赖 - {}
          * 多个不带配置的依赖 - []String ,
          * 多个带配置的依赖 []Object
          * { test: /\.vue$/, use: [{loader:'vue-loader',options:{}},{}...] },
          */
         {
           test: /\.s[ca]ss$/,
           use: ["style-loader", "css-loader", "scss-loader"],
         }, //要注意顺序，依次从后往前解析
         {
           test: /\.m?js$/, //.msj 是es6 的模块化js 文件
           use: {
             loader: "babel-loader",
             options: {
               presets: ["@babel/preset-env"],
             },
           },
         },
         {
           //图片处理
           // test: /\.(png|jpe?g|gif|svg|webp)$/,use: { laoder: "file-loader", options: { esModule: false } },//老语法
           test: /\.(png|jpe?g|gif|svg|webp)$/,
           type: "asset/resource",
         },
       ],
     },
     plugins: [
       //插件用于增强模块
       // vue-template-compiler 的作用是解析.vue 文件内部时，遇到js 块和css 块时的处理方式，复用我们上面定义的规则
       new VueLoaderPlugin(),
     ],
   }
   ```

### 6.  编写入口文件 main.js

   ```javascript
   import Vue from "vue";
   import App from "./App.vue";
   
   new Vue({
     el: "#app",
     render: (h) => h(App), //将App 依赖通过渲染函数渲染成DOM 节点,挂载到 #app 节点下
   });
   
   ```

   ```html
   <!--App.vue-->
   <template>
     <div>hello vue starter</div>
   </template>
   <script>
   export default {};
   </script>
   <style lang="scss" scoped></style>
   ```

### 7.  准备跑起来项目，创建一个快捷脚本去调用非全局webpack 命令

   ```json
   #package.json
   "scripts": {
       "serve": "webpack --mode=development --watch", 
       "build": "webpack --mode=production"
     },
   ```

   > 在package.json 文件中指定的 script 脚本会自动去执行node_modules/bin 下的脚本， mode 选项指定启动模式：
   >
   > - production : 生成环境，压缩代码，无错误提示
   > - development ： 开发环境，不压缩代码
   >
   > watch ： 检测文件变化，自动重新编译打包

### 8.  启动项目

   cmd 执行命令 `npm run serve`

   dist 目录下生成了 bundle.js 文件，

   此时打开dist 目录下的index.html 文件。将会看到App.vue 中写的内容：

   ![image-20211101232725016](https://img2020.cnblogs.com/blog/1735896/202111/1735896-20211102002121983-1689978571.png)

   这说明初步成功了。

### 9.  做一些增强，引入路由

   安装依赖

   ```bash
   npm i vue-router
   # -S 是默认参数
   ```

   创建 /router/index.js 并编辑：

   ```javascript
   import VueRouter from "vue-router";
   import Home from "../pages/Home.vue";
   import Vue from "vue";
   
   Vue.use(VueRouter);
   
   const router = new VueRouter({
     routes: [
       {
         path: "",
         component: Home,
       },
       {
         path: "/me",
         component: () => import("../pages/About.vue"),
       },
     ],
   });
   
   export default router;
   
   ```

   main.js 中引入：

   ```javascript
   import Vue from "vue";
   import App from "./App.vue";
   import router from "./router";
   
   new Vue({
     el: "#app",
     router,
     render: (h) => h(App), //将App 依赖通过渲染函数渲染成DOM 节点,挂载到 #app 节点下
   });
   
   ```

   App.vue 注册 `<router-view>` 标签：

   ```html
   <template>
     <div>
       <span>hello vue starter</span>
       <div><button @click="$router.push('/')">HomePage</button></div>
       <div><button @click="$router.push('/me')">About Me</button></div>
       <router-view></router-view>
     </div>
   </template>
   <script>
   export default {};
   </script>
   <style lang="scss" scoped></style>
   ```

   启动程序 `npm run serve`

   ![image-20211101234624755](https://img2020.cnblogs.com/blog/1735896/202111/1735896-20211102002121803-1822477456.png)

### 10.  进一步增强，引入webpack 开发服务器

    ```bash
    npm i -D webpack-dev-server
    ```

    修改启动脚本：
    pacakge.json

    ```json
    "serve": "webpack --mode=development --watch",
    ```

    修改为：

    ```json
    "serve": "webpack serve --mode=development",
    ```

    > webpack -dev-server 提供了子命令serve 并会自动watch

    配置webpack.config.js

    启动项目：

    ```bash
    npm run serve
    ```

    ![image-20211102000024219](https://img2020.cnblogs.com/blog/1735896/202111/1735896-20211102002121545-385713942.png)

    ![image-20211102000046376](https://img2020.cnblogs.com/blog/1735896/202111/1735896-20211102002121262-958672201.png)

### 11.  优化配置，自动打开浏览器

    webpack.config.js:

    ```json
      devServer: {
        static: "./dist",
        open:true
      },
    ```

### 12.  更多

    ```json
    const path = require("path");
    
    const { VueLoaderPlugin } = require("vue-loader");
    module.exports = {
      entry: "./src/main.js", //入口文件 绝对路径 / 相对路径
      output: {
        //出口文件，
        path: path.resolve(__dirname, "dist") + "", //绝对路径 __dirname 是node "当前所在路径pwd" , 由于window 的目录分隔符是 '\', 而类nix是 '/'， 为了保持灵活性，使用了node 内置的path 对象方法,将自动将当前系统目录分隔符和目录名拼接
        filename: "bundle.js",
      },
      module: {
        //webpack 中一切皆模块
        rules: [
          { test: /\.vue$/, use: "vue-loader" },
          /**
           * 处理.vue 文件的加载, 写法可以指定
           * 单个依赖 - String，
           * 单个带配置的依赖 - {}
           * 多个不带配置的依赖 - []String ,
           * 多个带配置的依赖 []Object
           * { test: /\.vue$/, use: [{loader:'vue-loader',options:{}},{}...] },
           */
          {
            test: /\.s[ca]ss$/,
            use: ["style-loader", "css-loader", "scss-loader"],
          }, //要注意顺序，依次从后往前解析
          {
            test: /\.m?js$/, //.msj 是es6 的模块化js 文件
            use: {
              loader: "babel-loader",
              options: {
                presets: ["@babel/preset-env"],
              },
            },
          },
          {
            //图片处理
            // test: /\.(png|jpe?g|gif|svg|webp)$/,use: { laoder: "file-loader", options: { esModule: false } },//老语法
            test: /\.(png|jpe?g|gif|svg|webp)$/,
            type: "asset/resource",
          },
        ],
      },
      plugins: [
        //插件用于增强模块
        // vue-template-compiler 的作用是解析.vue 文件内部时，遇到js 块和css 块时的处理方式，复用我们上面定义的规则
        new VueLoaderPlugin(),
      ],
      devServer: {
        static: "./dist",
        open: true,
        host: "local-ip", //启动地址为局域网ipv4 地址
        port: 3333, //手动指定地址，
        onListening(devServer) {
          //命令行自定义输出
          console.log(
            "Listening :http://",
            devServer.server.address().address,
            ":",
            devServer.server.address().port,
          );
        },
      },
    };
    ```

13. done

14. https://github.com/jaycethanks/vue-starter

15. https://www.bilibili.com/video/BV1234y1D7Bv

    https://www.bilibili.com/video/BV1db4y1a7HA













