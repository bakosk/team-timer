<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { user } from '$lib/auth';
	import { goto } from '$app/navigation';
	import { subscribeToTeamTimers, teamTimersStore } from '$lib/firebase';
	import TeamTimers from '$lib/components/TeamTimers.svelte';
	import UserProfile from '$lib/components/Auth/UserProfile.svelte';

	let teamUnsubscribe;
	let authUnsubscribe;

	onMount(() => {
		if (browser) {
			// Redirect to auth if not logged in
			 authUnsubscribe = user.subscribe(currentUser => {
				if (!currentUser) {
					goto('/auth');
				}
			});

			// Subscribe to team timers
			teamUnsubscribe = subscribeToTeamTimers();
		}
	});

	onDestroy(() => {
		if (browser) {
			if (teamUnsubscribe) teamUnsubscribe();
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
			<h2 class="text-xl font-bold mb-4">Team Timers</h2>
			<TeamTimers timers={$teamTimersStore} isPersonal={false} />
		</div>
	</div>
</div>