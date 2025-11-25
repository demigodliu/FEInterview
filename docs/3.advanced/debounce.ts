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
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number,
  options?: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
  }
) {
  // 请实现该函数
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
