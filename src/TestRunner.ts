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

            testArguments.push(Util.instanceOfTreeItemLabel(testItem.label) ? testItem.label.label : testItem.label);
        }     

        return testArguments;
    }

    private getCustomArguments(folder: vscode.WorkspaceFolder) : string[] {
        let customArguments: string[] = [];

        let configuredCustomArguments = vscode.workspace.getConfiguration('testlatte', folder).get('customArguments');
        if(typeof(configuredCustomArguments) === 'string') {
            customArguments = customArguments.concat((<string>configuredCustomArguments).split(' '));
        }

        return customArguments;
    }

    private executeTest(args: string, folder: vscode.WorkspaceFolder) {
        let testcafeTerminal: vscode.Terminal | undefined = undefined;
        for (const terminal of vscode.window.terminals) {
            if(terminal.name === 'Testcafe') { 
                testcafeTerminal = terminal;
            }  
        }

        if(!testcafeTerminal) {
            let terminalOptions: vscode.TerminalOptions = {
                cwd: folder.uri.fsPath,
                name: 'Testcafe'
            };

            testcafeTerminal = vscode.window.createTerminal(terminalOptions);
        }

        let commandLine: string = `cd ${folder.uri.fsPath}; npx --no-install ${Util.getTestcafePath(folder)} ${args}`;

        testcafeTerminal.show();
        testcafeTerminal.sendText(commandLine, true);
    }

    private executeDebug(testArguments: string[], folder: vscode.WorkspaceFolder) {
        vscode.debug.startDebugging(folder, {
            name: 'Run Test Testcafe',
            request: 'launch',
            type: 'node',
            protocol: 'inspector',
            program: Util.getTestcafePath(folder),
            console: 'integratedTerminal',
            cwd: '${workspaceFolder}',
            args: testArguments
        });
    }

    public runTest(testItem: TestItem) {    
        let listArguments: string[] = [this.getBrowserArg()];
        listArguments = listArguments.concat(this.getTestArguments(testItem));
        listArguments = listArguments.concat(this.getCustomArguments(testItem.folder));

        let testArguments:string = listArguments.map(i => {
            if(i.indexOf(' ') >= 0) {
                return (`"${i}"`);
            }
            return (i);            
        }).join(' ');

        this.executeTest(testArguments, testItem.folder);        
    }

    public runAll(folder: vscode.WorkspaceFolder) {
        let testcafeArguments: string[] = [this.getBrowserArg(), Util.getFullworkspaceFilePath(folder, Util.getConfiguredFilePath(folder))];
        testcafeArguments = testcafeArguments.concat(this.getCustomArguments(folder));

        let testArguments:string = testcafeArguments.map(i => {
            if(i.indexOf(' ') >= 0) {
                return (`"${i}"`);
            }
            return (i);            
        }).join(' ');

        this.executeTest(testArguments, folder);  
    }

    public debugTest(testItem: TestItem) { 
        let testcafeArguments: string[] = [this.getBrowserArg()];
        testcafeArguments = testcafeArguments.concat(this.getTestArguments(testItem));
        testcafeArguments = testcafeArguments.concat(this.getCustomArguments(testItem.folder));

        this.executeDebug(testcafeArguments, testItem.folder);
    }

    public debugAll(folder: vscode.WorkspaceFolder) {
        let testcafeArguments: string[] = [this.getBrowserArg(), Util.getFullworkspaceFilePath(folder, Util.getConfiguredFilePath(folder))];
        testcafeArguments = testcafeArguments.concat(this.getCustomArguments(folder));

        this.executeDebug(testcafeArguments, folder);
    }
}