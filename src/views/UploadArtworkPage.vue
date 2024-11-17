<script setup lang="ts">
import { toastController, IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonChip, IonImg, IonGrid, IonRow, IonCol } from '@ionic/vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Artwork } from '@/interfaces/Artwork';
import { getFirestore, collection, setDoc, doc } from 'firebase/firestore';
import { add, trashOutline} from 'ionicons/icons';
import { Camera, CameraResultType } from '@capacitor/camera';
import { v4 as uuidv4 } from "uuid";
import { getStorage, uploadBytes, getDownloadURL, ref as dbRef } from "firebase/storage";

const router = useRouter()

// Keeps track of the input field for new hashtags
const newHashtags = ref("");

// Keeps track of all data input from the user towards adding a artwork
const newArtwork = ref<Artwork>({
  id: '',  
  title: '',
  abstract: '',
  yearCreated: '',
  imageURL: '',
  hashtags: [], 
  artist: {
    country: '',
    name: '',
    yearBorn: 0,
    yearDead: 0,
    about: '',
  },
  comments: []  
});

// Get a reference to the 'art_vista' collection in Firestore
const artworkCollection = collection(getFirestore(), 'art_vista')

const addNewHashtag = () => {
    // Hashtag cannot be empty
    if (newHashtags.value) {
        // Makes sure you add # when entering a hashtag
        if (newHashtags.value.charAt(0) !== '#') {
            alert("Hashtag must start with '#'");
            return;
        }

        if (!newArtwork.value.hashtags.includes(newHashtags.value)) {
            newArtwork.value.hashtags.push(newHashtags.value); 
        } else {
            alert("Hashtag already exists")
        }
        newHashtags.value = "";
    }
}

// Handle POST new artwork to database
const postNewArtwork = async () => {
    if (!newArtwork.value.imageURL) {
        alert("You must upload an image");
        return;
    }

    if (!newArtwork.value.title || !newArtwork.value.abstract || !newArtwork.value.yearCreated || !newArtwork.value.hashtags) {
        alert("Please provide full details about the artwork");
        return; 
    }
    if (!newArtwork.value.artist.name || !newArtwork.value.artist.country || !newArtwork.value.artist.yearBorn) {
        alert("Please provide full details about artist");
        return;
    }

    try {
        const generatedUUID = uuidv4() // Generates an unique ID
        const imageName = new Date().getTime() + ".jpg" // Generate a unique image name
        const storageRef = getStorage() 
        const imageRef = dbRef(storageRef, `images/${imageName}`); // Creates a reference for the specific image in Firebase Storage

        const response = await fetch(newArtwork.value.imageURL); // Fetches the image from the temporary blob URL
        const imageBlob = await response.blob();  // Converts the fetched image to a Blob object
        const snapshot = await uploadBytes(imageRef, imageBlob)  // Uploads imageBlob to Firebase storage
        const url = await getDownloadURL(snapshot.ref);  // Retrieves the public URL for the uploaded image in Firebase Storage

        newArtwork.value.imageURL = url;
        newArtwork.value.id = generatedUUID;
        await setDoc(doc(artworkCollection, generatedUUID), newArtwork.value);

        const successToast = await toastController.create({
            message: 'Artwork was uploaded!',
            duration: 2000,
            position: 'bottom',
            color: 'success'
        });

        await successToast.present();
        router.replace('/home'); 


    } catch (error) {
        console.log("Error handling artwork upload! ", error)
    }
}

// Opens the device's camera and/or file picker UI
const triggerCamera = async () => {
    const photo = await Camera.getPhoto({
        quality: 100,
        allowEditing: false,
        resultType: CameraResultType.Uri
    });

     if (photo.webPath) {
        newArtwork.value.imageURL = photo.webPath;    
    } 
}

const removeImagePreview = () => {
    newArtwork.value.imageURL = '';
}

</script>

