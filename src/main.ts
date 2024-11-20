import { createApp } from 'vue'
import App from './App.vue'
import router from './router';

import { IonicVue } from '@ionic/vue';

// Importing firebase app
import { initializeApp } from "firebase/app";

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */
import './theme/variables.css';

import { defineCustomElements } from '@ionic/pwa-elements/loader';

// Initialize my Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDBp143mVtjTF7a73l2dHczlqe19RnAlSM",
  authDomain: "artvista-822c0.firebaseapp.com",
  projectId: "artvista-822c0",
  storageBucket: "artvista-822c0.firebasestorage.app",
  messagingSenderId: "326471264345",
  appId: "1:326471264345:web:059cc38ecb97575f71a948",
  measurementId: "G-44ERD8PHP9"
};

// Initialize the Firebase app
initializeApp(firebaseConfig)

const app = createApp(App)
  .use(IonicVue)
  .use(router);

defineCustomElements(window);
router.isReady().then(() => {
  app.mount('#app');
});
