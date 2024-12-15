import { DataType } from '../decorators';
import { Field } from '../travel';

function argsJoin(args: any[]){
    return args.filter(value => value).join(', ');
}
export const mapBuildTypeToTolkType: Record<string, string> = {
    [DataType.REF]: 'cell',
    [DataType.DICT]: 'cell',
    [DataType.ADDRESS]: 'slice',
    [DataType.SLICE]: 'slice',
    [DataType.BIT]: 'int',
    [DataType.UINT]: 'int',
    [DataType.INT]: 'int',
    [DataType.COINS]: 'int',
}

export const mapBuildTypeToTolkBuilderFunction: Record<string, (field: Field) => string> = {
    [DataType.REF]: (field: Field) => `storeRef(${argsJoin([field.name, field.size])})`,
    [DataType.ADDRESS]: (field: Field) => `storeSlice(${argsJoin([field.name, field.size])})`,
    [DataType.BIT]: (field: Field) => `storeBool(${argsJoin([field.name, field.size])})`,
    [DataType.INT]: (field: Field) => `storeInt(${argsJoin([field.name, field.size])})`,
    [DataType.UINT]: (field: Field) => `storeUint(${argsJoin([field.name, field.size])})`,
    [DataType.COINS]: (field: Field) => `storeCoins(${argsJoin([field.name, field.size])})`,
    [DataType.DICT]: (field: Field) => `storeDict(${argsJoin([field.name, field.size])})`,
    [DataType.SLICE]: (field: Field) => `storeSlice(${argsJoin([field.name])})`,
}

export const mapBuildTypeToTolkSliceFunction: Record<string, (field: Field, args?: any[]) => string> = {
    [DataType.REF]: (field) => `loadRef()`,
    [DataType.ADDRESS]: (field) => `loadAddress(${argsJoin([field.size])})`,
    [DataType.BIT]: (field) => `loadBool()`,
    [DataType.INT]: (field) => `loadInt(${argsJoin([field.size])})`,
    [DataType.UINT]: (field) => `loadUint(${argsJoin([field.size])})`,
    [DataType.COINS]: (field) => `loadCoins()`,
    [DataType.DICT]: (field) => `loadDict()`,
    [DataType.SLICE]: (field, args) => `loadBits(${argsJoin([field.size, ...args || []])})`,
}

export const storeMayBeRef = (field: Field) => `storeMaybeRef(${field.name})`;
export const storeMayBe = (field: Field) => `storeBool(${field.name} != null)`;

export const loadMayBeRef = (field: Field) =>
    `loadMaybeRef()`;
export const loadMayBeIsDeclaration = (field: Field, fiendName: string, loadDeclaration: string) =>
    `${fiendName}.loadBool() ? ${loadDeclaration} : null`;

export const storeMayBeIsDeclaration = (field: Field, storeDeclaration: string) => `if(${field.name} != null) {\n\t\t${storeDeclaration}}\n\t`;
