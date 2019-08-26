// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import TestProvider from './TestProvider';
import BrowserProvider from './BrowserProvider';

export async function activate(context: vscode.ExtensionContext) {
    const testProvider = new TestProvider();
	vscode.window.registerTreeDataProvider('testOutline', testProvider);

	const browserProvider = new BrowserProvider();
	vscode.window.registerTreeDataProvider('browserSelection', browserProvider);

	vscode.commands.registerCommand('testOutline.openTest', async treeTest => {
		treeTest.openTest();
		await vscode.window.showQuickPick(['explorer', 'search', 'scm', 'debug', 'extensions'], { placeHolder: 'Select the view to show when opening a window.' });
	});
}


// this method is called when your extension is deactivated
export function deactivate() {}
