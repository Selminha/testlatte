import * as vscode from 'vscode';
import TreeTest from './TreeTest';
import Util from './Util';

export default class TestProvider implements vscode.TreeDataProvider<TreeTest> {
    private testList: TreeTest[] = [];
    private _onDidChangeTreeData: vscode.EventEmitter<TreeTest> = new vscode.EventEmitter<TreeTest>();
    readonly onDidChangeTreeData: vscode.Event<TreeTest> = this._onDidChangeTreeData.event;

    constructor() {
    }
 
    // super class methods

    public async getChildren(test?: TreeTest): Promise<TreeTest[]> {      

        if (test) {
            if (!test.isFixture()) {
                // nothing to return
                return Promise.resolve([] as TreeTest[]);
            }

            return Promise.resolve(test.testChildren);
        }
                
        return Promise.resolve(this.testList);
 
    }
  
    public getTreeItem(test: TreeTest): vscode.TreeItem {
        return test;
    }

    // Class methods
    private async getTestList(): Promise<TreeTest[]> {
        let treeTestsList: TreeTest[] = [];

        let filePath: string = Util.getConfiguredFilePath();

        let fileListPath = await this.getFileListPath(filePath);
        for (const file of fileListPath) {
            let listTest = await this.getFileTests(file);
            for (const testCafeData of listTest) {
                treeTestsList.push(new TreeTest(testCafeData.name,vscode.TreeItemCollapsibleState.Collapsed, testCafeData, file));
            }
        }

        return Promise.resolve(treeTestsList);
    }

    private async getFileListPath(filePath?: string): Promise<string[]> {
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

    private setPanelVisibility() {
        if(this.testList.length > 0) {
            vscode.commands.executeCommand('setContext', 'foundTestcafeTests', true);
        }
        else {
            vscode.commands.executeCommand('setContext', 'foundTestcafeTests', false);
        }
    }

    public async refresh () {
        await this.fillTestList();
        this.setPanelVisibility();
        this._onDidChangeTreeData.fire();
    }

    public async startProvider() {
        await this.fillTestList();
        this.setPanelVisibility();
    }
}

