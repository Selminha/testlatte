import * as vscode from 'vscode';

export default class TreeTest extends vscode.TreeItem {

    public testCafeData: any;
    public filepath: string;
        
    constructor(
        label: string, 
        collapsibleState: vscode.TreeItemCollapsibleState,
        testCafeData: any,
        filepath: string
    ) {
        super(label, collapsibleState);
        this.testCafeData = testCafeData;
        this.filepath = filepath;
        this.command =  {
            command: 'testOutline.openTest', 
            title: "Open", 
            arguments: [this, ]
        };
    }
     
}
