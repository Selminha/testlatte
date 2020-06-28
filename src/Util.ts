import * as vscode from 'vscode';
const util = require('util');
const exec = util.promisify(require('child_process').exec);

export default class Util {
    public static getConfiguredFilePath(folderUri: vscode.Uri): string {

        let filePath: string | undefined = folderUri.fsPath;
        if(filePath === undefined) {
            return "";
        }

        filePath = filePath + "/" + vscode.workspace.getConfiguration('testlatte').get('filePath');

        return filePath;
    }

    public static async isTestcafeInstalled(path: string): Promise<boolean> {
        try {
            const { stdout, stderr } = await exec('npm ls testcafe', { cwd: path });
            return Promise.resolve(true);
        }
        catch(e) {
            return Promise.resolve(false);
        }
    }

    public static async checkFolderForTestcafe(folderPath: string): Promise<boolean> {
        if(await Util.isTestcafeInstalled(folderPath)) {
            return Promise.resolve(true);
        } 

        return Promise.resolve(false);
    }
}