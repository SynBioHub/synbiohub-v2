
import pug = require('pug');
import serializeSBOL from 'synbiohub/serializeSBOL';
import config from 'synbiohub/config';
import getUrisFromReq from 'synbiohub/getUrisFromReq';
import uploads from 'synbiohub/uploads';
import DefaultSBOLFetcher from 'synbiohub/fetch/DefaultSBOLFetcher';

export default async function(req, res) {

    const { graphUri, uri, designId, share } = getUrisFromReq(req)

    let result = await DefaultSBOLFetcher.get(req).fetchSBOLObjectRecursive(uri)

    const sbol = result.sbol
    const object = result.object

    throw new Error('attachments need updating to sbolgraph')

    /*
    var attachmentType = object.getAnnotation('http://wiki.synbiohub.org/wiki/Terms/synbiohub#attachmentType')
    var attachmentHash = object.getAnnotation('http://wiki.synbiohub.org/wiki/Terms/synbiohub#attachmentHash')

    if(sbol.attachments.length === 1) {
        attachmentType = sbol.attachments[0].format
        attachmentHash = sbol.attachments[0].hash
    }

    const readStream = uploads.createCompressedReadStream(attachmentHash)

    const mimeType = config.get('attachmentTypeToMimeType')[attachmentType] || 'application/octet-stream'

    res.status(200)
    res.header('Content-Encoding', 'gzip')
    res.header('Content-Disposition', 'attachment; filename="' + object.name + '"')
    res.type(mimeType)
    readStream.pipe(res)*/
};


