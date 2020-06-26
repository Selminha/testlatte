import * as vscode from 'vscode';
const util = require('util');
const exec = util.promisify(require('child_process').exec);

export default class Util {
    public static getConfiguredFilePath(): string {

        let filePath: string | undefined = vscode.workspace.rootPath;
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

    public static async checkAllFoldersForTestcafe(): Promise<boolean> {
        if(vscode.workspace.workspaceFolders) {
            for (const folder of vscode.workspace.workspaceFolders) {
                // if found at least one folder with testcafe installed return true
                if(await Util.isTestcafeInstalled(folder.uri.fsPath)) {
                    return Promise.resolve(true);
                } 
            }
        }
    
        // If there is no folders or testcafe is not installed return false
        return Promise.resolve(false);
    }
}