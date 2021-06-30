import { Component, Input, OnChanges, Output, SimpleChanges, EventEmitter } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { and, any, compose, flatten, includedIn, is, map, not, on, or, Predicate, to } from 'tsfun';
import { Category, ConfigurationDocument, CustomCategoryDefinition, FieldDefinition, Group, LabelUtil, Named,
    RelationDefinition, Resource, Document, GroupDefinition, Inplace, ProjectConfiguration, AppConfigurator, getConfigurationName } from 'idai-field-core';
import { ConfigurationUtil, OVERRIDE_VISIBLE_FIELDS } from '../../core/configuration/configuration-util';
import { MenuContext, MenuService } from '../menu-service';
import { AddFieldModalComponent } from './add-field-modal.component';
import { ConfigurationChange } from '../../core/configuration/configuration-change';
import { CategoryEditorModalComponent } from './editor/category-editor-modal.component';
import { FieldEditorModalComponent } from './editor/field-editor-modal.component';
import { InputType } from './project-configuration.component';
import { AngularUtility } from '../../angular/angular-utility';
import { SettingsProvider } from '../../core/settings/settings-provider';
import { Messages } from '../messages/messages';


@Component({
    selector: 'configuration-category',
    templateUrl: './configuration-category.html'
})
/**
* @author Sebastian Cuy
* @author Thomas Kleinke
 */
export class ConfigurationCategoryComponent implements OnChanges {

    @Input() category: Category;
    @Input() customConfigurationDocument: ConfigurationDocument;
    @Input() showHiddenFields: boolean = true;
    @Input() availableInputTypes: Array<InputType>;

    @Output() onEdited: EventEmitter<ConfigurationChange> = new EventEmitter<ConfigurationChange>();

    public selectedGroup: string;

    public label: string;
    public description: string;

    private permanentlyHiddenFields: string[];


    constructor(private menuService: MenuService,
                private modalService: NgbModal,
                private appConfigurator: AppConfigurator,
                private settingsProvider: SettingsProvider,
                private messages: Messages) {}
    

    ngOnChanges(changes: SimpleChanges) {

        if (changes['category']) {
            if (!changes['category'].previousValue
                    || changes['category'].currentValue.name !== changes['category'].previousValue.name) {
                this.selectedGroup = this.getGroups()[0].name;
            }
            this.permanentlyHiddenFields = this.getPermanentlyHiddenFields();
        }

        this.updateLabelAndDescription();
    }

    
    public getGroupLabel = (group: Group) => LabelUtil.getLabel(group);

    public getCustomLanguageConfigurations = () => this.customConfigurationDocument.resource.languages;

    public isHidden = (field: FieldDefinition) =>
        ConfigurationUtil.isHidden(this.getCustomCategoryDefinition(), this.getParentCustomCategoryDefinition())(field);


    public getCustomCategoryDefinition(): CustomCategoryDefinition|undefined {

        return this.customConfigurationDocument.resource.categories[this.category.libraryId ?? this.category.name];
    }

    
    public getParentCustomCategoryDefinition(): CustomCategoryDefinition|undefined {

        return this.category.parentCategory
            ? this.customConfigurationDocument.resource
                .categories[this.category.parentCategory.libraryId ?? this.category.parentCategory.name]
            : undefined;
    }


    public getGroups(): Array<Group> {

        return this.category.groups.filter(
            or(
                (group: Group) => group.fields.length > 0,
                (group: Group) => group.relations.length > 0
            )
        );
    }


    public hasCustomFields: Predicate<Group> = compose(
        to<Array<FieldDefinition>>(Group.FIELDS),
        map(_ => _.source),
        any(is(FieldDefinition.Source.CUSTOM))
    );


    public getFields(): Array<FieldDefinition> {

        return this.category.groups
            .find(on(Named.NAME, is(this.selectedGroup)))!
            .fields
            .filter(
                and(
                    on(FieldDefinition.NAME, not(includedIn(this.permanentlyHiddenFields))),
                    or(
                        () => this.showHiddenFields,
                        not(ConfigurationUtil.isHidden(
                            this.getCustomCategoryDefinition(), this.getParentCustomCategoryDefinition()
                        ))
                    )
                )
            );
    }


