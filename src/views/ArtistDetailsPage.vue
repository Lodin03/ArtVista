<script setup lang="ts">
import { onIonViewDidEnter, IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonCard, IonCardTitle, IonText, IonCardHeader, IonCardSubtitle, IonCardContent, IonList, IonItem, IonLabel, IonImg } from '@ionic/vue';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getFirestore, getDoc, doc, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth, User } from 'firebase/auth';
import { Artwork } from '@/interfaces/Artwork';

const route = useRoute();
const { id } = route.params;  // Get 'id' from route params (the document ID)
const router = useRouter();
const db = getFirestore();

// Reactive variable to store artist details
const artist = ref<Artwork['artist']>({
    name: '',
    country: '',
    yearBorn: 0,
    yearDead: 0,
    about: '', 
});
// Reactive variable to store artwork(s) by the artist
const artistArtworks = ref<Artwork[]>([]); 

// Reactive loading state
const isLoadingArtist = ref(true);

// Reactive variable for user data
const currentUserData = ref<User | null>(null);

onIonViewDidEnter(async () => {
  currentUserData.value = getAuth().currentUser;
  // Await to ensure that the artist data is fully fetched before attempting to fetch the artworks from the artist.
  await fetchArtist(); 
  fetchArtistArtworks(artist.value.name);
});

const fetchArtist = async () => {
    try {
        if (typeof id === 'string') {
            const docRef = doc(db, 'art_vista', id); 
            const docSnap = await getDoc(docRef);
        
            if (docSnap.exists()) {
                const artworkData = docSnap.data() as Artwork;  // Get the artwork document data (whole document)
                artist.value = artworkData.artist as Artwork['artist'];  // Assigning artist details to the reactive variable
                isLoadingArtist.value = false;  // Setting loading state to false after data is fetched

                console.log("Fetched artist: ", artist.value)
            } else {
                console.error("No artwork found with id:", id);
            }
        }      
    } catch (error) {
        console.error("Error fetching artworks: ", error);
    }
}

const fetchArtistArtworks = async (artistName: string) => {
  try {
    const artworksRef = collection(db, 'art_vista');
    const q = query(artworksRef, where('artist.name', '==', artistName));
    const querySnapshot = await getDocs(q);
    
    // Updating the reactive artworks array with fetched artworks
    artistArtworks.value = querySnapshot.docs.map(doc => doc.data() as Artwork);
  } catch (error) {
    console.error('Error fetching artworks:', error);
  }
};

const navigateToArtworkDetails = (artworkId: Artwork['id']) => {
  router.push(`/artwork/${artworkId}`);
};
   
</script>

<template> 
  <ion-page>
    <ion-header :translucent="true" v-if="artist && !isLoadingArtist">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/"></ion-back-button>
        </ion-buttons>
        <ion-title>Artist Profile - {{ artist.name }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" v-if="artist && !isLoadingArtist">       
      <ion-card>
        <ion-card-header> <!-- Added styling so padding is equal to the content inside ion-card-content-->
          <ion-card-title color="secondary" class="ion-padding-start">{{ artist.name }}</ion-card-title>
          <ion-card-subtitle class="ion-padding-start"><b>Country: </b>{{ artist.country }}</ion-card-subtitle>
        </ion-card-header>

        <ion-card-content>
          <ion-list>
            <ion-item>
              <ion-label>
                <b>Born: </b> {{ artist.yearBorn }}
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-label>
                <b>Died: </b> {{ artist.yearDead }}
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-label>
                <b>About: </b> {{ artist.about }}
              </ion-label>
            </ion-item>
          </ion-list>

          <ion-list>
            <ion-card-title class="ion-padding" color="secondary">{{ artist.name }}'s artworks</ion-card-title>
            <ion-item v-for="artwork in artistArtworks" :key="artwork.id" @click="navigateToArtworkDetails(artwork.id)">
              <ion-label class="cursor">{{ artwork.title }}</ion-label>
              <ion-img :src="artwork.imageURL" :alt="artwork.title + ' image'" class="artwork-img cursor"></ion-img>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>

      
    </ion-content>
  </ion-page>
</template>

<style scoped>
.artwork-img {
  width: 10rem;       
  height: 10rem;      
  object-fit: cover; 
  margin-bottom: 0.25rem;
  margin-top: 0.25rem;
}

.cursor {
  cursor: pointer;
}
</style>