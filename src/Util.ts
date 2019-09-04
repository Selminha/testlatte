import * as vscode from 'vscode';

export default class Util {
    public static getConfiguredFilePath(): string {

        let filePath: string | undefined = vscode.workspace.rootPath;
        if(filePath === undefined) {
            return "";
        }

        filePath = filePath + "/" + vscode.workspace.getConfiguration('testlatte').get('filePath');

        return filePath;
    }
}