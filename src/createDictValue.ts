import { Address, Builder, DictionaryKey, DictionaryValue, Slice } from '@ton/core';
import { ClassConstructor } from './type';
import { sliceParser } from './parser/cellParser';
import { buildCell } from './builder/cellBuilder';

export function createDictValue<T>(type: ClassConstructor<T>){
    return {
        serialize(src: T, builder: Builder) {
            buildCell(src as any, builder);
        },
        parse(src: Slice): T {
            return sliceParser(src, type);
        },
    } as DictionaryValue<T>;
}

export function creteDictKeyFromAddress(){
    return {
        bits: 256,
        serialize: (src: Address) => {
            return BigInt('0x'+src.hash.toString('hex'));
        },
        parse: (src: bigint) => {
            return new Address(0, Buffer.from(src.toString(16), 'hex'));
        }
    } as DictionaryKey<Address>
}
