import {Either, includedIn} from 'tsfun';
import {Document, toResourceId} from 'idai-components-2';
import {DocumentReadDatastore} from '../../datastore/document-read-datastore';
import {Name, ResourceId} from '../../constants';
import {ImageRelations, TypeRelations} from '../../model/relation-constants';
import {RelationsManager} from '../../model/relations-manager';
import {ImageRelationsManager} from '../../model/image-relations-manager';


export const ERROR_NOT_ALl_IMAGES_EXCLUSIVELY_LINKED =  'export.catalog.get-export-documents.not-all-images-exlusively-linked';


export async function getExportDocuments(datastore: DocumentReadDatastore,
                                         relationsManager: RelationsManager,
                                         imageRelationsManager: ImageRelationsManager,
                                         catalogId: ResourceId,
                                         project: Name)
    : Promise<Either<string[] /* msgWithParams */, [Array<Document>, Array<ResourceId>]>> {

    const catalogAndTypes = await relationsManager.get(catalogId, { descendants: true });

    const linkedImages = await imageRelationsManager.getLinkedImages(catalogAndTypes);
    const exclusivelyLinkedImages = await imageRelationsManager.getLinkedImages(catalogAndTypes, true);

    if (linkedImages.length !== exclusivelyLinkedImages.length) {
        return [
            [ERROR_NOT_ALl_IMAGES_EXCLUSIVELY_LINKED], // TODO add identifiers
            undefined
        ];
    }

    const relatedImages = cleanImageDocuments(
        linkedImages,
        catalogAndTypes.map(toResourceId));
    return [
        undefined,
        [
            catalogAndTypes
                .concat(relatedImages)
                .map(cleanDocument)
                .map(document => {
                    document.project = project;
                    return document;
                }),
            relatedImages.map(toResourceId)
        ]
    ];
}


function cleanImageDocuments(images: Array<Document>,
                             idsOfCatalogResources: Array<ResourceId>) {

    const relatedImageDocuments = [];
    for (let image of images) {

        image.resource.relations = {
            depicts: image.resource.relations[ImageRelations.DEPICTS]
                .filter(includedIn(idsOfCatalogResources)) // TODO currently we don't need to filter since we prohibit that scenario
        } as any;

        if (image.resource.relations[ImageRelations.DEPICTS].length > 0) {
            relatedImageDocuments.push(image);
        }
    }
    return relatedImageDocuments;
}


function cleanDocument(document: Document) {

    delete document['_attachments'];
    delete document[Document._REV];
    delete document['_id'];
    delete document[Document.CREATED];
    delete document[Document.MODIFIED];
    delete document.resource.relations[TypeRelations.HASINSTANCE];
    return document;
}
