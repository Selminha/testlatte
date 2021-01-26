import * as vscode from 'vscode';
import { ITest, IFixture } from './TestDefinition';

export default class SearchTests {
    private workspaceFoldersTest : Map<string, Map<string, Promise<Array<ITest|IFixture>>> | undefined> = new Map();

    constructor() {
        if(vscode.workspace.workspaceFolders == undefined) {
            return;
        }

        for (const folder of vscode.workspace.workspaceFolders) {
            this.workspaceFoldersTest.set(folder.name, undefined);
        }
    }

    private dataToTest(data:any) : IFixture|ITest {
        if(data.tests) {
            let fixture: IFixture|ITest;
            fixture = {
                testName: data.name,
                filePath: data.filePath,
                startLine: data.loc.start.line,
                testChildren: (() => { 
                    let tests = new Array<ITest>();
                    for(const test of data.tests) {
                        tests.push(this.dataToTest(test));
                    }
                    return tests;
                })(),
            } as IFixture;
            
            return fixture;
        }

        let test = {
            testName: data.name,
            filePath: data.filePath,
            startLine: data.loc.start.line
        } as ITest;

        return test;
    }

    private convertData(dataList: any[]) : Array<IFixture|ITest> {
        let fileData = new Array<IFixture|ITest>();
        for(const data of dataList) {
            fileData.push(this.dataToTest(data));
        }

        return fileData;
    }

    public async getFileTests(wokspaceFolder: string, file: string): Promise<Array<ITest|IFixture> | undefined> {
        let workspace = this.workspaceFoldersTest.get(wokspaceFolder);
        if((workspace != undefined) && (workspace.get(file) != undefined)){
            return workspace.get(file);
        }
        
        let embeddingUtils = require('testcafe').embeddingUtils;

        let testList = undefined;

        let path = require('path');
        let extension = path.extname(file);
        try {
            if(extension === '.ts') {
                testList = await embeddingUtils.getTypeScriptTestList(file).then((result: any[]) => {
                    return this.convertData(result);
                });

                workspace?.set(file, testList);
                
            }
            else {
                testList = await embeddingUtils.getTypeScriptTestList(file).then((result: any[]) => {
                    return this.convertData(result);
                });

                workspace?.set(file, testList);
            }
        }
        catch(e) {
            console.log(e);
        }

        return Promise.resolve(testList);
    }
}