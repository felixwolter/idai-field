import { FeatureDocument, IndexFacade, PouchdbDatastore } from 'idai-field-core';
import { CachedDatastore } from '../cached/cached-datastore';
import { CategoryConverter } from '../cached/category-converter';
import { DocumentCache } from '../cached/document-cache';


/**
 * Data Access Object
 *
 * @author Daniel de Oliveira
 */
export class FeatureDatastore
    extends CachedDatastore<FeatureDocument> {

    constructor(datastore: PouchdbDatastore,
                indexFacade: IndexFacade,
                documentCache: DocumentCache<FeatureDocument>,
                documentConverter: CategoryConverter<FeatureDocument>) {

        super(datastore, indexFacade, documentCache, documentConverter, 'FeatureDocument');
    }
}
