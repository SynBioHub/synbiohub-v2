
import sbolmeta = require('sbolmeta');
import ViewTopLevelWithObject from 'synbiohub/views/ViewTopLevelWithObject';
import formatSequence = require('sequence-formatter')

import { Request, Response } from 'express'
import { SBHRequest } from 'synbiohub/SBHRequest';

export default class ViewSequence extends ViewTopLevelWithObject {

    constructor() {
        super()
    }

    meta:any

    blastUrl:string
    formatted:string

    async prepare(req:SBHRequest) {

        await super.prepare(req)

        this.rdfType = {
            name: 'Sequence'
        }

        this.setTopLevelMetadata(req, sbolmeta.summarizeSequence(this.object))

        this.blastUrl = this.meta.type === 'AminoAcid' ?
            'http://blast.ncbi.nlm.nih.gov/Blast.cgi?PROGRAM=blastp&PAGE_TYPE=BlastSearch&LINK_LOC=blasthome' :
            'http://blast.ncbi.nlm.nih.gov/Blast.cgi?PROGRAM=blastn&PAGE_TYPE=BlastSearch&LINK_LOC=blasthome'

        this.meta.formatted = formatSequence(this.object.elements)
    }

    async render(res:Response) {

        res.render('templates/views/sequence.jade', this)

    }
}


