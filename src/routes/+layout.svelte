<script>
	import '../app.css';
	import { authLoading } from '$lib/auth';
	import { navigating } from '$app/state';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import Navigation from '$lib/components/Navigation.svelte';

	let isInitializing = true;
	$: loading = $authLoading;

	onMount(() => {
		if (browser) {
			// Wait for auth state to be determined
			const unsubscribe = authLoading.subscribe(loading => {
				if (!loading) isInitializing = false;
			});

			return unsubscribe;
		}
	});
</script>

{#if isInitializing}
	<div class="flex justify-center items-center min-h-screen">
		<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
	</div>
	{:else if loading}
	<div class="loading-spinner">Loading...</div>
{:else}
	<Navigation />
	<slot />
{/if}
