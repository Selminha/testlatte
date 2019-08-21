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

        this.setCursorPosition.bind(this);
    }

    public openTest() {
        vscode.workspace.openTextDocument(this.filepath).then(doc => {
            vscode.window.showTextDocument(doc).then(textEditor => {
                this.setCursorPosition(textEditor);
            });            
        });
    }

    public setCursorPosition(textEditor: vscode.TextEditor) {
        if(textEditor) {
            let position = new vscode.Position(this.testCafeData.loc.start.line,0);
            let selection = new vscode.Selection(position, position);
            textEditor.selection = selection;
            let range = textEditor.document.lineAt(this.testCafeData.loc.start.line-1).range;
            textEditor.revealRange(range, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
        }
    }
     
}
