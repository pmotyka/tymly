'use strict'

module.exports = function g (event, context) {
  const list = event.results
  console.log('G')
  list.push('G')
  this.sendTaskSuccess({results: list})
}