<script setup lang="ts">
import { onIonViewDidEnter, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonCard, IonImg, IonCardHeader, IonCardTitle, IonCardContent, IonText, IonCardSubtitle, IonChip, IonBadge } from '@ionic/vue';
import { ref } from 'vue';
import { Artwork } from '@/interfaces/Artwork';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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
</script>

<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Art Vista</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-grid>
        <ion-row v-for="artwork in artworks" :key="artwork.id" class="ion-align-items-stretch">
          <ion-col size="12" size-md="6" size-lg="4"> <!-- Responsive column size -->
            <ion-card class="artwork-card">
              <ion-img :src="artwork.imageURL" :alt="artwork.title + ' image'" class="artwork-image"></ion-img>

              <ion-card-header class="artwork-header">
                <ion-card-title>
                  <ion-text class="title">{{ artwork.title }}</ion-text>
                </ion-card-title>
                <ion-card-subtitle>
                  <ion-text class="abstract">{{ artwork.abstract }}</ion-text>
                </ion-card-subtitle>
                <hr> <!-- Spacing between abstract and year -->
                <ion-text class="year">Year: {{ artwork.yearCreated }}</ion-text>
                <div class="hashtags">
                  <ion-badge v-for="hashtag in artwork.hashtags" :key="hashtag" color="danger" class="hashtag-badge">{{ hashtag }}</ion-badge>
                </div>
              </ion-card-header>

              <ion-card-content class="artist-info">
                <ion-card-subtitle>Artist: <ion-text class="artist-name">{{ artwork.artist.name }}</ion-text></ion-card-subtitle>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.artwork-card {
  display: flex;
  flex-direction: column;
  height: auto;
  padding: 1rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* Light shadow for card */
}

.artwork-image {
  width: 100%;
  height: 20rem;
  object-fit: contain;
  object-position: center;
  margin-bottom: 1rem;
}

.artwork-header {
  padding: 0.5rem;
}

.title, .abstract, .year {
  margin: 0.2rem 0;
  font-size: 1rem; 
  word-wrap: break-word;
}

.title {
  font-weight: bold;
}

.abstract {
  font-style: italic;
}

.hashtags {
  margin-top: 0.5rem;
}

ion-chip {
  margin: 0.2rem;
}

.artist-info {
  padding: 0.5rem;
  font-size: 0.9rem;
}

ion-card-header,
ion-card-content {
  display: block;
}

ion-card {
  overflow: hidden;
}

ion-card-title, ion-card-subtitle {
  font-size: 1.1rem;
}

/* Styling for the artist's name to make it visually prominent */
.artist-name {
  color: #007acc;
  cursor: pointer;
  font-weight: bold;
  text-decoration: underline;
}

.artist-name:hover {
  color: #005f8b; /* Darker shade on hover */
}

.hashtag-badge {
  margin-right: 0.5rem;
  padding: 0.2rem 0.5rem;
  font-size: 0.9rem;
  border-radius: 0.3rem;
}

</style>
