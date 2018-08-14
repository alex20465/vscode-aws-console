"use strict";

import * as vscode from "vscode";

import EC2Manager from "./managers/EC2Manager";

export function activate(context: vscode.ExtensionContext) {
    vscode.workspace.onDidChangeConfiguration(() => {});

    const ec2Manager = new EC2Manager();
    ec2Manager.register();
}

export function deactivate() {}
