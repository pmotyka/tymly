'use strict'

const levelLabels = ['softly', 'away', 'loudly']

class Purring {
  init (stateConfig, options, callback) {
    this.calculateContentmentLevel = options.services.functions.getFunction('fbotTest', 'calculateContentmentLevel')
    callback(null)
  }

  enter (flobot, data, callback) {
    const ctx = flobot.ctx
    const level = this.calculateContentmentLevel()
    console.log(' * Can you hear that? ' + ctx.petName + ' is purring ' + levelLabels[level] + '! :-)')
    callback(null)
  }

  leave (flobot, data, callback) {
    callback(null)
  }
}

module.exports = {
  autoNudge: false,
  stateClass: Purring
}