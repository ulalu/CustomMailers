export function debounce(fn, waitMs) {
  let timeoutId = null;
  let lastArgs = null;

  function invoke() {
    timeoutId = null;
    const args = lastArgs;
    lastArgs = null;
    fn(...args);
  }

  function debounced(...args) {
    lastArgs = args;
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(invoke, waitMs);
  }

  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastArgs = null;
    }
  };

  debounced.flush = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      invoke();
    }
  };

  return debounced;
}
