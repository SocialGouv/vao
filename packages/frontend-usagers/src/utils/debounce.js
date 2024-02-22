export default function debounce(func, wait, immediate) {
  let timeout;
  return function (...args) {
    return new Promise((resolve) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        timeout = null;
        if (!immediate) {
          Promise.resolve(func.apply(this, [...args])).then(resolve);
        }
      }, wait);
      if (immediate && !timeout) {
        Promise.resolve(func.apply(this, [...args])).then(resolve);
      }
    });
  };
}
