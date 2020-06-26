// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import TestProvider from './TestProvider';
import BrowserProvider from './BrowserProvider';
import TestRunner from './TestRunner';
import Util from './Util';

// TODO add exclude folder configuration

function setPanelVisibility(show: boolean) {
	if(show) {
		vscode.commands.executeCommand('setContext', 'foundTestcafeTests', true);
		return;
	}

	vscode.commands.executeCommand('setContext', 'foundTestcafeTests', false);	
}

let folderWatcher: Map<string, fs.FSWatcher> = new Map();

function setFolderWatcher(folder: vscode.WorkspaceFolder) {
	let watcher: fs.FSWatcher = fs.watch(folder.uri.fsPath, async (eventType, filename) => {
		if(filename === 'package.json') {
			setPanelVisibility(await Util.checkAllFoldersForTestcafe());
		}
	});

	folderWatcher.set(folder.name, watcher);
}

export async function activate(context: vscode.ExtensionContext) {

	setPanelVisibility(await Util.checkAllFoldersForTestcafe());
	
	const browserProvider = new BrowserProvider();
	await browserProvider.createBrowserList(context.workspaceState.get("SelectedBrowserList"));
	context.workspaceState.update("SelectedBrowserList", browserProvider.getBrowserList());
	vscode.window.registerTreeDataProvider('browserSelection', browserProvider);
	
	const testProvider = new TestProvider();
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

	vscode.workspace.onDidChangeWorkspaceFolders(async (changed) => {
		setPanelVisibility(await Util.checkAllFoldersForTestcafe());
		for (const folder of changed.added) {
			setFolderWatcher(folder);
		}

		for (const folder of changed.removed) {
			let watcher = folderWatcher.get(folder.name);
			if(watcher) {
				watcher.close();
				folderWatcher.delete(folder.name);
			}
		}
	});

	if(vscode.workspace.workspaceFolders) {
		for (const folder of vscode.workspace.workspaceFolders) {
			setFolderWatcher(folder);
		}
	}
	
}


// this method is called when your extension is deactivated
export function deactivate() {
	for(const folder of folderWatcher.values()) {
		folder.close();
	}
}
