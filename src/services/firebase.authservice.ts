import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup 
} from "firebase/auth"

export const authService = {
    async register(email: string, password: string) { 
        const userCredential = await createUserWithEmailAndPassword(getAuth(), email, password)
        return userCredential;
    },

    async login(email: string, password: string) {
        const userCredential = await signInWithEmailAndPassword(getAuth(), email, password)
        return userCredential.user
    },

    async logout() {
        return await signOut(getAuth());
    },

    async currentUser() {
        return await getAuth().currentUser;
    },

    async signinWithGoogle() {
        try {
          const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(getAuth(), provider);
            const user = result.user;
            console.log("user signed in:", user);
            return user;  // Return the user object for further processing
        } catch (error) {
            console.log("Error signing in with Google:", error);
            throw error;  // Re-throw the error to be handled by the caller
        }
      } 
}