    public getRelations(): Array<RelationDefinition> {

        return this.category.groups
            .find(on(Named.NAME, is(this.selectedGroup)))!
            .relations
            .filter(on('editable', is(true)));
    }


    public async edit() {

        this.menuService.setContext(MenuContext.CONFIGURATION_EDIT);

        const modalReference: NgbModalRef = this.modalService.open(
            CategoryEditorModalComponent,
            { size: 'lg', backdrop: 'static', keyboard: false }
        );
        modalReference.componentInstance.customConfigurationDocument = this.customConfigurationDocument;
        modalReference.componentInstance.category = this.category;
        modalReference.componentInstance.initialize();

        try {
            this.onEdited.emit(await modalReference.result);
        } catch (err) {
            // Modal has been canceled
        } finally {
            this.menuService.setContext(MenuContext.DEFAULT);
            AngularUtility.blurActiveElement();
        }
    }


    public async addField() {

        this.menuService.setContext(MenuContext.MODAL);

        const modalReference: NgbModalRef = this.modalService.open(AddFieldModalComponent);

        try {
            await this.createNewField(await modalReference.result);
        } catch (err) {
            // Modal has been canceled
        } finally {
            this.menuService.setContext(MenuContext.DEFAULT);
        }
    }


    public async onDrop(event: CdkDragDrop<any>) {

        const groups: Array<GroupDefinition> = ConfigurationUtil.createGroupsConfiguration(
            this.category, this.permanentlyHiddenFields
        );
        const selectedGroup: GroupDefinition = groups.find(group => group.name === this.selectedGroup);
        Inplace.moveInArray(selectedGroup.fields, event.previousIndex, event.currentIndex);
    
        const clonedConfigurationDocument = Document.clone(this.customConfigurationDocument);
        clonedConfigurationDocument.resource
            .categories[this.category.libraryId ?? this.category.name]
            .groups = groups;
        
        try {
            const newProjectConfiguration: ProjectConfiguration = await this.appConfigurator.go(
                this.settingsProvider.getSettings().username,
                getConfigurationName(this.settingsProvider.getSettings().selectedProject),
                clonedConfigurationDocument
            );
            this.onEdited.emit({ 
                newProjectConfiguration,
                newCustomConfigurationDocument: clonedConfigurationDocument
            });
        } catch (errWithParams) {
            // TODO Show user-readable error messages
            this.messages.add(errWithParams);
        }
    }


    private async createNewField(fieldName: string) {

        this.menuService.setContext(MenuContext.CONFIGURATION_EDIT);

        const modalReference: NgbModalRef = this.modalService.open(
            FieldEditorModalComponent,
            { size: 'lg', backdrop: 'static', keyboard: false }
        );
        modalReference.componentInstance.customConfigurationDocument = this.customConfigurationDocument;
        modalReference.componentInstance.category = this.category;
        modalReference.componentInstance.field = {
            name: fieldName,
            inputType: 'input',
            label: {},
            defaultLabel: {},
            description: {},
            defaultDescription: {},
            source: 'custom'
        };
        modalReference.componentInstance.availableInputTypes = this.availableInputTypes;
        modalReference.componentInstance.new = true;
        modalReference.componentInstance.initialize();

        try {
            this.onEdited.emit(await modalReference.result);
        } catch (err) {
            // Modal has been canceled
        } finally {
            this.menuService.setContext(MenuContext.DEFAULT);
        }
    }


    private updateLabelAndDescription() {

        const { label, description } = LabelUtil.getLabelAndDescription(this.category);
        this.label = label;
        this.description = description;
    }


    private getPermanentlyHiddenFields(): string[] {

        const result: string[] = flatten(this.category.groups.map(to('fields')))
            .filter(field => !field.visible
                && !OVERRIDE_VISIBLE_FIELDS.includes(field.name)
                && (!this.category.libraryId || !ConfigurationUtil.isHidden(
                    this.getCustomCategoryDefinition(),
                    this.getParentCustomCategoryDefinition()
                )(field)))
            .map(to('name'));

        if (this.category.name === 'Project') result.push(Resource.IDENTIFIER);

        return result;
    }
}
