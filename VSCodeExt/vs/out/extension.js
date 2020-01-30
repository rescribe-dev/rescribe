"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
//import {PythonShell} from 'python-shell';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "vs" is now active!');
    const execLocation = context.asAbsolutePath("script");
    console.log("Absolute exec location: " + execLocation);
    var newExec = execLocation.replace(/\\/g, '/');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let reScribe = vscode.commands.registerTextEditorCommand('extension.rescribe', () => __awaiter(this, void 0, void 0, function* () {
        // The code you place here will be executed every time your command is executed
        //vscode.window.showInformationMessage('Rescribe!');
        var vscode = require("vscode");
        var path = require("path");
        var currentlyOpenTabfilePath = vscode.window.activeTextEditor.document.fileName;
        var currentlyOpenTabfileName = path.basename(currentlyOpenTabfilePath);
        console.log('Current File Path: ' + currentlyOpenTabfilePath);
        console.log('Current File: ' + currentlyOpenTabfileName);
        var newPath = currentlyOpenTabfilePath.replace(/\\/g, '\\\\');
        //Tests to see if the file exits and therefore can be edited
        const fs = require("fs");
        fs.exists(currentlyOpenTabfilePath, (exist) => {
            if (exist) {
                //Saves all files in workspaace
                //vscode.workspace.saveAll()
                //Saves current document
                vscode.window.activeTextEditor.document.save();
                console.log("File exists");
                //arg is used for testing
                const arg = 'C:/Users/Trevor/vs/sampleCode.java';
                //These 2 lines are for spawning/running the python script
                //For spawn('python, ['filepathtoscript', 'arg1')
                //arg1 = file to be rescribed arg2 = reScribe, traverse, or addToDict
                const spawn = require("child_process").spawn;
                const pythonProcess = spawn('python3', [newExec + "/vscodeext.py", "reScribe", newPath, newExec + "/command_dict.json"]);
                //Looks for python output
                pythonProcess.stdout.on('data', (data) => {
                    vscode.window.showInformationMessage('reScribe!');
                    console.log('No Errors:');
                    console.log(data.toString());
                });
                //If script has error then this prints
                pythonProcess.stderr.on('data', (data) => {
                    vscode.window.showInformationMessage('reScribe! Error');
                    console.log('Error: ');
                    console.log(data.toString());
                });
                //At end of process this will print
                pythonProcess.stdout.on('end', () => {
                    //vscode.window.showInformationMessage('Rescribe!');
                    console.log('Process Ended');
                });
            }
            else {
                console.log("File does not exist");
                vscode.window.showErrorMessage('Please save the file before using reScribe!');
            }
        });
    }));
    let traverse = vscode.commands.registerCommand('extension.traverse', () => __awaiter(this, void 0, void 0, function* () {
        const spawn = require("child_process").spawn;
        const search = spawn('python3', [newExec + "/vscodeext.py", "traverse", newExec + "/command_dict.json"]);
        //Looks for python output
        search.stdout.on('data', (data) => {
            console.log('No Errors:');
            console.log(data.toString());
        });
        //If script has error then this prints
        search.stderr.on('data', (data) => {
            vscode.window.showInformationMessage('Error!');
            console.log('Error: ');
            console.log(data.toString());
        });
        //At end of process this will print
        search.stdout.on('end', () => {
            console.log('Process Ended');
        });
    }));
    let addToDict = vscode.commands.registerCommand('extension.addToDict', () => __awaiter(this, void 0, void 0, function* () {
        var vscode = require("vscode");
        var path = require("path");
        var currentlyOpenTabfilePath = vscode.window.activeTextEditor.document.fileName;
        var currentlyOpenTabfileName = path.basename(currentlyOpenTabfilePath);
        console.log('Current File Path: ' + currentlyOpenTabfilePath);
        console.log('Current File: ' + currentlyOpenTabfileName);
        var newPath = currentlyOpenTabfilePath.replace(/\\/g, '\\\\');
        //Tests to see if the file exits and therefore can be edited
        const fs = require("fs");
        fs.exists(currentlyOpenTabfilePath, (exist) => {
            if (exist) {
                //Saves all files in workspaace
                //vscode.workspace.saveAll()
                //Saves current document
                vscode.window.activeTextEditor.document.save();
                console.log("File exists");
                //arg is used for testing
                const arg = 'C:/Users/Trevor/vs/sampleCode.java';
                //These 2 lines are for spawning/running the python script
                //For spawn('python, ['filepathtoscript', 'arg1')
                //arg1 = file to be rescribed arg2 = reScribe or traverse
                const spawn = require("child_process").spawn;
                const pythonProcess = spawn('python3', [newExec + "/vscodeext.py", "addToDict", newPath, newExec + "/command_dict.json"]);
                //Looks for python output
                pythonProcess.stdout.on('data', (data) => {
                    vscode.window.showInformationMessage('Successfully added command to dictonary!');
                    console.log('No Errors:');
                    console.log(data.toString());
                });
                //If script has error then this prints
                pythonProcess.stderr.on('data', (data) => {
                    vscode.window.showInformationMessage('Error! Could not add command to dictionary');
                    console.log('Error: ');
                    console.log(data.toString());
                });
                //At end of process this will print
                pythonProcess.stdout.on('end', () => {
                    //vscode.window.showInformationMessage('Rescribe!');
                    console.log('Process Ended');
                });
            }
            else {
                console.log("File does not exist");
                vscode.window.showErrorMessage('Please save the file before using reScribe!');
            }
        });
    }));
    context.subscriptions.push(reScribe);
    context.subscriptions.push(traverse);
    context.subscriptions.push(addToDict);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map