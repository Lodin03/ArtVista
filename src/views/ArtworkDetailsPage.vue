<script setup lang="ts">
import { onIonViewDidEnter, IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonCol, IonImg, IonRow, IonChip, IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonText, IonIcon, IonButton, IonModal, IonList, IonItem, IonLabel, IonTextarea, IonListHeader, IonAvatar, IonNote, IonCardSubtitle } from '@ionic/vue';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { getFirestore, getDoc, doc, setDoc } from 'firebase/firestore';
import { getAuth, User } from 'firebase/auth';
import { Artwork } from '@/interfaces/Artwork';
import { chatboxOutline, trashBinOutline } from 'ionicons/icons';

const route = useRoute();

/* Retrieve the id parameter from the current route's query string (/artwork/:id) and ensure its treated as a string, not string[] so I dont get type warning on doc */
const { id } = route.params as { id: string }; 
const db = getFirestore();

// Reference for artwork of type Artwork, initially undefined until artwork data is fetched.
// Initializes variable artwork with default empty values based on the Artwork interface
const artwork = ref<Artwork>({
  id: '',  
  title: '',
  abstract: '',
  yearCreated: 0,
  imageURL: '',
  hashtags: [], 
  category: '',
  artist: {
    country: '',
    name: '',
    yearBorn: 0,
    yearDead: 0,
    about: '',
  },
  comments: []  
});
const isLoadingArtwork = ref(true);

// This allows the ref to be either User or null
const currentUserData = ref<User | null>(null);  
// Ref to check if modal is open, its closed by default.
const isModalOpen = ref(false);
// Ref to store the new comment and the user
const newCommentText = ref("");
const newCommentUser = ref("");

onIonViewDidEnter(async () => {
    currentUserData.value = getAuth().currentUser; // Retrieves user from Firebase and assigns it to currentUserData

    // Checks if currentUserData is available and if displayName or email are missing
    if (!currentUserData.value || !currentUserData.value.displayName || !currentUserData.value.email) {
        alert("Either displayName or email is null, cannot load");
        return; // Early exit to prevent further execution
    }
    newCommentUser.value = currentUserData.value.displayName;
    fetchArtworks();
})

const fetchArtworks = async () => {
    try {
        if (typeof id === 'string') {
            const docRef = doc(db, 'art_vista', id);
            const docSnap = await getDoc(docRef);
        
            if (docSnap.exists()) {
                artwork.value = docSnap.data() as Artwork;
                isLoadingArtwork.value = false;
            } else {
                console.log("Document doesnt exists!")
            }
        }      
    } 
    catch (error) {
        console.log("Error fetching artworks: ", error)
    }
}

const addNewComment = async () => {
  try {
    const docRef = doc(db, 'art_vista', id);  
    // Non-null assertion operator for username and email, because page wont load if they are, based on onIOnViewDidEnter.
    // Username and email should never be empty, as you need to logged in with an user to access the page, but I added 'Anonymous', just to remove type check error message.
    const newComment = {
      commentId: artwork.value.comments ? artwork.value.comments.length + 1 : 1, 
      username: currentUserData.value!.displayName || 'Anonymous',  // User's display name from Firebase Auth
      email: currentUserData.value!.email || '',  // User's email from Firebase Auth
      text: newCommentText.value  // Comment text entered in the modal
    };

    // Update the comments array, initializing as empty array if there are no comments yet
    const updatedComments = [...(artwork.value.comments || []), newComment];

    // Update Firestore with new comment
    await setDoc(docRef, { comments: updatedComments }, { merge: true });

    // Update the artwork object locally with the new comment array
    artwork.value.comments = updatedComments;

    // Close modal and clear the comment text
    isModalOpen.value = false;
    newCommentText.value = '';
  } catch (error) {
    console.error("Error adding new comment:", error);
  }
}

