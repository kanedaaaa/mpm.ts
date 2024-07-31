import { promises as fs } from 'fs'
import * as path from 'path'

const uninstallCommand = async (pkg: string) => {
	const projectDir = process.cwd()
	const packageJsonPath = path.join(projectDir, 'package.json')

	let packageJson

	try {
		const data = await fs.readFile(packageJsonPath, 'utf-8')
		packageJson = JSON.parse(data)
	} catch (err) {
		console.error('Error reading package.json:', err)
		return
	}

	const deps = packageJson.dependencies

	if (!(pkg in deps)) {
		console.error("Package isn't installed")
		return
	}

	const packageDir = path.join(process.cwd(), 'node_modules', pkg)
	await fs.rm(packageDir, { recursive: true })

	delete packageJson.dependencies[pkg]
	await fs.writeFile(
		path.join(process.cwd(), 'package.json'),
		JSON.stringify(packageJson, null, 2)
	)

	console.log(`Uninstalled ${pkg}`)
}

export default uninstallCommand
