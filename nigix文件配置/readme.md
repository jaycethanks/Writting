本文总结自官方文档：https://nginx.org/en/docs

[toc]

## 1. Beginner's Guide

> 安装等操作，系统进程管理操作等，在此不会过多的提及。因为不同系统方式存在差异。 仅作少量说明。 
>
> 作者本地环境为
>
> ```powershell
> wsl -l -v                                                                                           NAME            STATE           VERSION                                                         * Ubuntu-20.04    Running         2 
> ```
>
>  系统管理为：
>
> ```bash
> $ service --version
> service ver. 1.57
> ```

### **nginx 的安装：**

```bash
$ sudo apt update
$ sudo apt install nginx -y
```

### **nginx 服务控制：**

```bash
$ service nginx + tab
configtest    force-reload  reload        restart       rotate        start         status        stop          upgrade
```

```bash
# 启动nginx服务：
$ sudo service nginx start 
# 重启nginx:
$ sudo service nginx restart
# 重载nginx配置文件：
$ sudo service nginx reload
# 强制重载nginx配置文件：
$ sudo service nginx force-reload
# 查看nginx 服务运行状态
$ sudo service nginx status
# 停止nginx服务
$ sudo service nginx stop
```



## 2. 配置文件结构 （Configuration File's Structure）

nginx 的配置文件时模块化组织的，每个模块化配置中的配置规则都是由指令集（就是多个指令集合，directives）来指定， 指令集又分为两类，一个时简单指令集（simple directives） ,一个是块指令集（block directives）。

主配置文件为： /etc/nginx/nginx.conf