const removeComment = async (commentId: number) => {
    try {
        const docRef = doc(db, 'art_vista', id)
        const targetComment = artwork.value.comments.find(comment => comment.commentId === commentId)

        // Checks if the comment exists in the current state. If not, it may have been deleted already 
        // or failed to syncronize properly, so it handles synchronization issues between the firebase and the UI.
        if (!targetComment) {
            alert("Comment not found.");
            return; 
        }

        // Ensures the user is still logged in, handling potential synchronization issues where the user's session or token may have expired.
        if (!currentUserData.value) {
            alert("User is not logged in")
            return;
        }

        // Check if the logged-in user's email does not match the target comment's email
        if (targetComment.email !== currentUserData.value.email) {
            alert("You can't delete someone elses comment"); // Alert message
            return; // Exit the function early
        }

        // Filters out the comment from the array of comments
        const updatedComments = artwork.value.comments.filter(comment => comment.commentId != commentId);

         // Reassign comment IDs to ensure they are sequential
         updatedComments.forEach((comment, index) => {
            comment.commentId = index + 1;  // Reassign commentId starting from 1
        });

        // Updates the db with the new list of comments
        await setDoc(docRef, {comments: updatedComments}, {merge: true});
        artwork.value.comments = updatedComments;
        alert("Comment deleted!");
    }
    catch (error) {
        console.log("Error removing comment", error)
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
                <ion-title>ArtVista</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="isModalOpen=true">
                    <ion-icon :icon="chatboxOutline"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        
        <!-- Makes sure artworks data from Firebase has loaded -->
        <ion-content :fullscreen="true" v-if="artwork && !isLoadingArtwork">
            <ion-col class="ion-padding">
                <div class="artwork-img-container">
                    <ion-img :src="artwork.imageURL" :alt="artwork.title + ' image'" class="artwork-img"></ion-img>
                </div>

                <!-- Text section: Title, Abstract, and Hashtags -->
                <ion-col>
                    <ion-card class="card-padding">
                        <ion-card-header>
                            <ion-card-title color="dark"> {{ artwork.title }} </ion-card-title>
                        </ion-card-header>

                        <ion-card-content>
                            <ion-text>{{ artwork.abstract }}</ion-text>
                            <div class="ion-padding-top">
                                <ion-text>
                                    <b>Category:</b> {{ artwork.category }}
                                </ion-text>
                            </div>
                            <div>
                                <ion-text>
                                    <b>Year Created:</b> {{ artwork.yearCreated }}
                                </ion-text>
                            </div>
                            
                        </ion-card-content>

                        <ion-row class="ion-chip-padding">
                            <ion-chip v-for="hashtag in artwork.hashtags" :key="hashtag" color="secondary">
                                {{ hashtag }}
                            </ion-chip>
                        </ion-row>
                    </ion-card>
                </ion-col> 
            </ion-col>


            <ion-card>
                    <ion-list>
                        <ion-list-header>
                            <ion-card-title>
                                Comment section 
                                <ion-icon :icon="chatboxOutline" @click="isModalOpen=true"></ion-icon>
                            </ion-card-title>
                        </ion-list-header>

                        <ion-item v-for="comment in artwork.comments" :key="comment.commentId">
                            <ion-avatar slot="start">
                                <!-- Black avatar image -->
                                <ion-img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAAAAACH5BAAAAAAALAAAAAABAAEAAAICTAEAOw==" alt="User Avatar"></ion-img>
                            </ion-avatar>
                        <ion-label>
                            <ion-text class="username">{{comment.username}}</ion-text>
                            <ion-note class="comment-text">
                                Kommentar #{{comment.commentId}}: {{comment.text}}
                                <ion-icon :icon="trashBinOutline" @click="removeComment(comment.commentId)" class="trash-bin"></ion-icon>
                            </ion-note>
                        </ion-label>
                        </ion-item>
                    </ion-list>
                </ion-card>

            <ion-modal :is-open="isModalOpen" :initial-breakpoint="0.5" :breakpoints="[0, 0.25, 0.5, 0.75]" @did-dismiss="isModalOpen = false">
                    <ion-content>
                        <ion-list>
                            <ion-item>
                                <ion-label position="floating">Username</ion-label>
                                <ion-textarea v-model="newCommentUser" readonly></ion-textarea>
                            </ion-item>
                            <ion-item lines="none">
                                <ion-label position="floating">Your comment:</ion-label>
                                <ion-textarea v-model="newCommentText" placeholder="Write a comment"></ion-textarea>
                            </ion-item>
                            <ion-item lines="none">
                                <ion-button @click="addNewComment">Add a comment</ion-button>
                            </ion-item>
                        </ion-list>
                    </ion-content>
                </ion-modal>
        </ion-content>
    </ion-page>
</template>

<style scoped>
.artwork-img-container {
    width: 100%;
    max-width: 30rem; 
    margin: 0 auto; 
}

.artwork-img {
    width: 100%;
    height: auto;
    object-fit: contain;
    border: 1rem solid var(--ion-color-secondary);
    padding: .5rem;
    border-radius: 1rem;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    background-color: #fff;
}

.ion-chip-padding {
    padding: 0.5rem;
}

.trash-bin {
    padding-left: 0.25rem;
}

.username {
  font-weight: bold;
}

.comment-text {
  display: block;
}

</style>