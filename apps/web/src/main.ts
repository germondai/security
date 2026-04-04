import { createApp } from 'vue';
import { router } from './router';
import App from './App.vue';
import './assets/main.css';
import { initTheme } from './composables/useTheme';

// Apply the saved theme before mounting so first paint is correct.
initTheme();

createApp(App).use(router).mount('#app');
