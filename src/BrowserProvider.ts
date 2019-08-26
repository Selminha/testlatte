import * as vscode from 'vscode';
import TreeBrowser from './TreeBrowser';

let testcafeBrowserTools = require ('testcafe-browser-tools');

export default class BrowserProvider implements vscode.TreeDataProvider<TreeBrowser> {

    public getChildren(browser?: TreeBrowser): Promise<TreeBrowser[]> { 
        if(browser) {
            Promise.resolve([] as TreeBrowser[]);
        }

        return new Promise((resolve, reject) => {
            testcafeBrowserTools.getInstallations()
            .then((browserList: any) => {
                let treeBrowser: TreeBrowser[] = [];
                for (const browser in browserList) {
                    treeBrowser.push(new TreeBrowser(browser, vscode.TreeItemCollapsibleState.None));
                }
                resolve(treeBrowser);
            });
        });        
    }

    getTreeItem(browser: TreeBrowser): vscode.TreeItem {
        return browser;
    }
}