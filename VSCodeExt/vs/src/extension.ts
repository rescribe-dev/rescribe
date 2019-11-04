// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {PythonShell} from 'python-shell';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vs" is now active!');
	const execLocation = context.asAbsolutePath("script");
	console.log("Absolute exec location: " + execLocation);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerTextEditorCommand('extension.rescribe', () => {
		// The code you place here will be executed every time your command is executed
		//vscode.window.showInformationMessage('Rescribe!');

		var vscode = require("vscode");
		var path = require("path");

   		var currentlyOpenTabfilePath = vscode.window.activeTextEditor.document.fileName;
		var currentlyOpenTabfileName = path.basename(currentlyOpenTabfilePath);
		console.log('Current File Path: ' + currentlyOpenTabfilePath);
		console.log('Current File: ' + currentlyOpenTabfileName);
		
		//Tests to see if the file exits and therefore can be edited
		const fs = require("fs");
		fs.exists(currentlyOpenTabfilePath, (exist: any) => {
			if (exist) {
				console.log("File exists");

				//arg is used for testing
				const arg = 'C:/Users/Trevor/vs/sampleCode.java';

				//These 2 lines are for spawning/running the python script
				//For spawn('python, ['filepathtoscript', 'arg1')
				//arg1 = file to be rescribed
				const spawn = require("child_process").spawn;
				const pythonProcess = spawn('python',["C:/Users/Trevor/vs/vscodeext.py", currentlyOpenTabfilePath]);
				
				//Looks for python output
				pythonProcess.stdout.on('data', (data: any) => { 
					vscode.window.showInformationMessage('Rescribe!');
					console.log('Hi');
  	      			console.log(data);
				} ); 

				//If script has error then this prints
				pythonProcess.stderr.on('data', (data: any) => { 
					vscode.window.showInformationMessage('Rescribe! Error');
					console.log('Error: ');
  	      			console.log(data);
				} ); 

				//At end of process this will print
				pythonProcess.stdout.on('end', () => { 
				//vscode.window.showInformationMessage('Rescribe!');
				console.log('Hi! I\'m dead');
				} );
			} else {
				console.log("File doesn't exists");
				vscode.window.showErrorMessage('Please save the file before using rescribe!');
			}
		});
});
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}