const counter = {};
const queues = {};

const requestLock = async (key, limit, timeout) => {
  counter[key] = counter[key] || 0;
  if (counter[key] < limit) {
    counter[key] += 1;
    return true;
  }
  queues[key] = queues[key] || [];
  await new Promise((resolve, reject) => {
    let resolved = false;
    queues[key].push(() => {
      if (resolved) return;
      counter[key] += 1;
      resolved = true;
      resolve();
    });
    setTimeout(() => {
      if (resolved) return;
      resolved = true;
      reject(Error(`Request lock timeout: ${timeout} s`));
    }, timeout * 1000);
  });
  return true;
};

const completed = key => {
  const fns = queues[key];
  counter[key] -= 1;
  if (!Array.isArray(fns)) return;
  const resolve = fns.shift();
  if (!resolve) return;
  resolve();
};

/**
 * @param key String lock key
 * @param fn Function (Promise) will be curried function
 * @param self Object fn's this when be called
 * @param limit Number Max concurrency limit
 * @param timeout Number Max seconds wait for
 *
 * @return Function
 */
const throttleLock = (key, fn, self, limit, timeout = 300) => async (
  ...args
) => {
  await requestLock(key, limit, timeout);
  const result = await fn.call(self, ...args);
  completed(key);
  return result;
};

module.exports = { throttleLock };
