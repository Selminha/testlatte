import * as vscode from 'vscode';
import TestItem from './TestItem';
import FolderItem from './FolderItem';

export default class TestProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<undefined> = new vscode.EventEmitter<undefined>();
    readonly onDidChangeTreeData: vscode.Event<undefined> = this._onDidChangeTreeData.event;

    constructor() {
    }

    // super class methods

    public async getChildren(testTreeItem?: vscode.TreeItem): Promise<vscode.TreeItem[]> {

        if (testTreeItem && (testTreeItem instanceof TestItem)) {
            if (!testTreeItem.isFixture()) {
                // nothing to return
                return Promise.resolve([] as TestItem[]);
            }

            return Promise.resolve(testTreeItem.testChildren);
        }

        if(testTreeItem && testTreeItem instanceof FolderItem) {
            return testTreeItem.getTestList();
        }

        if(testTreeItem) {
            return Promise.resolve([] as vscode.TreeItem[]);
        }

        let folderList: FolderItem[] = [];
        if(!vscode.workspace.workspaceFolders) {
            return Promise.resolve(folderList);
        }

        for (const folder of vscode.workspace.workspaceFolders) {
            folderList.push(new FolderItem(folder.name, vscode.TreeItemCollapsibleState.Collapsed, folder));
        }

        // workspace has only one folder
        if(folderList.length === 1) {
            vscode.commands.executeCommand('setContext', 'singleFolder', true);
            return folderList[0].getTestList();
        }

        vscode.commands.executeCommand('setContext', 'singleFolder', false);

        return Promise.resolve(folderList);
    }

    public getTreeItem(testTreeItem: vscode.TreeItem): vscode.TreeItem {
        return testTreeItem;
    }

    public async refresh () {
        this._onDidChangeTreeData.fire(undefined);
    }
}

