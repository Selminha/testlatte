import * as vscode from 'vscode';
import TreeTest from './TreeTest';
import Util from './Util';

export default class TestProvider implements vscode.TreeDataProvider<TreeTest> {
    private _onDidChangeTreeData: vscode.EventEmitter<TreeTest> = new vscode.EventEmitter<TreeTest>();
    readonly onDidChangeTreeData: vscode.Event<TreeTest> = this._onDidChangeTreeData.event;

    constructor() {
    }
 
    // super class methods

    public async getChildren(test?: TreeTest): Promise<TreeTest[]> {      
  
        let treeTests: TreeTest[] = [];
        
        if (test) {
            if (!test.isFixture()) {
                // nothing to return
                return Promise.resolve([] as TreeTest[]);
            }

            return Promise.resolve(test.testChildren);
        }
        else {
            let filePath: string = Util.getConfiguredFilePath();
            
            let fileListPath = await this.getFileListPath(filePath);
            for (const file of fileListPath) {
                let listTest = await this.getTests(file);
                for (const testCafeData of listTest) {
                    treeTests.push(new TreeTest(testCafeData.name,vscode.TreeItemCollapsibleState.Collapsed, testCafeData, file));
                }
            }
        }    
        
        return Promise.resolve(treeTests);
 
    }
  
    public getTreeItem(test: TreeTest): vscode.TreeItem {
        return test;
    }

    // Class methods

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

    private async getTests(file: string): Promise<any[]> {
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

    public refresh () {
        this._onDidChangeTreeData.fire();
    }
}

