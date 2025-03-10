import { ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { filter, flatten, flow, is, Map, map, remove, set, take, pipe } from 'tsfun';
import { Document, Datastore, FieldDocument, Relation, SyncService, SyncStatus, Resource,
    ProjectConfiguration, Named, Hierarchy, SortUtil } from 'idai-field-core';
import { makeLookup } from '../../../../../../core/src/tools/transformers';
import { Imagestore } from '../../../services/imagestore/imagestore';
import { PLACEHOLDER } from '../../image/row/image-row';
import { NavigationPath } from '../../../components/resources/view/state/navigation-path';
import { ViewFacade } from '../../../components/resources/view/view-facade';
import { TabManager } from '../../../services/tabs/tab-manager';
import { Loading } from '../../widgets/loading';
import { BaseList } from '../base-list';
import { ResourcesComponent } from '../resources.component';
import { ViewModalLauncher } from '../service/view-modal-launcher';
import { ResourcesContextMenu } from '../widgets/resources-context-menu';
import { ResourcesContextMenuAction } from '../widgets/resources-context-menu.component';
import { ComponentHelpers } from '../../component-helpers';
import { Routing } from '../../../services/routing';
import { Menus } from '../../../services/menus';
import { MenuContext } from '../../../services/menu-context';
import { TypeImagesUtil } from '../../../util/type-images-util';


@Component({
    selector: 'types',
    templateUrl: './types.html',
    host: {
        '(window:contextmenu)': 'handleClick($event, true)',
        '(window:keydown)': 'onKeyDown($event)'
    }
})
/**
 * @author Thomas Kleinke
 * @author Sebastian Cuy
 */
export class TypesComponent extends BaseList implements OnChanges {

    /**
     * These are the Type documents found at the current level,
     * as given by the current selected segment of the navigation path.
     */
    @Input() documents: Array<FieldDocument>;

    /**
     * Undefined if we are on the top level.
     * If defined, this is the document also represented
     * by the current selected segment of the navigation path,
     * which is either a Type Catalogue, a Type (or a subtype of a Type, which is always also a Type).
     */
    public mainDocument: FieldDocument|undefined;

    /**
     * All Types and Subtypes below the mainDocument (see field above).
     */
    private subtypes: Map<FieldDocument> = {};

    /**
     * The 'regular' (meaning non-Type-) documents, which are linked
     * to all subtypes (see field above).
     */
    public linkedDocuments: Array<FieldDocument> = [];

    public images: { [resourceId: string]: Array<Blob> } = {};
    public contextMenu: ResourcesContextMenu = new ResourcesContextMenu();

    private expandAllGroups: boolean = false;
    private visibleSections = ['types'];


    constructor(private datastore: Datastore,
                private imagestore: Imagestore,
                private viewModalLauncher: ViewModalLauncher,
                private routingService: Routing,
                private tabManager: TabManager,
                private changeDetectorRef: ChangeDetectorRef,
                private syncService: SyncService,
                private projectConfiguration: ProjectConfiguration,
                resourcesComponent: ResourcesComponent,
                viewFacade: ViewFacade,
                loading: Loading,
                menuService: Menus) {

        super(resourcesComponent, viewFacade, loading, menuService);
        resourcesComponent.listenToClickEvents().subscribe(event => this.handleClick(event));
        this.syncService.statusNotifications().subscribe(() => this.update(this.documents));
    }


    public isLoading = () => this.loading.isLoading();

    public getExpandAllGroups = () => this.expandAllGroups;

    public setExpandAllGroups = (expand: boolean) => this.expandAllGroups = expand;


    public isPlusButtonShown(): boolean {

        return super.isPlusButtonShown()
            && (!this.mainDocument || this.mainDocument.project === undefined);
    }


    async ngOnChanges(changes: SimpleChanges) {

        this.loading.start();
        await this.update(changes['documents'].currentValue);
        this.loading.stop();
        this.changeDetectorRef.detectChanges();
    }


    public async onKeyDown(event: KeyboardEvent) {

        if (event.key === 'Escape' && this.menuService.getContext() === MenuContext.DEFAULT) {
            await this.tabManager.openActiveTab();
        }
    }


    public async open(document: FieldDocument) {

        await this.viewFacade.moveInto(document, false, true);
    }


    public async edit(document: FieldDocument) {

        const editedDocument: FieldDocument|undefined = await this.resourcesComponent.editDocument(document);
        if (editedDocument) {
            await this.updateLinkedDocuments();
            this.loadImages([editedDocument], true);
        }
    }


    public async jumpToResource(document: FieldDocument) {

        await this.routingService.jumpToResource(document);
    }


    public async performContextMenuAction(action: ResourcesContextMenuAction) {

        if (this.contextMenu.documents.length !== 1) return;
        const document: FieldDocument = this.contextMenu.documents[0] as FieldDocument;

        this.contextMenu.close();

        switch (action) {
            case 'edit':
                await this.edit(document);
                break;
            case 'move':
                await this.resourcesComponent.moveDocuments([document]);
                break;
            case 'delete':
                await this.resourcesComponent.deleteDocument([document]);
                break;
            case 'edit-images':
                await this.viewModalLauncher.openImageViewModal(document, 'edit');
                this.loadImages(await Hierarchy.getAntescendents(
                    id => this.datastore.get(id), document.resource.id) as Array<FieldDocument>, true);
                break;
        }
    }


    public async openImageViewModal(document: Document) {

        await this.viewModalLauncher.openImageViewModal(document, 'view');
        this.loadImages(await Hierarchy.getAntescendents(
            id => this.datastore.get(id), document.resource.id) as Array<FieldDocument>, true);
    }


    public async openResourceViewModal(document: FieldDocument) {

        const edited: boolean = await this.viewModalLauncher.openResourceViewModal(document);
        if (edited) this.loadImages([document], true);
    }


    public getLinkedSubtype(document: FieldDocument): FieldDocument|undefined {

        if (!Document.hasRelations(document, Relation.Type.INSTANCEOF)) return undefined;

        for (const typeId of document.resource.relations.isInstanceOf) {
            const type = this.subtypes[typeId];
            if (type) return type;
        }
        return undefined;
    }


    public handleClick(event: any, rightClick: boolean = false) {

        if (!this.contextMenu.position) return;

        if (!ComponentHelpers.isInside(event.target, target =>
                target.id === 'context-menu'
                    || (rightClick && target.id && target.id.startsWith('type-grid-element')))) {

            this.contextMenu.close();
        }
    }


    public toggleSection(section: string) {

        if (!this.visibleSections.includes(section)) {
            this.visibleSections.push(section);
        } else {
            this.visibleSections.splice(this.visibleSections.indexOf(section), 1);
            if (this.visibleSections.length < 1) {
                (section === 'types') ? this.toggleSection('finds') : this.toggleSection('types');
            }
        }
    }


    public isSectionVisible = (section: string) => this.linkedDocuments.length === 0 || this.visibleSections.includes(section);


    private async update(documents: Array<FieldDocument>) {

        const newMainDocument: FieldDocument|undefined = this.getMainDocument();
        if (newMainDocument !== this.mainDocument) {
            this.mainDocument = newMainDocument;
            await this.updateLinkedDocuments();
        }
        if (documents.length > 0
                && this.syncService.getStatus() !== SyncStatus.Pushing
                && this.syncService.getStatus() !== SyncStatus.Pulling) {
            await this.loadImages(documents);
        }
    }


    private async updateLinkedDocuments() {

        this.subtypes = await this.getSubtypes();
        this.linkedDocuments = await this.getLinkedDocuments();
        await this.loadImages(this.linkedDocuments);
    }


    private getMainDocument(): FieldDocument|undefined {

        return this.viewFacade.isInExtendedSearchMode()
            ? undefined
            : NavigationPath.getSelectedSegment(this.viewFacade.getNavigationPath())?.document;
    }


    private async getSubtypes(): Promise<Map<FieldDocument>> {

        if (!this.mainDocument) return {};

        const subtypesArray = (await this.datastore.find({
            constraints: {
                'isChildOf:contain': {
                    value: this.mainDocument.resource.id,
                    searchRecursively: true
                }
            }
        })).documents as Array<FieldDocument>;

        return makeLookup([Document.RESOURCE, Resource.ID])(subtypesArray);
    }


    private async getLinkedDocuments(): Promise<Array<FieldDocument>> {

        if (!this.mainDocument) return [];

        const linkedResourceIds: string[] = flow(
            [this.mainDocument].concat(Object.values(this.subtypes)),
            filter(pipe(Document.hasRelations, Relation.Type.HASINSTANCE)),
            map(document => document.resource.relations[Relation.Type.HASINSTANCE]),
            flatten(),
            set as any // TODO any
        );

        const linkedDocuments: Array<FieldDocument>
            = await this.datastore.getMultiple(linkedResourceIds) as Array<FieldDocument>;

        return linkedDocuments.sort((linkedDocument1, linkedDocument2) => {
            return SortUtil.alnumCompare(linkedDocument1.resource.identifier, linkedDocument2.resource.identifier);
        });
    }


    private async loadImages(documents: Array<FieldDocument>, reload: boolean = false) {

        if (!this.images) this.images = {};

        const imageLinks: Array<{ resourceId: string, imageIds: string[] }> = [];

        for (const document of documents) {
            if (!reload && this.images[document.resource.id]) continue;
            imageLinks.push({ resourceId: document.resource.id, imageIds: this.getLinkedImageIds(document) });
        }

        const imageIds: string[] = flatten(imageLinks.map(_ => _.imageIds));

        const urls: { [imageId: string]: Blob } = await this.imagestore.readThumbnails(imageIds);

        imageLinks.forEach(imageLink => this.images[imageLink.resourceId] = imageLink.imageIds.map(id => urls[id]));
    }


    private getLinkedImageIds(document: FieldDocument): string[] {

        if (Document.hasRelations(document, Relation.Image.ISDEPICTEDIN)) {
            return [document.resource.relations[Relation.Image.ISDEPICTEDIN][0]];
        } else if (this.isCatalogOrType(document)) {
            return this.getImageIdsOfLinkedResources(document);
        } else {
            return [];
        }
    }


    private getImageIdsOfLinkedResources(document: FieldDocument): string[] {

        const getLinkedImageIds = pipe(TypeImagesUtil.getLinkedImageIds, this.datastore);

        return flow(document,
            getLinkedImageIds,
            remove(is(PLACEHOLDER)),
            take(4));
    }


    private isCatalogOrType(document: FieldDocument): boolean {

        return this.projectConfiguration.getTypeCategories().map(Named.toName).includes(document.resource.category);
    }
}
