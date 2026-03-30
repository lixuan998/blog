---
title: 调度延迟预算：从 wakeup path 到 runqueue 抢占
date: 2026-03-21 21:10:00
updated: 2026-03-21 21:10:00
categories:
  - 调度器
tags:
  - CFS
  - wakeup
  - perf
thumbnail: /blog/images/cover-scheduler.svg
toc: true
---

系统里出现尾延迟时，“调度慢”通常只是一个模糊标签。真正有价值的分析，必须把一次线程从可运行到真正上 CPU 的过程拆成预算单元。

<!-- more -->

## 延迟不是单点数字

从睡眠线程被唤醒，到它真正执行用户代码，中间至少要穿过这些阶段：

1. 唤醒方进入 `try_to_wake_up()`
2. 目标线程状态切换为 runnable
3. 目标 CPU 的 runqueue 被更新
4. 调度器判断是否应该立即抢占当前任务
5. 上下文切换发生

同样是“多花了 3ms”，卡在这些阶段中的任何一段，治理手段都完全不同。

## 先看 wakeup path

如果 `try_to_wake_up()` 本身就慢，问题通常不在公平调度，而更可能在：

- 锁竞争太重
- CPU 选路不合理
- 跨核唤醒过多
- 目标线程的 affinity 过窄

很多系统的延迟放大，并不是“线程没被看见”，而是“线程被看见了，但被送到了一个不合适的 runqueue”。

## 再看 runqueue 压力

当线程已经成功入队，接下来要判断的是它为什么没有立刻拿到 CPU。

一个简单的预算表可以这样记：

| 阶段 | 典型问题 | 优先观测点 |
| --- | --- | --- |
| wakeup | 锁竞争、跨核唤醒 | `sched:sched_wakeup` |
| enqueue | CFS 实体过多、vruntime 偏移 | `sched:sched_switch` |
| preempt | 当前任务不可抢占、内核区停留过长 | `preempt_disable` 时长 |
| context switch | runqueue 忙、CPU 饱和 | `perf sched timehist` |

这个表的价值在于，它把“调度延迟”拆成能定位的路径，而不是抽象抱怨。

## 一组够用的命令

```bash
perf sched record -a -- sleep 10
perf sched timehist
trace-cmd record -e sched:sched_wakeup -e sched:sched_switch
trace-cmd report
```

如果你已经知道问题线程的 `pid`，那就不要再盲目抓全系统，把观察面收窄会更快进入结论。

## 一个经常被忽略的点

当应用说“线程刚被唤醒却没立刻运行”时，很多人会直接去盯 CFS 参数。实际上更常见的原因是：

- 线程被唤醒时目标 CPU 正处于长临界区
- 线程在错误 CPU 上堆积
- 频繁迁核导致缓存热度不断丢失

这类问题本质上是系统级调度路径设计问题，不是单个 tunable 能补救的。

## 实战里怎么下手

我的常用顺序是：

1. 先确认应用感知的延迟点对应的是 wakeup 还是 on-CPU。
2. 再看这段时间里是否发生了跨核唤醒。
3. 然后对照 runqueue 压力和上下文切换。
4. 最后才评估权重、nice、绑核、负载均衡策略。

顺序很重要。因为一旦先去调参数，很容易把结构性问题掩盖掉。

调度器从来不是一团魔法。只要把预算拆清，延迟就能回到工程问题，而不是玄学问题。
