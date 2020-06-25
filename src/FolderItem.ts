import * as vscode from 'vscode';

export default class FolderItem extends vscode.TreeItem {
    private _uri: vscode.Uri;

    constructor (
        label: string, 
        collapsibleState: vscode.TreeItemCollapsibleState,
        uri: vscode.Uri
    ) {
        super(label, collapsibleState);
        this._uri = uri
    }
}