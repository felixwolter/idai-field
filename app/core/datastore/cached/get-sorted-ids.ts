import {on, is, isNot, undefinedOrEmpty, to, keys, filter, equal, values, Pair} from 'tsfun';
import {Query} from 'idai-components-2';
import {IndexItem, SimpleIndexItem} from '../index/index-item';
import {SortUtil} from '../../util/sort-util';
import {Name, ResourceId} from '../../constants';
import {isUndefinedOrEmpty} from 'tsfun/src/predicate';
import {pairWith} from '../../util/utils';

// @author Daniel de Oliveira
// @author Thomas Kleinke

/**
 * @param indexItems // TODO review typing: must be Array<IndexItem> if exactMatchFirst
 * @param query
 */
export function getSortedIds(indexItems: Array<SimpleIndexItem>,
                             query: Query): Array<ResourceId> {

    indexItems = generateOrderedResultList(indexItems);
    if (shouldRankTypes(query)) {
        indexItems = handleTypesForName(indexItems, query.rankOptions['matchType']);
    }
    handleExactMatch(indexItems, query);
    return indexItems.map(to('id'));
}


function shouldRankTypes(query: Query) {

    return equal(query.types)(['Type']) && query.rankOptions && query.rankOptions['matchType'];
}


function handleTypesForName(indexItems: Array<SimpleIndexItem>,
                            rankTypesFor: Name) {

    const pairs = calcPercentages(indexItems, rankTypesFor);
    pairs.sort(comparePercentages);
    return pairs.map(to('[0]'));
}


function comparePercentages(a: any, b: any) {

    if (a[1] < b[1]) return 1;
    if (a[1] === b[1]) {

        // TODO make count replace keys + length
        if (keys(a[0]['instances']).length < keys(b[0]['instances']).length) return 1;
        return -1;
    }
    return -1;
}


function calcPercentages(indexItems: Array<SimpleIndexItem>, rankTypesFor: Name): Array<Pair<SimpleIndexItem, number>> {

    return indexItems.map(pairWith((indexItem: SimpleIndexItem) => {

        const instances = (indexItem as any)['instances'];
        if (isUndefinedOrEmpty(keys(instances))) return 0;
        return filter(is(rankTypesFor))(values(instances)).length * 100.0 / keys(instances).length;

    })) as Array<Pair<SimpleIndexItem, number>>;
}


function handleExactMatch(indexItems: Array<SimpleIndexItem>,
                          query: Query) {

    if (query.sort === 'exactMatchFirst' && isNot(undefinedOrEmpty)(query.q)) { // TODO extract function; perhaps move up

        const exactMatch = indexItems.find(on('identifier', is(query.q)));

        if (exactMatch) {
            indexItems.splice(indexItems.indexOf(exactMatch), 1);
            indexItems.unshift(exactMatch);
        }
    }
}


function generateOrderedResultList(items: Array<SimpleIndexItem>): Array<SimpleIndexItem> {

    return items
        .sort((a: any, b: any) =>
            // we know that an IndexItem created with from has the identifier field
            SortUtil.alnumCompare(a['identifier'], b['identifier']));
}