import { EC2ContainerItem } from "../../providers/EC2ContainerProvider";
import AbstractCommand from "../AbstractCommand";
import EC2Manager from "../../managers/EC2Manager";

export class StopCommand extends AbstractCommand<EC2Manager> {
    async run(item: EC2ContainerItem) {
        if (!item || !(item instanceof EC2ContainerItem)) {
            return null;
        }
        await this.manager.client
            .stopInstances({
                InstanceIds: [item.instanceId]
            })
            .promise();

        this.manager.ec2Provider.refresh();
        while (await this.manager.isInstanceInProgress(item.instanceId)) {
            await new Promise(resolve => setTimeout(() => resolve(), 5000));
        }
        this.manager.ec2Provider.refresh();
    }

    name() {
        return "awsconsole.ec2.stopContainer";
    }
}
