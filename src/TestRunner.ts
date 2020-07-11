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
        let browserArg: string = '';
        let firstBrowser = true;

        this.browserList.forEach(element => {
            if(!firstBrowser)
            {
                browserArg += ',';
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
                testArguments.push('--fixture');
            }
            else {
                testArguments.push('--test');
            }

            testArguments.push(testItem.label);
        }     

        return testArguments;
    }

    private getCustomArguments(folderUri: vscode.Uri) : string[] {
        let customArguments: string[] = [];

        let configuredCustomArguments = vscode.workspace.getConfiguration('testlatte', vscode.workspace.getWorkspaceFolder(folderUri)).get('customArguments');
        if(typeof(configuredCustomArguments) === 'string') {
            customArguments = customArguments.concat((<string>configuredCustomArguments).split(' '));
        }

        return customArguments;
    }

    private executeTest(args: string, folderUri: vscode.Uri) {
        let testcafeTerminal: vscode.Terminal | undefined = undefined;
        for (const terminal of vscode.window.terminals) {
            if(terminal.name === 'Testcafe') { 
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

        let commandLine: string = `cd ${folderUri.fsPath}; npx --no-install ${Util.getTestcafePath(vscode.workspace.getWorkspaceFolder(folderUri))} ${args}`;

        testcafeTerminal.show();
        testcafeTerminal.sendText(commandLine, true);
    }

    private executeDebug(testArguments: string[], folderUri: vscode.Uri) {
        vscode.debug.startDebugging(vscode.workspace.getWorkspaceFolder(folderUri), {
            name: 'Run Test Testcafe',
            request: 'launch',
            type: 'node',
            protocol: 'inspector',
            program: Util.getTestcafePath(vscode.workspace.getWorkspaceFolder(folderUri)),
            console: 'integratedTerminal',
            cwd: '${workspaceFolder}',
            args: testArguments
        });
    }

    public runTest(testItem: TestItem) {    
        let listArguments: string[] = [this.getBrowserArg()];
        listArguments = listArguments.concat(this.getTestArguments(testItem));
        listArguments = listArguments.concat(this.getCustomArguments(testItem.folderUri));

        let testArguments:string = listArguments.map(i => {
            if(i.indexOf(' ') >= 0) {
                return (`"${i}"`);
            }
            return (i);            
        }).join(' ');

        this.executeTest(testArguments, testItem.folderUri);        
    }

    public runAll(folderUri: vscode.Uri) {
        let testcafeArguments: string[] = [this.getBrowserArg(), Util.getFullworkspaceFilePath(vscode.workspace.getWorkspaceFolder(folderUri), Util.getConfiguredFilePath(vscode.workspace.getWorkspaceFolder(folderUri)))];
        testcafeArguments = testcafeArguments.concat(this.getCustomArguments(folderUri));

        let testArguments:string = testcafeArguments.map(i => {
            if(i.indexOf(' ') >= 0) {
                return (`"${i}"`);
            }
            return (i);            
        }).join(' ');

        this.executeTest(testArguments, folderUri);  
    }

    public debugTest(testItem: TestItem) { 
        let testcafeArguments: string[] = [this.getBrowserArg()];
        testcafeArguments = testcafeArguments.concat(this.getTestArguments(testItem));
        testcafeArguments = testcafeArguments.concat(this.getCustomArguments(testItem.folderUri));

        this.executeDebug(testcafeArguments, testItem.folderUri);
    }

    public debugAll(folderUri: vscode.Uri) {
        let testcafeArguments: string[] = [this.getBrowserArg(), Util.getFullworkspaceFilePath(vscode.workspace.getWorkspaceFolder(folderUri), Util.getConfiguredFilePath(vscode.workspace.getWorkspaceFolder(folderUri)))];
        testcafeArguments = testcafeArguments.concat(this.getCustomArguments(folderUri));

        this.executeDebug(testcafeArguments, folderUri);
    }
}