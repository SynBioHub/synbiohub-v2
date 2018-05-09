
import * as sparql from './sparql/sparql';
import ExecutionTimer from './util/execution-timer';
import TrieSearch from 'trie-search';

var autocompleteTitle = new TrieSearch('name', {
    splitOnRegEx: /\s|_/g
})

function updateCache() {

    const query = [
        'SELECT ?subject ?title WHERE {',
            '{',
                '?subject a <http://sbols.org/v2#ComponentDefinition> .',
                '?subject <http://purl.org/dc/terms/title> ?title .',
            '}',
            'UNION',
            '{',
                '?subject a <http://sbols.org/v2#ComponentDefinition> .',
                '?subject <http://sbols.org/v2#displayId> ?title .',
            '}',
        '}'
    ].join('\n')

    const queryTimer = ExecutionTimer('Retrieve list of subjects from triplestore')

    sparql.queryJson(query, null).then((results) => {

        queryTimer()

        const populateTitleToUriTimer = ExecutionTimer('Populate title to URI list')

        results.forEach((result) => {
            autocompleteTitle.add({ name: result.title, uri: result.subject })
        })

        populateTitleToUriTimer()

    })

}

export default {

    update: updateCache,
    autocompleteTitle: autocompleteTitle

};


