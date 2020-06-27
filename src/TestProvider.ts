import * as vscode from 'vscode';
import TestItem from './TestItem';
import FolderItem from './FolderItem';
import Util from './Util';

export default class TestProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TestItem> = new vscode.EventEmitter<TestItem>();
    readonly onDidChangeTreeData: vscode.Event<TestItem> = this._onDidChangeTreeData.event;

    private _folderList: FolderItem[] = [];

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

        // workspace has only one folder
        if((this._folderList.length == 1) && vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length == 1)) {
            return this._folderList[0].getTestList();
        }

        return Promise.resolve(this._folderList);                 
    }
  
    public getTreeItem(testTreeItem: vscode.TreeItem): vscode.TreeItem {
        return testTreeItem;
    }

    public async refresh () {
        await this.setProvider();
        this._onDidChangeTreeData.fire();
    }

    public async setProvider() {
        await this.fillFolderList();
        vscode.commands.executeCommand('setContext', 'foundTestcafeTests', this._folderList.length > 0);
    }

    private async fillFolderList() {
        this._folderList = [];
        if(vscode.workspace.workspaceFolders) {
            for (const folder of vscode.workspace.workspaceFolders) {
                //only show folders with testcafe installed
                if(await Util.checkFolderForTestcafe(folder.uri.fsPath)) {
                    this._folderList.push(new FolderItem(folder.name, vscode.TreeItemCollapsibleState.Collapsed, folder.uri));
                }
            }
        }
    }
}

