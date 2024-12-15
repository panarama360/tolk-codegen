# Tolk file generator by typescript decorators

## Example generator
### Create builder file in root folder ``builder.ts``

```ts
import {createBuildsTolkToFile, createStorageTolkToFile, createOpsFile, createParsersTolkToFile} from "tolk-codegen";

async function build() {
    createStorageTolkToFile(Store, "contract.store.tolk");
    createBuildsTolkToFile([TokenNotification], [], "contract.builders.tolk");
    createParsersTolkToFile([TokenNotification], [], "contract.parsers.tolk");
    createOpsFile([TokenNotification], "ops.tolk");
}

build();
```
Start builder use nodemon  ``nodemon --watch 'wrappers/**/*.ts' --exec 'ts-node' ./builder.ts``
### Create Store

```ts
import {StoreUint, StoreAddress, StoreBit} from "tolk-codegen";
import {Address} from "@ton/core";

@DefineCell()
class Store {
    @StoreUint(32)
    seqno!: BigInt;

    @StoreAddress()
    owner!: Address;

    @StoreBit()
    stop!: boolean;
}
```
### Output store ``contract.store.tolk``
```tolk
global seqno: int;
global owner: slice;
global stop: int;

@inline
fun saveStorage(){
    setContractData(
            beginCell()
                .storeUint(seqno, 32).storeSlice(owner).storeBool(stop)
                .endCell()
        );
}

@inline
fun loadStorage(){
    var sc = getContractData().beginParse();
    seqno = sc.loadUint(32);
    owner = sc.loadAddress();
    stop = sc.loadBool();
}
```
### Create Message
```ts
import {DefineCell, DefineMessage, StoreCoins, StoreAddress, StoreSliceRemaining} from "tolk-codegen";
import {Address, Slice} from "@ton/core";

@DefineCell()
@DefineMessage(BigInt(0x7362d09c))
class TokenNotification extends BaseMessageWithQueryId{
    @StoreCoins()
    amount!: BigInt;

    @StoreAddress()
    from!: Address;

    @StoreSliceRemaining()
    forwardPayload!: Slice;
}
```
## Output message builder ``contract.builders.tolk``
```tolk
@inline // buildCellTokenNotification(op: int, queryId: int, amount: int, from: slice, forwardPayload: slice);
fun buildCellTokenNotification(op: int, queryId: int, amount: int, from: slice, forwardPayload: slice): cell{
    var data = beginCell();
    data.storeUint(op, 32);
    data.storeUint(queryId, 64);
    data.storeCoins(amount);
    data.storeSlice(from);
    data.storeSlice(forwardPayload);
    return data.endCell();
}
```

## Output message parser ``contract.parsers.tolk``
```tolk
@inline // var (op, queryId, amount, from, forwardPayload) = parseCellTokenNotification(data);
fun parseCellTokenNotification(data: cell): (int, int, int, slice, slice){
    return parseSliceTokenNotification(data.beginParse());
}

@inline // var (op, queryId, amount, from, forwardPayload) = parseSliceTokenNotification(sc);
fun parseSliceTokenNotification(sc: slice): (int, int, int, slice, slice){
    return (sc.loadUint(32), sc.loadUint(64), sc.loadCoins(), sc.loadAddress(), sc.loadBits(sc.getRemainingBitsCount()));
}
```

## Output OP ``ops.tolk``
```tolk
const TokenNotificationOP = 0x7362d09c;
```

## Example use classes

```ts
import {buildCell, parseCell} from "tolk-codegen";
import {Address, Cell} from "@ton/core";

export class MyContract implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {
    }

    static createFromAddress(address: Address) {
        return new MyContract(address);
    }
    
    async getContractData(provider: ContractProvider){
        return await provider.getState().then(value => {
            if(value.state.type =='active'){
                return parseCell(Cell.fromBoc(value.state.data!)[0], Store)
            }
            return null;
        })
    }

    async sendMessage(provider: ContractProvider, via: Sender, message: MyMessage | TokenNotification, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: buildCell(message),
        });
    }
}
```

