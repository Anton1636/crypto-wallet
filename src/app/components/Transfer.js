'use client'
import { useEffect, useState } from 'react'
import styles from './transfer.module.css'
import { Contract, parseUnits } from 'ethers'
import { formatWeiToEth } from '../../../utils'
import Link from 'next/link'
import blockchain from '../blockchain.json'

export default function Transfer({
	provider,
	wallet,
	chain,
	nativeAsset,
	transfer,
	setShowTransferModal,
}) {
	const [txCostEth, setTxCostEth] = useState(undefined)
	const [txCostUSD, setTxCostUSD] = useState(undefined)
	const [sending, setSending] = useState(undefined)
	const [txHash, setTxHash] = useState(undefined)
	const [error, setError] = useState(undefined)

	useEffect(() => {
		const init = async () => {
			let estimateGas

			if (!transfer.asset.address) {
				const txRequest = {
					from: wallet.address,
					to: transfer.to,
					value: parseUnits(transfer.amount, transfer.asset.decimals),
				}
				estimateGas = wallet.estimateGas(txRequest)
			} else {
				const token = new Contract(
					transfer.asset.address,
					blockchain.abis.erc20,
					wallet
				)
				estimateGas = token.transfer.estimateGas(
					transfer.to,
					parseUnits(transfer.amount, transfer.asset.decimals)
				)
			}

			const [gasCost, feeData, ethPriceRaw] = await Promise.all([
				estimateGas,
				provider.getFeeData(),
				fetch(
					`https://api.coingecko.com/api/v3/simple/price?ids=${nativeAsset.coingekoId}&vs_currencies=usd&x_cg_pro_api_key=${process.env.NEXT_PUBLIC_COINGEKO_API_KEY}`
				),
			])

			const txCostEth = BigInt(gasCost) * BigInt(feeData.maxFeePerGas)
			const ethPrice = await ethPriceRaw.json()
			const scaleFactor = 100
			const adjustedEthPrice = parseInt(
				ethPrice[nativeAsset.coingeckoId].usd.toFixed(2) * scaleFactor
			)
			const txCostUSD =
				(txCostEth * BigInt(adjustedEthPrice)) / BigInt(scaleFactor)

			setTxCostEth(txCostEth)
			setTxCostUSD(txCostUSD)
		}
		init()
	}, [])

	const getTransactionFeeString = () => {
		return `${formatWeiToEth(
			txCostUSD,
			nativeAsset.decimals
		)} USD (${formatWeiToEth(txCostEth, nativeAsset.decimals)})`
	}

	const getTransactionUrl = hash => {
		return `${chain.blockchainExplorer}/${hash}`
	}

	const send = async () => {
		try {
			let tx

			if (!transfer.asset.address) {
				const txRequest = {
					from: wallet.address,
					to: transfer.to,
					value: parseUnits(transfer.amount, transfer.asset.decimals),
				}
				tx = wallet.sendTransaction(txRequest)
			} else {
				const token = new Contract(
					transfer.asset.address,
					blockchain.abis.erc20,
					wallet
				)
				tx = token.transfer(
					transfer.to,
					parseUnits(transfer.amount, transfer.asset.decimals)
				)
			}

			const txResponse = await tx
			const txReceipt = await txResponse.wait()

			if (parseInt(txReceipt.status !== 1))
				throw new Error('Transaction failed')
			setTxHash(txReceipt.hash)
		} catch (error) {
			console.log(true)
		} finally {
			setSending(false)
		}
	}

	return (
		<div id={styles.overlay}>
			<div id={styles.transfer}>
				<h2 className='fw-bold text-center'>Transfer details</h2>
				<div className='form-group mb-3'>
					<label>Network</label>
					<input
						type='text'
						className='form-control mb-3'
						name='network'
						value={chain.name}
						disabled={true}
					/>
				</div>
				<div className='form-group mb-3'>
					<label>From</label>
					<input
						type='text'
						className='form-control mb-3'
						name='from'
						value={wallet.address}
						disabled={true}
					/>
				</div>
				<div className='form-group mb-3'>
					<label>To</label>
					<input
						type='text'
						className='form-control mb-3'
						name='to'
						value={transfer.to}
						disabled={true}
					/>
				</div>
				<div className='form-group mb-3'>
					<label>Amount</label>
					<input
						type='text'
						className='form-control mb-3'
						name='amount'
						value={transfer.amount}
						disabled={true}
					/>
				</div>
				<div className='form-group mb-3'>
					<label>Asset</label>
					<input
						type='text'
						className='form-control mb-3'
						name='asset'
						value={transfer.asset.ticker}
						disabled={true}
					/>
				</div>
				<div className='form-group mb-3'>
					<label>Transaction Fee</label>
					<input
						type='text'
						className='form-control mb-3'
						name='txFee'
						value={
							txCostEth && txCostUSD ? getTransactionFeeString() : 'Loading'
						}
						disabled={true}
					/>
				</div>
				{sending && (
					<div className='alert alert-info mt-3 mb-3'>
						<i className='bi bi-info-circle-fill'></i>Sending...
					</div>
				)}
				{txHash && (
					<div className='alert alert-info mt-3 mb-3'>
						<i className='bi bi-check-circle-fill'></i>Transfer successful! -{' '}
						<Link href={getTransactionUrl(txHash)}>Transaction hash</Link>
					</div>
				)}
				{error && (
					<div className='alert alert-danger mt-3 mb-3'>
						<i className='bi bi-exclamation-triangle-fill'></i>Oops, the
						transfer failed...
					</div>
				)}
				<div className='text-right'>
					<button className='btn btn-primary me-3' onClick={send}>
						Submit
					</button>
					<button
						className='btn btn-secondary'
						onClick={() => setShowTransferModal(false)}
					>
						Close
					</button>
				</div>
			</div>
		</div>
	)
}
