import * as vscode from 'vscode';
import { ITest, IFixture } from './TestDefinition';

export default class SearchTests {
    private workspaceFoldersTest : Map<vscode.WorkspaceFolder, Map<string, Promise<Array<ITest|IFixture>>> | undefined> = new Map();

    constructor() {
        if(vscode.workspace.workspaceFolders == undefined) {
            return;
        }

        for (const folder of vscode.workspace.workspaceFolders) {
            this.workspaceFoldersTest.set(folder, undefined);
        }
    }

    private dataToTest(data:any, filePath: string, folder: vscode.WorkspaceFolder) : IFixture|ITest {
        let test = {
            testName: data.name,
            filePath: filePath,
            startLine: data.loc.start.line, 
            folder: folder
        };

        if(data.tests) {
            (test as IFixture).testChildren = (() => { 
                let tests = new Array<ITest>();
                for(const test of data.tests) {
                    tests.push(this.dataToTest(test, filePath, folder));
                }
                return tests;
            })();
        }

        return test;
    }

    private convertData(dataList: any[], filePath: string, folder: vscode.WorkspaceFolder) : Array<IFixture|ITest> {
        let fileData = new Array<IFixture|ITest>();
        for(const data of dataList) {
            fileData.push(this.dataToTest(data, filePath, folder));
        }

        return fileData;
    }

    public async getFileTests(wokspaceFolder: vscode.WorkspaceFolder, file: string): Promise<Array<ITest|IFixture> | undefined> {
        let workspace : Map<string, Promise<Array<ITest|IFixture>>> | undefined = this.workspaceFoldersTest.get(wokspaceFolder);
        if((workspace != undefined) && (workspace.get(file) != undefined)){
            return workspace.get(file);
        }
        else if (workspace === undefined){
            workspace = new Map();
            this.workspaceFoldersTest.set(wokspaceFolder, workspace);
        }
        
        let testList = undefined;

        let path = require('path');
        let extension = path.extname(file);
        try {
            let embeddingUtils = require('testcafe').embeddingUtils;
            let functionGetTests = (extension === '.ts') ? embeddingUtils.getTypeScriptTestList : embeddingUtils.getTestList;

            testList = await functionGetTests(file).then((result: any[]) => {
                return this.convertData(result, file,wokspaceFolder);
            });

            workspace.set(file, testList);
        }
        catch(e) {
            console.log(e);
        }

        return Promise.resolve(testList);
    }
}