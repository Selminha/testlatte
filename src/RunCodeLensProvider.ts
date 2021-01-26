import * as vscode from 'vscode';
import SearchTests from "./SearchTests";
import { ITest, IFixture } from './TestDefinition';

export default class RunCodeLensProvider implements vscode.CodeLensProvider {
    public static docSelector = [ {
            language: 'javascript',
            scheme: 'file',
        },
        {
            language: 'typescript',
            scheme: 'file',
        }
    ];

    public debugCommand: vscode.Command = {
        command: 'testOutline.debugTest',
        title: 'Debug',
    };

    public runCommand: vscode.Command = {
        command: 'testOutline.runTest',
        title: 'Run',
    };

    private searchTests: SearchTests;

    constructor(
        searchTests: SearchTests
    ) {
        this.searchTests = searchTests;
    }

    private createCodeLens(test: IFixture | ITest): vscode.CodeLens[] {
        let DebugPosition = new vscode.Range(test.startLine-1, 0, test.startLine-1, this.debugCommand.title.length);
        let runPosition = new vscode.Range(test.startLine-1, this.debugCommand.title.length, test.startLine-1, this.debugCommand.title.length + this.runCommand.title.length);
        return [new vscode.CodeLens(DebugPosition, this.debugCommand), new vscode.CodeLens(runPosition, this.runCommand)];
    }

    private createTestCodeLens(test: IFixture | ITest): vscode.CodeLens[] {
        let codeLens = this.createCodeLens(test);
        let fixture = test as IFixture;
        if(fixture.testChildren != undefined) {
            for (const children of fixture.testChildren) {
                codeLens = codeLens.concat(this.createCodeLens(children));
            }
        }

        return codeLens;        
    }

    public async provideCodeLenses(document: vscode.TextDocument): Promise<vscode.CodeLens[]> {
        let codeLens = new Array<vscode.CodeLens>();
        let workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
        if(workspaceFolder === undefined) {
            return Promise.resolve(codeLens);
        }
        let tests = await this.searchTests.getFileTests(workspaceFolder.name, document.fileName);
        if(tests === undefined) {
            return Promise.resolve(codeLens);
        }

        for (const test of tests) {
            codeLens = codeLens.concat(this.createTestCodeLens(test));
        }

        return Promise.resolve(codeLens);
    }
}