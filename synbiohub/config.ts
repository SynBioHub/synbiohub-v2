
import * as fs from 'mz/fs';
import extend = require('xtend');
import deepmerge = require('deepmerge')

var path = 'config.json'
var localPath = 'config.local.json'

var config = JSON.parse(fs.readFileSync(path) + '')

var localConfig = fs.existsSync(localPath) ?
    JSON.parse(fs.readFileSync(localPath) + '') : {}

var mergedConfig

mergeConfigs()

export default {

    get: function configGet(key?) {

        if(arguments.length === 0)
            return mergedConfig

        return mergedConfig[key]

    },

    getLocal: function configGetLocal() {

        return clone(localConfig)

    },

    set: function configSet(key, value) {

        console.log('config: set ' + key + ' => ' + value)

        localConfig = extend(localConfig, {

            [key]: clone(value)

        })

        mergeConfigs()
        saveLocalConfig()
    },

    setAll: function configSetAll(all) {

        localConfig = clone(all)

        mergeConfigs()
        saveLocalConfig()

        return
    },

    delete: function configDelete(key) {
        if (arguments.length === 1) {
            if(localConfig[key] !== undefined)
                delete localConfig[key];

            mergeConfigs()
            saveLocalConfig()
        }
    },

    merge: function configMerge(newConfig) {

        localConfig = deepmerge(localConfig, newConfig, {
            arrayMerge: (dest, src) => src
        })

        mergeConfigs()
        saveLocalConfig()
    }

};


function clone(val) {

    return JSON.parse(JSON.stringify(val))

}

function mergeConfigs() {

    mergedConfig = deepmerge(config, localConfig, {
        arrayMerge: (dest, src) => src
    })

}

function saveLocalConfig() {

    fs.writeFileSync(localPath, JSON.stringify(localConfig, null, 2))

}


