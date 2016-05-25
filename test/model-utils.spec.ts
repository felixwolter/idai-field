import {fdescribe,describe,expect,fit,it,xit, inject,beforeEach, beforeEachProviders} from '@angular/core/testing';
import {ModelUtils} from "../app/model/model-utils";

/**
 * @author Jan G. Wieners
 */
export function main() {
    describe('ModelUtils', () => {

        it('should create a full copy of an IdaiFieldObject, not just a reference to the object',
            function(){

                var initialObject = {
                    "identifier": "ob1",
                    "title": "Title",
                    "type": "Object",
                    "synced": 0,
                };
                var clonedObject = ModelUtils.filterUnwantedProps(initialObject);
                expect(clonedObject).not.toBe(initialObject);
            }
        );

        it('should create a clone of an IdaiFieldObject which lacks the properties "synced" and "valid"',
            function(){

                var initialObject = {
                    "identifier": "ob1",
                    "title": "Title",
                    "synced": 0,
                    "type": "Object"
                };
                var clonedObject = ModelUtils.filterUnwantedProps(initialObject);

                var filteredObject = {
                    "identifier": "ob1",
                    "title": "Title",
                    "type": "Object"
                };
                expect(clonedObject).toEqual(filteredObject);
            }
        );
    })
}