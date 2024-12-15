import { ClassConstructor } from '../type';
import * as fs from 'node:fs';
import { mapBuildTypeToTolkBuilderFunction, mapBuildTypeToTolkSliceFunction, mapBuildTypeToTolkType } from './maps';
import { travel } from '../travel';

export function createStorageTolk<T>(type: ClassConstructor<T>){
    const template = fs.readFileSync(__dirname + '/../templates/storage.template.ttolk').toString('ascii');
    const globalVarDeclaration: string[] = [];
    const saveDeclarationFunction: string[] = [];
    const loadDeclarationFunction: string[] = [];
    travel(type, (prototype, field) => {
        globalVarDeclaration.push(`global ${field.name}: ${mapBuildTypeToTolkType[field.buildType] || field.buildType};`);
        saveDeclarationFunction.push(`.${mapBuildTypeToTolkBuilderFunction[field.buildType](field)}`);
        loadDeclarationFunction.push(`${field.name} = sc.${mapBuildTypeToTolkSliceFunction[field.buildType](field)};`)
    }, false);

    const output = template
        .replace("{{globalVarSection}}", globalVarDeclaration.join('\n'))
        .replace("{{saveDeclaration}}", saveDeclarationFunction.join(''))
        .replace("{{loadDeclaration}}", loadDeclarationFunction.join('\n    '))
    return output;
}

export async function createStorageTolkToFile<T>(type: ClassConstructor<T>, file: string) {
    const output = createStorageTolk(type);
    await fs.promises.writeFile(file, output);
}

