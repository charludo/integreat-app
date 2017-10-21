import { createAction } from 'redux-actions'
import format from 'string-template'

import Payload from 'endpoints/Payload'

class ActionType {
  static RECEIVE = 'RECEIVE_DATA'
  static REQUEST = 'REQUEST_DATA'
  static INVALIDATE = 'INVALIDATE_DATA'
}

const DUMMY = () => { return {} }

class Endpoint {
  /**
   * @type string
   */
  name
  /**
   * @type string
   */
  url
  receiveAction
  requestAction
  invalidateAction
  /**
   * @type mapStateToOptionsCallback
   */
  mapStateToOptions
  /**
   * @type shouldRefetchCallback
   */
  shouldRefetch

  /**
   * Converts a json document to any object
   */
  jsonToAny

  /**
   * @callback mapStateToOptionsCallback
   * @param {object} state
   * @return {object} The url params
   */

  /**
   * @callback shouldRefetchCallback
   * @param {object} currentProps
   * @param {object} nextProps
   * @return {boolean} Whether we should refetch
   */

  /**
   * @param {string} name The name of this endpoint. This is used as key in the state and as Payload name. The Payload name is name + 'Paylaod'
   * @param {string} url The url with params (params are used like this: https://cms.integreat-app.de/{location}/{language})
   * @param {function} jsonToAny Transforms the json input to a result
   * @param {mapStateToOptionsCallback} mapStateToUrlParams Maps the state to the url params which are needed in the Fetcher component
   * @param shouldRefetch Takes the current and the next props and should return whether we should refetch
   */
  constructor ({name, url, jsonToAny, mapStateToOptions = DUMMY, shouldRefetch = () => false}) {
    this.name = name
    this.url = url
    this.mapStateToOptions = mapStateToOptions
    this.shouldRefetch = shouldRefetch
    this.jsonToAny = jsonToAny

    const actionName = this.name.toUpperCase()

    this.receiveAction = createAction(`${ActionType.RECEIVE}_${actionName}`, (value, error) => new Payload(false, value, error))
    this.requestAction = createAction(`${ActionType.REQUEST}_${actionName}`, () => new Payload(true))
    this.invalidateAction = createAction(`${ActionType.INVALIDATE}_${actionName}`, () => new Payload(false))
    this._stateName = name
  }

  /**
   * @returns {string|*} The name of the linked state
   */
  get stateName () {
    return this._stateName
  }

  /**
   * @returns {string|*} The name of the resulting payload
   */
  get payloadName () {
    return `${this.stateName}Payload`
  }

  fetchEndpointAction (urlParams = {}, options = {}) {
    return (dispatch, getState) => {
      if (getState()[this.name].isFetching) {
        return
      }

      dispatch(this.requestAction())

      let formattedURL = format(this.url, urlParams)
      /*
       todo:  check if there are any paramters left in the url: formattedURL.match(/{(.*)?}/)
       currently this does not work as unused paramaters are just removed from the url
       */
      return fetch(formattedURL)
        .then(response => response.json())
        .then(json => {
          let error
          let value
          try {
            value = this.jsonToAny(json, options)
          } catch (e) {
            error = e.message
            console.error(error)
          }

          return dispatch(this.receiveAction(value, error))
        })
        .catch(ex => {
          console.error('Failed to load the endpoint request: ' + this.name, ex.message)
          return dispatch(this.receiveAction(null, 'errors:page.loadingFailed'))
        })
    }
  }
}

export default Endpoint
