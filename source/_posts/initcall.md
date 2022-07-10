---
title: 在STM32上模拟Linux自动初始化过程
tag: STM32 框架
abbrlink: 507015846
---
####    一、通常我们写程序都是按照这个套路，一个函数一个函数按照顺序逻辑一个一个的执行下去

```c
int main(int agrc, void *argv)
{
	systimer_init();
    usart_init();
    gpio_init();
    tim_init();
    iwdg_init();
    bsp_init();
    while(true)
    {
        ...
    }

}
```

如果逻辑非常复杂，涉及的模块比较多，那么这种顺序执行的代码就会比较臃肿，各模块耦合非常紧密。Linux kernel 中，有各种外设驱动，想按照一个顺序逻辑执行下去，几乎是不可能的。

而Linux kenrel 代码能有这么大的代码量，大而不乱，把各层次，各模块有效的分离，而大量的代码又有逻辑的组织在一起，和这个initcall 有至关重要的作用。

通过模仿这种方式，最后把main函数代码清空，分离这种逻辑，又实现同样的功能。

如何能实现这样的功能了，需要一些背景知识：

1，程序代码的组织

2，链接脚本相关的知识。

3，函数指针的应用。

```c
int main(int agrc, void *argv)
{
    int a;
    int b = 0;
    typedef void (*initcall_t)(void);
    initcall_t fn1;
    initcall_t fn2 = system_init();
}

```

上述的a,fn1都是存放在bss 段中，b,fn2是存放在data段中，因为已经给定了初始值，而实现这个intcall会把需要自动初始化的数据放到一个自定义的段中去，如.initcall。

如何放到特定的段中了，就需要用到了__attribute__((section(x)))关键字，来改变的数据存放段。

```c
#define __define_initcall(fn, id)                      \
    static const initcall_t __initcall_##fn##id __used \
        __attribute__((__section__("initcall" #id "init"))) = fn;

```

#### 二、本次分享的是开源项目[cola_os](https://gitee.com/schuck/cola_os)，采用MulanPSL-1.0开源协议，以下代码为了适用本人习惯修改部分地方，源码[点击查看](https://gitee.com/schuck/cola_os)

###### initcall.c

``` c
#include "initcall.h"

void do_init_call(void)
{
#if defined(__CC_ARM) /* ARM Compiler */
	extern initcall_t initcall0init$$Base[];
	extern initcall_t initcall0init$$Limit[];
	extern initcall_t initcall1init$$Base[];
	extern initcall_t initcall1init$$Limit[];
	extern initcall_t initcall2init$$Base[];
	extern initcall_t initcall2init$$Limit[];
	extern initcall_t initcall3init$$Base[];
	extern initcall_t initcall3init$$Limit[];
	extern initcall_t initcall4init$$Base[];
	extern initcall_t initcall4init$$Limit[];

	initcall_t *fn;

	for (fn = initcall0init$$Base;
		 fn < initcall0init$$Limit;
		 fn++)
	{
		if (fn)
			(*fn)();
	}

	for (fn = initcall1init$$Base;
		 fn < initcall1init$$Limit;
		 fn++)
	{
		if (fn)
			(*fn)();
	}

	for (fn = initcall2init$$Base;
		 fn < initcall2init$$Limit;
		 fn++)
	{
		if (fn)
			(*fn)();
	}

	for (fn = initcall3init$$Base;
		 fn < initcall3init$$Limit;
		 fn++)
	{
		if (fn)
			(*fn)();
	}

	for (fn = initcall4init$$Base;
		 fn < initcall4init$$Limit;
		 fn++)
	{
		if (fn)
			(*fn)();
	}
#elif defined(__GNUC__)
	extern initcall_t __initcall_start[];
	extern initcall_t __initcall_end[];

	initcall_t *start = __initcall_start;
	initcall_t *end = __initcall_end;
	initcall_t *fn;

	for (fn = start; fn < end; fn++)
	{
		printf("initcall fn 0x%x\r\n", fn);
		(*fn)();
	}
#endif
}

/**
 * @brief  各种类型各添加一个空函数，否则未使用的类型编译器会报警告，但不影响使用
 */
#if 1

void SystemClock_Init(void)
{

}
INIT_PREV_EXPORT(SystemClock_Init);

void Device_Init(void)
{

}
INIT_DEVICE_EXPORT(Device_Init);

void Component_Init(void)
{

}
INIT_COMPONENT_EXPORT(Component_Init);

void Env_Init(void)
{

}
INIT_ENV_EXPORT(Env_Init);

void App_Init(void)
{

}
INIT_APP_EXPORT(App_Init);

#endif


```

initcall.h

```c
#ifndef _INIT_CALL_H_
#define _INIT_CALL_H_

#define __used __attribute__((__used__))

typedef void (*initcall_t)(void);

#define __define_initcall(fn, id)                      \
	static const initcall_t __initcall_##fn##id __used \
		__attribute__((__section__("initcall" #id "init"))) = fn;

#define INIT_PREV_EXPORT(fn) 		__define_initcall(fn, 0)	   	//可用作系统时钟初始化
#define INIT_DEVICE_EXPORT(fn) 		__define_initcall(fn, 1)	   	//设备接口初始化
#define INIT_COMPONENT_EXPORT(fn) 	__define_initcall(fn, 2) 		//驱动初始化
#define INIT_ENV_EXPORT(fn) 		__define_initcall(fn, 3)	   	//环境初始化
#define INIT_APP_EXPORT(fn) 		__define_initcall(fn, 4)	   	// APP初始化

void do_init_call(void);
#endif

```

#### 三、使用方式

初始化函数编写完成后调用以下命令导出函数即可

```c
INIT_PREV_EXPORT();				//可用作系统时钟初始化
INIT_DEVICE_EXPORT();			//设备接口初始化
INIT_COMPONENT_EXPORT(fn);		//驱动初始化
INIT_ENV_EXPORT(fn);			//环境初始化
INIT_APP_EXPORT(fn);			// APP初始化
```



```c
#include "initcall.h"
void SystemClock_Init(void)
{
	//do something
}
INIT_PREV_EXPORT(SystemClock_Init);

void Device_Init(void)
{
	//do something
}
INIT_DEVICE_EXPORT(Device_Init);

void Component_Init(void)
{
	//do something
}
INIT_COMPONENT_EXPORT(Component_Init);

void Env_Init(void)
{
	//do something
}
INIT_ENV_EXPORT(Env_Init);

void App_Init(void)
{
	//do something
}
INIT_APP_EXPORT(App_Init);
```

最后在main.c初始化调用do_init_call();

```c
int main(int agrc, void *argv)
{
	do_init_call();
	while(true)
	{
		//loop
	}
}
```

这样就可以优雅的在其他文件内初始化各模块了。
