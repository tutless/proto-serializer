import { plainToInstance, type ClassConstructor } from 'class-transformer';
import { iif, map, of, tap } from 'rxjs';

//U=T is an optional for type U

 type GenericTransformerType<T,U> = {
     dataRecord:Record<string,any>,
     targetOuput:ClassConstructor<T>,
     targetInput?:ClassConstructor<U>,
     transformOutput: (target:ClassConstructor<T>, source:object) => T,
     transformInput: (target:ClassConstructor<U>, source:object) => U,
     labelKey:string
}
export class GenericDtoSerializer<T,U=T>{

  
    constructor(private readonly serializerArgs:GenericTransformerType<T,U>){}

    dtoTansformer<T>(target:ClassConstructor<T>, source:object) {
            return plainToInstance(target, source, {
                excludeExtraneousValues:true,
                enableImplicitConversion: true
            });
    }

    genericInputModelTransformer(){
        const {dataRecord,targetOuput,targetInput,transformInput,transformOutput,labelKey} = this.serializerArgs
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

    genericOutputModelTransformer(){
            const {dataRecord,targetOuput,transformOutput,labelKey} = this.serializerArgs
            return of(dataRecord).pipe(map(dt => {
                return transformOutput(targetOuput, dt);
            }),tap(conversion => console.log("Target transformation Output result", conversion)),map(dataModel => {
                return {
                    ...dataModel,
                    ...dataRecord[labelKey]
                } as Record<string,any>
            }))
    }


    rawToModelTranformer(){
       return iif(() => this.serializerArgs.targetInput == undefined, this.genericOutputModelTransformer(),this.genericInputModelTransformer())
       .pipe(map(finalOutputDto => this.serializerArgs.transformOutput(this.serializerArgs.targetOuput,finalOutputDto)))
    }


}