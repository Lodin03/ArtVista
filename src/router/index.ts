import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue'
import ArtworkDetailsPage from '@/views/ArtworkDetailsPage.vue';
import UploadArtworkPage from '@/views/UploadArtworkPage.vue';
import AuthenticationPage from '@/views/AuthenticationPage.vue';
import { authService } from '@/services/firebase.authservice';

const parseJwt = (token:string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (error) {
    return null;
  }
};

const logoutUser = async () => {
  // Logic to logout from Firebase and clear local session
  localStorage.removeItem("auth_token");
  await authService.logout();
}

const authenticationRouterGuard = async () => { 
  const userAccessToken = localStorage.getItem("auth_token");

  if (!userAccessToken) {
    return {name: "authentication"}
  }

  const jwtPayload = parseJwt(userAccessToken);
  const userAccessTokenExpiredsAt = jwtPayload?.exp as unknown as number;
  
  if (userAccessTokenExpiredsAt < Date.now() / 1000) {
    await logoutUser();
    alert("User session expired")
    //browser token expired while user is still logged in at firebase
    // you need to manually logout current user from firebase.
    return {name: "authentication"}
  }
}

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
    beforeEnter: [authenticationRouterGuard] 
  },
  {
    path: '/authentication',
    name: 'authentication',
    component: AuthenticationPage
  },
  {
    path: '/artwork/:id',
    name: 'ArtworkDetails',
    component: ArtworkDetailsPage,
    beforeEnter: [authenticationRouterGuard] 
  },
  {
    path: '/upload-artwork',
    name: 'UploadArtwork',
    component: UploadArtworkPage,
    beforeEnter: [authenticationRouterGuard] 
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
