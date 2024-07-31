import { program } from 'commander'

import initCommand from './core/init'
import installCommand from './core/install'
import uninstallCommand from './core/uninstall'

program.name('Mini Package Manasger / MPM').description('Idk').version('1.0.0')

program
	.command('init')
	.description('Initialize a new project')
	.option('-y, --yes', 'Skip prompts and use default values')
	.action((options) => {
		initCommand(options.yes)
	})

program
	.command('install <package> [version]')
	.description('Install a package')
	.action((pkg, version) => {
		installCommand(pkg, version)
	})

program
	.command('uninstall <package>')
	.description('Uninstall a package')
	.action((pkg) => {
		uninstallCommand(pkg)
	})

program.parse(process.argv)
