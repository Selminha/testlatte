import * as vscode from 'vscode';
import SearchTests from './SearchTests';
import TestItem from './TestItem';
import Util from './Util';

interface FileTests {
    filePath: string;
    testsData: any[];
}

export default class FolderItem extends vscode.TreeItem {
    public folder: vscode.WorkspaceFolder;

    private searchTests: SearchTests;

    constructor (
        label: string,
        collapsibleState: vscode.TreeItemCollapsibleState,
        folder: vscode.WorkspaceFolder,
        searchTests: SearchTests
    ) {
        super(label, collapsibleState);
        this.folder = folder;
        this.contextValue = 'FolderItem';
        this.searchTests = searchTests;
    }

    public getTestList(): Promise<vscode.TreeItem[]> {
        return new Promise ((resolve) => {
            this.getFilePaths().then(
                result =>  {
                    var promises = [];
                    for (const file of result) {
                        promises.push(this.searchTests.getFileTests(this.folder.name, file.fsPath));
                    }
                    Promise.all(promises).then(
                        result => {
                            let foundTest = false;

                            let testList: vscode.TreeItem[] = [];
                            for (const testsData of result) {
                                if(testsData === undefined) {
                                    continue;
                                }

                                for(const test of testsData) {
                                    foundTest = true;
                                    testList.push(new TestItem(test.testName,vscode.TreeItemCollapsibleState.Collapsed, test, this.folder));
                                }
                            }
                            if(!foundTest) {
                                let notFoundList: vscode.TreeItem[] = [new vscode.TreeItem('No test found.', vscode.TreeItemCollapsibleState.None)];
                                resolve(notFoundList);
                            }
                            else {
                                resolve(testList);
                            }
                        }
                    );
                }
            );
        });
    }

    private getFilePaths(): Thenable<vscode.Uri[]> {
        let configuredPath: string = Util.getConfiguredFilePath(this.folder);
        let relativePattern: vscode.RelativePattern = new vscode.RelativePattern(this.folder, configuredPath + '**/*.{ts,js}');
        return (vscode.workspace.findFiles(relativePattern, 'node_modules'));
    }
}