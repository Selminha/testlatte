import * as vscode from 'vscode';
import TreeTest from './TreeTest';

export class TestProvider implements vscode.TreeDataProvider<TreeTest> {
  
    constructor() {
  
    }

    private getFileList(filePath?: string): string[] {
        if(filePath === undefined) {
            return [];
        }

        let fs = require('fs');
        let path = require('path');

        let filelist: string[] = [];

        fs.readdirSync(filePath).forEach((file: string) => {
            let extension = path.extname(file);

            // ignore node_modules
            if(file === 'node_modules') {
                return filelist;
            }

            if(fs.statSync(filePath + '/' + file).isDirectory()) {
                filelist = filelist.concat(this.getFileList(filePath + '/' + file));
            }
            else if ((extension === '.ts') || (extension === '.js')){
                filelist.push(filePath + '/' + file);
            }            
        });

        return filelist;
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
 
    public async getChildren(test?: TreeTest): Promise<TreeTest[]> {      
  
        let treeTests: TreeTest[] = [];
        
        if(test) {
            if(test.testData.tests === undefined) {
                // nothing to return
                return treeTests;
            }

            test.testData.tests.forEach((test: any) => {
                treeTests.push(new TreeTest(test.name, vscode.TreeItemCollapsibleState.None, test));
            });
        }
        else {
            let fileList = this.getFileList(vscode.workspace.rootPath);
            for (const file of fileList) {
                let listTest = await this.getTests(file);
                for (const test of listTest) {
                    treeTests.push(new TreeTest(test.name,vscode.TreeItemCollapsibleState.Collapsed, test));
                }
            }
        }    
        
        return Promise.resolve(treeTests);
 
    }
  
    getTreeItem(test: TreeTest): vscode.TreeItem {
        return test;
    }
}

