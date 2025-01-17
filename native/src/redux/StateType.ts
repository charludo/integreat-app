import moment from 'moment'

import {
  CategoriesMapModel,
  CategoryModel,
  CityModel,
  ErrorCode,
  EventModel,
  LanguageModel,
  PoiModel,
  CategoriesRouteType,
  EventsRouteType,
  PoisRouteType
} from 'api-client'
import { config } from 'translations'

export type PathType = string
export type CategoryRouteConfigType = {
  readonly path: string
  readonly depth: number
  readonly language: string
  readonly city: string
}
export type CategoryRouteStateType =
  | (CategoryRouteConfigType & {
      readonly routeType: CategoriesRouteType
      readonly status: 'ready'
      readonly allAvailableLanguages: ReadonlyMap<string, string>
      // including the current content language
      readonly models: Readonly<Record<PathType, CategoryModel>>

      /* Models could be stored outside of CategoryRouteStateType
                                                       (e.g. CategoriesStateType) to save memory
                                                       in the state. This would be an optimization! */
      readonly children: Readonly<Record<PathType, ReadonlyArray<PathType>>>
    })
  | {
      readonly routeType: CategoriesRouteType
      readonly status: 'languageNotAvailable'
      readonly depth: number
      readonly city: string
      readonly language: string
      readonly allAvailableLanguages: ReadonlyMap<string, string>
    }
  | (CategoryRouteConfigType & {
      readonly routeType: CategoriesRouteType
      readonly status: 'loading'
      readonly allAvailableLanguages?: ReadonlyMap<string, string>
      readonly models?: Readonly<Record<PathType, CategoryModel>>
      readonly children?: Readonly<Record<PathType, ReadonlyArray<PathType>>>
    })
  | (CategoryRouteConfigType & {
      readonly routeType: CategoriesRouteType
      readonly status: 'error'
      readonly message: string
      readonly code: ErrorCode
    })
export type PoiRouteConfigType = {
  readonly path: string | null | undefined
  // path is null for the poi-lists route
  readonly language: string
  readonly city: string
}
export type PoiRouteStateType =
  | (PoiRouteConfigType & {
      readonly routeType: PoisRouteType
      readonly status: 'ready'
      readonly models: ReadonlyArray<PoiModel>
      readonly allAvailableLanguages: ReadonlyMap<string, string | null | undefined> // including the current content language
    })
  | (PoiRouteConfigType & {
      readonly routeType: PoisRouteType
      readonly status: 'languageNotAvailable'
      readonly allAvailableLanguages: ReadonlyMap<string, string | null | undefined>
    })
  | (PoiRouteConfigType & {
      readonly routeType: PoisRouteType
      readonly status: 'loading'
    })
  | (PoiRouteConfigType & {
      readonly routeType: PoisRouteType
      readonly status: 'error'
      readonly code: ErrorCode
      readonly message: string | null | undefined
    })
export type EventRouteConfigType = {
  readonly path: string | null | undefined
  // path is null for the event-lists route
  readonly language: string
  readonly city: string
}
export type EventRouteStateType =
  | (EventRouteConfigType & {
      readonly routeType: EventsRouteType
      readonly status: 'ready'
      readonly models: ReadonlyArray<EventModel>
      readonly allAvailableLanguages: ReadonlyMap<string, string | null | undefined> // including the current content language
    })
  | (EventRouteConfigType & {
      readonly routeType: EventsRouteType
      readonly status: 'languageNotAvailable'
      readonly allAvailableLanguages: ReadonlyMap<string, string | null | undefined>
    })
  | (EventRouteConfigType & {
      readonly routeType: EventsRouteType
      readonly status: 'loading'
      readonly models?: ReadonlyArray<EventModel>
      readonly allAvailableLanguages?: ReadonlyMap<string, string | null | undefined>
    })
  | (EventRouteConfigType & {
      readonly routeType: EventsRouteType
      readonly status: 'error'
      readonly code: ErrorCode
      readonly message: string | null | undefined
    })
export type PageResourceCacheEntryStateType = {
  readonly filePath: string
  readonly lastUpdate: moment.Moment
  readonly hash: string
}
export type PageResourceCacheStateType = Readonly<Record<string, PageResourceCacheEntryStateType>>
export type LanguageResourceCacheStateType = Readonly<Record<string, PageResourceCacheStateType>>
export type ResourceCacheStateType =
  | {
      readonly status: 'error'
      readonly code: ErrorCode
      readonly message: string | null | undefined
    }
  | {
      readonly status: 'ready'
      readonly progress: number
      readonly value: LanguageResourceCacheStateType
    }
export type CityResourceCacheStateType = Readonly<Record<string, LanguageResourceCacheStateType>>
export type CitiesStateType =
  | {
      readonly status: 'ready'
      readonly models: ReadonlyArray<CityModel>
    }
  | {
      readonly status: 'loading'
    }
  | {
      readonly status: 'error'
      readonly code: ErrorCode
      readonly message: string
    }
export const defaultCitiesState: CitiesStateType = {
  status: 'error',
  code: ErrorCode.UnknownError,
  message: 'Cities not yet initialized'
}
export type LanguagesStateType =
  | {
      readonly status: 'ready'
      readonly models: ReadonlyArray<LanguageModel>
    }
  | {
      readonly status: 'loading'
    }
  | {
      readonly status: 'error'
      readonly code: ErrorCode
      readonly message: string
    }
export const defaultContentLanguageState = config.defaultFallback
export type SearchRouteType = {
  readonly categoriesMap: CategoriesMapModel
}
export type RouteStateType = CategoryRouteStateType | EventRouteStateType | PoiRouteStateType
export type RouteMappingType = Readonly<Record<string, RouteStateType>>
export type CityContentStateType = {
  readonly city: string
  readonly switchingLanguage: boolean
  readonly languages: LanguagesStateType
  readonly routeMapping: RouteMappingType
  readonly resourceCache: ResourceCacheStateType
  readonly searchRoute: SearchRouteType | null
}
export const defaultCityContentState = null
export type SnackbarType = {
  text: string
}
export type SnackbarStateType = Array<SnackbarType>
export type StateType = {
  readonly snackbar: SnackbarStateType
  readonly resourceCacheUrl: string | null
  readonly cityContent: CityContentStateType | null
  readonly contentLanguage: string
  readonly cities: CitiesStateType
}
