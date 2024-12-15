import { beginCell, Builder, Cell, Slice } from '@ton/core';
import { DataType } from '../decorators';
import { Field, travel } from '../travel';

const build: Record<DataType, (builder: Builder, value: any, field: Field) => void> = {
    [DataType.SLICE]: (builder: Builder, value: any, field: Field) => {
        if(value instanceof Slice){
            builder.storeSlice(value);
        }else {
            builder.storeSlice(buildCell(value).asSlice());
        }

    },
    [DataType.BIT]: (builder: Builder, value: any, field: Field) => {
        builder.storeBit(value);
    },
    [DataType.COINS]: (builder: Builder, value: any, field: Field) => {
        builder.storeCoins(value);
    },
    [DataType.INT]: (builder: Builder, value: any, field: Field) => {
        builder.storeInt(value, field.size!);
    },
    [DataType.UINT]: (builder: Builder, value: any, field: Field) => {
        builder.storeUint(value, field.size!);
    },
    [DataType.REF]: (builder: Builder, value: any, field: Field) => {
        if(value instanceof Cell){
            builder.storeRef(value);
        }else{
            builder.storeRef(buildCell(value));
        }
    },
    [DataType.ADDRESS]: (builder: Builder, value: any, field: Field) => {
     builder.storeAddress(value);
    },
    [DataType.STRING_TAIL]: (builder: Builder, value: any, field: Field) => {
        builder.storeStringTail(value);
    },
    [DataType.DICT]: (builder: Builder, value: any, field: Field) => {
        builder.storeDict(value, field.dict?.key, field.dict!.value);
    }
}

export function buildCell<T extends object>(object: T, builder: Builder = beginCell()){
    travel(object.constructor as any, (prototype, field) => {
        if(!build[field.buildType]){
            throw `${field.buildType} data type`;
        }
        const value = (object as any)[field.name];
        if(field.mayBe){
            if(value){
                builder.storeBit(true)
            }else{
                builder.storeBit(false)
            }
        }
        build[field.buildType](builder, (object as any)[field.name], field)
    });
    return builder.endCell();
}
