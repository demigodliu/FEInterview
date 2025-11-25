/**
 * 实现一个防抖函数 debounce
 *
 * 要求：
 * 1. 当持续调用返回的防抖函数时，只在停止调用 wait 毫秒后执行 fn。
 * 2. 支持 options 参数，包含：
 *    - leading?: boolean，是否在首次调用时立即执行。
 *    - trailing?: boolean，是否在最后一次调用结束后执行，默认为 true。
 *    - maxWait?: number，保证即使持续调用，也会在 maxWait 时间后执行一次。
 * 3. 返回的防抖函数需带有 cancel() 和 flush() 两个方法：
 *    - cancel(): 取消所有挂起的执行。
 *    - flush(): 立即执行任何挂起的调用并返回结果。
 *
 * @param fn 需要防抖执行的函数
 * @param wait 防抖延迟时间（毫秒）
 * @param options 配置项
 * @returns 返回带 cancel 和 flush 方法的防抖函数
 */
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number,
  options?: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
  }
) {
  // 定时器 id，用于清除延迟调用
  let timer: ReturnType<typeof setTimeout> | null = null;
  // 上一次调用时传入的参数，供延迟调用时使用
  let lastArgs: Parameters<T> | null = null;
  // 上一次调用时的 this 指向
  let lastThis: any = null;
  // 上一次调用的时间戳
  let lastCallTime: number | null = null;
  // 上一次执行 fn 的时间戳
  let lastInvokeTime = 0;
  // 保存 fn 的返回值，供 flush 时返回
  let result: ReturnType<T>;

  // 解构配置项，默认 trailing 为 true，其他为 false/undefined
  const { leading = false, trailing = true, maxWait } = options || {};

  /**
   * 真正执行 fn 的函数
   * @param time - 当前时间戳
   * @returns fn 返回值
   */
  function invokeFunc(time: number) {
    lastInvokeTime = time; // 记录执行时间
    result = fn.apply(lastThis, lastArgs!); // 使用上次的 this 和参数调用 fn
    lastArgs = lastThis = null; // 调用后清理引用，避免内存泄漏
    return result;
  }

  /**
   * 启动或重置定时器
   * @param pendingFunc - 定时器到期时调用的函数
   * @param wait - 延迟时间（毫秒）
   */
  function startTimer(pendingFunc: () => void, wait: number) {
    if (timer !== null) clearTimeout(timer); // 清理之前的定时器
    timer = setTimeout(pendingFunc, wait); // 新建定时器
  }

  /**
   * 判断当前时间是否满足执行条件
   * @param time - 当前时间戳
   * @returns 是否满足立即执行条件
   */
  function shouldInvoke(time: number) {
    // 首次调用，必执行
    if (lastInvokeTime === 0) {
      return true;
    }
    // 如果设置了 maxWait，且时间超过最大等待，强制执行
    if (maxWait !== undefined) {
      return time - lastInvokeTime >= maxWait;
    }
    // 其他情况不立即执行
    return false;
  }

  /**
   * 定时器触发，执行 trailing 逻辑
   * @param time - 当前时间戳
   * @returns fn 返回值或 undefined
   */
  function trailingEdge(time: number) {
    timer = null; // 定时器已执行，清空标记
    if (trailing && lastArgs) {
      // 如果启用 trailing 且有未执行的调用，则执行
      return invokeFunc(time);
    }
    // 没有需要执行的调用，清理参数引用
    lastArgs = lastThis = null;
    return result;
  }

  /**
   * 防抖函数主体
   * @param args - 调用时传入的参数
   * @returns fn 返回值
   */
  function debounced(this: any, ...args: Parameters<T>) {
    const now = Date.now(); // 当前时间
    const isInvoking = shouldInvoke(now); // 判断是否应立即执行

    // 缓存调用参数和 this，供后续调用使用
    lastArgs = args;
    lastThis = this;
    lastCallTime = now;

    if (isInvoking) {
      if (timer === null) {
        // 没有定时器，首次调用或超过 maxWait
        if (leading) {
          // 如果启用 leading，立即执行一次 fn
          invokeFunc(now);
        }
        // 启动定时器，用于 trailing 调用
        startTimer(() => trailingEdge(Date.now()), wait);
      } else if (maxWait !== undefined) {
        // 有定时器且设置 maxWait，重置定时器等待时间
        startTimer(() => trailingEdge(Date.now()), wait);
      }
    } else if (timer === null) {
      // 未满足立即执行条件，且无定时器，启动定时器等待 trailing
      startTimer(() => trailingEdge(Date.now()), wait);
    }

    return result;
  }

  /**
   * 取消防抖，清理所有挂起调用
   */
  debounced.cancel = function () {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    lastArgs = lastThis = null;
    lastInvokeTime = 0;
  };

  /**
   * 立即执行所有挂起的调用，返回 fn 执行结果
   * @returns fn 返回值或 undefined
   */
  debounced.flush = function () {
    if (timer !== null) {
      const time = Date.now();
      clearTimeout(timer);
      timer = null;
      return trailingEdge(time);
    }
    return result;
  };

  return debounced;
}

/* ========================== 示例调用 ========================== */

function greet(name: string) {
  console.log(`Hello, ${name} at ${Date.now()}`);
}

const debouncedGreet = debounce(greet, 2000, {
  leading: true,
  trailing: true,
  maxWait: 5000,
});

// 0ms：立即执行，leading=true，打印 Tom
debouncedGreet("Tom");

// 1000ms：调用，触发 trailing 延迟执行 Jerry（大约3000ms执行）
setTimeout(() => {
  debouncedGreet("Jerry");
}, 1000);

// 3000ms：调用，更新参数为 Lucy，延迟等待（大约5000ms执行）
setTimeout(() => {
  debouncedGreet("Lucy");
}, 3000);

// 5000ms：maxWait 到达，强制执行 Lucy（maxWait 触发）
// 这里不需手动调用，debounce 内部自动触发
setTimeout(() => {
  // 等待 maxWait 触发
}, 5000);

// 5200ms：调用，更新参数为 Alice，挂起等待 flush 执行
setTimeout(() => {
  debouncedGreet("Alice");
}, 5200);

// 6000ms：调用 flush()，立即执行挂起的 Alice
setTimeout(() => {
  console.log("调用 flush()");
  debouncedGreet.flush();
}, 6000);

// 7000ms：调用 cancel()，取消所有挂起任务
setTimeout(() => {
  console.log("调用 cancel()");
  debouncedGreet.cancel();
}, 7000);

/* ========================== 期望输出 ==========================

Hello, Tom at [0ms]          <-- 立即调用，leading=true

Hello, Jerry at [~3000ms]    <-- trailing 调用（延迟2秒）

Hello, Lucy at [~5000ms]     <-- maxWait 限制强制执行

调用 flush()

Hello, Alice at [~6000ms]    <-- flush 立即执行挂起的 Alice

调用 cancel()

================================================================= */
