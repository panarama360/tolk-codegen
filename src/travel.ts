import { ClassConstructor } from './type';
import { DataType, MetadataKey } from './decorators';
import { Cell, DictionaryKey, DictionaryValue } from '@ton/core';

export interface Field {
    name: string;
    buildType: DataType;
    size?: number;
    dict?: {key: DictionaryKey<any>, value: DictionaryValue<any>};
    type: any;
    mayBe: boolean
}
export function travel<T>(
    type: ClassConstructor<T>,
    callback: (prototype: object, field: Field) => void,
    deep: boolean = false,
) {
    const prototype = type.prototype;
    const props: string[] = Reflect.getMetadata(MetadataKey.PROPERTIES, prototype) || [];
    props.forEach((propertyKey) => {
        const buildType: DataType | undefined = Reflect.getMetadata(MetadataKey.DATATYPE, prototype, propertyKey as string);
        let size = Reflect.getMetadata(MetadataKey.SIZE, prototype, propertyKey as string);
        const type = Reflect.getMetadata("design:type", prototype, propertyKey);
        const dict = Reflect.getMetadata(MetadataKey.DICT, prototype, propertyKey);
        const mayBe = Reflect.getMetadata(MetadataKey.MAY_BE, prototype, propertyKey);
        if (!buildType) throw 'undefined data type';
        if ((buildType == DataType.REF) && !(type == Cell) && deep) {
            travel(type, callback, deep);
        }
        callback(prototype, {
            name: propertyKey,
            buildType,
            size,
            type,
            dict,
            mayBe: !!mayBe
        });
    });
}
