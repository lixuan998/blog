---
title: I/O 路径可观测性：把一次 read() 拆开看
date: 2026-03-12 22:00:00
updated: 2026-03-12 22:00:00
categories:
  - I/O
tags:
  - VFS
  - Page Cache
  - bpftrace
thumbnail: /blog/images/cover-io-path.svg
toc: true
---

用户态看到的是一次 `read()`，内核看到的是一条可能跨越 VFS、page cache、readahead、文件系统和 block layer 的长路径。

如果你只在应用侧看 syscall latency，很多时候只能得到“慢”，却不知道慢在第几层。

<!-- more -->

## 先分命中与失配

排查读延迟时，第一刀应该先砍在 page cache 命中率上，而不是先怀疑磁盘。

因为这两条路径的成本模型完全不同：

- 命中 page cache：主要消耗在查找页、拷贝数据和锁路径。
- cache miss：会继续触发 readahead、bio 提交、设备队列等待和完成回调。

也就是说，明明都是读请求，是否命中缓存决定了你应该把精力放在内存子系统还是块层。

## 路径最少要分到这几层

```text
read()
  -> VFS
  -> file_operations
  -> page cache lookup
  -> readahead / page faulted-in page
  -> filesystem mapping
  -> block layer
  -> device completion
```

这个分层看起来朴素，但它能有效避免一种常见误判：把文件系统锁竞争误当成磁盘慢，把设备排队误当成 page cache 失效。

## 一组可观测矩阵

做 I/O 排查时，我通常会把指标按下面这张表配对看：

| 层级 | 关注点 | 工具 |
| --- | --- | --- |
| syscall | 单次 read 延迟 | `strace`, 应用埋点 |
| VFS / fs | inode 与页缓存路径 | `perf`, `ftrace` |
| page cache | 命中、回收、readahead | `/proc/meminfo`, `sar -B` |
| block layer | 队列深度、merge、dispatch | `iostat`, `blktrace` |
| device | 服务时间与饱和度 | 设备厂商指标 |

只看其中一层，几乎一定会误判。

## 一个够用的 bpftrace 切面

```bash
bpftrace -e '
tracepoint:syscalls:sys_enter_read { @start[tid] = nsecs; }
tracepoint:syscalls:sys_exit_read /@start[tid]/ {
  @latency = hist((nsecs - @start[tid]) / 1000);
  delete(@start[tid]);
}'
```

这个切面只能告诉你 syscall 级别的延迟分布，但它的价值在于先确认问题是否真实存在、分布是否集中、尾部是否异常肥大。

一旦确认延迟形态，再向下钻到文件系统和块层。

## 排查时最容易混淆的两件事

1. 吞吐下降不一定意味着设备饱和，可能是页缓存回收和脏页回写在抢内存带宽。
2. 平均延迟很稳不代表系统健康，尾部读延迟往往才对应用户可感知抖动。

所以 I/O 观测不要只报平均值，至少把 P95、P99 和最大值拉出来。

## 一个更稳的调查顺序

1. 先确认请求规模和访问模式，顺序读和随机读不能混看。
2. 判断 page cache 命中与否。
3. 再看文件系统层是否有锁、journal、metadata 路径放大。
4. 最后才去块层和设备层确认是否排队。

一次好的 I/O 排查，不是把全链路都看一遍，而是尽快判断“这次慢属于哪一层”。层次一旦找对，剩下的工作就只是收敛。
