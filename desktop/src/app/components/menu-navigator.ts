import { Router } from '@angular/router';
import { Injectable, NgZone } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Datastore, Document } from 'idai-field-core';
import { reloadAndSwitchToHomeRoute } from '../services/reload';
import { DoceditComponent } from './docedit/docedit.component';
import { SettingsService } from '../services/settings/settings-service';
import { Menus } from '../services/menus';
import { DeleteProjectModalComponent } from './project/delete-project-modal.component';
import { MenuContext } from '../services/menu-context';
import { CreateProjectModalComponent } from './project/create-project-modal.component';
import { SynchronizationModalComponent } from './project/synchronization-modal.component';

const ipcRenderer = typeof window !== 'undefined' ? window.require('electron').ipcRenderer : require('electron').ipcRenderer;


@Injectable()
/**
 * @author Thomas Kleinke
 */
export class MenuNavigator {

    constructor(private router: Router,
                private zone: NgZone,
                private settingsService: SettingsService,
                private datastore: Datastore,
                private modalService: NgbModal,
                private menuService: Menus) {}


    public initialize() {

        ipcRenderer.on('menuItemClicked', async (event: any, menuItem: string, projectName?: string) => {
            await this.onMenuItemClicked(menuItem, projectName);
        });

        this.menuService.setContext('default');
    }


    public async onMenuItemClicked(menuItem: string, projectName?: string) {

        if (menuItem === 'openProject') {
            await this.settingsService.selectProject(projectName);
            reloadAndSwitchToHomeRoute();
        } else if (menuItem === 'createProject') {
            await this.zone.run(async () => this.createProject());
        } else if (menuItem === 'editProject') {
            await this.zone.run(async () => this.editProject());
        } else if (menuItem === 'deleteProject') {
            await this.zone.run(async () => this.deleteProject());
        } else if (menuItem === 'projectSynchronization') {
            await this.zone.run(async () => this.openSynchronizationModal());
        } else {
            await this.zone.run(async () => await this.router.navigate([menuItem]));
        }
    }


    public async createProject() {

        this.menuService.setContext(MenuContext.MODAL);

        const modalRef = this.modalService.open(CreateProjectModalComponent,
            { backdrop: 'static', keyboard: false }
        );

        try {
            await modalRef.result;
        } catch(err) {
            // Create project modal has been canceled
        }

        this.menuService.setContext(MenuContext.DEFAULT);
    }


    public async editProject(activeGroup: string = 'stem') {

        this.menuService.setContext(MenuContext.DOCEDIT);

        const projectDocument: Document = await this.datastore.get('project');

        const modalRef = this.modalService.open(DoceditComponent,
            { size: 'lg', backdrop: 'static', keyboard: false }
        );
        modalRef.componentInstance.setDocument(projectDocument);
        modalRef.componentInstance.activeGroup = activeGroup;

        try {
            await modalRef.result;
        } catch(err) {
            // Docedit modal has been canceled
        }

        this.menuService.setContext(MenuContext.DEFAULT);
    }


    public async deleteProject() {

        this.menuService.setContext(MenuContext.MODAL);

        const modalRef = this.modalService.open(DeleteProjectModalComponent,
            { backdrop: 'static', keyboard: false }
        );

        try {
            await modalRef.result;
        } catch(err) {
            // Delete project modal has been canceled
        }

        this.menuService.setContext(MenuContext.DEFAULT);
    }


    public async openSynchronizationModal() {

        this.menuService.setContext(MenuContext.MODAL);

        const modalRef = this.modalService.open(SynchronizationModalComponent,
            { backdrop: 'static', keyboard: false }
        );

        try {
            await modalRef.result;
        } catch(err) {
            // Synchronization project modal has been canceled
        }

        this.menuService.setContext(MenuContext.DEFAULT);
    }
}