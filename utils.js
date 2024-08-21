import { formatUnits } from 'ethers'

/**
 * Formats a Wei amount to Ether, displaying up to 18 decimal places.
 * @param {BigNumber | string | number | null} amount - The amount in Wei to format.
 * @returns {string} The formatted Ether amount.
 */
export const formatWeiToEth = amount => {
	try {
		const etherAmount = formatUnits(amount, 18)
		return new Intl.NumberFormat('en-US', {
			maximumFractionDigits: 18,
		}).format(etherAmount)
	} catch (error) {
		console.error('Error formatting Wei to Ether:', error)
		return '0'
	}
}
