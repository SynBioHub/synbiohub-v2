
import SBOLFetcher from "./SBOLFetcher";

import SBOLDocument = require('sboljs')

export default class SBOLFetcherFederated extends SBOLFetcher {

    fetchers:Array<SBOLFetcher>

    constructor(fetchers:Array<SBOLFetcher>) {

        super()

        this.fetchers = fetchers

    }

    async fetchSBOLSource(uri:string, type?:string):Promise<string> {

        for(let fetcher of this.fetchers) {

            try {

                let tempFilename = await fetcher.fetchSBOLSource(uri, type)

                return tempFilename

            } catch(e) {
                continue
            }
        }
    }

    async fetchSBOLObjectRecursive(uri: string, type?:string, sbol?:SBOLDocument):Promise<any> {


        let errors = []

        for(let fetcher of this.fetchers) {

            try {

                let res = await fetcher.fetchSBOLObjectRecursive(uri, type, sbol)

                return res

            } catch(e) {
                if(e.name === 'NotFound') {
                    continue
                } else {
                    throw e
                }
            }
        }

        throw new Error('None of the fetchers could get me any SBOL!')

    }

}

