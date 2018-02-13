'use strict'

const requestPromise = require('rest-promise-native')

class GetDataFromRestApi {
  init (resourceConfig, env, callback) {
    const registry = env.bootedServices.registry
    this.templateUrl = registry.get(resourceConfig.namespace + '_' + resourceConfig.templateUrlRegistryKey)
    if (resourceConfig.authTokenRegistryKey) this.authToken = registry.get(resourceConfig.namespace + '_' + resourceConfig.authTokenRegistryKey)
    if (resourceConfig.resultPath) this.resultPath = resourceConfig.resultPath
    if (resourceConfig.paramPath) this.paramPath = resourceConfig.paramPath
    callback(null)
  }

  run (event, context) {
    const options = {
      uri: this.templateUrl,
      headers: {
        'User-Agent': 'Request-Promise'
      },
      json: true
    }

    if (this.authToken) options.headers.Authorization = this.authToken

    if (this.paramPath) {
      Object.keys(event[this.paramPath]).map(key => {
        this.templateUrl = this.templateUrl.replace(`{{${key}}}`, event[this.paramPath][key])
      })
    }

    requestPromise(options)
      .then((result, response) => {
        if (response.statusCode.toString()[0] === '2') {
          if (this.resultPath) return context.sendTaskSuccess({[this.resultPath]: result[this.resultPath]})
          context.sendTaskSuccess({result})
        } else {
          console.log(`Tried to GET '${this.templateUrl}' with '${this.authToken}' ` +
              `but received ${response.statusCode}: ${response.statusMessage}`)
          context.sendTaskFailure({
            statusCode: response.statusCode,
            cause: response.statusMessage
          })
        }
      }
      )
  }
}

module.exports = GetDataFromRestApi
