import * as vscode from 'vscode';
const util = require('util');
const exec = util.promisify(require('child_process').exec);

export class Util {
    public static getConfiguredFilePath(folderUri: vscode.Uri): string {

        let filePath: string | undefined = folderUri.fsPath;
        if(filePath === undefined) {
            return "";
        }

        filePath = filePath + "/" + vscode.workspace.getConfiguration('testlatte', folderUri).get('filePath');

        return filePath;
    }
}