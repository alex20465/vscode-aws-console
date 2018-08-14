import AbstractCommand from "../AbstractCommand";
import EC2Manager from "../../managers/EC2Manager";

export class RefreshCommand extends AbstractCommand<EC2Manager> {
    run() {
        this.manager.ec2Provider.refresh();
    }

    name() {
        return "awsconsole.ec2.refreshContainers";
    }
}
