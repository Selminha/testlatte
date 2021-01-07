import * as vscode from 'vscode';
import BrowserItem from './BrowserItem';
import Util from './Util';

let testcafeBrowserTools = require ('testcafe-browser-tools');

export default class BrowserProvider implements vscode.TreeDataProvider<BrowserItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<BrowserItem> = new vscode.EventEmitter<BrowserItem>();
    readonly onDidChangeTreeData: vscode.Event<BrowserItem> = this._onDidChangeTreeData.event;

    private treeBrowser: BrowserItem[] = [];

    // super class methods

    public getChildren(browser?: BrowserItem): BrowserItem[] { 
        if(browser) {
            return [];
        }

        return this.treeBrowser;
    }

    public getTreeItem(browser: BrowserItem): vscode.TreeItem {
        return browser;
    }

    // Class methods
    
    public async createBrowserList(selectedBrowser?: string[]) {
        let browserList = await testcafeBrowserTools.getInstallations();
        if(browserList.length <= 0) {
            return;
        }

        for (const browser in browserList) {
            let treeItem: BrowserItem = new BrowserItem(browser, vscode.TreeItemCollapsibleState.None);
            if(selectedBrowser && selectedBrowser.find(element => element === browser)) {
                treeItem.toggleSelection();
            }
            this.treeBrowser.push(treeItem);
        }

        if(!selectedBrowser) {
            // make the first browser the default selection
            this.treeBrowser[0].toggleSelection();
        }
    }

    public refresh(browserItem: BrowserItem) {
        this._onDidChangeTreeData.fire(browserItem);
    }

    public getBrowserList(): (string | undefined)[] {
        let browserList: (string | undefined)[] = [];
        this.treeBrowser.forEach(element => {
            if(element.selected) {
                browserList.push(Util.instanceOfTreeItemLabel(element.label) ? element.label.label : element.label);               
            }                 
        });
        
        return browserList;
    }
}
