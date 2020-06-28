// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as chokidar from 'chokidar';
import TestProvider from './TestProvider';
import BrowserProvider from './BrowserProvider';
import TestRunner from './TestRunner';

// TODO add exclude folder configuration

let watcher:chokidar.FSWatcher;

export async function activate(context: vscode.ExtensionContext) {

	const browserProvider = new BrowserProvider();
	await browserProvider.createBrowserList(context.workspaceState.get("SelectedBrowserList"));
	context.workspaceState.update("SelectedBrowserList", browserProvider.getBrowserList());
	vscode.window.registerTreeDataProvider('browserSelection', browserProvider);
	
	const testProvider = new TestProvider();
	await testProvider.setProvider();
	vscode.window.registerTreeDataProvider('testOutline', testProvider);

	vscode.commands.registerCommand('testOutline.openTest', treeTest => {
		treeTest.openTest();
	});
	vscode.commands.registerCommand('testOutline.debugTest', testItem => {
		testItem.openTest();
		let testRunner: TestRunner = new TestRunner(browserProvider);
		testRunner.debugTest(testItem);
	});
	vscode.commands.registerCommand('testOutline.runTest', testItem => {
		testItem.openTest();
		let testRunner: TestRunner = new TestRunner(browserProvider);
		testRunner.runTest(testItem);
	});
	vscode.commands.registerCommand('testOutline.debugAll', (folderItem) => {
		let testRunner: TestRunner = new TestRunner(browserProvider);
		if(folderItem) {
			testRunner.debugAll(folderItem.uri);
			return;
		}

		if(vscode.workspace.workspaceFolders) {
			testRunner.debugAll(vscode.workspace.workspaceFolders[0].uri);
		}
	});
	vscode.commands.registerCommand('testOutline.runAll', (folderItem) => {
		let testRunner: TestRunner = new TestRunner(browserProvider);
		if(folderItem) {
			testRunner.runAll(folderItem.uri);
			return;
		}

		if(vscode.workspace.workspaceFolders) {
			testRunner.runAll(vscode.workspace.workspaceFolders[0].uri);
		}
		
	});
	vscode.commands.registerCommand('testOutline.refresh', () => {
		testProvider.refresh();
	});

	vscode.commands.registerCommand('browserSelection.toggleSelection', (treeBrowser) => {
		treeBrowser.toggleSelection();
		browserProvider.refresh();
		context.workspaceState.update("SelectedBrowserList", browserProvider.getBrowserList());
	});

	vscode.workspace.onDidChangeConfiguration((change) => {
		if(change.affectsConfiguration('testlatte')) {
			testProvider.refresh();
		}
	});

	watcher = chokidar.watch('', { ignored: /^\./, persistent: true, ignoreInitial: true });
	watcher
		.on('addDir', function(path) {
			if(path.match('.\/node_modules\/testcafe$')) {
				testProvider.refresh();
			}
		})
		.on('unlinkDir', function(path) {
			if(path.match('.\/node_modules\/testcafe$')) {
				testProvider.refresh();
			}
		});

	if(vscode.workspace.workspaceFolders) {
		for (const folder of vscode.workspace.workspaceFolders) {
			watcher.add(folder.uri.fsPath);
		}
	}

	vscode.workspace.onDidChangeWorkspaceFolders(async (changed) => {
		testProvider.refresh();
		for (const folder of changed.added) {
			watcher.add(folder.uri.fsPath);
		}

		for (const folder of changed.removed) {
			await watcher.unwatch(folder.uri.fsPath);
		}
	});
	
}

// this method is called when your extension is deactivated
export async function deactivate() {
	await watcher.close();
}
