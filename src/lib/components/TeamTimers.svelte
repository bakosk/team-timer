<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import Timer from '$lib/components/Timer.svelte';
	import {
		addTimer,
		updateTimer,
		removeTimer,
		resetAllTimers,
		checkMidnightReset
	} from '$lib/firebase';

	// Props
	export let timers = [];
	export let isPersonal = false;

	let newTimerName = "";
	let dayChangeInterval;

	// Add a new timer
	async function handleAddTimer() {
		if (newTimerName.trim() === "") return;

		await addTimer(newTimerName, `${newTimerName}'s Timer`, !isPersonal);
		newTimerName = ""; // Clear the input field
	}

	// Remove a timer
	function handleRemoveTimer(id) {
		removeTimer(id);
	}

	// Update a specific timer
	function handleUpdateTimer(id, updates) {
		updateTimer(id, updates);
	}

	// Reset all timers in this section
	function handleResetAllTimers() {
		resetAllTimers(!isPersonal); // Pass true for team timers only
	}

	onMount(() => {
		if (browser && !isPersonal) {
			// Only set up midnight check for team timers to avoid duplication
			dayChangeInterval = setInterval(async () => {
				await checkMidnightReset();
			}, 1000);
		}
	});

	onDestroy(() => {
		if (browser && dayChangeInterval) {
			clearInterval(dayChangeInterval);
		}
	});
</script>

<div class="flex flex-col">
	<div class="mb-12">
		<div class="flex gap-2 mb-4">
			<input
				type="text"
				class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				bind:value={newTimerName}
				placeholder={isPersonal ? "Enter timer name" : "Enter team member name"}
				on:keydown={(e) => e.key === 'Enter' && handleAddTimer()}
			/>
			<button
				class="px-4 py-2 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
				on:click={handleAddTimer}
				disabled={!newTimerName.trim()}
			>
				Add Timer
			</button>
		</div>

		{#if timers.length > 0}
			<button
				class="w-full py-2 px-4 bg-gray-500 text-white font-bold rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
				on:click={handleResetAllTimers}
			>
				Reset All {isPersonal ? 'My' : 'Team'} Timers
			</button>
		{/if}
	</div>

	{#if timers.length === 0}
		<div class="p-8 bg-gray-50 rounded-md text-center text-gray-500">
			No {isPersonal ? 'personal' : 'team'} timers yet. Add one to get started!
		</div>
	{:else}
		<div class="grid gap-4  md:grid-cols-2">
			{#each timers as timer (timer.id)}
				<Timer
					id={timer.id}
					name={timer.name}
					timeRemaining={timer.timeRemaining}
					isRunning={timer.isRunning}
					timerLabel={timer.timerLabel}
					isTeamTimer={!isPersonal}
					color={timer.color}
				onUpdate={(updates) => handleUpdateTimer(timer.id, updates)}
				onRemove={() => handleRemoveTimer(timer.id)}
				/>
			{/each}
		</div>
	{/if}

	{#if !isPersonal}
		<p class="mt-4 text-sm text-gray-500 text-center">
			All team timers will automatically reset at midnight.
		</p>
	{/if}
</div>