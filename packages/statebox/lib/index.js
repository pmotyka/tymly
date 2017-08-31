'use strict'

// Amazon States Language reference
//   Specification: https://states-language.net/spec.html
//   API: http://docs.aws.amazon.com/step-functions/latest/apireference/API_CreateStateMachine.html
//   https://aws.amazon.com/step-functions/
//   https://aws.amazon.com/blogs/aws/new-aws-step-functions-build-distributed-applications-using-visual-workflows/

const _ = require('lodash')
const flows = require('./flows')
const resources = require('./resources')
const boom = require('boom')
const getExecutionDescription = require('./utils/get-execution-description')
const ensureDatabaseObjects = require('./utils/ensure-database-objects')

class Statebox {
  boot (options, callback) {
    this.client = options.client
    this.options = _.defaults(options, {schemaName: 'statebox'})
    getExecutionDescription.applyOptions(this.options)
    ensureDatabaseObjects(this.options, callback)
  }

  createFunctionResource (name, functionClass) {
    resources.createFunction(name, functionClass)
  }

  validateFlowDefinition (definition, callback) {
    flows.validateFlowDefinition(definition, callback)
  }

  createFlow (name, definition, callback) {
    flows.createFlow(
      name,
      definition,
      this.options,
      callback)
  }

  deleteFlow (name, callback) {
    flows.deleteFlow(name, callback)
  }

  describeFlow (name, callback) {
    flows.describeFlow(name, callback)
  }

  listFlows (callback) {
    flows.listFlows(callback)
  }

  findFlowByName (name) {
    flows.findFlowByName(name)
  }

  findFlows (options, callback) {
    flows.findFlows(options, callback)
  }

  createTaskResource (name, definition, callback) {

  }

  deleteTaskResource (name, callback) {

  }

  describeTaskResource (name, callback) {

  }

  listTaskResources (callback) {

  }

  startExecution (input, flowName, callback) {
    // References
    //   http://docs.aws.amazon.com/step-functions/latest/apireference/API_StartExecution.html
    //   http://docs.aws.amazon.com/step-functions/latest/apireference/API_DescribeExecution.html
    // TODO: Test 'input' conforms
    // TODO: Note API usually requires a string, but object seems better for Statebox?

    const flowToExecute = flows.findFlowByName(flowName)
    if (flowToExecute) {
      const sql = `INSERT INTO ${this.options.schemaName}.current_executions (flow_name, context, current_state_name) VALUES ($1, $2, $3) RETURNING execution_name, status, _created;`
      this.client.query(
        sql,
        [
          flowName, // $1 (flow_name)
          input, // $2 (context)
          flowToExecute.startAt // $3 (current_state_name)
        ],
        function (err, info) {
          if (err) {
            // TODO: Rollback (and test the rollback worked too) but don't close connection.
            callback(err)
          } else {
            const executionName = info.rows[0].execution_name
            const executionDescription = {
              executionName: executionName,
              input: input,
              currentStateName: flowToExecute.startAt,
              flowName: flowName,
              status: info.rows[0].status,
              startDate: info.rows[0]._created
            }
            flowToExecute.processState(executionName)
            callback(
              null,
              executionDescription
            )
          }
        }
      )
    } else {
      // No Flow!
      callback(
        boom.badRequest(
          `Unknown Flow with name '${flowName}`,
          flowName
        )
      )
    }
  }

  stopExecution (cause, error, executionName, callback) {

  }

  listExecutions (callback) {

  }

  describeExecution (executionName, callback) {
    getExecutionDescription.findByName(executionName, callback)
  }
}

module.exports = Statebox
