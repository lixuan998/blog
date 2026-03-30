---
title: 内核地址空间布局：把虚拟地址留给谁
date: 2026-03-28 20:40:00
updated: 2026-03-28 20:40:00
categories:
  - 内存管理
tags:
  - x86_64
  - 页表
  - 直接映射
thumbnail: /blog/images/cover-address-space.png
og_image: https://lixuan998.github.io/blog/images/cover-address-space.png
toc: true
---

讨论内核内存问题时，最容易犯的错误不是算错页数，而是根本没有先把地址空间的版图画出来。

如果 `higher-half kernel`、`direct map`、`vmalloc`、`fixmap`、`modules` 这些区域在脑子里还是一团雾，那么后面关于缺页、映射冲突、缓存属性、TLB 压力的分析，基本都会飘。

<!-- more -->

## 先画政治地图

以 x86_64 四级页表为例，可以先把高半区想成一张用途严格分区的地图：

```text
user space
--------------------------------------
canonical hole / reserved region
--------------------------------------
kernel text / rodata / data / bss
direct map (physical memory linear mapping)
vmalloc / ioremap
modules
fixmap / cpu entry area
--------------------------------------
```

这里最关键的不是记住每个区间的精确常量，而是理解它们为什么要分开：

- `direct map` 追求的是把物理内存快速映射进来，便于页框管理和大多数内核访问路径。
- `vmalloc` 提供的是虚拟上连续、物理上可离散的区域，用来避免高阶连续物理分配。
- `fixmap` 留给那些必须落在固定虚拟地址上的对象，比如早期页表、APIC、某些临时映射。

## direct map 不是“万能区”

很多初学者会把 direct map 理解成“内核天然都在这里”，这不准确。

direct map 的意义是把物理内存做线性映射，优点是转换成本低、访问路径直接；缺点是它天然绑定物理布局，所以并不适合承载所有“需要虚拟灵活性”的场景。

判断一个对象更适合落在哪个区域，可以先问三个问题：

1. 它是不是必须绑定真实页框。
2. 它是不是要求虚拟地址连续。
3. 它是不是需要特殊页属性，比如不可缓存、只读或固定地址。

这三个问题基本决定它会落向 `direct map`、`vmalloc`、`ioremap` 还是 `fixmap`。

## 一条实用排查顺序

遇到“内核地址看不懂”“某段地址到底归谁”时，我一般按下面顺序排：

1. 先确认体系结构和页表级数，不要拿五级页表的布局去套四级页表。
2. 再确认这是虚拟地址还是物理地址，很多日志里两者混着写。
3. 看它是否处于 direct map 可预测的线性区间。
4. 如果不是，再判断是否更像 `vmalloc`、module text 或 fixmap。
5. 最后才回到具体调用链，找是谁申请、谁释放、谁改了属性。

很多“地址异常”最后其实都不是 MM 子系统本身的问题，而是驱动、映射属性或释放时机出了错。

## 建议保留的观测点

```bash
cat /proc/iomem
cat /proc/meminfo
cat /proc/vmallocinfo
cat /sys/kernel/debug/kernel_page_tables
grep -n "vmalloc" /proc/kallsyms
```

这些文件不会直接替你下结论，但能把“地址属于哪个区域”这件事从猜测变成可证伪的判断。

## 一个常见误判

> 某段地址能被内核访问到，不代表它就应该被放在 direct map。

能访问只是结果，为什么在那里、为什么必须在那里，才是分析的起点。

地址空间布局本质上是在回答资源归属问题：哪些地址留给稳定映射，哪些地址留给灵活映射，哪些地址必须被隔离。把这个问题想明白，再看缺页和性能，思路会清很多。
