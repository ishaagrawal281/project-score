/**
 * ============================================================================
 *  EVENT LOOP UTILITIES — Debounce, Throttle & Microtask Helpers
 * ============================================================================
 *
 *  CONCEPT: JavaScript — Event Loop (Frontend)
 *
 *  The JavaScript event loop is the mechanism that handles asynchronous
 *  operations in a single-threaded environment. Understanding it is critical
 *  for building performant, non-blocking user interfaces.
 *
 *  ┌─────────────────────────────────────────────────────────────────────┐
 *  │                    EVENT LOOP EXECUTION ORDER                       │
 *  │                                                                     │
 *  │  1. CALL STACK        — Synchronous code executes here first        │
 *  │  2. MICROTASK QUEUE   — Promise.then(), queueMicrotask(),           │
 *  │                         MutationObserver callbacks                   │
 *  │  3. MACROTASK QUEUE   — setTimeout(), setInterval(),                │
 *  │                         I/O callbacks, UI rendering events          │
 *  │  4. RENDER STEP       — requestAnimationFrame(),                    │
 *  │                         style recalculation, layout, paint          │
 *  │                                                                     │
 *  │  The event loop processes ALL microtasks before moving to the       │
 *  │  next macrotask. This is why Promise.then() runs before             │
 *  │  setTimeout(fn, 0).                                                 │
 *  └─────────────────────────────────────────────────────────────────────┘
 *
 *  PRACTICAL APPLICATIONS IN THIS PROJECT:
 *  - debounce()  → Search input uses setTimeout (macrotask) to delay API calls
 *  - throttle()  → Scroll events use timestamp comparison to limit frequency
 *  - deferToNextTick() → Uses Promise.resolve() (microtask) for high-priority deferred work
 *  - batchDOMUpdates() → Uses requestAnimationFrame for paint-synchronized updates
 *
 * ============================================================================
 */

/**
 * DEBOUNCE — Delays function execution until after a period of inactivity.
 *
 * EVENT LOOP MECHANISM: setTimeout() (Macrotask Queue)
 *
 * How it works with the event loop:
 * 1. Each keystroke calls the debounced function
 * 2. The previous setTimeout timer is cleared (cancelled from the macrotask queue)
 * 3. A NEW setTimeout is scheduled on the macrotask queue
 * 4. Only when the user stops typing for `delay` ms does the callback execute
 *
 * Why setTimeout and not Promise?
 * - setTimeout schedules on the MACROTASK queue, which runs AFTER rendering
 * - This means the browser can repaint between keystrokes without blocking
 * - If we used Promise.resolve(), the microtask would run immediately after
 *   the current call stack, potentially blocking the render step
 *
 * @param {Function} fn - The function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function with .cancel() method
 *
 * @example
 * // In a React component:
 * const debouncedSearch = debounce((query) => {
 *   fetchSearchResults(query);  // Only fires after user stops typing
 * }, 300);
 */
export function debounce(fn, delay) {
  let timerId = null;

  const debounced = (...args) => {
    // Cancel any previously scheduled macrotask
    // This removes the pending callback from the macrotask queue
    if (timerId !== null) {
      clearTimeout(timerId);
    }

    // Schedule a new macrotask — this callback will execute only if
    // no subsequent calls arrive within `delay` milliseconds
    //
    // EVENT LOOP DETAIL:
    // setTimeout(fn, 300) does NOT guarantee execution at exactly 300ms.
    // It guarantees the callback is added to the macrotask queue AFTER 300ms.
    // The actual execution depends on what else is in the call stack and
    // microtask queue at that point.
    timerId = setTimeout(() => {
      fn.apply(this, args);
      timerId = null;
    }, delay);
  };

  // Allow external cancellation of pending debounced calls
  debounced.cancel = () => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  return debounced;
}


/**
 * THROTTLE — Ensures a function executes at most once per time window.
 *
 * EVENT LOOP MECHANISM: Synchronous timestamp comparison (Call Stack)
 *
 * Unlike debounce (which uses the macrotask queue), throttle works
 * synchronously by comparing Date.now() timestamps on each invocation.
 * This means the decision to execute or skip happens on the CALL STACK
 * without scheduling any asynchronous work.
 *
 * Use case: Scroll event handlers, window resize listeners, infinite scroll
 *
 * @param {Function} fn - The function to throttle
 * @param {number} limit - Minimum interval between executions (ms)
 * @returns {Function} Throttled function
 *
 * @example
 * // Throttle scroll handler to fire at most once every 200ms
 * const throttledScroll = throttle(handleScroll, 200);
 * window.addEventListener('scroll', throttledScroll);
 */
