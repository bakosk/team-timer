<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { user } from '$lib/auth';
	import { goto } from '$app/navigation';
	import { subscribeToUserTimers, myTimers } from '$lib/firebase';
	import TeamTimers from '$lib/components/TeamTimers.svelte';
	import UserProfile from '$lib/components/Auth/UserProfile.svelte';

	let userUnsubscribe;
	let authUnsubscribe;

	onMount(() => {
		if (browser) {
			// Redirect to auth if not logged in
			authUnsubscribe = user.subscribe(currentUser => {
				if (!currentUser) {
					goto('/auth');
				}
			});

			// Subscribe to user's timers
			userUnsubscribe = subscribeToUserTimers($user.uid);
		}
	});

	onDestroy(() => {
		if (browser) {
			if (userUnsubscribe) userUnsubscribe();
			if (authUnsubscribe) authUnsubscribe();
		}
	});
</script>

<div class="container mx-auto px-4 py-8">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-3xl font-bold">Team Timer App</h1>
		<UserProfile />
	</div>

	<div class="grid gap-8">
		<div class="bg-white p-6 rounded-lg shadow-sm">
			<h2 class="text-xl font-bold mb-4">My Timers</h2>
			<TeamTimers timers={$myTimers} isPersonal={true} />
		</div>
	</div>
</div>