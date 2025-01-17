import { call, SagaGenerator } from 'typed-redux-saga'

import { EventModel } from 'api-client'

import { DataContainer } from '../../utils/DataContainer'

export default function* loadEvents(
  city: string,
  language: string,
  eventsEnabled: boolean,
  dataContainer: DataContainer,
  forceRefresh: boolean
): SagaGenerator<Array<EventModel>> {
  const eventsAvailable = yield* call(() => dataContainer.eventsAvailable(city, language))

  if (!eventsAvailable || forceRefresh) {
    if (city === 'augsburg' && language === 'en') {
      return yield* call(dataContainer.getEvents, city, language)
    }
    throw new Error('When using this mock you should prepare the DataContainer with "augsburg" and language "en"!')
  }

  return yield* call(dataContainer.getEvents, city, language)
}
