import * as vscode from 'vscode';

export default class Util {
    public static getConfiguredFilePath(workspaceFolder: vscode.WorkspaceFolder | undefined): string {
        if(workspaceFolder === undefined) {
            return '';
        }

        let filePath: string | undefined = vscode.workspace.getConfiguration('testlatte', workspaceFolder).get('filePath');

       return (filePath ? filePath : '');
    }

    public static getFullworkspaceFilePath(workspaceFolder: vscode.WorkspaceFolder | undefined, partialFilePath: string): string {
        if(workspaceFolder === undefined) {
            return '';
        }

        let filePath: string | undefined = workspaceFolder.uri.fsPath;
        if(filePath === undefined) {
            return '';
        }

        filePath = filePath + '/' + partialFilePath;

        return filePath;
    }

    public static getTestcafePath(workspaceFolder: vscode.WorkspaceFolder | undefined): string {
        // default value
        let testcafeDefaultPath: string = `${workspaceFolder?.uri.fsPath}/node_modules/testcafe/bin/testcafe.js`;
        if(workspaceFolder === undefined) {
            return testcafeDefaultPath;
        }        

        let configuredPath: string | undefined = vscode.workspace.getConfiguration('testlatte', workspaceFolder).get('testcafePath');
        if((configuredPath === undefined) || (configuredPath.length <= 0)){
            return testcafeDefaultPath;
        }

        return configuredPath;
    }

    public static instanceOfTreeItemLabel(object: any): object is vscode.TreeItemLabel {
        return object.label !== undefined;
    }
}