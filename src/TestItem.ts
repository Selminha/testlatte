import * as vscode from 'vscode';
import { IFixture, ITest } from './TestDefinition';

export default class TestItem extends vscode.TreeItem {

    private _testChildren: TestItem[];

    public testData: IFixture|ITest;
    public folder: vscode.WorkspaceFolder;

    public get testChildren(): TestItem[] {
        return this._testChildren;
    }
        
    constructor(
        label: string, 
        collapsibleState: vscode.TreeItemCollapsibleState,
        testCafeData: IFixture|ITest,
        folder: vscode.WorkspaceFolder
    ) {
        super(label, collapsibleState);

        this.testData = testCafeData;

        this.command =  {
            command: 'testOutline.openTest', 
            title: 'Open', 
            arguments: [this, ]
        };

        this._testChildren = [];
        this.folder = folder;
        
        if((testCafeData as IFixture).testChildren) {
            this.createChildrenList(testCafeData as IFixture);
        }        

        this.setCursorPosition.bind(this);
        this.contextValue = 'TestItem';
    }

    public openTest() {
        vscode.workspace.openTextDocument(this.testData.filePath).then(doc => {
            vscode.window.showTextDocument(doc).then(textEditor => {
                this.setCursorPosition(textEditor);
            });            
        });
    }

    public setCursorPosition(textEditor: vscode.TextEditor) {
        if(textEditor) {
            let position = new vscode.Position(this.testData.startLine-1,0);
            let selection = new vscode.Selection(position, position);
            textEditor.selection = selection;
            let range = textEditor.document.lineAt(this.testData.startLine-1).range;
            textEditor.revealRange(range, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
        }
    }     

    public isFixture(): boolean {
        return (this._testChildren.length > 0);
    }

    private createChildrenList(testCafeData: IFixture) {
        for (const testData of testCafeData.testChildren) {
            this._testChildren.push(new TestItem(testData.testName, vscode.TreeItemCollapsibleState.None, testData, this.folder));
        }
    }
}
