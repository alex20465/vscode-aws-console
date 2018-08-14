import * as vscode from "vscode";
import { EC2 } from "aws-sdk";
import AbstractManager from "./AbstractManager";
import AbstractCommand from "../commands/AbstractCommand";
import { StartCommand, StopCommand, RefreshCommand } from "../commands/ec2";
import { EC2ContainerProvider } from "../providers/EC2ContainerProvider";

export default class EC2Manager extends AbstractManager {
    private commands: AbstractCommand<EC2Manager>[];
    public ec2Provider: EC2ContainerProvider;

    constructor(private _client: EC2) {
        super();
        this.commands = [
            new StartCommand(this),
            new StopCommand(this),
            new RefreshCommand(this)
        ];
        this.ec2Provider = new EC2ContainerProvider();
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
}
