import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { auth } from './firebaseInit.js'; // Import the Firebase app instance

// Initialize Firebase Auth

// Create a Svelte store for the user
export const user = writable(null);
export const authLoading = writable(true);
export const authError = writable(null);

// Set up auth state listener
if (browser) {
	onAuthStateChanged(auth, (currentUser) => {
		// Update the store with the user data or null if signed out
		user.set(currentUser);
		authLoading.set(false);
	});
}

// Register a new user with email and password
export async function register(email, password) {
	authError.set(null);
	try {
		const userCredential = await createUserWithEmailAndPassword(auth, email, password);
		return userCredential.user;
	} catch (error) {
		authError.set(error.message);
		throw error;
	}
}

// Sign in an existing user with email and password
export async function login(email, password) {
	authError.set(null);
	try {
		const userCredential = await signInWithEmailAndPassword(auth, email, password);
		return userCredential.user;
	} catch (error) {
		authError.set(error.message);
		throw error;
	}
}

// Sign out the current user
export async function logout() {
	authError.set(null);
	try {
		await signOut(auth);
	} catch (error) {
		authError.set(error.message);
		throw error;
	}
}

// Get the current user
export function getCurrentUser() {
	return auth.currentUser;
}