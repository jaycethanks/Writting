## tsup 是什么？

> https://tsup.egoist.dev/

官网对tsup的描述是：“Bundle your TypeScript library with no config, powered by [esbuild](https://github.com/evanw/esbuild).”

简单的来说， 这是一个打包器，可以用于打包任何能够被原生 Node 支持的文件， `.js`,`.json`,`.mjs` 以及 Typescript `.ts`,`.tsx`. css 现在是实验性支持。 

## tsup 有什么特点？

- 无需任何配置
- 基于 esbuild 进行打包
- 速度超快

### 安装

```bash
npm i tsup -D
yarn add tsup --dev
pnpm add tsup -D
```

### 使用

打包文件

```bash
tsup [...files]
```

## tsup 和 tsc 有什么区别

tsup 和 tsc 都可以用来编译 TypeScript 代码,但有以下主要区别:

1. tsc 是 TypeScript 自带的编译器,tsup 则是一个第三方构建工具。
2. tsc 主要功能就是编译 TS 为 JS。tsup 不仅能编译 TS,还能打包、压缩代码,生成生产可用的构建结果。
3. tsc 需要配置 tsconfig.json。tsup 可以零配置使用。
4. tsc 生成 ES6 CommonJS 格式代码。tsup 可以生成多种格式如 ESM、CJS、UMD。
5. tsc 构建比较慢。tsup 基于 esbuild 很快,利用 CPU 多核心。
6. tsup 内置了对 SSR、SWC 转换等功能的支持。

总结:

- tsc 是 TS 编译利器。
- tsup 更倾向于一个构建和打包工具。
- tsup 在编译速度和输出格式上拥有优势。

所以对于发布类库,tsup 是一个不错的选择。但 tsc 仍是日常编译代码的首选。



## tsup 和 esbuild 以及 rollup 有什么区别，共同点，以及有什么关系？

tsup、esbuild 和 rollup 都是用于打包和构建 JavaScript/TypeScript 项目的工具,主要区别和关系如下:

**区别**

- esbuild 只关注构建速度,是最快的构建工具
- rollup 关注生成代码的大小,树摇优化
- tsup 集成了 esbuild 与 rollup 的优势,同时支持多种输出格式

**共同点** 

- 都是构建和打包工具
- 能够处理 JavaScript 和 TypeScript 代码
- 支持常见的模块化格式(ESM、CJS、UMD)

**关系**

- tsup 基于 esbuild 实现快速构建
- tsup 集成了 rollup 插件,可供可选用
- esbuild 和 rollup 是两个独立的构建工具
- tsup 整合两者优点,作为上层解决方案

**总结**

tsup 借鉴并统一了 esbuild 与 rollup 的特性,作为一体化的打包工具给开发者使用。





## 更多

[浅谈基于tsup打包TypeScript](https://juejin.cn/post/7178792371159564346?searchId=20231121140404AF9736DCF1E598833B63)

[tsup 入门到熟练](https://juejin.cn/post/7201114708714963003?searchId=20231121140404AF9736DCF1E598833B63)