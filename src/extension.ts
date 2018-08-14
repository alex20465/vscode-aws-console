"use strict";

import * as vscode from "vscode";

import { EC2 } from "aws-sdk";
import EC2Manager from "./managers/EC2Manager";

export function activate(context: vscode.ExtensionContext) {
    const { region } = vscode.workspace.getConfiguration(
        "awsconsole.ec2",
        null
    );

    const ec2Client = new EC2({ region });

    const ec2Manager = new EC2Manager(ec2Client);

    ec2Manager.register();
}

export function deactivate() {}
