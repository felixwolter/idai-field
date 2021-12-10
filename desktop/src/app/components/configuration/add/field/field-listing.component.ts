import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Field, Labels } from 'idai-field-core';
import { getSearchResultLabel } from '../getSearchResultLabel';


@Component({
    selector: 'field-listing',
    templateUrl: './field-listing.html'
})
/**
 * @author Thomas Kleinke
 */
export class FieldListingComponent {

    @Input() fields: Array<Field> = [];
    @Input() emptyField: Field|undefined;
    @Input() selectedField: Field;
    @Input() searchTerm: string = '';

    @Output() onFieldSelected = new EventEmitter<Field>();


    constructor(private labels: Labels) {}


    public select = (field: Field) => this.onFieldSelected.emit(field);

    public getLabel = (value: any) => this.labels.get(value);

    public isNewFieldOptionShown = (): boolean => this.emptyField !== undefined
        && !this.fields.map(field => field.name).includes(this.searchTerm);

    public getSearchResultLabel = (field: Field) => getSearchResultLabel(field, this.searchTerm, this.getLabel);
}