import * as vscode from 'vscode';
import BrowserProvider from './BrowserProvider';
import Treetest from './TreeTest';
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

    private getTestArguments(treeTest: Treetest): string[] {
        let testArguments: string[] = [treeTest.filepath];

        if(treeTest.label) {
            if(treeTest.isFixture()) {
                testArguments.push("--fixture");
            }
            else {
                testArguments.push("--test");
            }

            testArguments.push(treeTest.label);
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

    private executeTest(args: string) {
        let testcafeTerminal: vscode.Terminal | undefined = undefined;
        for (const terminal of vscode.window.terminals) {
            if(terminal.name === "Testcafe") { 
                testcafeTerminal = terminal;
            }  
        }

        if(!testcafeTerminal) {
            testcafeTerminal = vscode.window.createTerminal('Testcafe');
        }

        let commandLine: string = 'npx --no-install testcafe ' + args;

        testcafeTerminal.show();
        testcafeTerminal.sendText(commandLine, true);
    }

    public runTest(treeTest: Treetest) {    
        let listArguments: string[] = [this.getBrowserArg()];
        listArguments = listArguments.concat(this.getTestArguments(treeTest));
        listArguments = listArguments.concat(this.getCustomArguments());

        let testArguments:string = listArguments.map(i => {
            if(i.indexOf(' ') >= 0) {
                return (`"${i}"`);
            }
            return (i);            
        }).join(' ');

        this.executeTest(testArguments);        
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

        this.executeTest(testArguments);  
    }

    public debugTest(treeTest: Treetest) { 
        let workspaceFolder = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0] : undefined;

        let testcafeArguments: string[] = [this.getBrowserArg()];
        testcafeArguments = testcafeArguments.concat(this.getTestArguments(treeTest));
        testcafeArguments = testcafeArguments.concat(this.getCustomArguments());

        vscode.debug.startDebugging(workspaceFolder, {
            name: "Run Test Testcafe",
            request: "launch",
            type: "node",
            protocol: "inspector",
            program: "${workspaceRoot}/node_modules/testcafe/bin/testcafe.js",
            console: "integratedTerminal",
            cwd: "${workspaceRoot}",
            args: testcafeArguments
        });
    }
}