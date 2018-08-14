import * as vscode from "vscode";
import { EC2 } from "aws-sdk";
import AbstractManager from "./AbstractManager";
import AbstractCommand from "../commands/AbstractCommand";
import {
    StartCommand,
    StopCommand,
    RefreshCommand,
    CopyCommand
} from "../commands/ec2";
import { EC2ContainerProvider } from "../providers/EC2ContainerProvider";

export default class EC2Manager extends AbstractManager {
    private commands: AbstractCommand<EC2Manager>[];
    private _client: EC2 = new EC2();

    public ec2Provider: EC2ContainerProvider;

    constructor() {
        super();
        this.commands = [
            new StartCommand(this),
            new StopCommand(this),
            new RefreshCommand(this),
            new CopyCommand(this)
        ];

        this.ec2Provider = new EC2ContainerProvider(this);

        this.init();

        vscode.workspace.onDidChangeConfiguration(() => {
            this.init();
            this.ec2Provider.refresh();
        });
    }

    public init() {
        const { region } = vscode.workspace.getConfiguration(
            "awsconsole.ec2",
            null
        );

        this._client = new EC2({ region });
    }

    get client() {
        return this._client;
    }

    public register() {
        this.registerProviders();
        this.registerCommands();
    }

    private registerProviders() {
        vscode.window.registerTreeDataProvider(
            "aws_ec2_containers",
            this.ec2Provider
        );
    }

    private registerCommands() {
        this.commands.forEach(command => {
            vscode.commands.registerCommand(
                command.name(),
                command.run.bind(command)
            );
        });
    }

    public async isInstanceInProgress(instanceId: string): Promise<boolean> {
        const statusCode = await this.getInstanceStatusCode(instanceId);
        return [0, 32, 64].indexOf(statusCode) !== -1;
    }

    public async getInstanceStatusCode(instanceId: string): Promise<number> {
        const { Reservations } = (await this.client
            .describeInstances({
                InstanceIds: [instanceId]
            })
            .promise()) as any;

        return Reservations[0].Instances[0].State.Code;
    }
}
