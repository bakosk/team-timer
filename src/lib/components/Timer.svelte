<!-- src/lib/components/Timer.svelte -->
<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	export let id;
	export let name;
	export let timeRemaining;
	export let isRunning;
	export let timerLabel;
	export let isTeamTimer = false;
	export let color = null; // New prop for timer color
	export let onUpdate;
	export let onRemove;

	let customTime = "60";
	let interval;
	let localTimeRemaining = timeRemaining;

	// Format seconds into HH:MM:SS
	function formatTime(seconds) {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;

		return [
			hours.toString().padStart(2, '0'),
			minutes.toString().padStart(2, '0'),
			secs.toString().padStart(2, '0')
		].join(':');
	}

	// Start/pause timer
	function toggleTimer() {
		const newIsRunning = !isRunning;
		onUpdate({ isRunning: newIsRunning });
	}

	// Manage timer interval locally
	$: {
		if (browser) {
			// Clear existing interval
			if (interval) {
				clearInterval(interval);
				interval = null;
			}

			// Update local time from props
			localTimeRemaining = timeRemaining;

			// Start new interval if running
			if (isRunning) {
				interval = setInterval(() => {
					// Update local time for UI responsiveness
					localTimeRemaining -= 1;

					// Update the Firebase record every second
					onUpdate({ timeRemaining: localTimeRemaining });

					// If timer reaches zero
					if (localTimeRemaining <= 0) {
						clearInterval(interval);
						interval = null;
						onUpdate({ isRunning: false });
						playAlarm();
					}
				}, 1000);
			}
		}
	}

	// Reset timer to default time
	function resetTimer() {
		onUpdate({ timeRemaining: 60 * 60, isRunning: false });
	}

	// Set custom time
	function setCustomTimer() {
		const minutes = parseInt(customTime, 10);
		if (!isNaN(minutes) && minutes > 0) {
			onUpdate({ timeRemaining: minutes * 60, isRunning: false });
		}
	}

	// Play alarm sound when timer reaches zero
	function playAlarm() {
		if (browser) {
			const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLHPM+N2MVBEbS6bo6ayAXxgPLIHa8cF4UAkPNZj0/tOVTgUGHXfn/uCzfEcC/SFn3wPswptdEwIaQ8D/8s2aVwYCB2HnIhrVpHQcBCyY9y0swLB3GwYomvwuHLOqgigEFXDbTjTLlWsHAfxVt1dV0LChUAUFJ4f35t6yhA3/NqX//vnZkTj/JZL+//vcoU0RBF3L5+XepGERBmbc+ezRpF4VCnDr9tWqaRMGWNTx89evcRUERM7y+e7OjzwEMrT3/PXepVQMAVm85/rz3biWPwUkiub8+vjbqGUcBTqh6v384LZ0IQRBpuv9/OW1gDkEFa7q/v3os24kAy6j9f1XvsFzEwVa2ttczK5cBQIWw9utmtHOf0enxseHe8rVi0ne4ssLDdfimIApwuSy9PurUb/SiH9WtNTPbFeUgV62x71uHI+EVIiSiGMWXHpbc4xz/v32wNDu9qBMioi6YCpoWE5CR0xMREbT8d7M/P7qjEBHTWApV1lZXBgpKyonQ9bh18rz+guhZUtDNmSlp6h8+fPu6eu96KybiF8ZJSkpPxIMDA4OD4CepZdqJYWo3bJ6YEND2/n//3YQBQMCAyxsrkAUKS3MtXLj9P///W0xCAcHCCVii1AVFxrFrXrb8P//+5RtUDk2Nle0vVUSEBPOrHfW7f778eB9Xlc9VYnJw2GPjobL0MLH/////wICAgMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
			audio.play();
		}
	}

	// Handle label change
	function handleLabelChange(event) {
		onUpdate({ timerLabel: event.target.value });
	}

	// Make sure interval is cleared when component is destroyed
	onDestroy(() => {
		if (browser && interval) {
			clearInterval(interval);
		}
	});

	// Default color for personal timers
	const defaultColor = '#3B82F6'; // Blue

	// Computed color style for the timer card
	$: cardStyle = `border-left: 4px solid ${color || defaultColor};`;

	// Computed color for the timer display
	$: displayStyle = `background-color: ${color ? `${color}10` : '#f3f4f6'};`; // Very light version of the color

	// Computed color for the start/pause button
	$: buttonStyle = `background-color: ${color || defaultColor};`;
</script>

<div class="bg-white rounded-lg shadow-sm p-6 relative" style={cardStyle}>
	<div class="flex justify-between items-center mb-4">
		<span class="font-bold text-gray-600">{name}</span>
		<button
			class="text-red-500 hover:text-red-700 text-xl"
			on:click={onRemove}
			aria-label="Remove timer"
		>
			×
		</button>
	</div>

	<!-- Timer Label -->
	<input
		type="text"
		class="w-full p-2 border border-gray-300 rounded-md text-center font-bold mb-4"
		value={timerLabel}
		on:input={handleLabelChange}
		placeholder="Timer Label"
	/>

	<!-- Timer Display - now uses the color -->
	<div class="text-4xl font-bold text-center py-6 rounded-md mb-4" style={displayStyle}>
		{formatTime(localTimeRemaining)}
	</div>

	<!-- Timer Controls - now uses the color -->
	<div class="flex gap-2 mb-4">
		<button
			class="flex-1 py-2 px-4 rounded-md text-white font-bold hover:opacity-90"
			style={isRunning ? "background-color: #ef4444;" : buttonStyle}
			on:click={toggleTimer}
		>
			{isRunning ? 'Pause' : 'Start'}
		</button>
		<button
			class="flex-1 py-2 px-4 bg-gray-500 hover:bg-gray-600 rounded-md text-white font-bold"
			on:click={resetTimer}
		>
			Reset
		</button>
	</div>

	<!-- Custom Time Input -->
	<div class="flex gap-2">
		<input
			type="number"
			class="flex-1 p-2 border border-gray-300 rounded-md"
			bind:value={customTime}
			min="1"
			placeholder="Minutes"
		/>
		<button
			class="py-2 px-4 rounded-md text-white font-bold hover:opacity-90"
			style={buttonStyle}
			on:click={setCustomTimer}
		>
			Set
		</button>
	</div>
</div>