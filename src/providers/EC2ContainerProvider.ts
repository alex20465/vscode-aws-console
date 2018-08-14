import * as vscode from "vscode";
import { Instance } from "aws-sdk/clients/ec2";
import EC2Manager from "../managers/EC2Manager";

export class EC2ContainerProvider
    implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<
        EC2ContainerItem | undefined
    > = new vscode.EventEmitter<EC2ContainerItem | undefined>();

    readonly onDidChangeTreeData: vscode.Event<
        EC2ContainerItem | undefined
    > = this._onDidChangeTreeData.event;

    constructor(private manager: EC2Manager) {}

    getTreeItem(element: EC2ContainerItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: EC2ContainerItem): Thenable<vscode.TreeItem[]> {
        if (element && element instanceof EC2ContainerItem) {
            return Promise.resolve(element.getDetailTreeItems());
        } else if (element) {
            return Promise.resolve([]);
        }

        return this.manager.client
            .describeInstances({})
            .promise()
            .then(response => {
                if (!response.Reservations || !response.Reservations.length) {
                    return [];
                }
                const items: EC2ContainerItem[] = [];

                response.Reservations.forEach(reservation => {
                    if (
                        reservation &&
                        reservation.Instances &&
                        reservation.Instances.length
                    ) {
                        reservation.Instances.forEach(instance => {
                            items.push(new EC2ContainerItem(instance));
                        });
                    }

                    return null;
                });

                return items;
            });
    }

    refresh() {
        this._onDidChangeTreeData.fire();
    }
}

export class EC2ContainerItem extends vscode.TreeItem {
    constructor(private instance: Instance) {
        super("", vscode.TreeItemCollapsibleState.Collapsed);
        this.label = this.getLabel();

        if (this.instance.State && this.instance.State.Name === "stopped") {
            this.contextValue = "stopped_container";
        } else if (
            this.instance.State &&
            this.instance.State.Name === "running"
        ) {
            this.contextValue = "running_container";
        } else {
        }
    }

    getLabel() {
        const nameTag = this.tags["Name"];
        const instanceId = this.instance.InstanceId;
        let prefix = "";
        if (this.instance.State && this.instance.State.Name) {
            prefix = `${this.instance.State.Name}`;
        }

        if (nameTag && instanceId) {
            return `[${prefix}] ${nameTag} - ${instanceId}`;
        } else if (instanceId) {
            return `[${prefix}] ${instanceId}`;
        } else {
            return "none";
        }
    }

    get tags(): { [k: string]: string } {
        return (this.instance.Tags || []).reduce(
            (tags, tagItem) => {
                tags[tagItem.Key || "none"] = tagItem.Value || "";
                return tags;
            },
            {} as { [k: string]: string }
        );
    }

    get instanceId(): string {
        return this.instance.InstanceId || "";
    }

    getDetailTreeItems(): vscode.TreeItem[] {
        return [
            "ImageId",
            "InstanceId",
            "InstanceType",
            "KeyName",
            "LaunchTime",
            "PrivateDnsName",
            "PrivateIpAddress",
            "PublicDnsName",
            "PublicIpAddress",
            "SubnetId",
            "VpcId",
            "Architecture",
            "ClientToken"
        ].map(name => {
            const value = (this.instance as any)[name] as string;
            const item = new vscode.TreeItem(`${name} : ${value}`);
            item.contextValue = "detail_item";
            return item;
        });
    }
}
