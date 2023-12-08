> 关于monorepo 工程化项目的一些最佳实践这篇文章写的蛮好 [Monorepo 下的模块包设计实践](https://juejin.cn/post/7052271542000074782?searchId=20231121140404AF9736DCF1E598833B63) - [字节跳动ADFE团队](https://juejin.cn/user/1310273592892846/posts)

### 项目目录结构

```bash
eslint-config$ tree -aL 2 -I ".git"
.
├── .gitattributes
├── .github
│   └── workflows
├── .gitignore
├── .npmrc
├── .vscode
│   └── settings.json
├── LICENSE
├── README.md
├── bin
│   └── index.js
├── eslint.config.js
├── fixtures
│   ├── input
│   └── output
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── src
│   ├── cli
│   ├── cli.ts
│   ├── configs
│   ├── factory.ts
│   ├── globs.ts
│   ├── index.ts
│   ├── plugins.ts
│   ├── types.ts
│   └── utils.ts
├── test
│   ├── cli.spec.ts
│   └── fixtures.test.ts
├── tsconfig.json
└── tsup.config.ts

11 directories, 22 files
```



## `tsup.config.ts`

[Tsup是什么？](./tsup介绍.md)



### `package.json.scripts.release` - bumpp是什么？

```json
    "release": "bumpp && pnpm publish",
```

bumpp是一个开源的版本发布工具,主要用来帮助管理包的版本和发布。

bumpp的主要功能包括:

1. 自动化包版本管理:可以基于规范自动升级版本号,支持主版本号/次版本号/修订版本号的升级。
2. 一键发布:集成了对npm/GitHub发布的支持,一次命令就可以把新版本发布到npm和GitHub。
3. Changelog 生成:可以自动生成变更日志,减少手动记录的麻烦。
4. 遵循Semver规范:生成的版本号和changelog都遵循语义化版本规范。
5. 支持各种包管理器:兼容npm、yarn、pnpm等。
6. 钩子函数:提供丰富的钩子函数,自定义版本升级流程。
7. 简化流程:不再需要记住许多发布步骤,一条命令完成构建/测试/发布。

总的来说,bumpp可以大幅简化包的版本和发布管理,让开发者更专注于代码和功能。它利用自动化流程减少了手动操作和认知负担。