'use strict'
const dottie = require('dottie')
const schema = require('./schema.json')

class ValueCommand {
  constructor (commandConfig) {
    this.valuePath = commandConfig.path
  }

  run (flobot, callback) {
    const ctx = flobot.ctx
    callback(null, dottie.get(ctx, this.valuePath))
  }
}

module.exports = {
  commandFunction: ValueCommand,
  schema: schema
}
