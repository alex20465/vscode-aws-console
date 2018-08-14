import { EC2ContainerItem } from "../../providers/EC2ContainerProvider";
import AbstractCommand from "../AbstractCommand";
import EC2Manager from "../../managers/EC2Manager";

export class StartCommand extends AbstractCommand<EC2Manager> {
    run(item: EC2ContainerItem) {
        if (!item || !(item instanceof EC2ContainerItem)) {
            return null;
        }

        return this.manager.client
            .startInstances({
                InstanceIds: [item.instanceId]
            })
            .promise();
    }
    name() {
        return "awsconsole.ec2.startContainer";
    }
}
