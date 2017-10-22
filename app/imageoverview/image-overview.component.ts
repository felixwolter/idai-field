import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Document} from 'idai-components-2/core';
import {IdaiFieldDocument} from 'idai-components-2/idai-field-model';
import {IdaiFieldImageDocument} from '../model/idai-field-image-document';
import {ReadDatastore} from 'idai-components-2/datastore';
import {Messages} from 'idai-components-2/messages';
import {LinkModalComponent} from './link-modal.component';
import {ImageGridComponent} from '../imagegrid/image-grid.component';
import {RemoveLinkModalComponent} from './remove-link-modal.component';
import {ViewFacade} from '../resources/view/view-facade';
import {ModelUtil} from '../model/model-util';
import {ImageOverviewFacade} from './view/imageoverview-facade';
import {PersistenceHelper} from './service/persistence-helper';

@Component({
    moduleId: module.id,
    templateUrl: './image-overview.html'
})
/**
 * Displays images as a grid of tiles.
 *
 * @author Daniel de Oliveira
 * @author Sebastian Cuy
 * @author Jan G. Wieners
 * @author Thomas Kleinke
 */
export class ImageOverviewComponent implements OnInit {

    @ViewChild('imageGrid') public imageGrid: ImageGridComponent;

    public operationTypeDocuments: Array<Document> = [];
    public totalImageCount: number;

    public maxGridSize: number = 6; // TODO before increasing this, make sure there is a solution to display the info box properly, or that it gets hidden automatically if images get too small or there are too many columns
    public minGridSize: number = 2;


    // provide access to static function
    public getDocumentLabel = (document) => ModelUtil.getDocumentLabel(document);

    // for clean and refactor safe template
    public getDocuments = () => this.imageOverviewFacade.getDocuments();
    public getSelected = () => this.imageOverviewFacade.getSelected();
    public select = (document) => this.imageOverviewFacade.select(document);
    public clearSelection = () => this.imageOverviewFacade.clearSelection();
    public getGridSize = () => this.imageOverviewFacade.getGridSize();
    public getQuery = () => this.imageOverviewFacade.getQuery();
    public getMainTypeDocumentFilterOption = () => this.imageOverviewFacade.getMainTypeDocumentFilterOption();
    public getDepictsRelationsSelected = () => this.imageOverviewFacade.getDepictsRelationsSelected();


    constructor(
        public viewFacade: ViewFacade,
        private router: Router,
        private datastore: ReadDatastore,
        private modalService: NgbModal,
        private messages: Messages,
        private imageOverviewFacade: ImageOverviewFacade,
        private persistenceHelper: PersistenceHelper
    ) {
        this.viewFacade.getAllOperationTypeDocuments().then(
            documents => this.operationTypeDocuments = documents,
            msgWithParams => messages.add(msgWithParams)
        );

        this.imageOverviewFacade.initialize().then(() => {
            this.imageOverviewFacade.fetchDocuments();
            this.updateTotalImageCount();
        });
    }


    public ngOnInit() {

        this.imageGrid.nrOfColumns = this.imageOverviewFacade.getGridSize();
    }


    public setGridSize(size) {

        if (size >= this.minGridSize && size <= this.maxGridSize) {
            this.imageOverviewFacade.setGridSize(parseInt(size));
            this.imageGrid.nrOfColumns = parseInt(size);
            this.imageGrid.calcGrid();
        }
    }


    public onResize() {

        this.imageGrid._onResize();
    }


    public refreshGrid() {

        this.imageOverviewFacade.fetchDocuments();
        this.updateTotalImageCount();
    }


    public setQueryString(q: string) {

        this.imageOverviewFacade.setQueryString(q);
    }


    public setQueryTypes(types: string[]) {

        this.imageOverviewFacade.setQueryTypes(types);
    }


    public resetSearch() {

        this.imageOverviewFacade.resetSearch();
    }


    /** // TODO factor out to a routing helper for the imageoverview package
     * @param documentToSelect the object that should be navigated to if the preconditions
     *   to change the selection are met.
     */
    public navigateTo(documentToSelect: IdaiFieldImageDocument) {

        this.router.navigate(
            ['images', documentToSelect.resource.id, 'show'],
            { queryParams: { from: 'images' } }
        );
    }


    public openDeleteModal(modal) {

        this.modalService.open(modal).result.then(result => {
            if (result == 'delete') this.deleteSelected();
        });
    }


    public openLinkModal() {

        this.modalService.open(LinkModalComponent).result.then( (targetDoc: IdaiFieldDocument) => {
            if (targetDoc) {
                this.persistenceHelper.addRelationsToSelectedDocuments(targetDoc)
                    .then(() => {
                        this.imageOverviewFacade.clearSelection();
                    }).catch(msgWithParams => {
                        this.messages.add(msgWithParams);
                    });
            }
        }, () => {}); // do nothing on dismiss
    }


    public openRemoveLinkModal() {

        // TODO remove entries from resource identifiers necessary?

        this.modalService.open(RemoveLinkModalComponent)
            .result.then( () => {
                this.persistenceHelper.removeRelationsOnSelectedDocuments().then(() => {
                    this.imageGrid.calcGrid();
                    this.imageOverviewFacade.clearSelection();
                })
            }
            , () => {}); // do nothing on dismiss
    }


    public chooseMainTypeDocumentFilterOption(filterOption: string) {

        this.imageOverviewFacade.chooseMainTypeDocumentFilterOption(filterOption);
    }


    private deleteSelected() {

        this.persistenceHelper.deleteSelectedImageDocuments().then(
            () => {
                this.imageOverviewFacade.clearSelection();
                this.imageOverviewFacade.fetchDocuments();
                this.updateTotalImageCount();
            });
    }


    private updateTotalImageCount() {

        this.datastore.find(this.imageOverviewFacade.getDefaultQuery())
            .then(documents => this.totalImageCount = documents.length);
    }
}
