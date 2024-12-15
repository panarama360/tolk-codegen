import { DefineCell, MetadataKey, StoreUint } from '../decorators';

@DefineCell()
export class BaseMessage{
    @StoreUint(32)
    op!: bigint;

    constructor() {
        this.op = Reflect.getMetadata(MetadataKey.OP, this.constructor.prototype);
    }
}


@DefineCell()
export class BaseMessageWithQueryId extends BaseMessage {

    @StoreUint(64)
    queryId!: bigint;

    constructor(queryId: bigint) {
        super();
        this.queryId = queryId;
    }
}
