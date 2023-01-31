## JetBrain 全家桶破解注册教程

- **本教程适用于 Jetbrains WebStorm | PyCharm | PhpStorm | IDEA**
- **本教程适用于 Windows / Mac / Linux**
- **脚本来源自 [discord](https://discord.com/channels/930039921111080990/930039921111080995). 源下载[链接](https://cdn.discordapp.com/attachments/930039921111080993/996089590421127278/jetbrain_activation_ja-netfilter.zip).**
- **本教程以 IDEA 示例，linux 环境(适用于 mac)**
- **windows 用户自行见脚本包中的 readme 教程**
- **本教程 IDEA 版本为 IntelliJ IDEA 2022.2.3 (Ultimate Edition)， 更多版本可尝试这个[激活资源包](https://wwt.lanzoue.com/i83HE0f6woud)，内附教程**

1. 自行下载 IDEA [官网](https://www.jetbrains.com/idea/download/#section=linux), [下载直链 (linux)](https://www.jetbrains.com/idea/download/download-thanks.html?platform=linux)。

2. 下载注册脚本 [蓝奏云](https://wwt.lanzoue.com/iLwjk0f6tw9c)

3. 自行安装 IDEA. (至能正常创建项目)

4. 将下载的 脚本包移动至不会变动的路径，并解压，这里如：

   ```bash
   $ pwd
   /opt
   $ tree
   Intellij_IDEA_2022/
   ├── bin
   ├── build.txt
   ├── help
   ├── Install-Linux-tar.txt
   ├── jbr
   ├── lib
   ├── license
   ├── plugins
   └── product-info.json
   jetbrains_register_script/
   ├── jetbrain
   └── jetbrain_activation_ja-netfilter.zip
   ```

   > Intellij_IDEA_2022 为 IDEA 安装目录， jetbrain 为解压后的 脚本包， 解压命令 `sudo unzip jetbrain_activation_ja-netfilter.zip`

5. 执行 install.sh 脚本:

   ```bash
   $ pwd
   /opt
   $ sudo bash ./jetbrains_register_script/jetbrain/scripts/install.sh
   done. you'd better log off first! #出现这行提示为安装完成。
   ```

6. **重启电脑 `reboot` （:warning: 不重启激活码会报 无效的）**

7. 复制 `jetbrains_register_script/jetbrain/keys/IntelliJ_IDEA.key` 中的 key

8. 启动 IDEA, - Help - Register

   1. 如果登陆了就点击你的账户名，- log out
   2. 反正最 Activation Code 这里填写赋值的激活码， 然后点击激活，就 Ok 了。
