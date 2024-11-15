<script setup lang="ts">
import { authService } from '@/services/firebase.authservice';
import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonList, IonPage, IonToggle, IonHeader, IonToolbar, IonTitle, IonButtons, IonIcon } from '@ionic/vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { updateProfile } from "firebase/auth";
import { home } from 'ionicons/icons'

const router = useRouter();

// The user can toggle between login and register mode in the form to show/hide additional fields
const inRegisterMode = ref(false);

// Provides two-way data binding between Vue and the input fields in the form
const userDetails = ref({
    displayName: '',
    email: '',
    password: ''
});

// Implement email/password login, email/password register, google sign in, and logout
const login = async () => {
    try {
        const user = await authService.login(userDetails.value.email, userDetails.value.password);     
        const idToken = await user.getIdToken(true);
        localStorage.setItem("auth_token", idToken);

        router.replace('/home'); 

    } catch (error) {
        console.error(error);
    }
}
const register = async () => {
    if (userDetails.value.password.length < 6) {
        alert('Password must be at least 6 characters long.');
        return; 
    }

    try {
        const userCredential = await authService.register(userDetails.value.email, userDetails.value.password);
        const user = userCredential.user; // Get the user object from the credential

        // Update the user's profile with the first name
        await updateProfile(user, {
            displayName: userDetails.value.displayName // Set displayName to firstName
        });

        console.log("Display Name being set: ", userDetails.value.displayName);

        await login();
    } catch (error) {
        console.log(error);
    }
}


const googlelogin = async () =>{
    try {
        const user = await authService.signinWithGoogle();     
        if (user) {                
            const idToken = await user.getIdToken(true);
            localStorage.setItem("auth_token", idToken)

            router.replace('/home');
        } else {
            throw new Error("No user returned from Google sign-in.")
        }
    } catch (error) {
        console.error(error);
    }
}

// Navigates to the HomePage route (this is for users who are not logged in and just want to visit the HomePage)
const goToHome = () => {
    router.push('/home'); 
}

</script>

<template>
    <ion-page>
        <ion-header>
            <ion-toolbar color="primary">
                <ion-title>Artvista Authentication</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="goToHome">
                        <ion-icon :icon="home" slot="icon-only" />
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <ion-list>
                <img src="../assets/images/auth_img.png" alt="Authentication Image" class="auth-image">

                <ion-item lines="none">
                    <ion-label color="dark" position="stacked">New user?</ion-label>
                    <ion-toggle color="secondary" @ion-change="inRegisterMode = !inRegisterMode"></ion-toggle>
                </ion-item> 

                <hr />

                <ion-item v-if="inRegisterMode">
                    <ion-label position="stacked" color="dark">Name</ion-label>
                    <ion-input type="text" v-model="userDetails.displayName"></ion-input>
                </ion-item>

                <ion-item>
                    <ion-label position="stacked" color="dark">Email</ion-label>
                    <ion-input type="email" v-model="userDetails.email"></ion-input>
                </ion-item>

                <ion-item>
                    <ion-label position="stacked" color="dark">Password</ion-label>
                    <ion-input type="password" v-model="userDetails.password"></ion-input>
                </ion-item>

                <ion-button v-if="inRegisterMode" @click="register" class="button-auth" fill="solid" color="dark" size="default"> 
                    Register
                </ion-button>

                <ion-button v-else @click="login"  class="button-auth" fill="solid" color="dark" size="default">
                    Log in 
                </ion-button>

                <ion-button @click="googlelogin"  class="button-auth" fill="solid" color="dark" size="default">
                    Log in (Google)
                </ion-button>
            </ion-list>
        </ion-content>
    </ion-page>
</template>
    
<style scoped>

ion-list {
    display: flex;
    flex-direction: column;
}

.button-auth {
    margin-top: 2rem; 
    margin-left: 1rem;
    margin-right: 1rem;
}
.auth-image {
    width: 100%;  
    max-width: 18rem;  
    height: auto; 
    margin: 1rem auto;  
    display: block; 
}


</style>