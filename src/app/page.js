'use client'

import { JsonRpcProvider, Wallet } from 'ethers'
import { useEffect, useState } from 'react'
import styles from './page.module.css'
import { formatWeiToEth } from '../../utils'
import blockchain from './blockchain.json'
import Logo from './components/Logo.js'
require('dotenv').config()

const initialChain = blockchain.chains[0]
const initialNativeAsset = blockchain.assets.find(
	asset => asset === initialChain.nativeAssetId
)

export default function Home() {
	const [provider, setProvider] = useState(undefined)
	const [wallet, setWallet] = useState(undefined)
	const [balance, setBalance] = useState(undefined)
	const [loading, setLoading] = useState(true)
	const { nativeAsset, setNativeAsset } = useState(initialNativeAsset)

	useEffect(() => {
		const init = async () => {
			try {
				if (!wallet) {
					const provider = new JsonRpcProvider(
						process.env.NEXT_PUBLIC_LOCAL_RPC_URL
					)
					const wallet = Wallet.fromPhrase(
						process.env.NEXT_PUBLIC_MNEMONIC,
						provider
					)

					setProvider(provider)
					setWallet(wallet)
					setLoading(false)
				}
			} catch (error) {
				console.error('Error initializing wallet:', error)
				setLoading(false)
			}
		}

		init()
	}, [])

	useEffect(() => {
		const init = async () => {
			if (!loading && wallet) {
				try {
					const balance = await provider.getBalance(wallet.address)
					if (balance === null || balance === undefined) {
						console.error('Failed to retrieve balance')
						setBalance(null)
					} else {
						setBalance(balance)
					}
				} catch (error) {
					console.error('Error retrieving balance:', error)
				}
			}
		}

		init()
	}, [wallet, loading])

	return (
		<div className='container-fluid mt-5 d-flex justify-content-center'>
			<div id='content' className='row'>
				<div id='content-inner' className='col'>
					<div className='text-center'>
						<h1 id='title' className='fw-bold'>
							CRYPTO WALLET
						</h1>
						<p id='sub-title' className='mt-4 fw-bold'>
							Manage your crypto assets
						</p>
					</div>
					{wallet ? (
						<>
							<div className={styles.overview}>
								<p>
									<Logo asset={nativeAsset} /> {nativeAsset.name}
								</p>
								<p className={styles.address}>{wallet.address}</p>
								<p className={styles.balance}>{formatWeiToEth(balance)} ETH</p>
							</div>
							"wallet loaded"
						</>
					) : (
						'Loading'
					)}
				</div>
			</div>
		</div>
	)
}
