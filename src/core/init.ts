import { promises as fs } from 'fs'
import * as path from 'path'
import inquirer from 'inquirer'

const initCommand = async (skipPrompt = false) => {
	let name = 'my-project'
	let version = '1.0.0'

	if (!skipPrompt) {
		// wtf inquirer
		const questions: any = [
			{
				type: 'input',
				name: 'name',
				message: 'Project name:',
				default: 'my-project'
			},
			{
				type: 'input',
				name: 'version',
				message: 'Project version:',
				default: '1.0.0'
			}
		]

		const answers = await inquirer.prompt(questions)

		name = answers.name
		version = answers.version
	}

	const projectDir = process.cwd()
	const packageJson = {
		name: name,
		version: version,
		dependencies: {}
	}

	try {
		await fs.mkdir(path.join(projectDir, 'node_modules'), { recursive: true })
		await fs.writeFile(
			path.join(projectDir, 'package.json'),
			JSON.stringify(packageJson, null, 2)
		)

		console.log(`Project ${name} initialized with version ${version}!`)
	} catch (err: any) {
		console.error('Error initializing project:', err)
	}
}

export default initCommand
