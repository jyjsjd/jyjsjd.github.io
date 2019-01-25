---
title: ThreadPoolExecutor 注释翻译
category: ['Java']
tags: ['Java']
author: 景阳
email: jyjsjd@hotmail.com
description: ThreadPoolExecutor 注释翻译
---

## 线程池状态和状态转换

```
   /**
     * The main pool control state, ctl, is an atomic integer packing
     * two conceptual fields
     *   workerCount, indicating the effective number of threads
     *   runState,    indicating whether running, shutting down etc
     *
     * In order to pack them into one int, we limit workerCount to
     * (2^29)-1 (about 500 million) threads rather than (2^31)-1 (2
     * billion) otherwise representable. If this is ever an issue in
     * the future, the variable can be changed to be an AtomicLong,
     * and the shift/mask constants below adjusted. But until the need
     * arises, this code is a bit faster and simpler using an int.
     *
     * The workerCount is the number of workers that have been
     * permitted to start and not permitted to stop.  The value may be
     * transiently different from the actual number of live threads,
     * for example when a ThreadFactory fails to create a thread when
     * asked, and when exiting threads are still performing
     * bookkeeping before terminating. The user-visible pool size is
     * reported as the current size of the workers set.
     *
     * The runState provides the main lifecycle control, taking on values:
     *
     *   RUNNING:  Accept new tasks and process queued tasks
     *   SHUTDOWN: Don't accept new tasks, but process queued tasks
     *   STOP:     Don't accept new tasks, don't process queued tasks,
     *             and interrupt in-progress tasks
     *   TIDYING:  All tasks have terminated, workerCount is zero,
     *             the thread transitioning to state TIDYING
     *             will run the terminated() hook method
     *   TERMINATED: terminated() has completed
     *
     * The numerical order among these values matters, to allow
     * ordered comparisons. The runState monotonically increases over
     * time, but need not hit each state. The transitions are:
     *
     * RUNNING -> SHUTDOWN
     *    On invocation of shutdown(), perhaps implicitly in finalize()
     * (RUNNING or SHUTDOWN) -> STOP
     *    On invocation of shutdownNow()
     * SHUTDOWN -> TIDYING
     *    When both queue and pool are empty
     * STOP -> TIDYING
     *    When pool is empty
     * TIDYING -> TERMINATED
     *    When the terminated() hook method has completed
     *
     * Threads waiting in awaitTermination() will return when the
     * state reaches TERMINATED.
     *
     * Detecting the transition from SHUTDOWN to TIDYING is less
     * straightforward than you'd like because the queue may become
     * empty after non-empty and vice versa during SHUTDOWN state, but
     * we can only terminate if, after seeing that it is empty, we see
     * that workerCount is 0 (which sometimes entails a recheck -- see
     * below).
     */
```

`ctl` ——是线程池主要的控制状态，是 `AtomicInteger` 类型，它包含了两个字段的概念：

* `workerCount`：代表正在工作的线程数
* `runState`：代表线程池状态的一种

> ctl 是 `workerCount` 和 `runState` 按位或之后的结果，保留了所有为 `1` 的位。后面要得到 `workerCount` 和 `runState` 其中一个值，只需设置参数 `rs` 或 `wc` 为 `0` 即可。
> ```java
> private static int ctlOf(int rs, int wc) { 
> 	return rs | wc; 
> }
> ```

为了能把上述两个概念包装起来，`workerCount` 被限定在 `(2^29)-1` 个（大约5亿）线程而不是 `(2^31)-1` 个（20亿）。如果在将来产生了什么问题的话，可以把`ctl`的类型转换为 `AtomicLong` ，相应的调整它的转换、包装。但目前为止，使用 `int` 会更快、更简单。

`workerCount` 是启动（不是停止）状态的 `worker` 的数量。这个数值在瞬时可能会和真实的存活线程数不一致，比如 `ThreadFactory` 创建线程失败了，或者线程在结束之前仍在保存现场。<u>用户可见的线程池大小就是现有的 `worker` 的数量。<u>

> 核心线程数和最大线程数都是 `worker`。

`runState` 提供了线程池主要的生命周期控制，它的值可能是：
* `RUNNING`：接受新任务并且处理队列中的任务。
* `SHUTDOWN`：不接受新任务，但会处理队列中的任务。
* `STOP`：不接受新任务也不处理队列中的任务，中断处理中的任务。
* `TIDYING`：所有任务都终止了，`workerCount` 是 `0`，线程在转换到此状态时，会执行 	`terminated()` 方法。
*` TERMINATED`：`terminated()` 方法调用结束。

这些状态值可以顺序比较，`runState` 的状态单调递增，但可能不会到达每个状态值。可能的状态转换如下：
* `RUNNING -> SHUTDOWN`：`shutdown()` 方法调用之后，可能隐式包含在 `finalize()` 方法中。
*`(RUNNING or SHUTDOWN) -> STOP`：调用 `shutdownNow()` 方法。
* `SHUTDOWN -> TIDYING`：当队列和线程池都为空时。
* `STOP -> TIDYING`：当线程池为空时。
* `TIDYING -> TERMINATED`：`terminated()` 方法调用结束时。

