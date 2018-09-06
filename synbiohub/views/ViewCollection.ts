
import { Request, Response } from 'express'
import { getAttachmentsForSubject } from "synbiohub/attachments";

import extend = require('xtend')
import ViewDescribingTopLevel from "./ViewDescribingTopLevel";

import { SBHRequest } from 'synbiohub/SBHRequest';
import Breadcrumbs, { Breadcrumb } from 'synbiohub/Breadcrumbs';
import { S2Collection } from 'sbolgraph';

export default class ViewCollection extends ViewDescribingTopLevel {

    breadcrumbs:Breadcrumbs

    collection:S2Collection

    constructor() {

        super()

    }

    async prepare(req:SBHRequest) {

        await super.prepare(req)

        this.rdfType = {
            name: 'Collection',
        }

        this.collection = this.object as S2Collection

        this.breadcrumbs = new Breadcrumbs([
            new Breadcrumb('/projects', 'Projects'),
            new Breadcrumb(this.uri.toURL(), this.object.displayName)
        ])

        console.log('OBJECT IS ' + this.object)

    }

    async render(res:Response) {

        res.render('templates/views/collection.jade', this)

    }
}
