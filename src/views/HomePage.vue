<script setup lang="ts">
import { onIonViewDidEnter, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonCard, IonImg, IonCardHeader, IonCardTitle, IonCardContent, IonText, IonCardSubtitle, IonButton } from '@ionic/vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router'; 
import { Artwork } from '@/interfaces/Artwork';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const router = useRouter()

const db = getFirestore();
const artworks = ref<Artwork[]>([]); 

const fetchArtworks = async () => {
  const results: Artwork[] = []; 
  const artworksSnapshot = await getDocs(collection(db, 'art_vista'));

  artworksSnapshot.forEach((doc) => {
    const artworkData = { id: doc.id, ...doc.data()} as Artwork; 
    results.push(artworkData);
  });

  artworks.value = results;
}

onIonViewDidEnter(() => {
  fetchArtworks();
});

// Gives artworkId of type Artwork['id'] (which is a string)
const navigateToArtworkDetails = (artworkId: Artwork['id']) => {
  router.push(`/artwork/${artworkId}`);
};
</script>

<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar color="primary"> <!-- Burgundy color, changed color in variables.css-->
        <ion-title>Art Vista</ion-title>
      </ion-toolbar>

      <!-- TODO: Fikse login funksjon, med v-if som sjekker displayer basert på login/logout
      <ion-toolbar>
        <ion-card-subtitle>
          <ion-text>Login</ion-text>
          <ion-button></ion-button>
          </ion-card-subtitle>

        <ion-card-subtitle>
          <ion-text>Logout</ion-text>
          <ion-button></ion-button>
        </ion-card-subtitle>
      </ion-toolbar>-->
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-grid>
        <ion-row>
          <!-- Each column will take up 12 units on mobile and 4 units on web (large screens), so there can be displayed max 1 artwork (ion-card) per row for mobile devices and 3 for web -->
          <ion-col v-for="artwork in artworks" :key="artwork.id" size="12" size-lg="4" @click="navigateToArtworkDetails(artwork.id)"> 
            <ion-card class="artwork-card">
              <ion-img :src="artwork.imageURL" :alt="artwork.title + ' image'" class="artwork-image"></ion-img>
              <ion-card-header class="artwork-header">
                <ion-card-title>{{ artwork.title }}</ion-card-title>
                <ion-card-subtitle>{{ artwork.abstract }}</ion-card-subtitle>
              </ion-card-header>

              <ion-card-content class="artist-info">
                <ion-card-subtitle>Artist:
                  <ion-text class="artist-name">{{ artwork.artist.name }}</ion-text>
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

ion-col {
  padding-bottom: 1.5rem;
}
.artwork-card {
  height: 100%;
  padding: 1rem;
}

.artwork-image {
  width: 100%;
  height: 20rem;
  object-fit: contain;
  object-position: center;
  margin-bottom: 1rem;
}

.artwork-header, .artist-info {
  padding: 0.5rem;
}

/* Styling for the artist's name to make it visually prominent */
.artist-name {
  color: #ffffff;
  cursor: pointer;
  text-decoration: underline;
}

.artist-name:hover {
  color: #007acc; /* Darker shade on hover */
}

</style>