export function throttle(fn, limit) {
  let lastExecutionTime = 0;
  let timerId = null;

  const throttled = (...args) => {
    const now = Date.now();
    const timeSinceLastExecution = now - lastExecutionTime;

    if (timeSinceLastExecution >= limit) {
      // Enough time has passed — execute immediately on the call stack
      lastExecutionTime = now;
      fn.apply(this, args);
    } else {
      // Not enough time — schedule a trailing execution on the macrotask queue
      // This ensures the final call in a burst is never lost
      if (timerId !== null) {
        clearTimeout(timerId);
      }
      timerId = setTimeout(() => {
        lastExecutionTime = Date.now();
        fn.apply(this, args);
        timerId = null;
      }, limit - timeSinceLastExecution);
    }
  };

  throttled.cancel = () => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  return throttled;
}


/**
 * DEFER TO NEXT TICK — Schedules work on the Microtask Queue.
 *
 * EVENT LOOP MECHANISM: Promise.resolve().then() (Microtask Queue)
 *
 * Key difference from setTimeout:
 * - Promise.then() callbacks are added to the MICROTASK queue
 * - Microtasks execute BEFORE the next macrotask and BEFORE rendering
 * - This means deferred work will run very soon — after the current
 *   synchronous call stack completes, but before any setTimeout or paint
 *
 * EXECUTION ORDER DEMONSTRATION:
 * ```
 * console.log('1. Synchronous (Call Stack)');
 * setTimeout(() => console.log('4. Macrotask (setTimeout)'), 0);
 * Promise.resolve().then(() => console.log('2. Microtask (Promise)'));
 * queueMicrotask(() => console.log('3. Microtask (queueMicrotask)'));
 * ```
 * Output: 1, 2, 3, 4
 *
 * Use case: Deferring state updates that should happen immediately after
 * the current synchronous code but before the browser repaints.
 *
 * @param {Function} fn - Function to defer to the microtask queue
 * @returns {Promise} Resolves with the return value of fn
 */
export function deferToNextTick(fn) {
  // Promise.resolve() creates an already-resolved promise.
  // The .then() callback is scheduled on the microtask queue,
  // which the event loop drains completely before proceeding
  // to the next macrotask or rendering step.
  return Promise.resolve().then(fn);
}


/**
 * BATCH DOM UPDATES — Synchronize updates with the browser's render cycle.
 *
 * EVENT LOOP MECHANISM: requestAnimationFrame (Render Step)
 *
 * requestAnimationFrame schedules a callback to execute RIGHT BEFORE
 * the browser's next repaint. This is different from both:
 * - Microtasks (which run before any rendering)
 * - Macrotasks (which run between render cycles)
 *
 * rAF sits in a special position in the event loop:
 * Call Stack → Microtasks → rAF callbacks → Style/Layout/Paint
 *
 * Use case: Animations, batch DOM measurements, avoiding layout thrashing
 *
 * @param {Function} updateFn - Function containing DOM updates
 * @returns {number} Animation frame ID (can be cancelled with cancelAnimationFrame)
 */
export function batchDOMUpdates(updateFn) {
  // requestAnimationFrame is synchronized with the display refresh rate
  // (typically 60fps = ~16.67ms intervals).
  //
  // IMPORTANT: If multiple rAF callbacks are scheduled, they ALL execute
  // in the same frame, in the order they were registered.
  // This is different from setTimeout, where each callback gets its
  // own macrotask and potentially its own render cycle.
  if (typeof window !== 'undefined' && window.requestAnimationFrame) {
    return window.requestAnimationFrame(updateFn);
  }
  // Fallback for SSR or environments without rAF
  return setTimeout(updateFn, 16);
}


/**
 * EVENT LOOP CONTEXT: IntersectionObserver (used for Infinite Scroll)
 *
 * IntersectionObserver callbacks are scheduled as MICROTASKS by the browser.
 * When an observed element enters/exits the viewport:
 *
 * 1. Browser detects intersection during the render step
 * 2. Queues the observer callback as a microtask
 * 3. Callback executes before the next macrotask
 *
 * This is why IntersectionObserver is more efficient than scroll event
 * handlers — it's natively integrated with the browser's rendering pipeline
 * rather than firing on every scroll event (which would flood the macrotask queue).
 *
 * In this project, IntersectionObserver powers infinite scroll pagination
 * in dashboard/page.jsx — when the sentinel element becomes visible,
 * the observer callback triggers a new page fetch.
 */


/**
 * EVENT LOOP CONTEXT: React useState and Batching
 *
 * React 18's automatic batching groups multiple setState calls into a
 * single re-render. This works because React hooks into the event loop:
 *
 * - In event handlers: React batches ALL setState calls, then schedules
 *   a single re-render as a microtask
 * - In async code: React 18 also batches setState in Promises, setTimeout,
 *   and native event handlers (unlike React 17)
 *
 * This means:
 * ```
 * setPage(prev => prev + 1);    // Queued, no immediate re-render
 * setHasMore(false);             // Queued, no immediate re-render
 * // React schedules ONE re-render as a microtask after this function returns
 * ```
 */
