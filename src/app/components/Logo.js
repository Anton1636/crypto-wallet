const { default: Image } = require('next/image')

export default function Logo({ asset }) {
	return (
		<Image
			className='me-2'
			src={asset.logo}
			alt={asset.name}
			width={24}
			height={24}
		/>
	)
}
