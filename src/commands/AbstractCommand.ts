import AbstractManager from "../managers/AbstractManager";

export default abstract class AbstractCommand<M extends AbstractManager> {
    constructor(protected manager: M) {}
    abstract run(item: any): void;
    abstract name(): string;
}
