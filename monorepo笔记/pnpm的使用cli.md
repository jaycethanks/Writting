这里列举了常用的pnpm cli 配置项

## 命令等价

| npm 命令        | pnpm 等效                                        |
| --------------- | ------------------------------------------------ |
| `npm install`   | [`pnpm install`](https://pnpm.io/zh/cli/install) |
| `npm i <pkg>`   | [`pnpm add <pkg>`]                               |
| `npm run <cmd>` | [`pnpm <cmd>`]                                   |



## 常用 options

### `-C <path>, --dir <path>`

该选项用于在 `<path>` 中启动 pnpm ，而不是当前的工作目录。

假如我们现在有以下目录结构：
```bash
$ l
test_npm  test_pnpm
```

我们可以在 test_npm 的终端中，直接为 test_pnpm 添加依赖：
```bash
$ cd test_npm/
$ pnpm -C ../test_pnpm/ add lodash
$ cat ../test_pnpm/package.json  | grep -C 2 lodash
  "dependencies": {
    "express": "^4.18.2",
    "lodash": "^4.17.21"
  }
}
```





### `-w， --workspace-root` 

该选项在 monorepo 项目中，可以直接在任意子项目终端中，在跟工作目录执行命令， 假如我们现在有以下目录结构：
```bash
$ tree -L 2
.
├── package.json
├── pnpm-workspace.yaml
└── projects
    ├── test_npm
    └── test_pnpm

3 directories, 2 files

$ cat pnpm-workspace.yaml
packages:
 - "projects/**"
```

```bash
# 在子项目终端中 直接用pnpm操作根工作目录
# 在test_npm这个子项目中，直接在根目录引入 axios
$ cd projects/test_npm/; pnpm -w add axios;cd ../../
$ ls
node_modules  package.json  pnpm-lock.yaml  pnpm-workspace.yaml  projects

$ cat package.json | grep axios -C 2
  "license": "ISC",
  "dependencies": {
    "axios": "^1.6.1"
  }
}
```



## 配置

pnpm 使用 [npm 的配置](https://docs.npmjs.com/misc/config) 格式。 因此，您设置配置的方式应该与 npm 相同。例如，

```bash
pnpm config set store-dir /path/to/.pnpm-store
```

此外，pnpm 使用与 npm 相同的配置进行安装。 如果您有一个私有源并且 npm 被配置使用它， pnpm 应该不需要额外的配置也能够授权请求。

更多信息请参阅 [`config` 命令](https://pnpm.io/zh/cli/config)。



## 过滤

### `--filter <package_name>`

这个命令选项可以用于选择指定子项目去执行特定命令。 注意过滤范围是当前目录的子集目录

假设我们现在有以下目录结构：
```bash
$ tree -L 2
.
├── test_npm
│   ├── node_modules
│   ├── package-lock.json
│   └── package.json
└── test_pnpm
    ├── node_modules
    ├── package.json
    └── pnpm-lock.yaml

4 directories, 4 files
```

我为每个项目重新进行了命令， 并各子编写了一条 script, 如下：
```bash
$ cat test_*/package.json | grep -E "(name|hello)" -C 1
{
  "name": "@abcd/test_npm",
  "version": "1.0.0",
--
    "test": "echo \"Error: no test specified\" && exit 1",
    "hello": "echo \" 你好啊，老铁！\""
  },
--
{
  "name": "test_pnpm",
  "version": "1.0.0",
--
    "test": "echo \"Error: no test specified\" && exit 1",
    "hello": "echo \"Hello! Old iron! \""
  },
```

现在我们可以通过 `--filter` 选项去指定哪个项目执行某个命令：
```bash
$ pnpm --filter "@abcd/*" hello

> @abcd/test_npm@1.0.0 hello /home/jayce/workspace_personal/tmp/test_pnpm/projects/test_npm
> echo " 你好啊，老铁！"

 你好啊，老铁！
```

```bash
$ pnpm --filter "@ab*" hello

> @abcd/test_npm@1.0.0 hello /home/jayce/workspace_personal/tmp/test_pnpm/projects/test_npm
> echo " 你好啊，老铁！"

 你好啊，老铁！
```

```bash
$ pnpm --filter "test_pnpm" hello

> test_pnpm@1.0.0 hello /home/jayce/workspace_personal/tmp/test_pnpm/projects/test_pnpm
> echo "Hello! Old iron! "

Hello! Old iron!
```

```bash'
$ pnpm --filter "*test*" hello
Scope: all 2 projects
projects/test_npm hello$ echo " 你好啊，老铁！"
│  你好啊，老铁！
└─ Done in 18ms
projects/test_pnpm hello$ echo "Hello! Old iron! "
│ Hello! Old iron!
└─ Done in 16ms
```

> pnpm 所支持的过滤模式远比演示的强大， 具体的详见 [这里](https://pnpm.io/zh/filtering).



## 脚本

### 声明周期脚本

pnpm支持了一个特定的脚本命令叫做 `pnpm:devPreinstall`, 该命令将在每次执行 `pnpm install` 命令的时候被执行。

现在我们加了一条 `"pnpm:devPreinstall"` 命令， 如下：

```bash
$ cat package.json | grep -A 3 scripts
  "scripts": {
    "pnpm:devPreinstall": "echo 我要开始安装了哦！。。。。",
    "test": "echo \"Error: no test specified\" && exit 1",
    "hello": "echo \"Hello! Old iron! \""
```

```bash
$ pnpm install axios

> test_pnpm@1.0.0 pnpm:devPreinstall /home/jayce/workspace_personal/tmp/test_pnpm/projects/test_pnpm
> echo 我要开始安装了哦！。。。。

我要开始安装了哦！。。。。
Already up to date
Progress: resolved 70, reused 70, downloaded 0, added 0, done
Done in 836ms
```

```bash
$ pnpm install

> test_pnpm@1.0.0 pnpm:devPreinstall /home/jayce/workspace_personal/tmp/test_pnpm/projects/test_pnpm
> echo 我要开始安装了哦！。。。。

我要开始安装了哦！。。。。
Lockfile is up to date, resolution step is skipped
Already up to date
Done in 663ms
```





## CLI 命令

pnpm 支持了大量的命令， 可以在[这里](https://pnpm.io/zh/cli/add)看到.

pnpm 将命令归为了几个大类：

1. 管理依赖
2. 修补依赖项
3. 查看依赖
4. 运行脚本
5. 管理环境
6. 其他

我这里不会详细说明所有的命令，仅看pnpm的一些特定规则，以及几个后面可能会用的到的命令：

1. 管理依赖

   **`pnpm add <pkg>`**

   pnpm 支持多种依赖安装方式：

   1. 从 npm 安装

      `pnpm add package-name` 默认会**从 npm registry 安装最新的** `package-name`

      **如果在 workspace 中执行 , 该命令会首先去检查这个workspace 中的其他项目是否已经使用了这个指定的包，如果是的话，就使用这个包的版本范围来进行安装**。

   2. 从workspace 安装

   3. 从本地安装

      1. 源码文件(`.tar`, `.tar.gz`,`.tgz`)： `pnpm add ./package.tar.gz`
      2. 本地目录: `pnpm add ./some-directory`

   4. 从远端安装 Tar 包：`pnpm add https://github.com/indexzero/forever/tarball/v0.5.6`

   5. 从 git  安装: `pnpm add <git remote url>`

   **配置项**：

   1. `--workspace`: 仅添加在 workspace 找到的依赖项.

2. 修补依赖项

3. 查看依赖

4. 运行脚本

5. 管理环境

   pnpm 支持node 版本管理， 不过它要求使用独立的pnpm安装程序安装pnpm 才行。 并先卸载通过其他方式安装的 Nodejs.

   详细使用见[这里](https://pnpm.io/zh/cli/env).

6. 其他