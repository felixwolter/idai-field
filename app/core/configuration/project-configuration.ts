import {MDInternal} from 'idai-components-2';
import {IdaiType} from './model/idai-type';
import {FieldDefinition} from './model/field-definition';
import {RelationDefinition} from './model/relation-definition';
import {ConfigurationDefinition} from './configuration-definition';
import {ProjectConfigurationUtils} from './project-configuration-utils';


/**
 * ProjectConfiguration maintains the current projects properties.
 * Amongst them is the set of types for the current project,
 * which ProjectConfiguration provides to its clients.
 *
 * Within a project, objects of the available types can get created,
 * where every type is a configuration of different fields.
 *
 * @author Thomas Kleinke
 * @author Daniel de Oliveira
 * @author Sebastian Cuy
 */
export class ProjectConfiguration {

    private projectIdentifier: string;
    
    private typesTree: { [typeName: string]: IdaiType } = {};

    private typesMap: { [typeName: string]: IdaiType } = {};

    private typesList: Array<IdaiType> = [];    

    private typesColorMap: { [typeName: string]: string } = {};

    private relationFields: Array<RelationDefinition>|undefined = undefined;


    /**
     * @param configuration
     */
    constructor(configuration: any) {

        this.initTypes(configuration);

        this.projectIdentifier = configuration.identifier;
        this.relationFields = configuration.relations;
    }


    public getAllRelationDefinitions(): Array<RelationDefinition> {

        return this.relationFields
            ? this.relationFields as Array<RelationDefinition>
            : [];
    }


    /**
     * @returns {Array<IdaiType>} All types in flat array, ignoring hierarchy
     */
    public getTypesList(): Array<IdaiType> {

        return this.typesList;
    }


    public getTypesMap(): any {

        return this.typesMap;
    }


    public getTypesTree() : any {

        return this.typesTree;
    }

    /**
     * Gets the relation definitions available.
     *
     * @param typeName the name of the type to get the relation definitions for.
     * @param isRangeType If true, get relation definitions where the given type is part of the relation's range
     *                    (instead of domain)
     * @param property to give only the definitions with a certain boolean property not set or set to true
     * @returns {Array<RelationDefinition>} the definitions for the type.
     */
    public getRelationDefinitions(typeName: string, isRangeType: boolean = false,
                                  property?: string): Array<RelationDefinition>|undefined {

        if (!this.relationFields) return undefined;

        const availableRelationFields: Array<RelationDefinition> = [];
        for (let relationField of this.relationFields) {
            const types: string[] = isRangeType ? relationField.range : relationField.domain;

            if (types.indexOf(typeName) > -1) {
                if (!property ||
                    (relationField as any)[property] == undefined ||
                    (relationField as any)[property] == true) {
                    availableRelationFields.push(relationField);
                }
            }
        }
        return availableRelationFields;
    }

    /**
     * @returns {boolean} True if the given domain type is a valid domain type for a relation definition which has the
     * given range type & name
     */
    public isAllowedRelationDomainType(domainTypeName: string, rangeTypeName: string, relationName: string): boolean {

        const relationDefinitions: Array<RelationDefinition>|undefined = this.getRelationDefinitions(rangeTypeName, true);
        if (!relationDefinitions) return false;

        for (let relationDefinition of relationDefinitions) {
            if (relationName == relationDefinition.name
                && relationDefinition.domain.indexOf(domainTypeName) > -1) return true;
        }

        return false;
    }


    /**
     * @param typeName
     * @returns {any[]} the fields definitions for the type.
     */
    public getFieldDefinitions(typeName: string): FieldDefinition[] {

        if (!this.typesMap[typeName]) return [];
        return this.typesMap[typeName].fields;
    }


    public getLabelForType(typeName: string): string {

        if (!this.typesMap[typeName]) return '';
        return this.typesMap[typeName].label;
    }


    public getColorForType(typeName: string): string {

        return this.typesColorMap[typeName];
    }


    public getTextColorForType(typeName: string): string {

        return ProjectConfigurationUtils.isBrightColor(this.getColorForType(typeName)) ? '#000000' : '#ffffff';
    }


    public getTypeColors(): { [typeName: string]: string } {

        return this.typesColorMap;
    }


    public isMandatory(typeName: string, fieldName: string): boolean {

        return this.hasProperty(typeName, fieldName, 'mandatory');
    }
    
    public isVisible(typeName: string, fieldName: string): boolean {

        return this.hasProperty(typeName, fieldName, 'visible');
    }


    /**
     * Should be used only from within components.
     * 
     * @param relationName
     * @returns {string}
     */
    public getRelationDefinitionLabel(relationName: string): string {

        const relationFields = this.relationFields;
        return ProjectConfigurationUtils.getLabel(relationName, relationFields as any);
    }


    /**
     * Gets the label for the field if it is defined.
     * Otherwise it returns the fields definitions name.
     *
     * @param typeName
     * @param fieldName
     * @returns {string}
     * @throws {string} with an error description in case the type is not defined.
     */
    public getFieldDefinitionLabel(typeName: string, fieldName: string): string {

        const fieldDefinitions = this.getFieldDefinitions(typeName);
        if (fieldDefinitions.length == 0)
            throw 'No type definition found for type \'' + typeName + '\'';

        return ProjectConfigurationUtils.getLabel(fieldName, fieldDefinitions);
    }


    private hasProperty(typeName: string, fieldName: string, propertyName: string) {

        if (!this.typesMap[typeName]) return false;
        const fields = this.typesMap[typeName].fields;

        for (let i in fields) {
            if (fields[i].name == fieldName) {
                if ((fields[i] as any)[propertyName as any] == true) {
                    return true;
                }
            }
        }
        return false;
    }


    private initTypes(configuration: ConfigurationDefinition) {

        for (let type of configuration.types) {
            this.typesMap[type.type] = IdaiType.build(type);

            this.typesColorMap[type.type] =
                this.typesMap[type.type] && this.typesMap[type.type].color
                    ? this.typesMap[type.type].color as string
                    : ProjectConfigurationUtils.generateColorForType(type.type);
        }

        for (let type of configuration.types) {
            if (!type['parent']) {
                this.typesTree[type.type] = this.typesMap[type.type];
            } else {
                const parentType = this.typesMap[type.parent as any];
                if (parentType == undefined) throw MDInternal.PROJECT_CONFIGURATION_ERROR_GENERIC;
                IdaiType.addChildType(parentType, this.typesMap[type.type]);
            }
        }
        
        for (let type of configuration.types) {
            this.typesList.push(this.typesMap[type.type]);
        }
    }
}
