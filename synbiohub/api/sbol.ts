
import pug from 'pug';
import serializeSBOL from 'synbiohub/serializeSBOL';
import config from 'synbiohub/config';
import getUrisFromReq from 'synbiohub/getUrisFromReq';
import * as fs from 'mz/fs';
import DefaultSBOLFetcher from 'synbiohub/fetch/DefaultSBOLFetcher';

export default async function(req, res) {

    req.setTimeout(0) // no timeout

    const { graphUri, uri, designId, share } = getUrisFromReq(req)
	
    let tempFilename = await DefaultSBOLFetcher.get(req).fetchSBOLSource(uri)

    res.status(200).type('application/rdf+xml')
        //.set({ 'Content-Disposition': 'attachment; filename=' + collection.name + '.xml' })

    const readStream = fs.createReadStream(tempFilename)
        
    readStream.pipe(res).on('finish', () => {
        fs.unlink(tempFilename)
    })
};


