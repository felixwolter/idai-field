import { compose, cond, filter, flow, identity, includedIn, isDefined, isNot, Map, Mapping,
    update as updateStruct, curry, clone } from 'tsfun';
import { TransientCategoryDefinition } from '../model/category/transient-category-definition';
import { CustomFormDefinition } from '../model/form/custom-form-definition';
import { LanguageConfigurations } from '../model/language/language-configurations';
import { TransientFormDefinition } from '../model/form/transient-form-definition';
import { TransientFieldDefinition } from '../model/field/transient-field-definition';
import { RawProjectConfiguration } from '../../services/project-configuration';
import { addRelations } from './add-relations';
import { addSourceField } from './add-source-field';
import { Assertions } from './assertions';
import { iterateOverFields } from './helpers';
import { hideFields } from './hide-fields';
import { makeCategoryForest } from './make-category-forest';
import { mergeWithCustomForms } from './merge-with-custom-forms';
import { setGroupLabels } from './set-group-labels';
import { Valuelist } from '../../model/configuration/valuelist';
import { Relation } from '../../model/configuration/relation';
import { CategoryForm } from '../../model/configuration/category-form';
import { mergeBuiltInWithLibraryCategories } from './merge-built-in-with-library-categories';
import { getAvailableForms } from './get-available-forms';
import { BuiltInCategoryDefinition } from '../model/category/built-in-category-definition';
import { LibraryCategoryDefinition } from '../model/category/library-category-definition';
import { LibraryFormDefinition } from '../model/form/library-form-definition';
import { Forest, Tree } from '../../tools/forest';
import { sortStructArray } from '../../tools/sort-struct-array';
import { withDissoc } from '../../tools/utils';
import { linkParentAndChildInstances } from '../category-forest';
import { Field } from '../../model/configuration/field';
import { applyLanguagesToCategory, applyLanguagesToFields, applyLanguagesToForm, applyLanguagesToRelations } from './apply-languages-configurations';
import { Category } from '../../model/configuration/category';
import { BuiltInFieldDefinition } from '../model/field/built-in-field-definition';


const CATEGORIES = 0;


/**
 * @author Daniel de Oliveira
 * @author Thomas Kleinke
 */
export function buildRawProjectConfiguration(builtInCategories: Map<BuiltInCategoryDefinition>,
                                             libraryCategories: Map<LibraryCategoryDefinition>,
                                             libraryForms: Map<LibraryFormDefinition>,
                                             customForms?: Map<CustomFormDefinition>,
                                             commonFieldDefinitions: Map<BuiltInFieldDefinition> = {},
                                             libraryValuelists: Map<Valuelist> = {},
                                             customValuelists: Map<Valuelist> = {},
                                             builtInFieldDefinitions: Map<BuiltInFieldDefinition> = {},
                                             relationDefinitions: Array<Relation> = [],
                                             languageConfigurations: LanguageConfigurations = { default: {}, complete: {} },
                                             categoriesOrder: string[] = [],
                                             validateFields: any = identity,    // TODO Check if this has to be a parameter
                                             selectedParentForms?: string[]): RawProjectConfiguration {

    const valuelists: Map<Valuelist> = mergeValuelists(libraryValuelists, customValuelists);

    Assertions.performAssertions(
        builtInCategories, libraryCategories, libraryForms, commonFieldDefinitions, valuelists, customForms
    );
    addSourceField(builtInCategories, libraryCategories, libraryForms, commonFieldDefinitions, customForms);

    const categories: Map<TransientCategoryDefinition>
        = buildCategories(builtInCategories, libraryCategories, languageConfigurations, valuelists);
    const builtInFields: Map<Field>
        = buildFields(builtInFieldDefinitions, languageConfigurations, valuelists, 'fields');
    const commonFields: Map<Field>
        = buildFields(commonFieldDefinitions, languageConfigurations, valuelists, 'commons');
    applyLanguagesToRelations(languageConfigurations, relationDefinitions);

    setDefaultConstraintIndexed(categories, builtInFields, commonFields);

    const [forms, relations] = flow(
        getAvailableForms(categories, libraryForms, builtInFields, commonFields, relationDefinitions),
        cond(isDefined(customForms), Assertions.assertNoDuplicationInSelection(customForms)),
        cond(isDefined(customForms), mergeWithCustomForms(customForms, categories, builtInFields, commonFields, relationDefinitions)),
        cond(isDefined(customForms), removeUnusedForms(Object.keys(customForms ?? {}))),
        insertValuelistIds,
        Assertions.assertValuelistIdsProvided,
        replaceValuelistIdsWithValuelists(valuelists),
        cond(isDefined(customForms), hideFields),
        applyLanguagesForCustomFormFields(languageConfigurations, categories),
        prepareRawProjectConfiguration,
        addRelations(relationDefinitions),
        updateStruct(
            CATEGORIES,
            processForms(
                validateFields, languageConfigurations, categoriesOrder, relationDefinitions, categories,
                selectedParentForms
            )
        )
    );

    return {
        forms,
        categories: finalizeCategories(categories),
        relations,
        commonFields,
        valuelists
    };
}


const prepareRawProjectConfiguration = (forms: Map<TransientFormDefinition>) => [forms, [] /* relations */];


function buildCategories(builtInCategories: Map<BuiltInCategoryDefinition>,
                         libraryCategories: Map<LibraryCategoryDefinition>,
                         languageConfigurations: LanguageConfigurations,
                         valuelists: Map<Valuelist>): Map<TransientCategoryDefinition> {

    const categories: Map<TransientCategoryDefinition> = mergeBuiltInWithLibraryCategories(
        builtInCategories, libraryCategories
    );
    
    for (const categoryDefinition of Object.values(categories)) {
        applyLanguagesToCategory(languageConfigurations, categoryDefinition);
        for (const fieldName of Object.keys(categoryDefinition.fields)) {
            categoryDefinition.fields[fieldName].name = fieldName;
            setDefaultFieldVisibility(categoryDefinition.fields[fieldName]);
            Assertions.assertValuelistIdsProvided(categories);
            replaceValuelistIdWithValuelist(categoryDefinition.fields[fieldName], valuelists);
        }
    }

    return categories;
}


