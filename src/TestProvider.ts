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

        if(vscode.workspace.workspaceFolders /*&& (vscode.workspace.workspaceFolders.length > 1)*/) {
            let folderList: vscode.TreeItem[] = [];
            for (const folder of vscode.workspace.workspaceFolders) {
                folderList.push(new FolderItem(folder.name, vscode.TreeItemCollapsibleState.Collapsed, folder.uri));
            }

            return Promise.resolve(folderList);
        }

        return Promise.resolve([]);
                 
    }
  
    public getTreeItem(testTreeItem: vscode.TreeItem): vscode.TreeItem {
        return testTreeItem;
    }

    public async refresh () {
        this._onDidChangeTreeData.fire();
    }
}

