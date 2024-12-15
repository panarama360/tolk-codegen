import { beginCell, Builder, Cell, Slice } from '@ton/core';
import { DataType } from '../decorators';
import { ClassConstructor } from '../type';
import { Field, travel } from '../travel';
import { createDictValue } from '../createDictValue';

// createDictValue()
const parser: Record<DataType, (slice: Slice, field: Field) => void> = {
    [DataType.SLICE]: (slice: Slice, field: Field) => {
        if(field.size){
            return beginCell().storeBits(slice.loadBits(field.size!)).asSlice();
        }else{
            return beginCell().storeBits(slice.loadBits(slice.remainingBits)).asSlice();
        }

    },
    [DataType.BIT]: (slice: Slice, field: Field) => {
        return slice.loadBit();
    },
    [DataType.COINS]: (slice: Slice, field: Field) => {
        return slice.loadCoins();
    },
    [DataType.INT]: (slice: Slice, field: Field) => {
        return slice.loadIntBig(field.size!);
    },
    [DataType.UINT]: (slice: Slice, field: Field) => {
        return slice.loadUintBig(field.size!);
    },
    [DataType.REF]: (slice: Slice, field: Field) => {
        if(field.type == Cell){
            return slice.loadRef();
        }else{
            return parseCell(slice.loadRef(), field.type);
        }
    },
    // [DataType.MAYBE_REF]: (slice: Slice, field: Field) => {
    //     const ref = slice.loadMaybeRef()
    //     if(field.type == Cell){
    //         return ref;
    //     }else if(ref){
    //         return parseCell(ref, field.type);
    //     }else {
    //         return ref;
    //     }
    // },
    [DataType.ADDRESS]: (slice: Slice, field: Field) => {
        return slice.loadMaybeAddress();
    },
    [DataType.STRING_TAIL]: (slice: Slice, field: Field) => {
        return slice.loadStringTail();
    },
    [DataType.DICT]: (slice: Slice, field: Field) => {
        return slice.loadDict(field.dict!.key, field.dict!.value);
    },
}

export function parseCell<T>(cell: Cell, type: ClassConstructor<T>){
    return sliceParser(cell.beginParse(), type);
}

export function sliceParser<T>(slice: Slice, type: ClassConstructor<T>): T{
    const object: any = new type();
    travel(type, (prototype, field) => {
        if(!parser[field.buildType]){
            throw `${field.buildType} data type`;
        }
        if(field.mayBe && !slice.loadBit()){
            return;
        }
        object[field.name] = parser[field.buildType](slice, field);
    })
    return object;
}
