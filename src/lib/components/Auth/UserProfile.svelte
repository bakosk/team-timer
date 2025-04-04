<script>
	import { user, logout } from '$lib/auth';
	import { goto } from '$app/navigation';

	let isLoggingOut = false;

	async function handleLogout() {
		isLoggingOut = true;
		try {
			await logout();
			// Redirect to login page after successful logout
			goto('/auth');
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			isLoggingOut = false;
		}
	}
</script>

{#if $user}
	<div class="bg-white p-4 rounded-lg shadow-sm">
		<div class="flex justify-between items-center">
			<div>
				<p class="font-medium">{$user.email}</p>
				<p class="text-sm text-gray-500">Signed in</p>
			</div>
			<button
				on:click={handleLogout}
				disabled={isLoggingOut}
				class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none"
			>
				{isLoggingOut ? 'Signing out...' : 'Sign Out'}
			</button>
		</div>
	</div>
{/if}