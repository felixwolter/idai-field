import {InverseRelationsMap, makeInverseRelationsMap} from '../../../../app/core/configuration/inverse-relations-map';

describe('InverseRelationsMap', () => {

   it('make', () => {

       const inverseRelationsMap: InverseRelationsMap
           = makeInverseRelationsMap([{name: 'a', inverse: 'b'}, {name: 'c'}]);

       expect(inverseRelationsMap).toEqual({
           a: 'b',
           c: undefined
       });

       // let's make sure the keys are there, even if the values are undefined
       expect(Object.keys(inverseRelationsMap)).toEqual(['a', 'c']);
   })
});