// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as child_process from 'child_process'; 
import TestProvider from './TestProvider';
import BrowserProvider from './BrowserProvider';
import TestRunner from './TestRunner';

// TODO activate extension only when find tests
// TODO make it work with multi root workspace
// TODO add exclude folder configuration

export async function activate(context: vscode.ExtensionContext) {
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

	// let fileSystemWatcher: vscode.FileSystemWatcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(vscode.workspace.rootPath, *.*), )
	// vscode.workspace.onDidSaveTextDocument(function() {
	// 	testProvider.refresh();
	// });
}


// this method is called when your extension is deactivated
export function deactivate() {}
