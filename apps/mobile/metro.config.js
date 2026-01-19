const path = require('node:path')
const {getDefaultConfig} = require('expo/metro-config')
const {withUniwindConfig} = require('uniwind/metro')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

config.watchFolders = [workspaceRoot]
config.resolver.nodeModulesPaths = [
	path.resolve(projectRoot, 'node_modules'),
	path.resolve(workspaceRoot, 'node_modules')
]
config.resolver.disableHierarchicalLookup = true
config.resolver.unstable_enableSymlinks = true
config.resolver.unstable_enablePackageExports = true

module.exports = withUniwindConfig(config, {
	cssEntryFile: './global.css',
	dtsFile: './app/uniwind-types.d.ts'
})
