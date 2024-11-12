<script setup lang="ts">
import { onIonViewDidEnter, IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonCol, IonImg, IonRow, IonChip, IonCard, IonCardHeader, IonText, IonCardContent} from '@ionic/vue';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { getFirestore, getDoc, doc } from 'firebase/firestore';
import { Artwork } from '@/interfaces/Artwork';

const route = useRoute();

/* Retrieve the id parameter from the current route's query string (/artwork/:id) and ensure its treated as a string, not string[] so I dont get type warning on doc */
const { id } = route.params as { id: string }; 
const db = getFirestore();

// Reference for artwork of type Artwork, initially undefined until artwork data is fetched.
const artwork = ref<Artwork | undefined>(undefined);
const isLoadingArtwork = ref(true);

onIonViewDidEnter(async () => {
    fetchArtworks();
})

const fetchArtworks = async () => {
    try {
        if(typeof id === 'string') {}
        const docRef = doc(db, 'art_vista', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            artwork.value = docSnap.data() as Artwork;
            isLoadingArtwork.value = false;
        } else {
            console.log("Document doesnt exists!")
        }
    } 
    catch(error) {
        console.log("Error fetching artworks: ", error)
    }
}

</script>

<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar color="primary">
                <ion-buttons slot="start">
                    <ion-back-button default-href="/"></ion-back-button>
                </ion-buttons>
                <ion-title v-if="artwork">{{ artwork.title }}</ion-title>
            </ion-toolbar>
        </ion-header>
        
        <!-- Makes sure artworks data from Firebase has loaded -->
        <ion-content :fullscreen="true" v-if="artwork && !isLoadingArtwork">
            <ion-col>
                <ion-img :src="artwork.imageURL" :alt="artwork.title + ' image'" class="artwork-img-container"></ion-img>
                
                <ion-row>
                    <ion-chip v-for="hashtag in artwork.hashtags" :key="hashtag" color="tertiary">{{ hashtag }}</ion-chip>
                </ion-row>
            </ion-col>

            <ion-card>
                <ion-card-header>
                    <ion-text color="dark">Artwork abstract</ion-text>
                </ion-card-header>
                <ion-card-content>{{ artwork.abstract}}</ion-card-content>
            </ion-card>
        </ion-content>
    </ion-page>
</template>

<style scoped>
.artwork-img-container {
    width: 100%;       /* Adjust width as needed */
    max-width: 30rem;  /* Set max width to control image scaling */
    height: auto;      /* Keeps the image's aspect ratio */
    margin: 0 auto;    /* Centers the image */
    display: block;
}
</style>