// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { TestProvider } from './TestProvider';

export async function activate(context: vscode.ExtensionContext) {
    const testProvider = new TestProvider();
	vscode.window.registerTreeDataProvider('testOutline', testProvider);

	vscode.commands.registerCommand('testOutline.openTest', task => {
		vscode.tasks.executeTask(task).then(function (value) {
			return value;
		}, function(e) {
			console.error('Error');
		});
	});
}


// this method is called when your extension is deactivated
export function deactivate() {}
