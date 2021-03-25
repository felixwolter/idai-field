import {compose, Map, map, to, update_a} from 'tsfun';
import {assocReduce} from './assoc-reduce';


// @author Daniel de Oliveira
// @author Sebastian Cuy


/**
 * path: 'd.e'
 * as: [{ d: { e: 17 }}, { d: { e: 19 }}]
 * ->
 * { 17: { d: { e: 17 }}, 19: { d: { e: 19 }}}
 */
export function makeLookup(path: string|number|Array<string|number>) {

    return <A>(as: Array<A>): Map<A> =>
        assocReduce((a: A) => [to(path as any)(a as any) as any /*TODO review typing*/, a], {})(as);
}


export function addKeyAsProp<A extends Map>(prop: string) {

    return map((a: A, key: string) => update_a(prop, key)(a));
}


export function mapToArray(prop: string) {

    return compose(addKeyAsProp(prop) as any, Object.values);
}