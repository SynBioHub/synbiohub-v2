
const pug = require('pug')

import * as sparql from 'synbiohub/sparql/sparql'

import loadTemplate from 'synbiohub/loadTemplate'

import config from 'synbiohub/config'

import wiky from 'synbiohub/wiky/wiky'

export default async function(req, res) {

    // TODO reimplement

    /*

    const uri = req.body.uri

    const graphUri = getGraphUriFromTopLevelUri(uri,req.user)

    const source = req.body.value

    var sourceSparql = ''
    if (source.trim() != '') {
	sourceSparql = '<' + uri + '> sbh:mutableProvenance ' + JSON.stringify(source) + ' .'
    }

    var d = new Date();
    var modified = d.toISOString()
    modified = modified.substring(0,modified.indexOf('.'))

    const updateQuery = loadTemplate('./sparql/UpdateMutableSource.sparql', {
        topLevel: uri,
        source: sourceSparql,
	modified: JSON.stringify(modified)
    })

    let ownedBy = await DefaultMDFetcher.get(req).getOwnedBy(uri)

    if (ownedBy.indexOf(config.get('databasePrefix') + 'user/' + req.user.username) === -1) {
        res.status(401).send('not authorized to edit this submission')
        return
    }

    let result = await sparql.updateQuery(updateQuery, graphUri)

    const locals = {
        config: config.get(),
        src: source,
        source: source != '' ? wiky.process(source, {}) : '',
        canEdit: true
    }

    res.send(pug.renderFile('templates/partials/mutable-source.jade', locals))
    */
}



