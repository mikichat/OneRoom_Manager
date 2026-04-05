import { ref } from 'vue';

export function useDebounce(fn, delay = 300) {
  let timeout = null;

  const debounced = (...args) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };

  const cancel = () => {
    if (timeout) clearTimeout(timeout);
  };

  return { debounced, cancel };
}

export function useDebouncedRef(initialValue = '', delay = 300) {
  const value = ref(initialValue);
  let timeout = null;

  const debouncedSetValue = (newValue) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      value.value = newValue;
    }, delay);
  };

  const cancel = () => {
    if (timeout) clearTimeout(timeout);
  };

  return { value, debouncedSetValue, cancel };
}
