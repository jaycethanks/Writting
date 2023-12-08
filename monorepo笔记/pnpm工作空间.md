## 工作空间（Workspace）

workspace 可以用于将多个项目合并到一个仓库中。一个workspace 的根目录下必须有 `pnpm-workspace.yaml` 文件。

### pnpm-workspace.yaml

`pnpm-workspace.yaml` 定义了 [工作空间](https://pnpm.io/zh/workspaces) 的根目录，并能够使您从工作空间中包含 / 排除目录 。 默认情况下，包含所有子目录

示例:
```yaml
packages:
  # all packages in direct subdirs of packages/
  - 'packages/*'
  # all packages in subdirs of components/
  - 'components/**'
  # exclude packages that are inside test directories
  - '!**/test/**'
```



## Workspace 协议 (workspace:)

默认情况下，如果可用的 packages 与已声明的可用范围相匹配，pnpm 将从工作区链接这些 packages。 例如, 如果`bar`引用`"foo": "^1.0.0"`并且`foo@1.0.0`存在工作区，那么pnpm会从工作区将`foo@1.0.0`链接到`bar`。 但是，如果 `bar` 的依赖项中有 `"foo": "2.0.0"`，而 `foo@2.0.0` 在工作空间中并不存在，则将从 npm registry 安装 `foo@2.0.0` 。 这种行为带来了一些不确定性。



## 通过别名引用 workspace 包

假设你在 workspace 中有一个名为 `foo` 的包， 通常你会像这样引用：`"foo": "workspace:*"`。

如果要使用其他别名，那么以下语法也将起作用: `"bar": "workspace:foo@*"`。

在发布之前，别名被转换为常规名称。 上面的示例将变为：`"bar": "npm:foo@1.0.0"`



## 通过相对路径引用 workspace 包

假如 workspace 中有两个包：

```text
+ packages
    + foo
    + bar
```

`bar` 中可能有 `foo` 的依赖： `"foo": "workspace:../foo"`， 在发布之前，这些将转换为所有包管理器支持的常规版本规范。



## 发布 workspace 包

当 workspace 包打包到归档（无论它是通过 `pnpm pack` ，还是 `pnpm publish` 之类的发布命令）时，我们将动态替换这些 `workspace:` 依赖：

- 目标 workspace 中的对应版本（如果使用 `workspace:*`, `workspace:~`, or `workspace:^`）
- 相关的 semver 范围（对于任何其他范围类型）

看一个例子，假设我们的 workspace 中有 `foo`、 `bar`、 `qar`、 `zoo` 并且它们的版本都是 `1.5.0`，如下：

```json
{
    "dependencies": {
        "foo": "workspace:*",
        "bar": "workspace:~",
        "qar": "workspace:^",
        "zoo": "workspace:^1.5.0"
    }
}
```

将会被转化为：

```json
{
    "dependencies": {
        "foo": "1.5.0",
        "bar": "~1.5.0",
        "qar": "^1.5.0",
        "zoo": "^1.5.0"
    }
}
```

这个功能允许你发布转化之后的包到远端，并且可以正常使用本地 workspace 中的 packages，而不需要其它中间步骤。包的使用者也可以像常规的包那样正常使用，且仍然可以受益于语义化版本。