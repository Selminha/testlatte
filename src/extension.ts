// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as child_process from 'child_process'; 
import TestProvider from './TestProvider';
import BrowserProvider from './BrowserProvider';
import TestRunner from './TestRunner';

// TODO add exclude folder configuration

const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function isTestcafeInstalled(path: string) {
	try {
		const { stdout, stderr } = await exec('npm ls testcafe', { cwd: path });
		return true;
	}
	catch(e) {
		return false;
	}
}

async function setPanelVisibility() {
	if(vscode.workspace.workspaceFolders) {
		for (const folder of vscode.workspace.workspaceFolders) {
			if(await isTestcafeInstalled(folder.uri.fsPath)) {
				// if found at least one folder with testcafe installed activate the extension
				vscode.commands.executeCommand('setContext', 'foundTestcafeTests', true);
				return;
			} 
		}
	}

	// If there is no folders or testcafe is not installed do not activate extension
	vscode.commands.executeCommand('setContext', 'foundTestcafeTests', false);
}

export async function activate(context: vscode.ExtensionContext) {

	setPanelVisibility();
	
	const browserProvider = new BrowserProvider();
	await browserProvider.createBrowserList(context.workspaceState.get("SelectedBrowserList"));
	context.workspaceState.update("SelectedBrowserList", browserProvider.getBrowserList());
	vscode.window.registerTreeDataProvider('browserSelection', browserProvider);
	
	const testProvider = new TestProvider();
	await testProvider.startProvider();
	vscode.window.registerTreeDataProvider('testOutline', testProvider);

	vscode.commands.registerCommand('testOutline.openTest', treeTest => {
		treeTest.openTest();
	});
	vscode.commands.registerCommand('testOutline.debugTest', treeTest => {
		treeTest.openTest();
		let testRunner: TestRunner = new TestRunner(browserProvider);
		testRunner.debugTest(treeTest);
	});
	vscode.commands.registerCommand('testOutline.runTest', treeTest => {
		treeTest.openTest();
		let testRunner: TestRunner = new TestRunner(browserProvider);
		testRunner.runTest(treeTest);
	});
	vscode.commands.registerCommand('testOutline.debugAll', () => {
		let testRunner: TestRunner = new TestRunner(browserProvider);
		testRunner.debugAll();
	});
	vscode.commands.registerCommand('testOutline.runAll', () => {
		let testRunner: TestRunner = new TestRunner(browserProvider);
		testRunner.runAll();
	});
	vscode.commands.registerCommand('testOutline.refresh', () => {
		testProvider.refresh();
	});

	vscode.commands.registerCommand('browserSelection.toggleSelection', function(treeBrowser) {
		treeBrowser.toggleSelection();
		browserProvider.refresh();
		context.workspaceState.update("SelectedBrowserList", browserProvider.getBrowserList());
	});

	vscode.workspace.onDidChangeConfiguration(function (change) {
		if(change.affectsConfiguration('testlatte')) {
			testProvider.refresh();
		}
	});

	if(vscode.workspace.rootPath !== undefined) {
		let fileSystemWatcher: vscode.FileSystemWatcher = vscode.workspace.createFileSystemWatcher(
			new vscode.RelativePattern(vscode.workspace.rootPath, "**/package.json"), );

		fileSystemWatcher.onDidChange(function() {
			setPanelVisibility();
		});
	}
}


// this method is called when your extension is deactivated
export function deactivate() {}
