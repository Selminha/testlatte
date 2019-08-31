import * as vscode from 'vscode';
import * as path from 'path';
import BrowserProvider from './BrowserProvider';

export default class TreeBrowser extends vscode.TreeItem {
    
    private selectedIconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'light', 'icons8-caixa-de-seleção-marcada-24.png'),
		dark: path.join(__filename, '..', '..', 'resources', 'dark', 'icons8-caixa-de-seleção-marcada-24.png')
    };

    private notSelectedIconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'light', 'icons8-caixa-de-seleção-desmarcada-24.png'),
		dark: path.join(__filename, '..', '..', 'resources', 'dark', 'icons8-caixa-de-seleção-desmarcada-24.png')
    };

    public selected: boolean;
    public iconPath = this.notSelectedIconPath;  
    public providerParent:  BrowserProvider; 

    constructor(
        label: string, 
        collapsibleState: vscode.TreeItemCollapsibleState,
        providerParent: BrowserProvider
    ) {
        super(label, collapsibleState);
        this.providerParent = providerParent;
        this.selected = false;
        this.command =  {
            command: 'browserSelection.toggleSelection', 
            title: 'Select', 
            arguments: [this, ]
        };
    }

    public toggleSelection() {
        this.selected = !this.selected;
        if(this.selected) {
            this.iconPath = this.selectedIconPath;
        }
        else {
            this.iconPath = this.notSelectedIconPath;
        }
    }
}
