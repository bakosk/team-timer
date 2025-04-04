<script>
	let activeTab = 'login';

	import LoginForm from './LoginForm.svelte';
	import RegisterForm from './RegisterForm.svelte';

	function setTab(tab) {
		activeTab = tab;
	}
</script>

<div class="w-full max-w-md mx-auto">
	<div class="flex mb-4 border-b">
		<button
			class={`flex-1 py-2 text-center font-medium ${activeTab === 'login' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
			on:click={() => setTab('login')}
		>
			Sign In
		</button>
		<button
			class={`flex-1 py-2 text-center font-medium ${activeTab === 'register' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
			on:click={() => setTab('register')}
		>
			Create Account
		</button>
	</div>

	{#if activeTab === 'login'}
		<LoginForm />
	{:else}
		<RegisterForm />
	{/if}
</div>