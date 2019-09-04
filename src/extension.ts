// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import TestProvider from './TestProvider';
import BrowserProvider from './BrowserProvider';
import TestRunner from './TestRunner';

export async function activate(context: vscode.ExtensionContext) {
	const browserProvider = new BrowserProvider();
	await browserProvider.createBrowserList();
	vscode.window.registerTreeDataProvider('browserSelection', browserProvider);
	
    const testProvider = new TestProvider();
	vscode.window.registerTreeDataProvider('testOutline', testProvider);

	vscode.commands.registerCommand('testOutline.openTest', treeTest => {
		treeTest.openTest();
	});
	vscode.commands.registerCommand('testOutline.runTest', treeTest => {
		treeTest.openTest();
		let testRunner: TestRunner = new TestRunner(browserProvider);
		testRunner.runTest(treeTest);
	});
	vscode.commands.registerCommand('testOutline.runAll', () => {
		let testRunner: TestRunner = new TestRunner(browserProvider);
		testRunner.runAll();
	});

	vscode.commands.registerCommand('browserSelection.toggleSelection', function(treeBrowser) {
		treeBrowser.toggleSelection();
		browserProvider.refresh();
	});

	vscode.workspace.onDidChangeConfiguration(function (change) {
		if(change.affectsConfiguration('testlatte')) {
			testProvider.refresh();
		}
	});
}


// this method is called when your extension is deactivated
export function deactivate() {}
