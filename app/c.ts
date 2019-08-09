// Constants

export const RESOURCE_IDENTIFIER = 'resource.identifier';
export const RESOURCE_ID = 'resource.id';




export module TIME_RELATIONS {

    export const IS_BEFORE = 'isBefore';
    export const IS_AFTER = 'isAfter';
    export const IS_CONTEMPORARY_WITH = 'isContemporaryWith';
    export const ALL = [IS_AFTER, IS_BEFORE, IS_CONTEMPORARY_WITH];
}

export module POSITION_RELATIONS {

    export const IS_BELOW = 'isBelow';
    export const IS_ABOVE = 'isAbove';
    export const ALL = ['borders', 'cuts', 'isCutBy', IS_ABOVE, IS_BELOW];
}


export const PARENT = 'isChildOf'; // This is a hierarchical relation, but only used in import and export


export module HIERARCHICAL_RELATIONS {

    export const RECORDED_IN = 'isRecordedIn';
    export const LIES_WITHIN = 'liesWithin';
    export const INCLUDES = 'includes';
    export const ALL = [LIES_WITHIN, RECORDED_IN, INCLUDES];
}


export const ISRECORDEDIN_CONTAIN = 'isRecordedIn:contain';


export module GROUP_NAME {

    export const STEM = 0;
    export const PROPERTIES = 1;
    export const CHILD_PROPERTIES = 2;
    export const DIMENSION = 3;
    export const POSITION = 4;
    export const TIME = 5;
}


export const INPUT_TYPE = 'inputType';

export module INPUT_TYPES {

    export const DROPDOWN_RANGE = 'dropdownRange';
}


// Types

export type Name = string;
export type ResourceId = string;