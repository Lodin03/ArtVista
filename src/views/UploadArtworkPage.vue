<script setup lang="ts">
import { IonText } from '@ionic/vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Artwork } from '@/interfaces/Artwork';
import { getFirestore, collection } from 'firebase/firestore';

// TODO: Fikser dette senere
const newArtwork = ref<Artwork>({
    id: "",
    title: "",
    abstract: "",
    yearCreated: "",
    imageURL: "",
    hashtags: [],
    artist: {
        country: "",
        name: "",
        yearBorn: 0,
        yearDead: 0,
        about: ""
    }
});

const artworkCollection = collection(getFirestore(), 'art_vista')


</script>

<template>
    Hello World
</template>