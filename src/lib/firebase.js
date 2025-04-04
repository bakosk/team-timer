import { get } from'svelte/store'
import {
	getFirestore,
	collection,
	doc,
	addDoc,
	updateDoc,
	deleteDoc,
	onSnapshot,
	serverTimestamp,
	query,
	where,
	orderBy,
	getDoc,
	setDoc
} from 'firebase/firestore';
import { writable, derived } from 'svelte/store';
import { db } from './firebaseInit';
// Import user store from auth.js
import { user } from './auth';
import { generateColorFromString } from './utils/colorUtils';

// Firebase configuration
// const firebaseConfig = {
// 	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
// 	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
// 	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
// 	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
// 	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
// 	appId: import.meta.env.VITE_FIREBASE_APP_ID
// };
//
// // Initialize Firebase
// export const app = initializeApp(firebaseConfig);
// export const db = getFirestore(app);

// Create a Svelte store for timers
export const timersStore = writable([]);
export const teamTimersStore = writable([]);

// User-specific and team timers derived from the auth user store
export const myTimers = derived([user || writable(null), timersStore], ([$user, $timers]) => {
	if (!$user) return [];
	return $timers.filter(timer => timer.userId === $user.uid);
});

// Collection references
const timersCollection = collection(db, 'timers');
const metadataRef = doc(db, 'system', 'metadata');

// Subscribe to user-specific timers
export function subscribeToUserTimers(userId) {
	const q = query(
		timersCollection,
		where("userId", "==", userId),
		orderBy('createdAt', 'asc')
	);

	const unsubscribe = onSnapshot(q, (snapshot) => {
		const timersData = snapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data()
		}));
		timersStore.set(timersData);
	});

	return unsubscribe;
}

// Subscribe to team timers
export function subscribeToTeamTimers() {
	const q = query(
		timersCollection,
		where("isTeamTimer", "==", true),
		orderBy('createdAt', 'asc')
	);

	const unsubscribe = onSnapshot(q, (snapshot) => {
		const timersData = snapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data()
		}));
		teamTimersStore.set(timersData);
	});

	return unsubscribe;
}

// Add a new timer
export async function addTimer(name, timerLabel, isTeamTimer = false) {
	try {

		const currentUser = get(user);
		if (!currentUser && !isTeamTimer) {
			throw new Error("You must be logged in to add a personal timer");
		}

		// Generate a color for team timers
		const timerColor = isTeamTimer ? generateColorFromString(name) : null;

		await addDoc(timersCollection, {
			name,
			timerLabel: timerLabel || `${name}'s Timer`,
			timeRemaining: 60 * 60, // 1 hour in seconds
			isRunning: false,
			userId: currentUser ? currentUser.uid : null,
			userEmail: currentUser ? currentUser.email : null,
			isTeamTimer: isTeamTimer,
			color: timerColor, // Store the color
			createdAt: serverTimestamp(),
			lastUpdated: serverTimestamp()
		});
	} catch (error) {
		console.error("Error adding timer: ", error);
		throw error;
	}
}



// Update a timer
export async function updateTimer(id, updates) {
	try {
		const timerRef = doc(db, 'timers', id);

		// Optional: Check if user has permission to update this timer
		const timerDoc = await getDoc(timerRef);
		if (!timerDoc.exists()) {
			throw new Error("Timer not found");
		}

		const timerData = timerDoc.data();
		const currentUser = get(user);

		// Allow updates if: it's a team timer OR the user owns the timer
		if (!timerData.isTeamTimer && currentUser && timerData.userId !== currentUser.uid) {
			throw new Error("You don't have permission to update this timer");
		}

		await updateDoc(timerRef, {
			...updates,
			lastUpdated: serverTimestamp()
		});
	} catch (error) {
		console.error("Error updating timer: ", error);
		throw error;
	}
}

// Remove a timer
export async function removeTimer(id) {
	try {
		const timerRef = doc(db, 'timers', id);

		// Optional: Check if user has permission to delete this timer
		const timerDoc = await getDoc(timerRef);
		if (!timerDoc.exists()) {
			throw new Error("Timer not found");
		}

		const timerData = timerDoc.data();
		const currentUser = get(user);

		// Allow deletion if: it's a team timer OR the user owns the timer
		if (!timerData.isTeamTimer && currentUser && timerData.userId !== currentUser.uid) {
			throw new Error("You don't have permission to delete this timer");
		}

		await deleteDoc(timerRef);
	} catch (error) {
		console.error("Error removing timer: ", error);
		throw error;
	}
}

// Reset all timers
export async function resetAllTimers(teamTimersOnly = false) {
	try {
		// Get current timers
		let timersToReset = [];

		if (teamTimersOnly) {
			const unsubscribe = teamTimersStore.subscribe(value => {
				timersToReset = value;
			});
			unsubscribe();
		} else {
			// Reset both team timers and user timers
			const unsubscribe1 = teamTimersStore.subscribe(value => {
				timersToReset = [...timersToReset, ...value];
			});
			unsubscribe1();

			const currentUser = get(user);
			if (currentUser) {
				const unsubscribe2 = timersStore.subscribe(value => {
					timersToReset = [...timersToReset, ...value];
				});
				unsubscribe2();
			}
		}

		// Update each timer
		const promises = timersToReset.map(timer =>
			updateTimer(timer.id, {
				timeRemaining: 60 * 60, // Reset to 1 hour
				isRunning: false
			})
		);

		// Update the last reset date in the metadata
		const today = new Date();
		today.setHours(0, 0, 0, 0); // Set to beginning of day

		promises.push(
			setDoc(metadataRef, {
				lastResetDate: today.toISOString(),
				lastResetTimestamp: serverTimestamp()
			}, { merge: true })
		);

		await Promise.all(promises);

		return today;
	} catch (error) {
		console.error("Error resetting timers: ", error);
		throw error;
	}
}

export async function checkMidnightReset() {
	try {
		const now = new Date();
		const today = new Date(now);
		today.setHours(0, 0, 0, 0); // Set to beginning of today

		// Get the last time timers were reset
		const lastResetDate = await getLastResetDate();

		// Check if we missed a reset (lastResetDate is before today)
		const missedReset = lastResetDate < today;

		// Check if it's exactly midnight right now
		const isMidnight = now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() === 0;

		// Reset if it's midnight now OR if we missed a reset
		if (isMidnight || missedReset) {
			await resetAllTimers();
			return true;
		}

		return false;
	} catch (error) {
		console.error("Error checking midnight reset: ", error);
		return false;
	}
}

export async function getLastResetDate() {
	try {
		const metadataRef = doc(db, 'system', 'metadata');
		const metadataDoc = await getDoc(metadataRef);

		if (metadataDoc.exists() && metadataDoc.data().lastResetDate) {
			return new Date(metadataDoc.data().lastResetDate);
		}

		// If no reset has been recorded yet, return yesterday's date
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		yesterday.setHours(0, 0, 0, 0);
		return yesterday;
	} catch (error) {
		console.error("Error getting last reset date: ", error);

		// Default to yesterday if there's an error
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		yesterday.setHours(0, 0, 0, 0);
		return yesterday;
	}
}