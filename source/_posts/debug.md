---
title: 嵌入式日志系统设计：让 Debug 信息可控、可读、可关闭
date: 2022-07-12 07:00:00
tags:
  - C语言
  - 嵌入式
  - 日志
  - Debug
abbrlink: 2286445522
---

在单片机项目里，`printf` 能快速定位问题，但项目一大，所有输出混在一起就很难维护。更实用的做法是建立统一的日志接口，让日志具备级别、颜色和编译期开关。

## 一、先定义日志级别

常见的日志级别可以分成三类：

- `DEBUG`：开发阶段的详细调试信息。
- `INFO`：记录正常的初始化和运行状态。
- `WARN`：提示异常，但程序仍可继续运行。

发布版本通常关闭 `DEBUG`，保留必要的 `WARN` 和 `INFO`。

## 二、用宏封装输出

```c
#ifndef DEBUG_H
#define DEBUG_H

#include <stdio.h>

#define LOG_RESET "\033[0m"
#define LOG_RED   "\033[31m"
#define LOG_GREEN "\033[32m"
#define LOG_BLUE  "\033[34m"

#ifndef LOG_LEVEL
#define LOG_LEVEL 3 /* 0:关闭，1:WARN，2:INFO，3:DEBUG */
#endif

#define LOG_PRINT(color, tag, fmt, ...) \
    do { \
        printf(color "[LOG/%s] " fmt LOG_RESET "\r\n", tag, ##__VA_ARGS__); \
    } while (0)

#if LOG_LEVEL >= 3
#define log_d(fmt, ...) LOG_PRINT(LOG_BLUE, "D", fmt, ##__VA_ARGS__)
#else
#define log_d(fmt, ...) ((void)0)
#endif

#if LOG_LEVEL >= 2
#define log_i(fmt, ...) LOG_PRINT(LOG_GREEN, "I", fmt, ##__VA_ARGS__)
#else
#define log_i(fmt, ...) ((void)0)
#endif

#if LOG_LEVEL >= 1
#define log_w(fmt, ...) LOG_PRINT(LOG_RED, "W", fmt, ##__VA_ARGS__)
#else
#define log_w(fmt, ...) ((void)0)
#endif

#endif
```

使用时只关心统一接口：

```c
log_i("system init ok");
log_d("rx length = %d", length);
log_w("retry count = %d", retry_count);
```

## 三、Release 版本如何关闭

可以在编译参数中设置 `-DLOG_LEVEL=0`，也可以在工程配置中为 Debug 和 Release 分别设置不同的宏。关闭后，日志宏会展开为空操作，不会产生额外的串口输出。

## 四、几个容易踩坑的地方

1. 日志函数不要在中断里执行耗时的格式化和串口发送。
2. `printf` 的重定向要统一，否则不同模块可能使用不同串口。
3. 可变参数宏要使用 `##__VA_ARGS__` 兼容没有额外参数的调用。
4. 颜色码只对支持 ANSI 转义序列的终端有效，记录到文件时应关闭颜色。

统一日志接口的价值不在于多写几个宏，而在于让调试输出具备一致的格式，并且可以随着构建类型自动收敛。
