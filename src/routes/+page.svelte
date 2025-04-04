<script>
	import { user } from '$lib/auth';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		// Redirect to appropriate page based on auth state
		if ($user) {
			goto('/timers');
		} else {
			goto('/auth');
		}
	});
</script>

<div class="flex justify-center items-center min-h-screen">
	<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
</div>
