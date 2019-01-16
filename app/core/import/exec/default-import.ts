import {Document, ProjectConfiguration} from 'idai-components-2';
import {ImportValidator} from './import-validator';
import {DocumentDatastore} from '../../datastore/document-datastore';
import {ImportUpdater} from './import-updater';
import {ImportFunction} from './import-function';
import {DefaultImportCalc} from "./default-import-calc";


/**
 * @author Daniel de Oliveira
 * @author Thomas Kleinke
 */
export module DefaultImport {


    export function build(validator: ImportValidator,
                          operationTypeNames: string[],
                          projectConfiguration: ProjectConfiguration, // TODO give getInverseRelations as a param
                          generateId: () => string,
                          mergeMode: boolean = false,
                          allowOverwriteRelationsInMergeMode = false,
                          mainTypeDocumentId: string = '' /* '' => no assignment */,
                          useIdentifiersInRelations: boolean = false): ImportFunction {

        if (mainTypeDocumentId && mergeMode) {
            throw 'FATAL ERROR - illegal argument combination - mainTypeDocumentId and mergeIfExists must not be both truthy';
        }

        /**
         * @param datastore
         * @param username
         * @param documents documents with the field resource.identifier set to a non empty string.
         *   If resource.id is set, it will be taken as document.id on creation.
         *   The relations map is assumed to be at least existent, but can be empty.
         *   The resource.type field may be empty.
         * @param importReport
         *   .errors of ImportError or Validation Error
         */
        return async function importFunction(documents: Array<Document>,
                                             datastore: DocumentDatastore,
                                             username: string): Promise<{ errors: string[][], successfulImports: number }> {

            const {get, find, getInverseRelation} = neededFunctions(datastore, projectConfiguration);
            try {
                const process = DefaultImportCalc.build(
                    validator,
                    operationTypeNames,
                    generateId,
                    find,
                    get,
                    getInverseRelation,
                    mergeMode,
                    allowOverwriteRelationsInMergeMode,
                    mainTypeDocumentId,
                    useIdentifiersInRelations);

                const documentsForUpdateAndRelatedDocuments = await process(documents);

                const updateErrors = [];
                try {
                    await ImportUpdater.go(
                        documentsForUpdateAndRelatedDocuments[0],
                        documentsForUpdateAndRelatedDocuments[1], datastore, username, mergeMode);
                } catch (errWithParams) { updateErrors.push(errWithParams)}
                return { errors: updateErrors, successfulImports: documents.length };

            } catch (errWithParams) { return { errors: [errWithParams], successfulImports: 0 }}
        }
    }


    function findByIdentifier(datastore: DocumentDatastore) {

        return async (identifier: string): Promise<Document|undefined> => {

            const result = await datastore.find({ constraints: { 'identifier:match': identifier }});
            return result.totalCount === 1
                ? result.documents[0]
                : undefined;
        }
    }


    function neededFunctions(datastore: DocumentDatastore, projectConfiguration: ProjectConfiguration) {

        return {
            get: (resourceId: string) => datastore.get(resourceId), // TODO convert to a function who returns undefined and does not return error in case doc not found
            find: findByIdentifier(datastore),
            getInverseRelation: (propertyName: string) => projectConfiguration.getInverseRelations(propertyName)
        };
    }
}