import * as AWS from "aws-sdk";
import * as vscode from "vscode";
import { Instance } from "aws-sdk/clients/ec2";

export class EC2ContainerProvider
    implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<
        EC2ContainerItem | undefined
    > = new vscode.EventEmitter<EC2ContainerItem | undefined>();

    readonly onDidChangeTreeData: vscode.Event<
        EC2ContainerItem | undefined
    > = this._onDidChangeTreeData.event;

    getTreeItem(element: EC2ContainerItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: EC2ContainerItem): Thenable<vscode.TreeItem[]> {
        if (element && element instanceof EC2ContainerItem) {
            return Promise.resolve(element.getDetailTreeItems());
        } else if (element) {
            return Promise.resolve([]);
        }

        const ec2 = new AWS.EC2({ region: "eu-central-1" });

        return ec2
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
        let suffix = "";
        if (this.instance.State && this.instance.State.Name) {
            suffix = `${this.instance.State.Name}`;
        }

        if (nameTag && instanceId) {
            return `${nameTag} - ${instanceId} (${suffix})`;
        } else if (instanceId) {
            return `${instanceId} (${suffix})`;
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
            "AmiLaunchIndex",
            "ImageId",
            "InstanceId",
            "InstanceType",
            "KeyName",
            "LaunchTime",
            "PrivateDnsName",
            "PrivateIpAddress",
            "PublicDnsName",
            "PublicIpAddress",
            "StateTransitionReason",
            "SubnetId",
            "VpcId",
            "Architecture",
            "ClientToken",
            "EbsOptimized",
            "EnaSupport",
            "Hypervisor",
            "RootDeviceName",
            "RootDeviceType",
            "SourceDestCheck",
            "VirtualizationType"
        ].map(name => {
            const value = (this.instance as any)[name] as string;
            return new vscode.TreeItem(`${name} : ${value}`);
        });
    }
}
