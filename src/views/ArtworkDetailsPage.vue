<script setup lang="ts">
import { onIonViewDidEnter, IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent } from '@ionic/vue';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { getFirestore, getDoc, doc } from 'firebase/firestore';

const route = useRoute();

/* Retrieve the id parameter from the current route's query string (/artwork/:id) */
const { id } = route.params;
const db = getFirestore();

const isLoadingArtwork = ref(true);

const artwork = ref(null);

onIonViewDidEnter(async () => {
    fetchArtworks();
})

const fetchArtworks = async () => {
    try {
        const docSnap = await getDoc(doc(db, 'art_vista', id));
        if (docSnap.exists()) {
            artwork.value = docSnap.data();
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

        <ion-content :fullscreen="true">

        </ion-content>
    </ion-page>
</template>