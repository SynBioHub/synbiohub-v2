
import ViewDescribingTopLevel from './ViewDescribingTopLevel';

import {getAttachmentsFromTopLevel, getAttachmentsFromList} from 'synbiohub/attachments';
import loadTemplate from '../loadTemplate';

import { Request, Response } from 'express'
import { SBHRequest } from 'synbiohub/SBHRequest';
var sparql = require('../sparql/sparql')

import { S2ProvActivity, S2Experiment, S2ProvAssociation, S2Implementation, S2ExperimentalData, S2Identified, S2ProvUsage, S2Attachment, S2ProvPlan } from 'sbolgraph'
import { Predicates } from 'bioterms';

export default class ViewExperiment extends ViewDescribingTopLevel{

    constructor(){
        super()
    }

    meta:any

    experiment:S2Experiment
    experimentalData:S2Identified[]

    construct_uri:string
    
    constructs: S2Implementation[]
    constructNames:string[]

    agent:string
    dataurl:string
    organism:string
    taxId:string
    plan:string
    plan_url:string
    plan_filename:string
    plans:S2ProvPlan[]
    metadata:any[]
    location:string


    async prepare(req:SBHRequest) {

        await super.prepare(req)

        this.rdfType = {
            name: 'Experiment'
        }

        this.experiment = this.object as S2Experiment

        await this.datastore.fetchProperties(this.graph, this.experiment)

        let act = this.experiment.activity as S2ProvActivity

        this.location = this.experiment.getStringProperty('http://wiki.synbiohub.org/wiki/Terms/synbiohub#physicalLocation')

        await this.datastore.fetchProperties(this.graph, act)

        let usg = act.usage as S2ProvUsage
        
        await this.datastore.fetchProperties(this.graph, usg)
        
        let asc = act.association as S2ProvAssociation

        await this.datastore.fetchProperties(this.graph, asc)

        let agent = asc.agent

        await this.datastore.fetchProperties(this.graph, agent)

        let plan = asc.plan
        
        await this.datastore.fetchProperties(this.graph, plan)

        await this.datastore.fetchAttachments(this.graph, plan)

        for (let attachment of plan.attachments){
            await this.datastore.fetchProperties(this.graph, attachment)
        }

        this.agent = agent.displayName

        this.plan = plan.displayName

        await this.datastore.fetchAttachments(this.graph, plan) as S2Attachment

        this.plan_url = plan.attachments[0].uri
        this.plan_filename = plan.attachments[0].displayName

        this.taxId = this.experiment.getUriProperty('http://w3id.org/synbio/ont#taxId')

        this.organism = this.experiment.getUriProperty('http://www.biopax.org/release/biopax-level3.owl#organism')

        this.dataurl = this.experiment.getUriProperty('http://purl.obolibrary.org/obo/NCIT_C114457')

        let constructs = this.experiment.getUriProperties(Predicates.Prov.wasDerivedFrom)

        this.constructs = []
        this.constructNames = []

        for (let construct of constructs){

            let temp_construct = new S2Implementation(this.graph, construct)

            await this.datastore.fetchProperties(this.graph, temp_construct) 

            this.constructs.push(temp_construct)
            this.constructNames.push(temp_construct.displayName)
            
        }


        // this.construct_uri = construct.uri

        // this.construct = construct.displayName

        // console.log(this.graph.serializeXML())

        this.experimentalData = this.experiment.experimentalData

        for (let data of this.experimentalData){
            await this.datastore.fetchAttachments(this.graph, data) as S2Attachment
        }

        await this.datastore.fetchPlans(this.graph)

        this.plans = this.graph.provPlans
    }

    async render(res:Response) {

        res.render('templates/views/Experiment.jade', this)

    }
}