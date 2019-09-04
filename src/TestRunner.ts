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

    private execute(args: string[]) {
        let workspaceFolder = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0] : undefined;

        let configuredCustomArguments = vscode.workspace.getConfiguration("testlatte").get("customArguments");
        if(typeof(configuredCustomArguments) === "string") {
            args = args.concat((<string>configuredCustomArguments).split(" "));
        }
        
        vscode.debug.startDebugging(workspaceFolder, {
            name: "Run Test Testcafe",
            request: "launch",
            type: "node",
            protocol: "inspector",
            program: "${workspaceRoot}/node_modules/testcafe/bin/testcafe.js",
            console: "integratedTerminal",
            cwd: "${workspaceRoot}",
            args: args
        });
    }

    public runTest(treeTest: Treetest) {    
        let testcafeArguments: string[] = [this.getBrowserArg(), treeTest.filepath];

        if(treeTest.label) {
            if(treeTest.isFixture()) {
                testcafeArguments.push("--fixture");
            }
            else {
                testcafeArguments.push("--test");
            }
    
            testcafeArguments.push(treeTest.label);
        }         
        
        this.execute(testcafeArguments);
    }

    public runAll() {
        let testcafeArguments: string[] = [this.getBrowserArg(), Util.getConfiguredFilePath()];

        this.execute(testcafeArguments);
    }
}