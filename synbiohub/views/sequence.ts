
import { fetchSBOLObjectRecursive } from 'synbiohub/fetch/fetch-sbol-object-recursive';
import { getContainingCollections } from 'synbiohub/query/local/collection';
import filterAnnotations from 'synbiohub/filterAnnotations';
import retrieveCitations from 'synbiohub/citations';
import shareImages from 'synbiohub/shareImages';
import loadTemplate from 'synbiohub/loadTemplate';
import sbolmeta from 'sbolmeta';
import formatSequence from 'sequence-formatter';
import async from 'async';
import pug from 'pug';
import * as sparql from 'synbiohub/sparql/sparql-collate';
import wiky from 'synbiohub/wiky/wiky.js';
import config from 'synbiohub/config';
import { URI } from 'sboljs';
import getUrisFromReq from 'synbiohub/getUrisFromReq';
import uriToUrl from 'synbiohub/uriToUrl';
import sha1 from 'sha1';

export default function(req, res) {

	var locals = {
        config: config.get(),
        section: 'sequence',
        user: req.user
    }

    var meta
    var sequence
    var collectionIcon 
    var remote

    var collections = []

    var submissionCitations = []
    var citations = []

    const { graphUri, uri, designId, share, url } = getUrisFromReq(req, res)

    var sbol 

    var templateParams = {
        uri: uri
    }

    var getCitationsQuery = loadTemplate('sparql/GetCitations.sparql', templateParams)

    fetchSBOLObjectRecursive('Sequence', uri, graphUri).then((result) => {

        sbol = result.sbol
        sequence = result.object
        remote = result.remote || false

        if(!sequence || sequence instanceof URI) {
            locals = {
                config: config.get(),
                section: 'errors',
                user: req.user,
                errors: [ uri + ' Record Not Found' ]
            }
            res.send(pug.renderFile('templates/views/errors/errors.jade', locals))
            return
        }

        meta = sbolmeta.summarizeSequence(sequence)
        if(!meta) {
            locals = {
                config: config.get(),
                section: 'errors',
                user: req.user,
                errors: [ uri + ' summarizeSequence returned null' ]
            }
            res.send(pug.renderFile('templates/views/errors/errors.jade', locals))
            return
        }

	if (meta.description != '') {
	    meta.description = wiky.process(meta.description, {})
	}

        meta.mutableDescriptionSource = meta.mutableDescription.toString() || ''
        if (meta.mutableDescription.toString() != '') {
	    meta.mutableDescription = shareImages(req,meta.mutableDescription.toString())
            meta.mutableDescription = wiky.process(meta.mutableDescription.toString(), {})
        }

        meta.mutableNotesSource = meta.mutableNotes.toString() || ''
        if (meta.mutableNotes.toString() != '') {
	    meta.mutableNotes = shareImages(req,meta.mutableNotes.toString())
            meta.mutableNotes = wiky.process(meta.mutableNotes.toString(), {})
        }

        meta.sourceSource = meta.source.toString() || ''
        if (meta.source.toString() != '') {
	    meta.source = shareImages(req,meta.source.toString())
            meta.source = wiky.process(meta.source.toString(), {})
        }

	meta.url = '/' + meta.uri.toString().replace(config.get('databasePrefix'),'')
	if (req.url.toString().endsWith('/share')) {
	    meta.url += '/' + sha1('synbiohub_' + sha1(meta.uri) + config.get('shareLinkSalt')) + '/share'
	}

	meta.encoding = sequence.encoding

	if (sequence.wasGeneratedBy) {
	    meta.wasGeneratedBy = { uri: sequence.wasGeneratedBy.uri?sequence.wasGeneratedBy.uri:sequence.wasGeneratedBy,
				    url: uriToUrl(sequence.wasGeneratedBy,req)
				  }
	}

        locals.meta = meta

        locals.meta.triplestore = graphUri ? 'private' : 'public'
        locals.meta.remote = remote

        locals.canEdit = false

        if(!remote && req.user) {

            const ownedBy = sequence.getAnnotations('http://wiki.synbiohub.org/wiki/Terms/synbiohub#ownedBy')
            const userUri = config.get('databasePrefix') + 'user/' + req.user.username

            if(ownedBy && ownedBy.indexOf(userUri) > -1) {

                locals.canEdit = true
		
            } 

        }

	locals.rdfType = {
	    name : 'Sequence',
	    url : 'http://wiki.synbiohub.org/wiki/Terms/SynBioHub#Sequence'
	}

        locals.annotations = filterAnnotations(req,sequence.annotations);

	locals.share = share
        locals.sbolUrl = url + '/' + meta.id + '.xml'
        locals.fastaUrl = url + '/' + meta.id + '.fasta'
        if(req.params.userId) {
            locals.searchUsesUrl = '/user/' + encodeURIComponent(req.params.userId) + '/' + designId + '/uses'
            locals.searchTwinsUrl = '/user/' + encodeURIComponent(req.params.userId) + '/' + designId + '/twins'
	} else {
            locals.searchUsesUrl = '/public/' + designId + '/uses'
            locals.searchTwinsUrl = '/public/' + designId + '/twins'
	} 

        locals.keywords = []
        locals.prefix = req.params.prefix

        locals.collections = collections

        locals.collectionIcon = collectionIcon

        locals.submissionCitations = submissionCitations
	locals.citationsSource = citations.map(function(citation) {
            return citation.citation
        }).join(',');

        locals.meta.formatted = formatSequence(meta.elements)

	locals.meta.blastUrl = meta.type === 'AminoAcid' ?
            'http://blast.ncbi.nlm.nih.gov/Blast.cgi?PROGRAM=blastp&PAGE_TYPE=BlastSearch&LINK_LOC=blasthome' :
            'http://blast.ncbi.nlm.nih.gov/Blast.cgi?PROGRAM=blastn&PAGE_TYPE=BlastSearch&LINK_LOC=blasthome'

        locals.meta.description = locals.meta.description.split(';').join('<br/>')

        res.send(pug.renderFile('templates/views/sequence.jade', locals))

    }).catch((err) => {

        const locals = {
            config: config.get(),
            section: 'errors',
            user: req.user,
            errors: [ err ]
        }

        res.send(pug.renderFile('templates/views/errors/errors.jade', locals))

    })
	
	};

function listNamespaces(xmlAttribs) {

    var namespaces = [];

    Object.keys(xmlAttribs).forEach(function(attrib) {

        var tokens = attrib.split(':');

        if(tokens[0] === 'xmlns') {

            namespaces.push({
                prefix: tokens[1],
                uri: xmlAttribs[attrib]
            })
        }
    });

    return namespaces;
}

