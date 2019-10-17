import {equal} from 'tsfun';
import {ProjectResourceConflictResolution} from '../../../../../app/core/datastore/core/project-resource-conflict-resolution';


describe('ProjectResourceConflictResolution', () => {

    it('two identical resources', () => {

        const left = {
            identifier: 'project-name',
            id: '1',
            type: 'Object',
            relations: {}
        };

        const right = {
            identifier: 'project-name',
            id: '1',
            type: 'Object',
            relations: {}
        };

        const result = ProjectResourceConflictResolution.solveProjectResourceConflicts([left, right])[0];

        const expectedResult = {
            identifier: 'project-name',
            id: '1',
            type: 'Object',
            relations: {}
        };

        expect(equal(result)(expectedResult)).toBeTruthy();
    });


    it('one is empty', () => {

        const left = {
            id: '1',
            identifier: 'project-name',
            type: 'Object',
            relations: {}
        };

        const right = {
            id: '1',
            identifier: 'project-name',
            aField: 'aValue',
            type: 'Object',
            relations: {}
        };


        const expectedResult = {
            id: '1',
            identifier: 'project-name',
            aField: 'aValue',
            type: 'Object',
            relations: {}
        };

        const result1 = ProjectResourceConflictResolution.solveProjectResourceConflicts([left, right])[0];
        expect(equal(result1)(expectedResult)).toBeTruthy();

        const result2 = ProjectResourceConflictResolution.solveProjectResourceConflicts([right, left])[0];
        expect(equal(result2)(expectedResult)).toBeTruthy();
    });


    it('unify staff', () => {

        const left = {
            id: '1',
            identifier: 'project-name',
            staff: ['a', 'b'],
            type: 'Object',
            relations: {}
        };

        const right = {
            id: '1',
            identifier: 'project-name',
            staff: ['b', 'c'],
            type: 'Object',
            relations: {}
        };


        const expectedResult = {
            id: '1',
            identifier: 'project-name',
            staff: ['a', 'b', 'c'],
            type: 'Object',
            relations: {}
        };

        const result = ProjectResourceConflictResolution.solveProjectResourceConflicts([left, right])[0];
        expect(equal(result)(expectedResult)).toBeTruthy();
    });


    it('do not unify staff', () => {

        const left = {
            id: '1',
            identifier: 'project-name',
            staff: ['a', 'b'],
            aField: 'aValue',
            type: 'Object',
            relations: {}
        };

        const right = {
            id: '1',
            identifier: 'project-name',
            staff: ['b', 'c'],
            bField: 'bValue',
            type: 'Object',
            relations: {}
        };

        const result = ProjectResourceConflictResolution.solveProjectResourceConflicts([left, right]);
        expect(result.length).toBe(2);
        expect(equal(left)(result[0])).toBeTruthy();
        expect(equal(right)(result[1])).toBeTruthy();
    });


    it('createResourceForNewRevisionFrom', () => {

        const one = {
            id: '1',
            identifier: 'project-name',
            staff: ['a', 'b'],
            aField: 'aValue',
            type: 'Object',
            relations: {}
        };

        const two = {
            id: '1',
            identifier: 'project-name',
            type: 'Object',
            relations: {}
        };

        const three = {
            id: '1',
            identifier: 'project-name',
            staff: ['b', 'c'],
            bField: 'bValue',
            type: 'Object',
            relations: {}
        };

        const result = ProjectResourceConflictResolution.createResourceForNewRevisionFrom([one, two, three]);
        expect(result['aField']).toBeUndefined();
        expect(result['bField']).toBe('bValue');
        expect(result['staff']).toEqual(['a', 'b', 'c']);
    })
});