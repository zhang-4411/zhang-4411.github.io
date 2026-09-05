---
title: 在 STM32 上实现可维护的 Initcall 自动初始化
date: 2022-07-12 10:00:00
tags:
  - STM32
  - 嵌入式
  - 启动流程
  - 链接脚本
  - 函数指针
abbrlink: 507015846
---

在 STM32 项目里，`main` 函数很容易变成一串初始化调用：时钟、串口、GPIO、定时器、看门狗和应用层组件全部堆在一起。模块变多以后，初始化顺序难以维护，模块之间也会产生不必要的耦合。

Linux 内核和不少嵌入式 RTOS 会把初始化函数放进特定的链接段，再由启动框架按阶段统一执行。下面用一个精简版 Initcall 说明这种思路。

## 一、核心思路

每个模块只需要完成两件事：实现自己的初始化函数，并通过宏把函数指针放入指定段。启动时遍历段的起止地址，依次调用其中的函数。

```text
模块实现 init 函数
        ↓
宏把函数指针放入 initcallNinit 段
        ↓
链接脚本收集同名段
        ↓
启动代码遍历段并调用函数
```

## 二、用宏注册初始化函数

```c
typedef void (*initcall_t)(void);

#define INIT_EXPORT(fn, level) \
    static const initcall_t __initcall_##fn##level \
    __attribute__((used, section("initcall" #level "init"))) = fn

#define INIT_PREV_EXPORT(fn)      INIT_EXPORT(fn, 0)
#define INIT_DEVICE_EXPORT(fn)    INIT_EXPORT(fn, 1)
#define INIT_COMPONENT_EXPORT(fn) INIT_EXPORT(fn, 2)
#define INIT_ENV_EXPORT(fn)       INIT_EXPORT(fn, 3)
#define INIT_APP_EXPORT(fn)       INIT_EXPORT(fn, 4)
```

`level` 表示初始化阶段。时钟和底层硬件应先执行，应用层初始化放在后面，这样顺序由框架统一管理，而不是依赖文件排列顺序。

## 三、GCC 下遍历链接段

链接脚本需要提供段的起止符号：

```ld
.initcall : {
    __initcall_start = .;
    KEEP(*(initcall0init))
    KEEP(*(initcall1init))
    KEEP(*(initcall2init))
    KEEP(*(initcall3init))
    KEEP(*(initcall4init))
    __initcall_end = .;
} >FLASH
```

C 代码中声明这些符号，并按地址遍历：

```c
extern initcall_t __initcall_start[];
extern initcall_t __initcall_end[];

void do_init_call(void)
{
    for (initcall_t *fn = __initcall_start;
         fn < __initcall_end;
         ++fn) {
        if (*fn != 0) {
            (*fn)();
        }
    }
}
```

实际工程中应确认链接脚本的段顺序，并使用 `KEEP` 防止链接器垃圾回收掉“看起来没有被引用”的函数指针。

## 四、模块侧的使用方式

```c
static void system_clock_init(void)
{
    /* 配置系统时钟 */
}
INIT_PREV_EXPORT(system_clock_init);

static void uart_init(void)
{
    /* 初始化调试串口 */
}
INIT_DEVICE_EXPORT(uart_init);

static void app_init(void)
{
    /* 初始化应用状态 */
}
INIT_APP_EXPORT(app_init);
```

最后在 `main` 中保留一处入口：

```c
int main(void)
{
    do_init_call();
    while (1) {
        /* 主循环 */
    }
}
```

## 五、工程实践中的注意事项

1. 初始化函数要保证幂等，避免重复调用造成资源泄漏。
2. 如果某个阶段依赖前一阶段的返回值，应增加错误处理或状态检查。
3. 不要在初始化函数中执行无限等待，否则后续阶段永远不会运行。
4. ARMCC、GCC 的段符号语法不同，移植时应分别维护遍历代码。
5. 链接脚本是这套机制的一部分，修改宏后必须检查最终 `.map` 文件。

Initcall 的价值，是把“初始化顺序”从业务代码中抽离出来。模块拥有自己的初始化入口，框架负责统一调度，项目规模扩大后仍能保持清晰的启动流程。
