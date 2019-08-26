import * as vscode from 'vscode';
import * as path from 'path';

export default class TreeBrowser extends vscode.TreeItem {
    constructor(
        label: string, 
        collapsibleState: vscode.TreeItemCollapsibleState,
    ) {
        super(label, collapsibleState);
    }

    public iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'light', 'refresh.svg'),
		dark: path.join(__filename, '..', '..', 'resources', 'dark', 'refresh.svg')
	};
}
