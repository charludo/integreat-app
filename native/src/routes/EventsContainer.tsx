import * as React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import { CityModel, ErrorCode, EventModel, EVENTS_ROUTE, EventsRouteType } from 'api-client'

import { NavigationPropType, RoutePropType } from '../constants/NavigationTypes'
import withPayloadProvider, { StatusPropsType } from '../hocs/withPayloadProvider'
import useSetShareUrl from '../hooks/useSetShareUrl'
import createNavigate from '../navigation/createNavigate'
import createNavigateToFeedbackModal from '../navigation/createNavigateToFeedbackModal'
import { EventRouteStateType, LanguageResourceCacheStateType, StateType } from '../redux/StateType'
import { StoreActionType, SwitchContentLanguageActionType } from '../redux/StoreActionType'
import { reportError } from '../utils/sentry'
import Events from './Events'

type NavigationPropsType = {
  route: RoutePropType<EventsRouteType>
  navigation: NavigationPropType<EventsRouteType>
}
type OwnPropsType = NavigationPropsType
type DispatchPropsType = {
  dispatch: Dispatch<StoreActionType>
}
type ContainerPropsType = NavigationPropsType &
  DispatchPropsType & {
    path: string | null | undefined
    events: Array<EventModel>
    cityModel: CityModel
    language: string
    resourceCache: LanguageResourceCacheStateType
    resourceCacheUrl: string
  }
type RefreshPropsType = NavigationPropsType & {
  cityCode: string
  language: string
  path: string | null | undefined
}
type StatePropsType = StatusPropsType<ContainerPropsType, RefreshPropsType>

const createChangeUnavailableLanguage =
  (city: string) => (dispatch: Dispatch<StoreActionType>, newLanguage: string) => {
    const switchContentLanguage: SwitchContentLanguageActionType = {
      type: 'SWITCH_CONTENT_LANGUAGE',
      params: {
        newLanguage,
        city
      }
    }
    dispatch(switchContentLanguage)
  }

const routeHasOldContent = (route: EventRouteStateType) => 'models' in route && route.allAvailableLanguages

const mapStateToProps = (state: StateType, ownProps: OwnPropsType): StatePropsType => {
  const {
    route: { key }
  } = ownProps

  if (!state.cityContent) {
    return {
      status: 'routeNotInitialized'
    }
  }

  const { resourceCache, routeMapping, switchingLanguage, languages } = state.cityContent
  const route = routeMapping[key]

  if (!route || route.routeType !== EVENTS_ROUTE) {
    return {
      status: 'routeNotInitialized'
    }
  }

  if (route.status === 'languageNotAvailable' && !switchingLanguage) {
    if (languages.status === 'error' || languages.status === 'loading') {
      reportError(new Error('languageNotAvailable status impossible if languages not ready'))
      return {
        status: 'error',
        refreshProps: null,
        code: languages.status === 'error' ? languages.code : ErrorCode.UnknownError,
        message: languages.status === 'error' ? languages.message : 'languages not ready'
      }
    }

    return {
      status: 'languageNotAvailable',
      availableLanguages: languages.models.filter(lng => route.allAvailableLanguages.has(lng.code)),
      cityCode: route.city,
      changeUnavailableLanguage: createChangeUnavailableLanguage(route.city)
    }
  }

  const refreshProps = {
    path: route.path,
    cityCode: route.city,
    language: route.language,
    navigation: ownProps.navigation,
    route: ownProps.route
  }

  if (state.cities.status === 'error') {
    return {
      status: 'error',
      message: state.cities.message,
      code: state.cities.code,
      refreshProps
    }
  }
  if (resourceCache.status === 'error') {
    return {
      status: 'error',
      message: resourceCache.message,
      code: resourceCache.code,
      refreshProps
    }
  }
  if (route.status === 'error') {
    return {
      status: 'error',
      message: route.message,
      code: route.code,
      refreshProps
    }
  }
  if (languages.status === 'error') {
    return {
      status: 'error',
      message: languages.message,
      code: languages.code,
      refreshProps
    }
  }

  const { resourceCacheUrl } = state

  if (
    resourceCacheUrl === null ||
    state.cities.status === 'loading' ||
    switchingLanguage ||
    (route.status === 'loading' && !routeHasOldContent(route)) ||
    languages.status === 'loading'
  ) {
    return {
      status: 'loading',
      progress: 0
    }
  }

  const cities = state.cities.models
  const cityModel = cities.find(city => city.code === route.city)

  if (!cityModel) {
    throw new Error('cityModel is undefined!')
  }

  if (route.status === 'languageNotAvailable') {
    throw new Error('language not available route status not handled!')
  }

  const innerProps = {
    path: route.path,
    events: Array.from(route.models || []),
    cityModel,
    language: route.language,
    resourceCache: resourceCache.value,
    resourceCacheUrl,
    navigation: ownProps.navigation,
    route: ownProps.route
  }

  if (route.status === 'loading') {
    return {
      status: 'loading',
      refreshProps,
      innerProps,
      progress: 0
    }
  }

  return {
    status: 'success',
    refreshProps,
    innerProps
  }
}

const mapDispatchToProps = (dispatch: Dispatch<StoreActionType>): DispatchPropsType => ({
  dispatch
})

const EventsContainer = ({ dispatch, navigation, route, ...rest }: ContainerPropsType) => {
  const routeInformation = {
    route: EVENTS_ROUTE,
    languageCode: rest.language,
    cityCode: rest.cityModel.code,
    cityContentPath: rest.path ?? undefined
  }
  useSetShareUrl({ navigation, routeInformation, route })

  return (
    <Events
      {...rest}
      navigateTo={createNavigate(dispatch, navigation)}
      navigateToFeedback={createNavigateToFeedbackModal(navigation)}
    />
  )
}

const refresh = (refreshProps: RefreshPropsType, dispatch: Dispatch<StoreActionType>) => {
  const { route, navigation, cityCode, language, path } = refreshProps
  const navigateTo = createNavigate(dispatch, navigation)
  navigateTo(
    {
      route: EVENTS_ROUTE,
      cityCode,
      languageCode: language,
      cityContentPath: path || undefined
    },
    route.key,
    true
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
  // @ts-expect-error TODO: IGAPP-636
)(withPayloadProvider<ContainerPropsType, RefreshPropsType, EventsRouteType>(refresh, true)(EventsContainer))