<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar color="primary">
                <ion-buttons slot="start">
                    <ion-back-button default-href="/"></ion-back-button>
                </ion-buttons>
                <ion-title>Add new artwork</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <ion-list class="ion-padding">
                <ion-button @click="triggerCamera" class="image-picker">Choose file or take picture</ion-button>
                <ion-item v-if="newArtwork.imageURL">
                    <ion-col size="12">
                        <ion-img :src="newArtwork.imageURL" class="upload-img-preview"></ion-img>
                        <!-- Trash icon below image preview -->
                        <ion-button @click="removeImagePreview" class="trash-btn">
                            <ion-icon :icon="trashOutline" ></ion-icon>Remove Image
                        </ion-button>
                    </ion-col>
                    
                </ion-item>

                <ion-item>
                    <ion-label position="stacked">Name of artwork</ion-label>
                    <ion-input v-model="newArtwork.title" type="text"></ion-input>
                </ion-item>

                <ion-item>
                    <ion-label position="stacked">Abstract</ion-label>
                    <ion-input v-model="newArtwork.abstract" type="text"></ion-input>
                </ion-item>

                <ion-item>
                    <ion-label position="stacked">Year artwork was created</ion-label>
                    <ion-input v-model="newArtwork.yearCreated" type="text"></ion-input>
                </ion-item>

                <ion-item>
                    <ion-label position="stacked">Hashtags</ion-label>
                    <ion-input v-model="newHashtags" type="text"></ion-input>

                    <ion-button slot="end" @click="addNewHashtag">
                        <ion-icon :icon="add"></ion-icon>
                    </ion-button>
                </ion-item>

                <ion-item>
                    <ion-chip v-for="hashtag in newArtwork.hashtags" :key="hashtag" color="secondary">{{hashtag}}</ion-chip>
                </ion-item>

                <ion-grid>
                <ion-row>
                    <ion-col size="6">
                        <ion-item>
                            <ion-label position="stacked">Artist Name</ion-label>
                            <ion-input v-model="newArtwork.artist.name" type="text"></ion-input>
                        </ion-item>
                    </ion-col>
                    <ion-col size="6">
                        <ion-item>
                            <ion-label position="stacked">Artist Country</ion-label>
                            <ion-input v-model="newArtwork.artist.country" type="text"></ion-input>
                        </ion-item>
                    </ion-col>
                </ion-row>

                <ion-row>
                    <ion-col size="6">
                        <ion-item>
                            <ion-label position="stacked">Year Born</ion-label>
                            <ion-input v-model="newArtwork.artist.yearBorn" type="number" min="0" max="2024"></ion-input>
                        </ion-item>
                    </ion-col>
                    <ion-col size="6">
                        <ion-item>
                            <ion-label position="stacked">Year Dead</ion-label>
                            <ion-input v-model="newArtwork.artist.yearDead" type="number" min="0" max="2024"></ion-input>
                        </ion-item>
                    </ion-col>
                </ion-row>

                <ion-row>
                    <ion-col size="12">
                        <ion-item>
                            <ion-label position="stacked">Artist Bio</ion-label>
                            <ion-input v-model="newArtwork.artist.about" type="text"></ion-input>
                        </ion-item>
                    </ion-col>
                </ion-row>
            </ion-grid>

                <ion-button @click="postNewArtwork" color="primary" class="upload-btn">
                    Upload artwork
                </ion-button>
            </ion-list>
        </ion-content>
    </ion-page>
</template>

<style scoped>
ion-input {
    --color: var(--ion-color-medium)
}

.image-picker {
    display: flex;
    height: 12.5rem;
    margin: 1rem;
    border: 0.125rem var(--ion-color-medium) dashed;
    border-radius: 0.5rem;
    font-size: medium;
}

.upload-img-preview {
    height: 20rem;
    object-fit: contain;
    display: block;
    margin-bottom: 0.5rem;
}

.trash-btn {
    color: var(--ion-color-danger); 
    font-weight: bold;
    display: flex;
    justify-content: center;
    padding-left: 40rem;
    padding-right: 40rem;
}

.upload-btn {
    padding-top: 0.5rem;
    padding-left: 0.5rem;
}
</style>