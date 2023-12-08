### 1.创建项目目录

```bash
mkdir bxh2b
cd bxh2b
code .
pnpm init
```

### 2.创建pnpm-workspace.yaml配置文件

```bash
touch pnpm-workspace.yaml

# pnpm-workspace.yaml
packages:
#  指定子项目，这些项目之间可以相互引用
 - "projects/**"

```

### 3.创建项目目录

```bash
mkdir projects
cd projects
```

#### 4.创建一个vue项目

```bash
pnpm create vite
# demo-comp
# Vue
# TypeScript
cd demo-comp
pnpm install
```

### 5.创建一个lib目录并创建一个示例组件

 ```bash
 mkdir lib;
 touch lib/DemoComp.vue lib/index.ts
 
 #lib/DemoComp.vue
 <script lang='ts' setup>
 </script>
 <template>
     <button>hello</button>
 </template>
 <style lang='scss' scoped>
 button{
     color: red;
 }
 </style>
 
 # lib/index.ts
 ```

> 如果index.ts 中在引入.vue 文件报错时， 是因为ts需要配置include路径
>
> 就是在 tsconfig.json.include 中加入 `lib/**/*.vue`, `lib/**/*.ts`

### 6.vite 配置库模式

安装组件用到的 sass 依赖， 安装为组件自动生成声明文件的插件 `vite-plugin-dts`

```bash
pnpm add sass vite-plugin-dts -D
```

配置库模式：

```js
// vue.config.js
import { defineConfig, resolveBaseUrl } from 'vite'
import vue from '@vitejs/plugin-vue'
import {resolve} from 'path'
// 为组件生成声明文件的插件
import dts from "vite-plugin-dts"
export default defineConfig({
  plugins: [vue(),dts({include:"./lib"})],
  build:{
    lib:{
      entry:resolve(__dirname,'lib/index.ts'),
      name:'demoComp',
      fileName:'demo-comp'
    },
    rollupOptions:{
      // 确保外部化处理那些你不想打包进库的以来
      external:['vue'],
      output:{
        // 在UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals:{
          vue:'Vue'
        }
      }
    }
  }
})

```



### 7. package.json 配置编写

> package.json 配置文件说明
>
> ```json
> {
>   /*
>    1. 用于定义package.json文件和该文件所在目录根目录中.js文件和无拓展名文件的处理方式。值为'moduel'则当作es模块处理；值为'commonjs'则被当作commonJs模块处理
>    2. 目前node默认的是如果pacakage.json没有定义type字段，则按照commonJs规范处理
>    3. node官方建议包的开发者明确指定package.json中type字段的值
>    4. 无论package.json中的type字段为何值，.mjs的文件都按照es模块来处理，.cjs的文件都按照commonJs模块来处理
>     */
>   "type": "module",
>   /*
>    如果需要避免这个包被发布到公共仓库上去，则可以设置为true，如果需要对外发布，则需要设置为false
>    */
>   "private": false,
>   /*
>   执行 npm pub 命令时哪些文件会被发布到npm仓库
>    */
>   "files": ["dist"],
>   // 使用 require('xxx') 方式引入时, 引入的是这个文件
>   "main": "./dist/my-button.umd.cjs",
>   // 使用 import x from 'xxx' 方式引入组件时，引入的是这个文件
>   "module": "./dist/my-button.js",
>   // 组件ts类型声明文件的入口文件
>   "types": "./dist/index.d.ts",
>   /*
>   定义外部可访问的资源。
>   如果不定义，那么整个发布目录下的资源都是可以访问的。
>   如果定义了，那只能访问定义的资源。
>   ".": {
>       "import": "./dist/my-button.js",
>       "require": "./dist/my-button.umd.cjs"
>     }
>     上面这个配置表示当使用 import 和 require 方式引入时，分别引入的是哪个具体的js
>    
>    "./dist/style.css": "./dist/style.css"
>    上面这个配置表示当使用 import 'xxx/dist/style.css'时访问的是 dist 目录下的 style.css文件
> 
>    定义了exports之后，如果想访问 import 'xx/dist/scss/index.scss' 会报错。 因为exports中未声明这个资源
>    要么就添加这个资源的定义. 要么就删除exports定义，删除了exports定义之后，发布目录下的所有文件就都可以直接访问了
>   */
>   "exports": {
>     ".": {
>       "import": "./dist/my-button.js",
>       "require": "./dist/my-button.umd.cjs"
>     },
>     "./dist/style.css": "./dist/style.css"
>   },
>   // 如果是打包成了一个可执行cli，那这里就指定这个cli的名称和cli文件的路径
>   "bin": { "npm": "./cli.js" },
>   // 提交bug的url和（或）邮件地址
>   "bugs": {
>     "url": "http://github.com/owner/project/issues",
>     "email": "project@hostname.com"
>   },
>   // 指定执行publish命令时，会发布到哪个仓库. 该方式可以用于避免代码不小心被发布到公共仓库
>   "publishConfig": {
>     "registry": "http://localhost:2000"
>   }
> }
> 
> ```

```json
{
  "name": "demo-comp",
  "private": false,
  "version": "0.0.0",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/demo-comp.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.3.4"
  },
  "devDependencies": {
    "@types/node": "^20.9.0",
    "@vitejs/plugin-vue": "^4.2.3",
    "sass": "^1.69.5",
    "typescript": "^5.0.2",
    "vite": "^4.4.5",
    "vite-plugin-dts": "^3.6.3",
    "vue-tsc": "^1.8.5"
  }
}

```

### 9. 打包测试

```bash
$ pnpm run build
```



### 9. 新起一个独立项目用于测试

```bash
cd projects
pnpm create vite
# demo-comp-example
# Vue
# TypeScript
```

我们需要在这个测试项目中去引入我们自己编写的组件, 得益于pnpm 的workspace 支持，我们可以很便捷的引入我们写好的组件。 但是有一点需要注意， 我们添加依赖也是使用 `pnpm add` 命令， 这样有个问题，就是容易引入现有的公共npm包， 为了解决这个问题， 我们可以利用npm的命名空间能力， 简单的来说，npm 可以组织的形式维护包， 组织名就会被用作命名空间。 例如`@vue/xxxx ` `@vue` 就是命名空间， 我们可以在申请自己的命名空间  [link](https://www.npmjs.com/org/create)

我申请了名为 `bxh2b` 的命名空间，现在我们将 projects/demo-comp/package.json 中的 name字段修改一下：
```diff
-  "name": "demo-comp",
+  "name": "@bxh2b/demo-comp",
```

紧接着，我们直接在 projects/demo-comp-example/ 下去引入我们的组件，执行：
```bash
$ pnpm add @bxh2b/demo-comp -S
```

我们可以在 projects/demo-comp-example/package.json中看到引入的依赖：
```diff
  "dependencies": {
+    "@bxh2b/demo-comp": "workspace:^",
    "vue": "^3.3.4"
  },
```



