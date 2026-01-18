import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
	/* config options here */
	reactCompiler: true,
	experimental: {
		// Allow imports from outside `apps/web` (e.g. `@root/meta`).
		externalDir: true
	}
}

export default nextConfig
