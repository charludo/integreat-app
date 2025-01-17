import { omit } from 'lodash'

import { CATEGORIES_ROUTE, EVENTS_ROUTE, POIS_ROUTE } from 'api-client'

import { CityContentStateType, defaultCityContentState } from '../StateType'
import { StoreActionType } from '../StoreActionType'
import createCityContent from './createCityContent'
import morphContentLanguage from './morphContentLanguage'
import pushCategory from './pushCategory'
import pushEvent from './pushEvent'
import pushPoi from './pushPoi'

export default (
  state: CityContentStateType | null = defaultCityContentState,
  action: StoreActionType
): CityContentStateType | null => {
  if (action.type === 'FETCH_CATEGORY') {
    const { language, path, depth, key, city } = action.params
    const initializedState = state || createCityContent(city)
    const reuseOldContent = state?.routeMapping[key]?.routeType === CATEGORIES_ROUTE
    const oldContent = reuseOldContent ? state.routeMapping[key] : {}
    return {
      ...initializedState,
      routeMapping: {
        ...initializedState.routeMapping,
        [key]: { ...oldContent, routeType: CATEGORIES_ROUTE, status: 'loading', language, depth, path, city }
      }
    }
  }
  if (action.type === 'FETCH_EVENT') {
    const { language, path, key, city } = action.params
    const initializedState = state || createCityContent(city)
    const reuseOldContent = state?.routeMapping[key]?.routeType === EVENTS_ROUTE
    const oldContent = reuseOldContent ? state.routeMapping[key] : {}
    return {
      ...initializedState,
      routeMapping: {
        ...initializedState.routeMapping,
        [key]: { ...oldContent, routeType: EVENTS_ROUTE, status: 'loading', language, city, path }
      }
    }
  }
  if (action.type === 'FETCH_POI') {
    const { language, path, key, city } = action.params
    const initializedState = state || createCityContent(city)
    return {
      ...initializedState,
      routeMapping: {
        ...initializedState.routeMapping,
        [key]: {
          routeType: POIS_ROUTE,
          status: 'loading',
          language,
          city,
          path
        }
      }
    }
  }
  if (state === null) {
    return null
  }

  switch (action.type) {
    case 'SWITCH_CONTENT_LANGUAGE':
      return {
        ...state,
        switchingLanguage: true,
        searchRoute: null,
        resourceCache:
          state.resourceCache.status !== 'error' ? { ...state.resourceCache, progress: 0 } : state.resourceCache
      }

    case 'SWITCH_CONTENT_LANGUAGE_FAILED':
      return { ...state, switchingLanguage: false }

    case 'PUSH_LANGUAGES':
      return {
        ...state,
        languages: {
          status: 'ready',
          models: action.params.languages
        }
      }

    case 'FETCH_LANGUAGES_FAILED':
      return {
        ...state,
        languages: {
          status: 'error',
          ...action.params
        }
      }

    case 'FETCH_RESOURCES_PROGRESS':
      return {
        ...state,
        resourceCache:
          state.resourceCache.status !== 'error'
            ? { ...state.resourceCache, progress: action.params.progress }
            : state.resourceCache
      }

    case 'PUSH_CATEGORY':
      return pushCategory(state, action)

    case 'PUSH_POI':
      return pushPoi(state, action)

    case 'PUSH_EVENT':
      return pushEvent(state, action)

    case 'CLEAR_ROUTE': {
      const { key } = action.params
      return { ...state, routeMapping: omit(state.routeMapping, [key]) }
    }

    case 'MORPH_CONTENT_LANGUAGE':
      return morphContentLanguage(state, action)

    case 'FETCH_EVENT_FAILED': {
      const { message, key, allAvailableLanguages, path, ...rest } = action.params
      return {
        ...state,
        routeMapping: {
          ...state.routeMapping,
          [key]: allAvailableLanguages
            ? {
                routeType: EVENTS_ROUTE,
                status: 'languageNotAvailable',
                allAvailableLanguages,
                path,
                ...rest
              }
            : {
                routeType: EVENTS_ROUTE,
                status: 'error',
                message,
                path,
                ...rest
              }
        }
      }
    }

    case 'FETCH_CATEGORY_FAILED': {
      const { message, code, key, allAvailableLanguages, path, ...rest } = action.params
      return {
        ...state,
        routeMapping: {
          ...state.routeMapping,
          [key]: allAvailableLanguages
            ? {
                routeType: CATEGORIES_ROUTE,
                status: 'languageNotAvailable',
                allAvailableLanguages,
                ...rest
              }
            : {
                routeType: CATEGORIES_ROUTE,
                status: 'error',
                message,
                code,
                path,
                ...rest
              }
        }
      }
    }

    case 'CLEAR_CITY':
    case 'CLEAR_RESOURCES_AND_CACHE':
      return null

    case 'FETCH_RESOURCES_FAILED': {
      const { message, code } = action.params
      return {
        ...state,
        resourceCache: {
          status: 'error',
          message,
          code
        }
      }
    }

    default:
      return state
  }
}
