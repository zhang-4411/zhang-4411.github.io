---
title: 常用debug配置
abbrlink: 2286445522
tag: debug
---
####  实现输出不同等级的log信息，可以debug版本打开调试信息，release版本关闭调试信息，使用mobaxterm或者xshell打印带有颜色字体

###### debug.h

``` c
/**
 *
 * @Copyright Copyright (c)
 *
 * @file: debug.h
 * @version : 1.0.0
 * @date : 2022-07-01
 * @author : zhang shuai
 * @brief
 */
#ifndef _DEBUG_H
#define _DEBUG_H
#include <stdio.h>

#define NONE "\033[m"

#define RED "\033[0;32;31m"

#define LIGHT_RED "\033[1;31m"

#define GREEN "\033[0;32;32m"

#define LIGHT_GREEN "\033[1;32m"

#define BLUE "\033[0;32;34m"

#define LIGHT_BLUE "\033[1;34m"

#define DARY_GRAY "\033[1;30m"

#define CYAN "\033[0;36m"

#define LIGHT_CYAN "\033[1;36m"

#define PURPLE "\033[0;35m"

#define LIGHT_PURPLE "\033[1;35m"

#define BROWN "\033[0;33m"

#define YELLOW "\033[1;33m"

#define LIGHT_GRAY "\033[0;37m"

#define WHITE "\033[1;37m"

#define PRINT_DEBUG 1 /* 打印调试信息 */
#define PRINT_WARN 1 /* 打印错误信息 */
#define PRINT_INFO 1  /* 打印个人信息 */

#if PRINT_DEBUG
#define log_d(fmt, args...)                                 \
	printf(NONE "[LOG/D](%s:%d) ", __FUNCTION__, __LINE__); \
	printf(fmt, ##args);                                    \
	printf("\r\n")
#else
#define log_d(fmt, args...)
#endif

#if PRINT_WARN
#define log_w(fmt, args...) \
	printf(RED "[LOG/W]");  \
	printf(fmt, ##args);    \
	printf("\r\n")
#else
#define log_e(fmt, args...)
#endif

#if PRINT_INFO
#define log_i(fmt, args...)  \
	printf(GREEN "[LOG/I]"); \
	printf(fmt, ##args);     \
	printf("\r\n")
#else
#define log_i(fmt, args...)
#endif

/* 断言 assert */

#define USING_ASSERT
#ifndef USING_ASSERT
#define assert(x) ((void)0)
#else
#define assert(x)                                            \
	do                                                       \
	{                                                        \
		if (!(x))                                            \
		{                                                    \
			printf("\nError:%s,%d\r\n", __FILE__, __LINE__); \
		}                                                    \
	} while (0)
#endif

#endif

```

