import { Component, NgZone, Renderer2, ViewChild } from '@angular/core';
import { Document, Datastore, IndexFacade } from 'idai-field-core';
import {ComponentHelpers} from '../component-helpers';
import { Routing } from '../../services/routing';
import { MenuNavigator } from '../menu-navigator';


@Component({
    selector: 'taskbar-conflicts',
    templateUrl: './taskbar-conflicts.html'
})
/**
 * @author Sebastian Cuy
 * @author Thomas Kleinke
 * @author Daniel de Oliveira
 */
export class TaskbarConflictsComponent {

    public conflicts: Array<Document> = [];

    private cancelClickListener: Function;

    @ViewChild('popover', { static: false }) private popover: any;


    constructor(private routingService: Routing,
                private renderer: Renderer2,
                private datastore: Datastore,
                private indexFacade: IndexFacade,
                private menuNavigator: MenuNavigator,
                private zone: NgZone) {

        this.fetchConflicts();
        this.indexFacade.changesNotifications().subscribe(() => {
            this.zone.run(() => {
                this.fetchConflicts();
            });
        });
    }


    public async openConflictResolver(document: Document) {

        if (this.popover.isOpen()) this.popover.close();

        if (document.resource.category === 'Project') {
            await this.menuNavigator.editProject('conflicts');
        } else {
            await this.routingService.jumpToConflictResolver(document);
        }
    };


    public togglePopover() {

        if (this.popover.isOpen()) {
            this.closePopover();
        } else {
            this.popover.open();
            this.cancelClickListener = this.startClickListener();
        }
    }


    private async fetchConflicts() {

        const result = await this.datastore.find({ constraints: { 'conflicts:exist': 'KNOWN' } });
        this.conflicts = result.documents;
    }


    private closePopover() {

        if (this.cancelClickListener) this.cancelClickListener();
        this.cancelClickListener = undefined as any;
        this.popover.close();
    }


    private handleClick(event: any) {

        if (!ComponentHelpers.isInside(event.target, target =>
               target.id === 'taskbar-conflicts-button-icon'
                    || target.id === 'taskbar-conflicts-button-pill'
                    || target.id === 'ngb-popover-1')) {

            this.closePopover();
        }
    }


    private startClickListener(): Function {

        return this.renderer.listen('document', 'click', (event: any) => {
            this.handleClick(event);
        });
    }
}
