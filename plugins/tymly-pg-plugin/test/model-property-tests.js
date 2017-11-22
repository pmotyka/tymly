/* eslint-env mocha */

'use strict'

const chai = require('./../node_modules/chai')
const chaiSubset = require('chai-subset')
const expect = chai.expect
const path = require('path')
const tymly = require('tymly')

chai.use(chaiSubset)

describe('Storage interaction tests', function () {
  this.timeout(5000)
  let statebox

  it('should startup tymly', function (done) {
    tymly.boot(
      {
        pluginPaths: [
          path.resolve(__dirname, './../lib')
        ],
        blueprintPaths: [
          path.resolve(__dirname, './fixtures/blueprints/planet-blueprint')
        ],
        config: {}
      },
      function (err, tymlyServices) {
        expect(err).to.eql(null)
        statebox = tymlyServices.statebox
        done()
      }
    )
  })

  it('should find a specific record in storage', function (done) {
    statebox.startExecution(
      {
        idToFind: 'Mars'
      },  // input
      'tymlyTest_findPlanet_1_0', // state machine name
      {
        sendResponse: 'COMPLETE'
      }, // options
      function (err, executionDescription) {
        if (err) {
          done(err)
        } else {
          try {
            console.log(JSON.stringify(executionDescription.ctx))
            expect(executionDescription.stateMachineName).to.eql('tymlyTest_findPlanet_1_0')
            expect(executionDescription.status).to.eql('SUCCEEDED')
            expect(executionDescription.ctx.foundPlanet).to.containSubset({
              'name': 'Mars',
              'type': 'terrestrial',
              'diameterInKilometers': 6787,
              'orbitInEarthDays': 687,
              'namedFor': 'Roman god of war'
            })
            done()
          } catch (err) {
            done(err)
          }
        }
      }
    )
  })

  it('should find another specific record in storage', function (done) {
    statebox.startExecution(
      {
        idToFind: 'Deimos'
      },  // input
      'tymlyTest_findMoon_1_0', // state machine name
      {
        sendResponse: 'COMPLETE'
      }, // options
      function (err, executionDescription) {
        if (err) {
          done(err)
        } else {
          console.log(JSON.stringify(executionDescription.ctx))
          expect(executionDescription.stateMachineName).to.eql('tymlyTest_findMoon_1_0')
          expect(executionDescription.status).to.eql('SUCCEEDED')
          expect(executionDescription.ctx.foundMoon).to.containSubset({
            'name': 'Deimos',
            'orbitingPlanet': 'Mars'
          })
          done()
        }
      }
    )
  })
})
