import { EC2ContainerItem } from "../../providers/EC2ContainerProvider";
import AbstractCommand from "../AbstractCommand";
import EC2Manager from "../../managers/EC2Manager";
import * as vscode from "vscode";
import { writeSync } from "clipboardy";

export class CopyCommand extends AbstractCommand<EC2Manager> {
    run(item: EC2ContainerItem) {
        if (!item || !(item instanceof vscode.TreeItem)) {
            return null;
        }

        const items = (item.label || "").split(":").map(v => v.trim());

        if (items.length === 2) {
            writeSync(items[1]);
            vscode.window.showInformationMessage("Copied to clipboard");
        }
    }
    name() {
        return "awsconsole.ec2.copyItemValue";
    }
}
