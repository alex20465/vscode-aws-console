"use strict";

import * as vscode from "vscode";

import { EC2 } from "aws-sdk";
import EC2Manager from "./managers/EC2Manager";

export function activate(context: vscode.ExtensionContext) {
    const ec2Client = new EC2({ region: "eu-central-1" });
    const ec2Manager = new EC2Manager(ec2Client);
    ec2Manager.register();
}

export function deactivate() {}
