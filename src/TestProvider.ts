import * as vscode from 'vscode';
import TestItem from './TestItem';
import FolderItem from './FolderItem';

export default class TestProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private testList: TestItem[] = [];
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

    // Class methods
    private async getTestList(): Promise<TestItem[]> {
        let treeTestsList: TestItem[] = [];

        let fileListPath = await this.getFileListPath();
        for (const file of fileListPath) {
            let listTest = await this.getFileTests(file);
            for (const testCafeData of listTest) {
                treeTestsList.push(new TestItem(testCafeData.name,vscode.TreeItemCollapsibleState.Collapsed, testCafeData, file));
            }
        }

        return Promise.resolve(treeTestsList);
    }

    private async getFileListPath(): Promise<string[]> {
        let fileListPath: string[] = [];

        if(!vscode.workspace.workspaceFolders) {
            return Promise.resolve(fileListPath);
        }

        let configuredPath: string | undefined = vscode.workspace.getConfiguration('testlatte').get('filePath');
        let relativePattern: vscode.RelativePattern = new vscode.RelativePattern(vscode.workspace.workspaceFolders[0], configuredPath + '**/*.{ts,js}');
        let fileList = await vscode.workspace.findFiles(relativePattern, 'node_modules');
        for (const file of fileList) {
            fileListPath.push(file.fsPath);
        }

        return Promise.resolve(fileListPath);
    }

    private async getFileTests(file: string): Promise<any[]> {
        let embeddingUtils = require('testcafe').embeddingUtils;
        let testList;
        let path = require('path');
        let extension = path.extname(file);
        if(extension === '.ts') {
            testList = embeddingUtils.getTypeScriptTestList(file).then((res: any) => {  
                return res;
            });
        }
        else {
            testList = embeddingUtils.getTestList(file).then((res: any) => {  
                return res;
            });
        }

        return testList;
    }

    private async fillTestList() {
        this.testList = await this.getTestList();
    }

    public async refresh () {
        await this.fillTestList();
        this._onDidChangeTreeData.fire();
    }

    public async startProvider() {
        await this.fillTestList();
    }
}

