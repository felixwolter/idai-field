import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {RelationsManager} from '../../../core/model/relations-manager';
import {M} from '../../messages/m';
import {readWldFile, Errors} from '../../../core/images/wld/wld-import';
import {downloadWldFile} from '../../../core/images/wld/wld-export';
import {Messages} from '../../messages/messages';
import {MenuContext, MenuService} from '../../menu-service';
import {SettingsProvider} from '../../../core/settings/settings-provider';


@Component({
    selector: 'georeference-view',
    templateUrl: './georeference-view.html'
})
/**
 * @author Thomas Kleinke
 */
export class GeoreferenceViewComponent {

    @Input() document: any;
    @Input() openSection: string|undefined;
    @Input() expandAllGroups: boolean;

    @Output() onSectionToggled: EventEmitter<string|undefined> = new EventEmitter<string|undefined>();

    @ViewChild('worldfileInput', { static: false }) worldfileInput: ElementRef;

    public shown: boolean = false;


    constructor(private relationsManager: RelationsManager,
                private messages: Messages,
                private modalService: NgbModal,
                private settingsProvider: SettingsProvider,
                private menuService: MenuService) {}


    public exportWldFile = () => downloadWldFile(this.document);


    public toggle() {

        if (this.openSection === 'georeference' && !this.expandAllGroups) {
            this.openSection = undefined;
        } else {
            this.openSection = 'georeference';
        }

        this.onSectionToggled.emit(this.openSection);
    }


    public async onSelectFile(event: any) {

        const files = event.target.files;

        if (files && files.length > 0) {
            try {
                this.document.resource.georeference = await readWldFile(files[0], this.document);
            } catch (e) {
                const msgWithParams = (e === Errors.FileReaderError) ? [M.IMAGES_ERROR_FILEREADER, files[0].name]
                    : (e === Errors.InvalidWldFileError) ? [M.IMAGESTORE_ERROR_INVALID_WORLDFILE, files[0].name]
                    : [M.MESSAGES_ERROR_UNKNOWN_MESSAGE];
                this.messages.add(msgWithParams);
                return;
            }

            try {
                await this.save();
            } catch(msgWithParams) {
                this.messages.add(msgWithParams);
            }
        }
    }


    public async openDeleteModal(modal: any) {

        this.menuService.setContext(MenuContext.GEOREFERENCE_EDIT);

        try {
            const result = await this.modalService.open(modal).result;
            if (result == 'delete') await this.deleteGeoreference();
        } catch (err) {
            // Modal has been canceled
        } finally {
            this.menuService.setContext(MenuContext.MODAL);
        }
    }


    private async deleteGeoreference() {

        this.document.resource.georeference = undefined;

        try {
            await this.save();
        } catch(msgWithParams) {
            this.messages.add(msgWithParams);
        }
    }


    private async save(): Promise<void> {

        try {
            Object.assign(
                this.document,
                await this.relationsManager.persist(this.document)
            );
        } catch (err) {
            console.error(err);
            throw [M.APP_ERROR_GENERIC_SAVE_ERROR];
        }
    }
}
