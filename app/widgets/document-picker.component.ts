import {Component, EventEmitter, Input, Output} from "@angular/core";
import {Datastore, Query, FilterSet} from "idai-components-2/datastore";
import {ConfigLoader} from "idai-components-2/configuration";
import {IdaiFieldDocument} from "../model/idai-field-document";
import {FilterUtility} from "../util/filter-utility";

@Component({
    selector: 'document-picker',
    moduleId: module.id,
    templateUrl: './document-picker.html'
})
export class DocumentPickerComponent {

    @Output() documentSelected: EventEmitter<IdaiFieldDocument> = new EventEmitter<IdaiFieldDocument>();

    public documents: IdaiFieldDocument[];
    protected query: Query;

    constructor(
        private datastore: Datastore,
        private configLoader: ConfigLoader

    ) {
        this.query = {q: '', filterSets: []};
    }

    public queryChanged(query: Query) {

        this.query = query;
        this.fetchDocuments(query);
    }

    /**
     * Populates the document list with all documents from
     * the datastore which match a <code>query</code>
     * @param query
     */
    public fetchDocuments(query: Query) {

        this.configLoader.getProjectConfiguration().then(projectConfiguration=>{

            this.query.filterSets = [FilterUtility.getNonImageTypesFilterSet(projectConfiguration.getTypesMap())];

            this.datastore.find(query).then(documents => {
                this.documents = documents as IdaiFieldDocument[];
            }).catch(err => console.error(err));
        })

    }
    
}