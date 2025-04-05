<script>
	import { user } from '$lib/auth';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import AuthTabs from '$lib/components/Auth/AuthTabs.svelte';

	onMount(() => {
		// Redirect to timers if already logged in
		// If user is already logged in, redirect to timers page
		const unsubscribe = user.subscribe(currentUser => {
			if (currentUser) {
				goto('/my-timers');
			}
		});

		return unsubscribe;
	});
</script>

<div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-md">
		<h1 class="text-center text-3xl font-extrabold text-gray-900 mb-8">Team Timer App</h1>
		<AuthTabs />
	</div>
</div>