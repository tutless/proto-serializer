import { type ClassConstructor } from 'class-transformer';
export type GenericTransformerType<T, U> = {
    dataRecord: Record<string, any>;
    targetOuput: ClassConstructor<T>;
    targetInput?: ClassConstructor<U>;
    transformOutput: (target: ClassConstructor<T>, source: object) => T;
    transformInput: (target: ClassConstructor<U>, source: object) => U;
    labelKey: string;
};
export declare const dtoTansformer: <T>(target: ClassConstructor<T>, source: object) => T;
export declare const rawToModelTranformer: <T, U>(serializerArgs: GenericTransformerType<T, U>) => import("rxjs").Observable<T>;
//# sourceMappingURL=generic-dto-serializer.d.ts.map