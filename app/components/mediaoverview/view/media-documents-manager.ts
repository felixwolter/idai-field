import {Injectable} from '@angular/core';
import {Query} from 'idai-components-2';
import {IdaiFieldMediaDocumentReadDatastore} from '../../../core/datastore/idai-field-media-document-read-datastore';
import {IdaiFieldMediaDocument} from '../../../core/model/idai-field-media-document';
import {MediaState} from './media-state';


@Injectable()
/**
 * @author Thomas Kleinke
 * @author Daniel de Oliveira
 */
export class MediaDocumentsManager {

    public selected: Array<IdaiFieldMediaDocument> = [];

    private documents: Array<IdaiFieldMediaDocument>;
    private totalDocumentCount: number;

    private depictsRelationsSelected: boolean = false;
    private currentQueryId: string;


    constructor(private mediaState: MediaState,
                private mediaDatastore: IdaiFieldMediaDocumentReadDatastore) {}


    public getSelected = (): Array<IdaiFieldMediaDocument> => this.selected;

    public getDocuments = (): Array<IdaiFieldMediaDocument> => this.documents;

    public getTotalDocumentCount = (): number => this.totalDocumentCount;

    public getDepictsRelationsSelected = (): boolean => this.depictsRelationsSelected;

    public clearSelection = () => this.selected = [];


    public remove(document: IdaiFieldMediaDocument) {

        this.documents.splice(this.documents.indexOf(document), 1);
    }


    public select(document: IdaiFieldMediaDocument) {

        if (this.selected.indexOf(document) == -1) this.selected.push(document);
        this.depictsRelationsSelected = this.doSelectedDocumentsContainDepictsRelations();
    }


    public toggleSelected(document: IdaiFieldMediaDocument) {

        if (this.selected.indexOf(document) == -1) {
            this.selected.push(document);
        } else {
            this.selected.splice(this.selected.indexOf(document), 1);
        }

        this.depictsRelationsSelected = this.doSelectedDocumentsContainDepictsRelations();
    }


    private doSelectedDocumentsContainDepictsRelations(): boolean {

        for (let document of this.selected) {
            if (document.resource.relations.depicts &&
                    document.resource.relations.depicts.length > 0) {
                return true;
            }
        }
        return false;
    }


    /**
     * Populates the document list with all documents from
     * the datastore which match a <code>query</code>
     */
    public async fetchDocuments(limit: number, offset?: number) {

        // console.log("limit: " + limit + ' offset ' + offset)

        this.currentQueryId = new Date().toISOString();

        const query: Query = JSON.parse(JSON.stringify(this.mediaState.getQuery()));
        if (offset) query.offset = offset;
        query.limit = limit;
        query.id = this.currentQueryId;

        try {
            const {documents, totalCount, queryId} = await this.mediaDatastore.find(query);
            if (queryId !== this.currentQueryId) return;

            this.documents = documents;
            this.totalDocumentCount = totalCount;
        } catch (errWithParams) {
            console.error('ERROR with find using query', query);
            if (errWithParams.length == 2) console.error('Cause: ', errWithParams[1]);
        }
    }
}