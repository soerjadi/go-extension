import { window, workspace, Uri, commands, WorkspaceEdit, TextEdit } from "vscode";

import fs = require('fs');

export function getRootDir(): String | null {
  if (!workspace.workspaceFolders) {
    window.showInformationMessage("No project opened, please open project first.");
    return null;
  }
  return workspace.workspaceFolders![0].uri.path;
}

export function openAndFormatFile(filePath: string) {
  var fileUri = Uri.file(filePath);
  workspace.openTextDocument(fileUri).then(doc => {
    window.showTextDocument(doc);
    reformatDocument(fileUri);
  });
}

export function reformatDocument(fileUri: Uri) {
  commands.executeCommand("vscode.executeFormatDocumentProvider", fileUri,
    { tabSize: 2, insertSpaces: true, insertFinalNewline: true })
    .then((edits) => {
      if (edits !== undefined) {
        let formatEdit = new WorkspaceEdit();
        formatEdit.set(fileUri, edits as TextEdit[]);
        workspace.applyEdit(formatEdit);
        workspace.saveAll();
      }
    },
      (error) => console.error(error));
}

export function insertLineInFile(filePath:string, insertAfterPattern: string, definition:string){
  const modData = fs.readFileSync(filePath).toString();
  const pattern = new RegExp(insertAfterPattern);

  var lines = modData.split(/\r?\n/);
  var newLines = [];
  var foundPattern = false;
  var alreadyInserted = false;

  for (let [, line] of lines.entries()) {
    let linet = line.trim();
    if (!alreadyInserted) {
      if (linet === definition){
        // already have
        alreadyInserted = true;
        newLines.push(line);
        continue;
      }
      // if (line.trim().startsWith(insertAfterPattern)) {
      if (pattern.test(linet)) {
        foundPattern = true;
      } else if (foundPattern) {
        newLines.push(definition);
        alreadyInserted = true;
      }
    }
    newLines.push(line);
  }

  fs.writeFileSync(filePath, newLines.join('\n'));
}