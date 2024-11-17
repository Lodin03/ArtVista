<script setup lang="ts">
import { onIonViewDidEnter, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonCard, IonImg, IonCardHeader, IonCardTitle, IonCardContent, IonText, IonCardSubtitle, IonButton, IonLabel } from '@ionic/vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router'; 
import { Artwork } from '@/interfaces/Artwork';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { authService } from '@/services/firebase.authservice';
import { User } from "firebase/auth";

const router = useRouter()
const db = getFirestore();
const artworks = ref<Artwork[]>([]); 
const currentUserData = ref<User | null>(null); // Set type to User | null because authService.currentUser() returns a User | null

const fetchArtworks = async () => {
  const results: Artwork[] = []; 
  const artworksSnapshot = await getDocs(collection(db, 'art_vista'));

  artworksSnapshot.forEach((doc) => {
    const artworkData = { id: doc.id, ...doc.data()} as Artwork; 
    results.push(artworkData);
  });

  artworks.value = results;
}

onIonViewDidEnter(async () => {
  currentUserData.value = await authService.currentUser();
  fetchArtworks();
});

// Gives artworkId of type Artwork['id'] (which is a string)
const navigateToArtworkDetails = (artworkId: Artwork['id']) => {
  router.push(`/artwork/${artworkId}`);
};

const login = () => {
  router.push('/authentication')
}

const navigateToUploadArtwork = () => {
  router.push('/upload-artwork'); 
}

const logout = async () => {
  try {
      await authService.logout();
      currentUserData.value = null;
      localStorage.removeItem("auth_token"); 
      router.replace('/authentication');
  } catch(error) {
    console.error(error)
  }
}
</script>

<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar color="primary"> <!-- Burgundy color, changed color in variables.css-->
        <ion-title class="app-title">Art Vista</ion-title>
        <ion-label @click="navigateToUploadArtwork" slot="end" class="upload-link">Upload Artwork</ion-label>
      </ion-toolbar>

      <ion-toolbar class="user-toolbar">
        <ion-row class="user-info">
          <ion-col size="auto" class="login-txt">
            <ion-text v-if="currentUserData" color="medium">Logged in as: <b>{{ currentUserData.displayName }}</b></ion-text>
            <ion-text v-else color="medium">You have not logged in</ion-text>
          </ion-col>
          
          <ion-col size="auto" class="login-btn">
            <ion-button v-if="currentUserData" @click="logout" color="secondary">Logout</ion-button>
            <ion-button v-else @click="login" color="secondary">Login</ion-button>
          </ion-col>
        </ion-row>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-grid>
        <ion-row>
          <!-- Each column will take up 12 units on mobile and 4 units on web (large screens), so there can be displayed max 1 artwork (ion-card) per row for mobile devices and 3 for web -->
          <ion-col v-for="artwork in artworks" :key="artwork.id" size="12" size-lg="4" @click="navigateToArtworkDetails(artwork.id)"> 
            <ion-card class="artwork-card">
              <ion-img :src="artwork.imageURL" :alt="artwork.title + ' image'" class="artwork-img"></ion-img>
              <ion-card-header class="artwork-header">
                <ion-card-title>{{ artwork.title }}</ion-card-title>
                <ion-card-subtitle>{{ artwork.abstract }}</ion-card-subtitle>
              </ion-card-header>

              <ion-card-content class="artist-info">
                <ion-card-subtitle>Artist:
                  <ion-text class="artist-name" color="secondary">{{ artwork.artist.name }}</ion-text>
                </ion-card-subtitle>
              </ion-card-content>

            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.app-title {
  font-weight: bold;
}

.upload-link {
  padding-right: 1rem;
  font-weight: bold;
  font-size: 1.25rem;
  cursor: pointer;
}

.user-toolbar {
  padding: 1rem 0 0 1rem;
}

.user-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.login-txt {
  font-size: 1.25rem;
  font-weight: bold;
}

.login-btn {
  padding-right: 1rem;
}


.artwork-card {
  height: 100%;
  padding: 1rem;
  border: 0.125rem solid var(--ion-color-primary); /* Adds border of color priamry (Gold) */
  border-radius: 1rem; 
}

.artwork-img {
  width: 100%;
  height: 20rem;
  object-fit: contain;
  object-position: center;
  margin-bottom: 1rem;
}

.artwork-header, .artist-info {
  padding: 0.5rem;
}

.artist-name { 
  cursor: pointer;
  text-decoration: underline;
}


ion-col {
  padding-bottom: 1.5rem;
}
</style>
