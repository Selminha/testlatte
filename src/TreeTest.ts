import * as vscode from 'vscode';

export default class TreeTest extends vscode.TreeItem {

    public testData: any;
        
    constructor(
        label: string, 
        collapsibleState: vscode.TreeItemCollapsibleState,
        testData: any,
        command?: vscode.Command
    ) {
        super(label, collapsibleState);
        this.testData = testData;
        this.command = command;
    }
     
}
