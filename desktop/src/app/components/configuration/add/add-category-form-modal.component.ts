import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Document, CategoryForm, ConfigurationDocument } from 'idai-field-core';
import { ConfigurationIndex } from '../configuration-index';
import { MenuContext } from '../../../services/menu-context';
import { AngularUtility } from '../../../angular/angular-utility';
import { CategoryEditorModalComponent } from '../editor/category-editor-modal.component';
import { ErrWithParams } from '../../import/import/import-documents';
import { Modals } from '../../../services/modals';
import { ConfigurationUtil } from '../configuration-util';


@Component({
    templateUrl: './add-category-form-modal.html',
    host: {
        '(window:keydown)': 'onKeyDown($event)',
    }
})
/**
 * @author Daniel de Oliveira
 */
export class AddCategoryFormModalComponent {

    public configurationIndex: ConfigurationIndex;
    public configurationDocument: ConfigurationDocument;
    public parentCategory: CategoryForm;
    public categoryToReplace?: CategoryForm;
    public projectCategoryNames?: string[];

    public searchTerm: string = '';
    public selectedForm: CategoryForm|undefined;
    public categoryForms: Array<CategoryForm> = [];

    public saveAndReload: (configurationDocument: ConfigurationDocument, reindexCategory?: string) =>
        Promise<ErrWithParams|undefined>;


    constructor(public activeModal: NgbActiveModal,
                private modals: Modals) {}


    public initialize() {

        this.applyCategoryNameSearch();
    }


    public async onKeyDown(event: KeyboardEvent) {

        if (event.key === 'Escape') this.activeModal.dismiss('cancel');
    }


    public selectForm(category: CategoryForm) {

        this.selectedForm = category;
    }


    public addSelectedCategory() {

        if (!this.selectedForm) return;

        const clonedConfigurationDocument = this.categoryToReplace
            ? ConfigurationUtil.deleteCategory(this.categoryToReplace, this.configurationDocument, false)
            : Document.clone(this.configurationDocument);

        clonedConfigurationDocument.resource.forms[this.selectedForm.libraryId] = {
            fields: {},
            hidden: []
        };

        clonedConfigurationDocument.resource.order = ConfigurationUtil.addToCategoriesOrder(
            clonedConfigurationDocument.resource.order, this.selectedForm.name, this.parentCategory?.name
        );

        try {
            this.saveAndReload(clonedConfigurationDocument, this.selectedForm.name);
            this.activeModal.close();
        } catch { /* stay in modal */ }
    }


    public cancel() {

        this.activeModal.dismiss('cancel');
    }


    public applyCategoryNameSearch() {

        this.categoryForms = ConfigurationIndex
            .find(this.configurationIndex, this.searchTerm, this.parentCategory?.name,
                !this.parentCategory && !this.categoryToReplace)
            .filter(category =>
                !Object.keys(this.configurationDocument.resource.forms).includes(
                    category.libraryId ?? category.name
                ) && (!this.projectCategoryNames || !this.projectCategoryNames.includes(category.name))
                && (!this.categoryToReplace || category.name === this.categoryToReplace.name)
            );

        this.selectedForm = this.categoryForms?.[0];
    }


    public async createNewSubcategory() {

        const [result, componentInstance] = this.modals.make<CategoryEditorModalComponent>(
            CategoryEditorModalComponent,
            MenuContext.CONFIGURATION_EDIT,
            'lg'
        );

        componentInstance.saveAndReload = this.saveAndReload;
        componentInstance.configurationDocument = this.configurationDocument;
        componentInstance.category = CategoryForm.build(this.searchTerm, this.parentCategory);
        componentInstance.new = true;
        componentInstance.initialize();

        this.modals.awaitResult(result,
            () => this.activeModal.close(),
            () => AngularUtility.blurActiveElement()
        );
    }
}