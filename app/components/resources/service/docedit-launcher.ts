import {Injectable} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Document} from 'idai-components-2/core';
import {IdaiFieldDocument} from 'idai-components-2/idai-field-model';
import {DocumentEditChangeMonitor} from 'idai-components-2/documents';
import {DoceditComponent} from '../../docedit/docedit.component';
import {DoceditActiveTabService} from '../../docedit/docedit-active-tab-service';
import {ViewFacade} from '../state/view-facade';

@Injectable()
/**
 * @author Daniel de Oliveira
 * @author Sebastian Cuy
 * @author Thomas Kleinke
 */
export class DoceditLauncher {

    constructor(
            private modalService: NgbModal,
            private doceditActiveTabService: DoceditActiveTabService,
            private documentEditChangeMonitor: DocumentEditChangeMonitor,
            private viewFacade: ViewFacade
    ) {}


    public async editDocument(document: Document, activeTabName?: string): Promise<any> {

        if (activeTabName) this.doceditActiveTabService.setActiveTab(activeTabName);

        const doceditRef = this.modalService.open(DoceditComponent,
            { size: 'lg', backdrop: 'static', keyboard: false });
        doceditRef.componentInstance.setDocument(document);

        const result: any = {};

        await doceditRef.result.then(
            res => this.handleSaveResult(result, res),
            closeReason => this.handleClosed(closeReason)
        );

        return result;
    }


    private async handleSaveResult(result: any, res: any) {

        result['document'] = res['document'];

        const nextActiveTab = this.doceditActiveTabService.getActiveTab();
        if (['relations','images','fields'].indexOf(nextActiveTab) != -1) {
            result['tab'] = nextActiveTab;
        }

        result['updateScrollTarget'] = true;

        await this.viewFacade.setSelectedDocument(result['document'] as IdaiFieldDocument);
        await this.viewFacade.populateDocumentList();
    }


    private async handleClosed(closeReason: string) {

        this.documentEditChangeMonitor.reset();

        if (closeReason == 'deleted') {
            this.viewFacade.deselect();
            await this.viewFacade.rebuildNavigationPath();
            await this.viewFacade.populateDocumentList();
        }
    }
}