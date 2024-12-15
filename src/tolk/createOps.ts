import { ClassConstructor } from '../type';
import fs from 'node:fs';
import { MetadataKey } from '../decorators';

export async function createOps(
    types: Array<ClassConstructor<any>>,
    file: string,
){
    const ops: string[] = types.map(value => {
        const op: bigint = Reflect.getMetadata(MetadataKey.OP, value.prototype);
        if(op){
            return `const ${value.name}OP = 0x${op.toString(16)};`;
        }else {
            throw "no OP code"
        }

    })
    await fs.promises.writeFile(file, ops.join("\n"));
}
