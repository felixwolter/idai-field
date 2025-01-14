import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { nop, on, to } from 'tsfun';
import { CategoryForm, ConfigurationDocument, Field, Document, CustomFormDefinition, SortUtil, Labels } from 'idai-field-core';
import { ConfigurationIndex } from '../../../../services/configuration/index/configuration-index';
import { Modals } from '../../../../services/modals';
import { FieldEditorModalComponent } from '../../editor/field-editor-modal.component';
import { MenuContext } from '../../../../services/menu-context';
import { ConfigurationUtil, InputType } from '../../configuration-util';
import { SaveResult } from '../../configuration.component';


@Component({
    templateUrl: './add-field-modal.html',
    host: {
        '(window:keydown)': 'onKeyDown($event)',
    }
})
/**
 * @author Thomas Kleinke
 */
export class AddFieldModalComponent {

    public configurationDocument: ConfigurationDocument;
    public category: CategoryForm;
    public groupName: string;
    public availableInputTypes: Array<InputType>;
    public permanentlyHiddenFields: string[];
    public saveAndReload: (configurationDocument: ConfigurationDocument, reindexCategory?: string) =>
        Promise<SaveResult>;

    public searchTerm: string = '';
    public selectedField: Field|undefined;
    public emptyField: Field|undefined;
    public fields: Array<Field> = [];


    constructor(public activeModal: NgbActiveModal,
                private configurationIndex: ConfigurationIndex,
                private modals: Modals,
                private labels: Labels) {}


    public initialize() {
    
        this.applyFieldNameSearch();
    }


    public async onKeyDown(event: KeyboardEvent) {

        if (event.key === 'Escape') this.activeModal.dismiss('cancel');
    }


    public select(field: Field) {

        this.selectedField = field;
    }


    public confirmSelection() {

        if (!this.selectedField) return;

        if (this.selectedField === this.emptyField) {
            this.createNewField();
        } else {
            this.addSelectedField();
        }
    }


    public cancel() {

        this.activeModal.dismiss('cancel');
    }


    public applyFieldNameSearch() {

        this.fields = this.configurationIndex.findFields(
            this.searchTerm,
            this.category.source === 'custom' ? this.category.parentCategory.name : this.category.name
        )
            .concat(this.configurationIndex.findFields(this.searchTerm, 'commons'))
            .filter(field => (field.visible || field.editable)
                && !CategoryForm.getFields(this.category).map(to('name')).includes(field.name))
            .sort((field1, field2) => SortUtil.alnumCompare(this.labels.get(field1), this.labels.get(field2)));

        this.selectedField = this.fields?.[0];
        this.emptyField = this.getEmptyField();
    }


    private addSelectedField() {

        const clonedConfigurationDocument = Document.clone(this.configurationDocument);
        const form: CustomFormDefinition = clonedConfigurationDocument.resource
            .forms[this.category.libraryId ?? this.category.name];

        form.groups = ConfigurationUtil.createGroupsConfiguration(
            this.category, this.permanentlyHiddenFields
        );
        form.groups.find(on('name', this.groupName)).fields.push(this.selectedField.name);

        try {
            this.saveAndReload(clonedConfigurationDocument, this.category.name);
            this.activeModal.close();
        } catch {
            // Stay in modal
        }
    }


    private async createNewField() {

        const [result, componentInstance] = this.modals.make<FieldEditorModalComponent>(
            FieldEditorModalComponent,
            MenuContext.CONFIGURATION_EDIT,
            'lg'
        );

        componentInstance.saveAndReload = this.saveAndReload;
        componentInstance.configurationDocument = this.configurationDocument;
        componentInstance.category = this.category;
        componentInstance.field = {
            name: this.searchTerm,
            inputType: 'input',
            label: {},
            defaultLabel: {},
            description: {},
            defaultDescription: {},
            source: 'custom'
        };
        componentInstance.groupName = this.groupName;
        componentInstance.availableInputTypes = this.availableInputTypes;
        componentInstance.permanentlyHiddenFields = this.permanentlyHiddenFields;
        componentInstance.new = true;
        componentInstance.initialize();

        await this.modals.awaitResult(result, nop, () => this.activeModal.close());
    }


    private getEmptyField(): Field|undefined {

        if (this.searchTerm.length === 0) return undefined;

        return {
            name: this.searchTerm
        } as Field;
    }
}
