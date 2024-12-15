import { ClassConstructor } from '../type';
import fs from 'node:fs';
import { loadMayBeIsDeclaration, loadMayBeRef, mapBuildTypeToTolkSliceFunction, mapBuildTypeToTolkType } from './maps';
import { travel } from '../travel';
import { DataType } from '../decorators';

export function createParserTolk<T>(type: ClassConstructor<T>, exclude?: (keyof T)[]) {
    const template = fs.readFileSync(__dirname + '/../templates/parser.template.ttolk').toString('ascii');

    const returnDeclaration: string[] = [];
    const loadDeclarations: string[] = [];
    const params: string[] = [];
    travel(
        type,
        (prototype, field) => {
            if (exclude && exclude.includes(field.name as any)) return;
            params.push(field.name);
            returnDeclaration.push(mapBuildTypeToTolkType[field.buildType]);
            if (field.buildType == DataType.SLICE && !field.size) {
                loadDeclarations.push(
                    `sc.${mapBuildTypeToTolkSliceFunction[field.buildType](field, ['sc.getRemainingBitsCount()'])}`,
                );
            } else {
                if(field.mayBe){
                    if(field.buildType == DataType.REF){
                        loadDeclarations.push(`sc.${loadMayBeRef(field)}`);
                    }else{
                        loadDeclarations.push(
                            loadMayBeIsDeclaration(
                                field,
                                'sc',
                                `sc.${mapBuildTypeToTolkSliceFunction[field.buildType](field)}`
                            )
                        )

                    }
                }else {
                    loadDeclarations.push(`sc.${mapBuildTypeToTolkSliceFunction[field.buildType](field)}`);
                }
            }
        },
        false,
    );
    if(returnDeclaration.length == 0){
        return "";
    }
    const returnDeclarationString = returnDeclaration.length > 1 ? `(${returnDeclaration.join(', ')})` : returnDeclaration.join(', ');
    const loadDeclarationString = loadDeclarations.length > 1 ? `(${loadDeclarations.join(', ')})` : loadDeclarations.join(', ');
    return template
        .replace(/\{\{name\}\}/gm, type.name)
        .replace(/\{\{returnType\}\}/gm, returnDeclarationString)
        .replace(/\{\{paramsName\}\}/gm, params.join(', '))
        .replace(/\{\{loadDeclaration\}\}/gm, loadDeclarationString);
}

export async function createParserTolkToFile<T>(type: ClassConstructor<T>, exclude: (keyof T)[], file: string) {
    const output = createParserTolk(type, exclude);
    await fs.promises.writeFile(file, output);
}

export async function createParsersTolkToFile(
    types: Array<ClassConstructor<any>>,
    exclude: string[],
    file: string,
) {
    const output = types
        .map((type) => {
            return createParserTolk(type, exclude as any);
        })
        .join('\n');
    await fs.promises.writeFile(file, output);
}
