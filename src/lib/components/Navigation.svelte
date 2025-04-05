<script>
	import { page } from '$app/state';
	import { user } from '$lib/auth';
</script>

{#if $user}
	<nav class="bg-white shadow-md py-4 px-6 mb-8">
		<div class="max-w-7xl mx-auto flex justify-center space-x-6">
			<a
				href="/timers"
				class="px-4 py-2 rounded-md transition-colors {page.url.pathname === '/timers' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'}"
			>
				Team Timers
			</a>
			<a
				href="/my-timers"
				class="px-4 py-2 rounded-md transition-colors {page.url.pathname === '/my-timers' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'}"
			>
				My Timers
			</a>
		</div>
	</nav>
{/if}