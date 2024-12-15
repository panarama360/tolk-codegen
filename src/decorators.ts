import "reflect-metadata";
import * as crc32 from 'crc-32';
import { BaseMessage } from './base/BaseMessage';
import {DictionaryKey, DictionaryKeyTypes, DictionaryValue} from "@ton/core";
import {Maybe} from "@ton/core/dist/utils/maybe";

export enum DataType{
    INT = 'int',
    UINT = 'uint',
    ADDRESS = 'address',
    REF = 'ref',
    STRING_TAIL = 'stringTail',
    COINS = 'coins',
    BIT = 'bit',
    DICT = 'dict',
    SLICE = 'slice'
}

export enum MetadataKey{
    PROPERTIES = "tlb:properties",
    DATATYPE = "tlb:dataType",
    MAY_BE = "tlb:bayBe",
    SIZE = "tlb:size",
    DICT = "tlb:dict",
    OP = "tlb:op",
}

function storeProperty(propertyKey: string, prototype: any){
    let pr = Reflect.getMetadata(MetadataKey.PROPERTIES, prototype) || [];
    Reflect.defineMetadata(MetadataKey.PROPERTIES, [...pr, propertyKey], prototype);
}

export function DefineCell(){
    return function (constructor: Function) {
        Reflect.defineMetadata(MetadataKey.DATATYPE, 'cell', constructor.prototype);
    }
}

export function StoreUint(size: number){
    return function(prototype: any, propertyKey: string){
        Reflect.defineMetadata(MetadataKey.DATATYPE, DataType.UINT, prototype, propertyKey);
        Reflect.defineMetadata(MetadataKey.SIZE, size, prototype, propertyKey);
        storeProperty(propertyKey, prototype);
    }
}

export function StoreInt(size: number){
    return function(prototype: any, propertyKey: string) {
        Reflect.defineMetadata(MetadataKey.DATATYPE, DataType.INT, prototype, propertyKey);
        Reflect.defineMetadata(MetadataKey.SIZE, size, prototype, propertyKey);
        storeProperty(propertyKey, prototype);
    }
}

export function StoreAddress(){
    return function(prototype: any, propertyKey: string){
        Reflect.defineMetadata(MetadataKey.DATATYPE, DataType.ADDRESS, prototype, propertyKey);
        storeProperty(propertyKey, prototype);
    }
}

export function StoreRef(){
    return function(prototype: any, propertyKey: string) {
        Reflect.defineMetadata(MetadataKey.DATATYPE, DataType.REF, prototype, propertyKey);
        storeProperty(propertyKey, prototype);
    }
}

export function StoreStringTail(){
    return function(prototype: any, propertyKey: string) {
        Reflect.defineMetadata(MetadataKey.DATATYPE, DataType.STRING_TAIL, prototype, propertyKey);
        storeProperty(propertyKey, prototype);
    }
}

export function StoreCoins(){
    return function(prototype: any, propertyKey: string) {
        Reflect.defineMetadata(MetadataKey.DATATYPE, DataType.COINS, prototype, propertyKey);
        storeProperty(propertyKey, prototype);
    }
}

export function StoreBit(){
    return function(prototype: any, propertyKey: string) {
        Reflect.defineMetadata(MetadataKey.DATATYPE, DataType.BIT, prototype, propertyKey);
        storeProperty(propertyKey, prototype);
    }
}

export function StoreSliceRemaining(){
    return function(prototype: any, propertyKey: string) {
        Reflect.defineMetadata(MetadataKey.DATATYPE, DataType.SLICE, prototype, propertyKey);
        storeProperty(propertyKey, prototype);
    }
}

export function StoreSlice(size: number){
    return function(prototype: any, propertyKey: string) {
        Reflect.defineMetadata(MetadataKey.DATATYPE, DataType.SLICE, prototype, propertyKey);
        Reflect.defineMetadata(MetadataKey.SIZE, size, prototype, propertyKey);
        storeProperty(propertyKey, prototype);
    }
}

export function MayBe(){
    return function(prototype: any, propertyKey: string) {
        Reflect.defineMetadata(MetadataKey.MAY_BE, true, prototype, propertyKey);
    }
}

export function DefineMessage(op?: bigint){
    return function (constructor: Function) {
        Reflect.defineMetadata(MetadataKey.OP, op || (BigInt(crc32.str(constructor.name)) & BigInt(0x7fffffff)), constructor.prototype);
    }
}

export function StoreDict<K extends DictionaryKeyTypes, V>(key?: Maybe<DictionaryKey<K>>, value?: Maybe<DictionaryValue<V>>){
    return function(prototype: any, propertyKey: string) {
        Reflect.defineMetadata(MetadataKey.DATATYPE, DataType.DICT, prototype, propertyKey);
        Reflect.defineMetadata(MetadataKey.DICT, {key, value}, prototype, propertyKey);
        storeProperty(propertyKey, prototype);
    }
}
