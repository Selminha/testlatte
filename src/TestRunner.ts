import * as vscode from 'vscode';
import BrowserProvider from './BrowserProvider';
import TestItem from './TestItem';
import Util from './Util';

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

    private getTestArguments(testItem: TestItem): string[] {
        let testArguments: string[] = [testItem.filepath];

        if(testItem.label) {
            if(testItem.isFixture()) {
                testArguments.push("--fixture");
            }
            else {
                testArguments.push("--test");
            }

            testArguments.push(testItem.label);
        }     

        return testArguments;
    }

    private getCustomArguments() : string[] {
        let customArguments: string[] = [];

        let configuredCustomArguments = vscode.workspace.getConfiguration("testlatte").get("customArguments");
        if(typeof(configuredCustomArguments) === "string") {
            customArguments = customArguments.concat((<string>configuredCustomArguments).split(" "));
        }

        return customArguments;
    }

    private executeTest(args: string, folderUri: vscode.Uri) {
        let testcafeTerminal: vscode.Terminal | undefined = undefined;
        for (const terminal of vscode.window.terminals) {
            if(terminal.name === "Testcafe") { 
                testcafeTerminal = terminal;
            }  
        }

        if(!testcafeTerminal) {
            let terminalOptions: vscode.TerminalOptions = {
                cwd: folderUri,
                name: 'Testcafe'
            };

            testcafeTerminal = vscode.window.createTerminal(terminalOptions);
        }

        let commandLine: string = 'npx --no-install testcafe ' + args;

        testcafeTerminal.show();
        testcafeTerminal.sendText(commandLine, true);
    }

    private executeDebug(testArguments: string[]) {
        let workspaceFolder = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0] : undefined;

        vscode.debug.startDebugging(workspaceFolder, {
            name: "Run Test Testcafe",
            request: "launch",
            type: "node",
            protocol: "inspector",
            program: "${workspaceRoot}/node_modules/testcafe/bin/testcafe.js",
            console: "integratedTerminal",
            cwd: "${workspaceRoot}",
            args: testArguments
        });
    }

    public runTest(testItem: TestItem) {    
        let listArguments: string[] = [this.getBrowserArg()];
        listArguments = listArguments.concat(this.getTestArguments(testItem));
        listArguments = listArguments.concat(this.getCustomArguments());

        let testArguments:string = listArguments.map(i => {
            if(i.indexOf(' ') >= 0) {
                return (`"${i}"`);
            }
            return (i);            
        }).join(' ');

        this.executeTest(testArguments, testItem.folderUri);        
    }

    public runAll() {
        let testcafeArguments: string[] = [this.getBrowserArg(), Util.getConfiguredFilePath()];
        testcafeArguments = testcafeArguments.concat(this.getCustomArguments());

        let testArguments:string = testcafeArguments.map(i => {
            if(i.indexOf(' ') >= 0) {
                return (`"${i}"`);
            }
            return (i);            
        }).join(' ');

        //this.executeTest(testArguments);  
    }

    public debugTest(treeTest: TestItem) { 
        let testcafeArguments: string[] = [this.getBrowserArg()];
        testcafeArguments = testcafeArguments.concat(this.getTestArguments(treeTest));
        testcafeArguments = testcafeArguments.concat(this.getCustomArguments());

        this.executeDebug(testcafeArguments);
    }

    public debugAll() {
        let testcafeArguments: string[] = [this.getBrowserArg(), Util.getConfiguredFilePath()];
        testcafeArguments = testcafeArguments.concat(this.getCustomArguments());

        this.executeDebug(testcafeArguments);
    }
}