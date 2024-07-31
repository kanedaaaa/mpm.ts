import { existsSync, promises as fs } from 'fs'
import * as path from 'path'
import axios from 'axios'
import * as tar from 'tar'

const installCommand = async (pkg: string, version: string = 'latest') => {
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

	try {
		await fetchAndExtractPackage(pkg, version)
		await installSubDeps(pkg, projectDir) // Start from projectDir
		packageJson.dependencies[pkg] = version
		await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2))

		console.log(`Package ${pkg}@${version} installed successfully`)
	} catch (err) {
		console.error('Error installing package:', err)
	}
}

const fetchAndExtractPackage = async (
	pkg: string,
	version: string,
	parentPkg?: string
) => {
	const metadataUrl = `https://registry.npmjs.org/${pkg}`
	const metadataResponse = await axios.get(metadataUrl)
	const metadata = metadataResponse.data

	const versionToInstall =
		version === 'latest'
			? metadata['dist-tags'].latest
			: cleanupVersion(version)

	const tarballUrl = metadata.versions[versionToInstall].dist.tarball

	const tarballResponse = await axios.get(tarballUrl, {
		responseType: 'stream'
	})
	const tarballStream = tarballResponse.data

	let extractPath: string = ''

	if (parentPkg) {
		extractPath = path.join(
			process.cwd(),
			'node_modules',
			parentPkg,
			'node_modules',
			pkg
		)
	} else {
		extractPath = path.join(process.cwd(), 'node_modules', pkg)
	}
	await fs.mkdir(extractPath, { recursive: true })

	return new Promise<void>((resolve, reject) => {
		tarballStream
			.pipe(tar.x({ cwd: extractPath }))
			.on('finish', async () => {
				const packagePathWithPackageDir = path.join(extractPath, 'package')
				const packagePathWithoutPackageDir = extractPath

				if (existsSync(packagePathWithPackageDir)) {
					const files = await fs.readdir(packagePathWithPackageDir)
					for (const file of files) {
						await fs.rename(
							path.join(packagePathWithPackageDir, file),
							path.join(packagePathWithoutPackageDir, file)
						)
					}
					await fs.rmdir(packagePathWithPackageDir)
				}

				resolve()
			})
			.on('error', reject)
	})
}

const installSubDeps = async (pkg: string, rootDir: string) => {
	const packagePath = path.join(rootDir, 'node_modules', pkg, 'package.json')

	const data = await fs.readFile(packagePath, 'utf-8')
	const packageJson = JSON.parse(data)
	const deps = packageJson.dependencies

	for (const [depPkg, depVersion] of Object.entries(deps)) {
		const depPath = path.join(
			rootDir,
			'node_modules',
			pkg,
			'node_modules',
			depPkg
		)

		if (!existsSync(depPath)) {
			await fetchAndExtractPackage(depPkg, depVersion as string, pkg)
		}
	}
}

const cleanupVersion = (version: string) => {
	return version.replace(/^[~^]/, '')
}

export default installCommand
