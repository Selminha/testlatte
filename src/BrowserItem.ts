import * as vscode from 'vscode';

export default class BrowserItem extends vscode.TreeItem {
    
    public selected: boolean;
    private selectedIcon: vscode.ThemeIcon = new vscode.ThemeIcon('check');  
    private notSelectedIcon: vscode.ThemeIcon = new vscode.ThemeIcon('circle-slash');

    constructor(
        label: string, 
        collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);

        this.selected = false;
        this.command =  {
            command: 'browserSelection.toggleSelection', 
            title: 'Select', 
            arguments: [this, ]
        };
        
        this.iconPath  = this.notSelectedIcon;
    }

    public toggleSelection() {
        this.selected = !this.selected;
        if(this.selected) {
            this.iconPath = this.selectedIcon;
        }
        else {
            this.iconPath = this.notSelectedIcon;
        }
    }
}