function buildFields(fieldDefinitions: Map<BuiltInFieldDefinition>, languageConfigurations: LanguageConfigurations,
                     valuelists: Map<Valuelist>, section: 'fields'|'commons'): Map<Field> {
    
    const fields: Map<TransientFieldDefinition> = fieldDefinitions as Map<TransientFieldDefinition>;

    for (const fieldName of Object.keys(fields)) {
        fields[fieldName].name = fieldName;
        setDefaultFieldVisibility(fields[fieldName]);
        replaceValuelistIdWithValuelist(fields[fieldName], valuelists);
    }

    applyLanguagesToFields(languageConfigurations, fields, section);

    return fields as Map<Field>;
}


function mergeValuelists(libraryValuelists: Map<Valuelist>, customValuelists: Map<Valuelist>): Map<Valuelist> {

    const valuelists: Map<Valuelist> = Object.keys(libraryValuelists).reduce((result, valuelistId) => {
        result[valuelistId] = clone(libraryValuelists[valuelistId]);
        result[valuelistId].id = valuelistId;
        result[valuelistId].source = 'library';
        return result;
    }, {});

    return Object.keys(customValuelists).reduce((result, valuelistId) => {
        if (!result[valuelistId]) {
            result[valuelistId] = clone(customValuelists[valuelistId]);
            result[valuelistId].id = valuelistId;
            result[valuelistId].source = 'custom';
        }
        return result;
    }, valuelists);
}


function processForms(validateFields: any,
                      languageConfigurations: LanguageConfigurations,
                      categoriesOrder: string[],
                      relations: Array<Relation>,
                      categories: Map<TransientCategoryDefinition>,
                      selectedParentForms?: string[]): Mapping<Map<TransientFormDefinition>, Forest<CategoryForm>> {

    return compose(
        validateFields,
        makeCategoryForest(relations, categories, selectedParentForms),
        Forest.map(curry(setGroupLabels, languageConfigurations)),
        orderCategories(categoriesOrder),
        linkParentAndChildInstances
    );
}


function setDefaultConstraintIndexed(categories:  Map<TransientCategoryDefinition>, builtInFields: Map<Field>,
                                     commonFields: Map<Field>) {

    iterateOverFields(categories, (categoryName, category, fieldName, field) => {
        field.defaultConstraintIndexed = field.constraintIndexed === true;
    });

    Object.values(builtInFields).concat(Object.values(commonFields)).forEach(field => {
        field.defaultConstraintIndexed = field.constraintIndexed === true;
    });
}


const orderCategories = (categoriesOrder: string[] = []) => (categories: Forest<CategoryForm>): Forest<CategoryForm> =>
    Tree.mapTrees(sortStructArray(categoriesOrder, Tree.ITEMNAMEPATH), categories) as Forest<CategoryForm>;


function setDefaultFieldVisibility(field: TransientFieldDefinition) {

    if (field.visible === undefined) field.visible = true;
    if (field.editable === undefined) field.editable = true;
}


function insertValuelistIds(forms: Map<TransientFormDefinition>): Map<TransientFormDefinition> {

    iterateOverFields(forms, (_, form: TransientFormDefinition, fieldName, field) => {

        if (form.valuelists && form.valuelists[fieldName]) {
            field.valuelistId = form.valuelists[fieldName];
        }
        if (form.positionValuelists && form.positionValuelists[fieldName]) {
            field.positionValuelistId = form.positionValuelists[fieldName];
        }
    });

    return forms;
}


function replaceValuelistIdsWithValuelists(valuelists: Map<Valuelist>) {
    
    return (forms: Map<TransientFormDefinition>): Map<TransientFormDefinition> => {

        for (const form of Object.values(forms)) {
            if (!form.fields) continue;
            for (const field of Object.values(form.fields)) {
                replaceValuelistIdWithValuelist(field, valuelists);
            }
        }

        return forms;
    }
}


function replaceValuelistIdWithValuelist(field: TransientFieldDefinition, valuelists: Map<Valuelist>) {

    if (!field.valuelistId && !field.positionValuelistId) return;

    field.valuelist = valuelists[field.valuelistId!];
    field.positionValues = valuelists[field.positionValuelistId!];
    delete field.valuelistId;
    delete field.positionValuelistId;
}


function applyLanguagesForCustomFormFields(languageConfigurations: LanguageConfigurations,
                                           categories: Map<TransientCategoryDefinition>) {
    
    return (forms: Map<TransientFormDefinition>): Map<TransientFormDefinition> => {

        for (const form of Object.values(forms)) {
            applyLanguagesToForm(languageConfigurations, form, form.parent ?? categories[form.categoryName].parent);
        }
        
        return forms;
    }
}


function removeUnusedForms(selectedFormsNames: string[]): Mapping<Map<TransientFormDefinition>> {

    return (forms: Map<TransientFormDefinition>) => {

        const formsToRemove = flow(
            forms,
            Object.keys,
            filter(isNot(includedIn(selectedFormsNames)))
        );

        return formsToRemove.reduce(withDissoc, forms) as Map<TransientFormDefinition>;
    }
}


function finalizeCategories(categories: Map<TransientCategoryDefinition>): Map<Category> {

    for (const category of Object.values(categories)) {
        delete category.minimalForm;
    }
    
    return categories as Map<Category>;
}
