import {Component, Input} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {Resource, Dimension, FieldDefinition} from 'idai-components-2';
import {DimensionUtil} from '../../../../core/util/dimension-util';


@Component({
    moduleId: module.id,
    selector: 'dai-dimension',
    templateUrl: './dimension.html'
})

/**
 * @author Fabian Z.
 * @author Thomas Kleinke
 */
export class DimensionComponent {

    @Input() resource: Resource;
    @Input() field: FieldDefinition;

    public newDimension: Dimension|undefined = undefined;
    public dimensionsInEditing: Array<Dimension> = [];


    constructor(private decimalPipe: DecimalPipe) {}


    public createNewDimension() {

    	this.newDimension = {
    		value: 0,
            inputValue: 0,
            inputRangeEndValue: 0,
			measurementPosition: '',
			measurementComment: '',
			inputUnit: 'cm',
			isImprecise: false,
            isRange: false
    	};
    }


    public getLabel(dimension: Dimension): string {

        return dimension.label ? dimension.label : DimensionUtil.generateLabel(dimension, this.decimalPipe);
    }


    public cancelNewDimension() {

        this.newDimension = undefined;
    }


    public startEditing(dimension: Dimension) {

        this.dimensionsInEditing.push(dimension);
    }


    private stopEditing(dimension: Dimension) {

        const index: number = this.dimensionsInEditing.indexOf(dimension);
        if (index > -1) this.dimensionsInEditing.splice(index, 1);
    }


    public isInEditing(dimension: Dimension) {

        return this.dimensionsInEditing.includes(dimension);
    }


    public removeDimensionAtIndex(dimensionIndex: number) {

        this.resource[this.field.name].splice(dimensionIndex, 1);
        if (this.resource[this.field.name].length === 0) delete this.resource[this.field.name];
    }


    public saveDimension(dimension: Dimension) {

    	if (!this.resource[this.field.name]) this.resource[this.field.name] = [];

        if (dimension.isRange) {
            dimension.rangeMin = DimensionUtil.convertValueFromInputUnitToMicrometre(dimension.inputUnit,
                dimension.inputValue);
            dimension.rangeMax = DimensionUtil.convertValueFromInputUnitToMicrometre(dimension.inputUnit,
                dimension.inputRangeEndValue);
            delete(dimension.value);
        } else {
    	    dimension.value = DimensionUtil.convertValueFromInputUnitToMicrometre(dimension.inputUnit,
                dimension.inputValue);
        }

    	if (this.newDimension === dimension) {
    		this.resource[this.field.name].push(dimension);
            this.newDimension = undefined;
    	} else {
            this.stopEditing(dimension);
        }
    }
}