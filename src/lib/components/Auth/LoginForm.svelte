<script>
	import { login, authError } from '$lib/auth';
	import { goto } from '$app/navigation';

	let email = '';
	let password = '';
	let loading = false;

	async function handleLogin() {
		loading = true;
		try {
			await login(email, password);
			// Redirect to timers page after successful login
			goto('/timers');
		} catch (error) {
			console.error("Login error:", error);
		} finally {
			loading = false;
		}
	}
</script>

<div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
	<h2 class="text-2xl font-bold mb-6 text-center">Sign In</h2>

	{#if $authError}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
			{$authError}
		</div>
	{/if}

	<form on:submit|preventDefault={handleLogin} class="space-y-4">
		<div>
			<label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
			<input
				type="email"
				id="email"
				bind:value={email}
				required
				class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
		</div>

		<div>
			<label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
			<input
				type="password"
				id="password"
				bind:value={password}
				required
				class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
		</div>

		<button
			type="submit"
			disabled={loading}
			class="w-full py-2 px-4 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
		>
			{loading ? 'Signing in...' : 'Sign In'}
		</button>
	</form>
</div>