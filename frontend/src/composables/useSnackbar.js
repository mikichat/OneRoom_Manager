import { computed } from 'vue';
import { useStore } from 'vuex';

export function useSnackbar() {
  const store = useStore();
  const snackbar = computed(() => store.state.snackbar);

  const showSnackbar = (message, color = 'success') => {
    store.dispatch('showSnackbar', { message, color });
  };

  const hideSnackbar = () => {
    store.dispatch('hideSnackbar');
  };

  return { snackbar, showSnackbar, hideSnackbar };
}
