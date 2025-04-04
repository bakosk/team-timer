<script>
	import { register, authError } from '$lib/auth';
	import { goto } from '$app/navigation';

	let email = '';
	let password = '';
	let confirmPassword = '';
	let loading = false;
	let passwordsMatch = true;

	function validatePasswords() {
		passwordsMatch = password === confirmPassword;
		return passwordsMatch;
	}

	async function handleRegister() {
		if (!validatePasswords()) return;

		loading = true;
		try {
			await register(email, password);
			// Redirect to timers page after successful registration
			goto('/timers');
		} catch (error) {
			console.error("Registration error:", error);
		} finally {
			loading = false;
		}
	}
</script>

<div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
	<h2 class="text-2xl font-bold mb-6 text-center">Create Account</h2>

	{#if $authError}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
			{$authError}
		</div>
	{/if}

	<form on:submit|preventDefault={handleRegister} class="space-y-4">
		<div>
			<label for="reg-email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
			<input
				type="email"
				id="reg-email"
				bind:value={email}
				required
				class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
		</div>

		<div>
			<label for="reg-password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
			<input
				type="password"
				id="reg-password"
				bind:value={password}
				required
				minlength="6"
				class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
			<p class="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
		</div>

		<div>
			<label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
			<input
				type="password"
				id="confirm-password"
				bind:value={confirmPassword}
				required
				on:input={validatePasswords}
				class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
			{#if !passwordsMatch}
				<p class="text-xs text-red-500 mt-1">Passwords do not match</p>
			{/if}
		</div>

		<button
			type="submit"
			disabled={loading || !passwordsMatch}
			class="w-full py-2 px-4 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
		>
			{loading ? 'Creating account...' : 'Create Account'}
		</button>
	</form>
</div>