import { Observable, Observer } from 'rxjs';
import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Document, Named, ProjectConfiguration } from 'idai-field-core';
import { DatastoreErrors } from 'idai-field-core';
import { ViewFacade } from '../components/resources/view/view-facade';
import { MenuNavigator } from '../components/menu-navigator';


@Injectable()
/**
 * Centralizes access to the Router.
 * Has knowledge about how to route into as well as route within
 * bigger components like ResourcesComponent (via ViewFacade).
 *
 * @author Daniel de Oliveira
 * @author Thomas Kleinke
 * @author Sebastian Cuy
 */
export class Routing {

    private currentRoute: any;


    constructor(private router: Router,
                private viewFacade: ViewFacade,
                private location: Location,
                private projectConfiguration: ProjectConfiguration,
                private menuNavigator: MenuNavigator) {}


    // For ResourcesComponent
    public routeParams(route: ActivatedRoute) {

        return Observable.create((observer: Observer<any>) => {
            this.setRoute(route, observer);
        });
    }


    public async jumpToOperationView(operation: Document) {

        await this.router.navigate(['resources', operation.resource.id]);
    }


    public async jumpToResource(documentToSelect: Document,
                                comingFromOutsideResourcesComponent: boolean = false) {

        if (comingFromOutsideResourcesComponent) this.currentRoute = undefined;

        if (documentToSelect.resource.category === 'Project') {
            await this.menuNavigator.editProject();
        } else if (this.projectConfiguration.isSubcategory(documentToSelect.resource.category, 'Image')) {
            await this.jumpToImageCategoryResource(documentToSelect, comingFromOutsideResourcesComponent);
        } else {
            await this.jumpToFieldCategoryResource(documentToSelect, comingFromOutsideResourcesComponent);
        }
    }


    public async jumpToConflictResolver(document: Document) {

        if (this.projectConfiguration.isSubcategory(document.resource.category, 'Image')) {
            if (this.router.url.includes('images')) {
                // indirect away first to reload the images component, in case you are already there
                await this.router.navigate(['images']);
            }
            return this.router.navigate(['images', 'conflicts', document.resource.id]);
        } else {
            const viewName: 'project'|'types'|string = this.getViewName(document);
            if (this.router.url.includes('resources')) {
                // indirect away first to reload the resources component, in case you are already there
                await this.router.navigate(['resources', viewName]);
            }
            return this.router.navigate(
                ['resources', viewName, document.resource.id, 'edit', 'conflicts']
            );
        }
    }


    private async jumpToImageCategoryResource(documentToSelect: Document,
                                              comingFromOutsideResourcesComponent: boolean) {

        const selectedDocument = this.viewFacade.getSelectedDocument();
        if (selectedDocument) {
            if (this.currentRoute && selectedDocument.resource && selectedDocument.resource.id) {
                this.currentRoute += '/' + selectedDocument.resource.id + '/show/images';
            }
        }

        await this.router.navigate(
            ['images', documentToSelect.resource.id, 'show',
                comingFromOutsideResourcesComponent ? 'fields' : 'relations'],
            { queryParams: { from: this.currentRoute } }
        );
    }


    private async jumpToFieldCategoryResource(documentToSelect: Document,
                                              comingFromOutsideResourcesComponent: boolean = false) {

        const viewName: 'project'|'types'|string = this.getViewName(documentToSelect);

        if (comingFromOutsideResourcesComponent || viewName !== this.viewFacade.getView()) {
            await this.router.navigate(['resources', viewName, documentToSelect.resource.id]);
        } else {
            await this.viewFacade.setSelectedDocument(documentToSelect.resource.id);
        }
    }


    // For ResourcesComponent
    // We need a setter because the route must come from the component it is bound to
    private setRoute(route: ActivatedRoute, observer: Observer<any>) {

        route.params.subscribe(async (params) => {

            this.currentRoute = undefined;
            if (params['view']) this.currentRoute = 'resources/' + params['view'];

            this.location.replaceState('resources/' + params['view']);

            try {
                await this.viewFacade.selectView(params['view']);
                observer.next(params);
            } catch (msgWithParams) {
                if (msgWithParams) {
                    if (msgWithParams.includes(DatastoreErrors.DOCUMENT_NOT_FOUND)) {
                        await this.router.navigate(['resources', 'project']);
                    } else {
                        console.error('Got msgWithParams in GeneralRoutingService#setRoute: ', msgWithParams);
                    }
                }
            }
        });
    }


    private getViewName(document: Document): 'project'|'types'|string {

        return this.projectConfiguration.getOverviewCategories().map(Named.toName).includes(document.resource.category)
            ? 'project'
            : this.projectConfiguration.getTypeCategories().map(Named.toName).includes(document.resource.category)
                ? 'types'
                : document.resource.relations['isRecordedIn'][0];
    }
}
