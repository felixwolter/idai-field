import { Field } from '../../../model/configuration/field';


export interface BaseFieldDefinition {

    inputType?: string;
    constraintIndexed?: boolean;
    fulltextIndexed?: boolean;
    source?: Field.SourceType;
    // TODO Add default valuelist
}


export module BaseFieldDefinition {

    export const INPUTTYPE = 'inputType';
}
