import {Document} from 'idai-field-core';
import {FieldConverter} from '../../../../src/app/components/import/field-converter';


/**
 * @author Daniel de Oliveira
 */
describe('FieldConverter', () => {

    it('preprocessDocument', () => {

        const document: Document = {
            _id: '1',
            created: undefined,
            modified: [],
            resource: {
                id: '1',
                identifier: '',
                category: 'Object',
                relations: {},
                dimensionHeight: [{
                    inputValue: '100',
                    inputUnit: 'cm',
                    value: '1000000'
                }],
                dating: [{
                    type: 'exact',
                    end: {
                        inputYear: '2000',
                        inputType: 'bce',
                        year: -2000
                    }
                }]
            }
        };

        const pc = jasmine.createSpyObj('ProjectConfiguration', ['getCategory']);
        pc.getCategory.and.returnValue({
            groups: [{
                name: 'stem',
                fields:
                    [{ name: 'dimensionHeight', inputType: 'dimension' },
                     { name: 'dating', inputType: 'dating' }]

            }]
        });

        const result = FieldConverter.preprocessDocument(pc)(document);
        expect(result.resource['dimensionHeight'][0]['value']).toBeUndefined();
        expect(result.resource['dating'][0]['end']['year']).toBeUndefined();
    });
});
