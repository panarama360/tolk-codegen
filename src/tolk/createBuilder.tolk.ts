import { ClassConstructor } from '../type';
import fs from 'node:fs';
import {
    mapBuildTypeToTolkBuilderFunction,
    mapBuildTypeToTolkType, storeMayBeRef,
    storeMayBe, storeMayBeIsDeclaration
} from './maps';
import { travel } from '../travel';
import { DataType } from '../decorators';


export function createBuilderTolk<T>(type: ClassConstructor<T>, exclude?: (keyof T)[]){
    const template = fs.readFileSync(__dirname + '/../templates/builder.template.ttolk').toString('ascii');

    const storeDeclaration: string[] = [];
    const paramsDeclaration: string[] = [];

    travel(type, (prototype, field) => {
        if(exclude && exclude.includes(field.name as any)) return;
        if(field.mayBe){
            if(field.buildType == DataType.REF){
                storeDeclaration.push(`data.${storeMayBeRef(field)};`);
            }
            else{
                storeDeclaration.push(`data.${storeMayBe(field)};`);
                storeDeclaration.push(
                    storeMayBeIsDeclaration(field, `data.${mapBuildTypeToTolkBuilderFunction[field.buildType](field)};`)
                );
            }

        }else{
            storeDeclaration.push(`data.${mapBuildTypeToTolkBuilderFunction[field.buildType](field)};`);
        }

        paramsDeclaration.push(`${field.name}: ${mapBuildTypeToTolkType[field.buildType]}`);
    }, false)
    return template
        .replace(/\{\{name\}\}/gm, type.name)
        .replace(/\{\{params\}\}/gm, paramsDeclaration.join(', '))
        .replace(/\{\{storeDeclaration\}\}/gm, storeDeclaration.join('\n\t'));
}

export async function createBuildTolkToFile<T>(type: ClassConstructor<T>, exclude: (keyof T)[], file: string) {
    const output = createBuilderTolk(type, exclude);
    await fs.promises.writeFile(file, output);
}

export async function createBuildsTolkToFile(types: Array<ClassConstructor<any>>, exclude: string[], file: string) {
    const output = types.map(type => {
        return createBuilderTolk(type, exclude as any);
    }).join('\n')
    await fs.promises.writeFile(file, output);
}
