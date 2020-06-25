import * as vscode from 'vscode';

export default class TestItem extends vscode.TreeItem {

    private _filepath: string;
    private _startLine: number;
    private _testChildren: TestItem[];

    public get filepath(): string {
        return this._filepath;
    }

    public get testChildren(): TestItem[] {
        return this._testChildren;
    }
        
    constructor(
        label: string, 
        collapsibleState: vscode.TreeItemCollapsibleState,
        testCafeData: any,
        filepath: string
    ) {
        super(label, collapsibleState);
        this.command =  {
            command: 'testOutline.openTest', 
            title: 'Open', 
            arguments: [this, ]
        };

        this._filepath = filepath;
        this._startLine = testCafeData.loc.start.line;
        this._testChildren = [];
        if(testCafeData.tests) {
            this.createChildrenList(testCafeData);
        }        

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
            let position = new vscode.Position(this._startLine,0);
            let selection = new vscode.Selection(position, position);
            textEditor.selection = selection;
            let range = textEditor.document.lineAt(this._startLine-1).range;
            textEditor.revealRange(range, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
        }
    }     

    public isFixture(): boolean {
        return (this._testChildren.length > 0);
    }

    private createChildrenList(testCafeData: any) {
        for (const testData of testCafeData.tests) {
            this._testChildren.push(new TestItem(testData.name, vscode.TreeItemCollapsibleState.None, testData, this._filepath));
        }
    }
}
