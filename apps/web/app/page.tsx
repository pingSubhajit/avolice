import {GITHUB_URL} from '@root/meta'

export default function Home() {
	return (
		<div className="flex min-h-screen items-center justify-center font-sans">
			<main className="h-full">
				<h1 className="font-medium text-5xl">avolice.</h1>
				<p className="text-sm font-mono opacity-60 mt-1.5">
					routine app that respects nuances
				</p>

				<div className="absolute bottom-8 text-xs [&>*]:opacity-40 text-center [&>*]:transition left-1/2 -translate-x-1/2 flex items-center justify-center gap-4">
					<span>coming soon</span>
					<span>{'</>'}</span>
					<a
						href={GITHUB_URL}
						target="_blank"
						className="focus-visible:opacity-100 hover:opacity-100"
					>
						Github
					</a>
				</div>
			</main>
		</div>
	)
}
