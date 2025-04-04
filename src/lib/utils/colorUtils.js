/**
 * Generates a consistent color based on a string input
 * This ensures the same name always gets the same color
 * @param {string} str - The string to generate a color for (usually timer name)
 * @returns {string} - A CSS color value (hex code)
 */
export function generateColorFromString(str) {
	// Define a set of pleasing, distinct colors
	const colorPalette = [
		'#4299E1', // Blue
		'#48BB78', // Green
		'#ED8936', // Orange
		'#9F7AEA', // Purple
		'#F56565', // Red
		'#38B2AC', // Teal
		'#ED64A6', // Pink
		'#ECC94B', // Yellow
		'#667EEA', // Indigo
		'#FC8181', // Light Red
		'#68D391', // Light Green
		'#63B3ED', // Light Blue
		'#B794F4', // Light Purple
		'#F6AD55', // Light Orange
		'#4FD1C5'  // Light Teal
	];

	// Generate a numeric hash from the string
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}

	// Use the hash to pick a color from the palette
	const index = Math.abs(hash) % colorPalette.length;
	return colorPalette[index];
}