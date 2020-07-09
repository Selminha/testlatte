// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import TestProvider from './TestProvider';
import BrowserProvider from './BrowserProvider';
import TestRunner from './TestRunner';
import { Util } from './Util';

// TODO add exclude folder configuration

export async function activate(context: vscode.ExtensionContext) {

	const browserProvider = new BrowserProvider();
	await browserProvider.createBrowserList(context.workspaceState.get("SelectedBrowserList"));
	context.workspaceState.update("SelectedBrowserList", browserProvider.getBrowserList());
	vscode.window.registerTreeDataProvider('browserSelection', browserProvider);

	const testProvider = new TestProvider();
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

	vscode.workspace.onDidChangeWorkspaceFolders(() => {
		testProvider.refresh();
	});

}

// this method is called when your extension is deactivated
export async function deactivate() {
}
