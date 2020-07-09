import * as vscode from 'vscode';
import TestItem from './TestItem';
import FolderItem from './FolderItem';

export default class TestProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TestItem> = new vscode.EventEmitter<TestItem>();
    readonly onDidChangeTreeData: vscode.Event<TestItem> = this._onDidChangeTreeData.event;

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
            return Promise.resolve([] as vscode.TreeItem[])
        }

        if(!vscode.workspace.workspaceFolders) {
            let folderNotFound: vscode.TreeItem[] = [new vscode.TreeItem('You have not yet opened a folder.', vscode.TreeItemCollapsibleState.None)];
            return Promise.resolve(folderNotFound);
        }

        let folderList: FolderItem[] = [];
        for (const folder of vscode.workspace.workspaceFolders) {
            folderList.push(new FolderItem(folder.name, vscode.TreeItemCollapsibleState.Collapsed, folder.uri));
        }

        // workspace has only one folder
        if(folderList.length == 1) {
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
        this._onDidChangeTreeData.fire();
    }
}

