<script setup lang="ts">
import { onIonViewDidEnter, loadingController, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonCard, IonImg, IonCardHeader, IonCardTitle, IonCardContent, IonText, IonCardSubtitle, IonButton, IonLabel, IonSearchbar, IonItem, IonSelect, IonSelectOption } from '@ionic/vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router'; 
import { Artwork } from '@/interfaces/Artwork';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { authService } from '@/services/firebase.authservice';
import { User } from "firebase/auth";

const router = useRouter()
const db = getFirestore();
const artworks = ref<Artwork[]>([]); 
const currentUserData = ref<User | null>(null); // Set type to User | null because authService.currentUser() returns a User | null
const originalArtworks = ref<Artwork[]>([]);
const filteredArtworks = ref<Artwork[]>([]);
const selectedCategory = ref(null);

onIonViewDidEnter(async () => {
  currentUserData.value = await authService.currentUser();
  await fetchArtworks();
});

const fetchArtworks = async () => {
  const loading = await loadingController.create({
    message: "Loading from Firebase...",
    duration: 1000 // Loading indicator will automatically dismiss after 1 second
  });

  try {
    await loading.present()

    const results: Artwork[] = []; 
    const artworksSnapshot = await getDocs(collection(db, 'art_vista'));

    artworksSnapshot.forEach((doc) => {
      const artworkData = { id: doc.id, ...doc.data()} as Artwork; 
      results.push(artworkData);
    });
    artworks.value = results;
    originalArtworks.value = results;
    filteredArtworks.value = results;
  } 
  catch (error) {
    console.error("Error fetching artworks: ", error);
  } finally {
    await loading.dismiss();
  }
  
}

const toggleSearch = (event:CustomEvent) => {
  const searchText = (event.target as HTMLInputElement).value;
  if (!searchText) {
      artworks.value = filteredArtworks.value; // Returns all artworks if there is no search query
    }

    // Can search by either name of artwork or artist
    artworks.value = filteredArtworks.value.filter((artwork) =>
    artwork.title.toLowerCase().includes(searchText.toLowerCase()) ||
    artwork.artist.name.toLowerCase().includes(searchText.toLowerCase())
    );
};

const fetchByCategory = async () => {
    if (selectedCategory.value === 'all') {
      artworks.value = originalArtworks.value;
    } else {
      const queryResults = query(
        collection(db, 'art_vista'), 
        where("category", "==", selectedCategory.value)
        );
      try {
        const results: Artwork[] = [];
        const querySnapshot = await getDocs(queryResults);
        querySnapshot.forEach((doc) => {
            results.push({ id: doc.id, ...doc.data() } as Artwork);
        });
        artworks.value = results;
      } catch (error) {
        console.error("Failed to fetch records by category:", error);
      }
    }
    filteredArtworks.value = artworks.value;

};

// Gives artworkId of type Artwork['id'] (which is a string)
const navigateToArtworkDetails = (artworkId: Artwork['id']) => {
  router.push(`/artwork/${artworkId}`);
};

const navigateToArtistDetails = (artistId: Artwork['id']) => {
  router.push(`/artist/${artistId}`); 
}

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
      <ion-toolbar color="primary" class="color-toolbar"> <!-- Burgundy color, changed color in variables.css-->
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

      <ion-toolbar>
         <ion-searchbar placeholder="Search Artworks By Artwork/Artist" @ionInput="toggleSearch($event)"></ion-searchbar>
      </ion-toolbar> 

      <ion-item lines="none">
        <ion-label><b>Category</b></ion-label>
        <ion-select placeholder="Select Category" v-model="selectedCategory" @ionChange="fetchByCategory">
          <ion-select-option value="all">All</ion-select-option> 
          <ion-select-option value="Portrait">Portrait</ion-select-option>
          <ion-select-option value="Landscape">Landscape</ion-select-option>
          <ion-select-option value="Architectural">Architectural</ion-select-option>
          <ion-select-option value="Emotional">Emotional</ion-select-option>
          <ion-select-option value="Religious">Religious</ion-select-option>
          <ion-select-option value="Other">Other</ion-select-option>
        </ion-select>
      </ion-item>
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
                  <ion-text class="artist-name" color="secondary" @click.stop="navigateToArtistDetails(artwork.id)">{{ artwork.artist.name }}</ion-text>
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
  cursor: pointer;
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
