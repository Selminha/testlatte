import * as vscode from 'vscode';
import BrowserProvider from './BrowserProvider';
import Treetest from './TreeTest';

export default class TestRunner {
    private browserList: (string | undefined)[];

    constructor(browserProvider: BrowserProvider) {
        this.browserList = browserProvider.getBrowserList();
    }

    private getBrowserArg(): string {
        let browserArg: string = "";
        let firstBrowser = true;

        this.browserList.forEach(element => {
            if(!firstBrowser)
            {
                browserArg += ",";
            }
            firstBrowser = false;
            browserArg = browserArg + element;
        });

        return browserArg;
    }

    public runTest(treeTest: Treetest) {    
        var workspaceFolder = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0] : undefined;
        vscode.debug.startDebugging(workspaceFolder, {
            name: "Run Test Testcafe",
            request: "launch",
            type: "node",
            protocol: "inspector",
            program: "${workspaceRoot}/node_modules/testcafe/bin/testcafe.js",
            console: "integratedTerminal",
            cwd: "${workspaceRoot}",
            args: [
                this.getBrowserArg(),
                treeTest.filepath
            ]
        });
    }
}