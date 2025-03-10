/**
 * @author Daniel de Oliveira
 */
export module ConfigurationErrors {

    export const INVALID_JSON = 'configuration/error/invalidJson';

    export const INVALID_CONFIG_MISSINGVALUELIST = 'configuration/error/missingValuelist';
    export const INVALID_CONFIG_MISSINGPOSITIONVALUELIST = 'configuration/error/missingPositionValuelist';
    export const INVALID_CONFIG_MISSINGFIELDNAME = 'configuration/error/missingFieldName';
    export const INVALID_CONFIG_MISSINGRELATIONCATEGORY = 'configuration/error/missingRelationCategory';
    export const INVALID_CONFIG_PARENT_NOT_DEFINED = 'configuration/fields/custom/parentNotDefined';
    export const INVALID_CONFIG_INVALID_GROUPS_CONFIGURATION = 'configuration/error/invalidGroupsConfiguration';
    export const UNKNOWN_CATEGORY_ERROR = 'configuration/error/unknownCategory';

    export const TRYING_TO_SUBTYPE_A_NON_EXTENDABLE_CATEGORY = 'configuration/fields/custom/tryingToSubtypeANonExtendableCategory';
    export const COMMON_FIELD_VALUELIST_FROM_PROJECTDOC_NOT_TO_BE_OVERWRITTEN = 'configuration/fields/custom/commonFieldValuelistFromProjectDocNotToBeOverwritten';

    // buildProjectCategories
    export const DUPLICATION_IN_SELECTION = 'configuration/buildProjectCategories/duplicationInSelection';
    export const MUST_HAVE_PARENT = 'configuration/buildProjectCategories/mustHaveParent';
    export const MISSING_CATEGORY_PROPERTY = 'configuration/buildProjectCategories/missingCategoryProperty';
    export const ILLEGAL_CUSTOM_FORM_PROPERTY = 'configuration/buildProjectCategories/illegalCustomFormProperty';
    export const MISSING_FORM_PROPERTY = 'configuration/buildProjectCategories/missingFormProperty';
    export const MISSING_FIELD_PROPERTY = 'configuration/buildProjectCategories/missingFieldProperty';
    export const CATEGORY_NAME_NOT_FOUND = 'configuration/buildProjectCategories/categoryNameNotFound';
    export const ILLEGAL_FIELD_INPUT_TYPE = 'configuration/buildProjectCategories/illegalFieldInputType';
    export const ILLEGAL_FIELD_PROPERTY = 'configuration/buildProjectCategories/illegalFieldProperty';
    export const NO_VALUELIST_PROVIDED = 'configuration/buildProjectCategories/noValuelistProvided';
    export const NO_POSITION_VALUELIST_PROVIDED = 'configuration/buildProjectCategories/noPositionValuelistProvided';
    export const NO_MINIMAL_FORM_PROVIDED = 'configuration/buildProjectCategories/noMinimalFormProvided';
    export const FIELD_NOT_FOUND = 'configuration/buildProjectCategories/fieldNotFound';
}
