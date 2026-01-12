import { plainToInstance } from 'class-transformer';
import { iif, map, of, tap } from 'rxjs';
export const dtoTansformer = (target, source) => {
    return plainToInstance(target, source, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true
    });
};
const genericInputModelTransformer = (serializerArgs) => {
    const { dataRecord, targetOuput, targetInput, transformInput, transformOutput, labelKey } = serializerArgs;
    return of(dataRecord).pipe(map(dataRec => transformOutput(targetOuput, dataRec)), tap(targetDto => console.log('Target DTO transformation', targetDto)), map(targetDto => {
        const responseBody = transformInput(targetInput, dataRecord);
        return {
            ...targetDto,
            [labelKey]: { ...responseBody }
        };
    }), tap(finalDto => console.log('Final DTO Input transformation', finalDto)));
};
const genericOutputModelTransformer = (serializerArgs) => {
    const { dataRecord, targetOuput, transformOutput, labelKey } = serializerArgs;
    return of(dataRecord).pipe(map(dt => {
        return transformOutput(targetOuput, dt);
    }), tap(conversion => console.log("Target transformation Output result", conversion)), map(dataModel => {
        return {
            ...dataModel,
            ...dataRecord[labelKey]
        };
    }));
};
export const rawToModelTranformer = (serializerArgs) => {
    return iif(() => serializerArgs.targetInput == null, genericOutputModelTransformer(serializerArgs), genericInputModelTransformer(serializerArgs))
        .pipe(map(finalOutputDto => serializerArgs.transformOutput(serializerArgs.targetOuput, finalOutputDto)));
};
//# sourceMappingURL=generic-dto-serializer.js.map