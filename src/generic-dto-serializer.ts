import { plainToInstance, type ClassConstructor } from 'class-transformer';
import { iif, map, of, tap } from 'rxjs';

//U=T is an optional for type U

export type GenericTransformerType<T,U=T> = {
     dataRecord:Record<string,any>,
     targetOuput:ClassConstructor<T>,
     targetInput?:ClassConstructor<U>,
     transformOutput: (target:ClassConstructor<T>, source:object) => T,
     transformInput: (target:ClassConstructor<U>, source:object) => U,
     labelKey:string
}



    export const dtoTansformer = <T>(target:ClassConstructor<T>, source:object) => {
            return plainToInstance(target, source, {
                excludeExtraneousValues:true,
                enableImplicitConversion: true
            });
    }

    const genericInputModelTransformer = <T,U>(serializerArgs:GenericTransformerType<T,U>) => {
        const {dataRecord,targetOuput,targetInput,transformInput,transformOutput,labelKey} = serializerArgs
        return of(dataRecord).pipe(map(dataRec => transformOutput(targetOuput,dataRec)),
            tap(targetDto => console.log('Target DTO transformation',targetDto)),
            map(targetDto => {
                const responseBody = transformInput(targetInput!!,dataRecord)
                return{
                    ...targetDto,
                    [labelKey]: {...responseBody}
                }
            }),
            tap(finalDto => console.log('Final DTO Input transformation', finalDto)))

    }

    const genericOutputModelTransformer = <T,U=T>(serializerArgs:GenericTransformerType<T,U>) => {
            const {dataRecord,targetOuput,transformOutput,labelKey} = serializerArgs
            return of(dataRecord).pipe(map(dt => {
                return transformOutput(targetOuput, dt);
            }),tap(conversion => console.log("Target transformation Output result", conversion)),map(dataModel => {
                return {
                    ...dataModel,
                    ...dataRecord[labelKey]
                } as Record<string,any>
            }))
    }


    export const rawToModelTransformer = <T,U=T>(serializerArgs:GenericTransformerType<T,U>) => {
       return iif(() => serializerArgs.targetInput == null, genericOutputModelTransformer(serializerArgs),genericInputModelTransformer(serializerArgs))
       .pipe(map(finalOutputDto => serializerArgs.transformOutput(serializerArgs.targetOuput,finalOutputDto)))
    }

