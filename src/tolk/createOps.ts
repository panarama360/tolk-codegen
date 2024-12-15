import { ClassConstructor } from '../type';
import fs from 'node:fs';
import { MetadataKey } from '../decorators';

export async function createOpsFile(
    types: Array<ClassConstructor<any>>,
    file: string,
){
    await fs.promises.writeFile(file, createOps(types));
}

export function createOps(
    types: Array<ClassConstructor<any>>
){
    const ops: string[] = types.map(value => {
        const op: bigint = Reflect.getMetadata(MetadataKey.OP, value.prototype);
        if(op){
            return `const ${value.name}OP = 0x${op.toString(16)};`;
        }else {
            throw "no OP code"
        }

    })
    return ops.join("\n")
}
