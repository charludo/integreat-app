import { call, SagaGenerator } from 'typed-redux-saga'

import { CityModel, createCitiesEndpoint } from 'api-client'

import { DataContainer } from '../utils/DataContainer'
import { determineApiUrl } from '../utils/helpers'
import { log, reportError } from '../utils/sentry'

function* loadCities(dataContainer: DataContainer, forceRefresh: boolean): SagaGenerator<Array<CityModel>> {
  const citiesAvailable = yield* call(dataContainer.citiesAvailable)

  if (citiesAvailable && !forceRefresh) {
    try {
      log('Using cached cities')
      return yield* call(dataContainer.getCities)
    } catch (e) {
      log('An error occurred while loading cities from JSON', 'error')
      reportError(e)
    }
  }
  log('Fetching cities')
  const apiUrl = yield* call(determineApiUrl)
  const payload = yield* call(() => createCitiesEndpoint(apiUrl).request())
  const cities = payload.data
  if (!cities) {
    throw new Error('Cities are not available')
  }
  yield* call(dataContainer.setCities, cities)
  return cities
}

export default loadCities