## 状态值

```java
	// 29
	private static final int COUNT_BITS = Integer.SIZE - 3;
	// 536870911
    private static final int CAPACITY   = (1 << COUNT_BITS) - 1;
    
    // 11100000000000000000000000000000
	private static final int RUNNING    = -1 << COUNT_BITS;
	// 00000000000000000000000000000000
    private static final int SHUTDOWN   =  0 << COUNT_BITS;
    // 00100000000000000000000000000000
    private static final int STOP       =  1 << COUNT_BITS;
    // 01000000000000000000000000000000
    private static final int TIDYING    =  2 << COUNT_BITS;
    // 01100000000000000000000000000000
    private static final int TERMINATED =  3 << COUNT_BITS;
```

ThreadPoolExecutor 线程池的大小（`workerCount`）和线程池状态（`runState`）用一个 `int` 的长度（32）来表示，前`3`位代表线程池状态，后`29`位代表线程池大小。

## 构造器

```java
   /**
     * Creates a new {@code ThreadPoolExecutor} with the given initial
     * parameters.
     *
     * @param corePoolSize the number of threads to keep in the pool, even
     *        if they are idle, unless {@code allowCoreThreadTimeOut} is set
     * @param maximumPoolSize the maximum number of threads to allow in the
     *        pool
     * @param keepAliveTime when the number of threads is greater than
     *        the core, this is the maximum time that excess idle threads
     *        will wait for new tasks before terminating.
     * @param unit the time unit for the {@code keepAliveTime} argument
     * @param workQueue the queue to use for holding tasks before they are
     *        executed.  This queue will hold only the {@code Runnable}
     *        tasks submitted by the {@code execute} method.
     * @param threadFactory the factory to use when the executor
     *        creates a new thread
     * @param handler the handler to use when execution is blocked
     *        because the thread bounds and queue capacities are reached
     * @throws IllegalArgumentException if one of the following holds:<br>
     *         {@code corePoolSize < 0}<br>
     *         {@code keepAliveTime < 0}<br>
     *         {@code maximumPoolSize <= 0}<br>
     *         {@code maximumPoolSize < corePoolSize}
     * @throws NullPointerException if {@code workQueue}
     *         or {@code threadFactory} or {@code handler} is null
     */
    public ThreadPoolExecutor(int corePoolSize,
                              int maximumPoolSize,
                              long keepAliveTime,
                              TimeUnit unit,
                              BlockingQueue<Runnable> workQueue,
                              ThreadFactory threadFactory,
                              RejectedExecutionHandler handler) {
        if (corePoolSize < 0 ||
            maximumPoolSize <= 0 ||
            maximumPoolSize < corePoolSize ||
            keepAliveTime < 0)
            throw new IllegalArgumentException();
        if (workQueue == null || threadFactory == null || handler == null)
            throw new NullPointerException();
        this.corePoolSize = corePoolSize;
        this.maximumPoolSize = maximumPoolSize;
        this.workQueue = workQueue;
        this.keepAliveTime = unit.toNanos(keepAliveTime);
        this.threadFactory = threadFactory;
        this.handler = handler;
    }
```

参数：
* `corePoolSize`：核心线程数，线程池中会始终保持的线程数量，即使线程处于空闲状态，除非设置了 `allowCoreThreadTimeOut` 参数。
* `maximumPoolSize`：最大线程数，线程池中能保持的最多线程数量。
* `keepAliveTime`：当线程数大于 `corePoolSize` 时，超出的空闲线程能等待新任务的最长时间。
* `unit`：`keepAliveTime` 的时间单位。
* `workQueue`：用于存放任务的队列，这个队列仅能存放由 `execute` 方法提交的 `Runnable` 。 
* `threadFactory`：`executor` 创建线程时所用的工厂。
* `handler`：当线程池中线程数量到达 `maximumPoolSize`、`workQueue` 队列已满时，所采取的策略。
> `ThreadPoolExecutor` 内部定义了3个拒绝策略内部类：
> AbortPolicy：默认策略，拒绝执行并抛出异常。
> CallerRunsPolicy：线程池没有关闭会直接启动任务的线程执行。
> DiscardOldestPolicy：线程池没有关闭会从队列头拿任务尝试让线程池执行（如果仍然不能执行，再次执行拒绝策略的时候这个任务就被抛弃了）。
> DiscardPolicy：忽略任务，什么也不做。

异常：
* `IllegalArgumentException`：当下列情况发生时会抛出：
	- corePoolSize < 0
	- keepAliveTime < 0
	- maximumPoolSize <= 0
	- maximumPoolSize < corePoolSize
* `NullPointerException`：`workQueue` 为 `null`。