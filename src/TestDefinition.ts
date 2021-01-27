import * as vscode from 'vscode';

export interface ITest {
    testName: string;
    filePath: string;
    startLine: number;
    folder: vscode.WorkspaceFolder;
}

export interface IFixture extends ITest {
    testChildren: Array<ITest>;
}
