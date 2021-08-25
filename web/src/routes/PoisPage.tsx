import React, { ReactElement, useCallback, useContext } from 'react'
import { BBox, Feature } from 'geojson'
import {
  createPOIsEndpoint,
  normalizePath,
  NotFoundError,
  PoiModel,
  useLoadFromEndpoint,
  POIS_ROUTE,
  embedInCollection,
  MapViewViewport,
  defaultViewportConfig
} from 'api-client'
import LocationLayout from '../components/LocationLayout'
import LocationToolbar from '../components/LocationToolbar'
import { FeedbackRatingType } from '../components/FeedbackToolbarItem'
import DateFormatterContext from '../contexts/DateFormatterContext'
import PoiListItem from '../components/PoiListItem'
import useWindowDimensions from '../hooks/useWindowDimensions'
import { cmsApiBaseUrl } from '../constants/urls'
import { createPath, RouteProps } from './index'
import { useTranslation } from 'react-i18next'
import LoadingSpinner from '../components/LoadingSpinner'
import FailureSwitcher from '../components/FailureSwitcher'
import Page from '../components/Page'
import PageDetail from '../components/PageDetail'
import Caption from '../components/Caption'
import List from '../components/List'
import Helmet from '../components/Helmet'
import MapView from '../components/MapView'
import { CityRouteProps } from '../CityContentSwitcher'
import { WebMercatorViewport } from 'react-map-gl'

const moveViewToBBox = (bBox: BBox, defaultVp: MapViewViewport): MapViewViewport => {
  const mercatorVp = new WebMercatorViewport(defaultVp)
  const vp = mercatorVp.fitBounds([
    [bBox[0], bBox[1]],
    [bBox[2], bBox[3]]
  ])
  return vp
}

type PropsType = CityRouteProps & RouteProps<typeof POIS_ROUTE>

const PoisPage = ({ match, cityModel, location, languages, history }: PropsType): ReactElement => {
  const { cityCode, languageCode, poiId } = match.params
  const pathname = normalizePath(location.pathname)
  const { t } = useTranslation('pois')
  const formatter = useContext(DateFormatterContext)
  const { viewportSmall } = useWindowDimensions()
  // eslint-disable-next-line no-console
  console.log('To use geolocation in a development build you have to start the dev server with\n "yarn start --https"')

  const requestPois = useCallback(async () => {
    return createPOIsEndpoint(cmsApiBaseUrl).request({ city: cityCode, language: languageCode })
  }, [cityCode, languageCode])
  const { data: pois, loading, error: poisError } = useLoadFromEndpoint(requestPois)

  const poi = poiId && pois?.find((poi: PoiModel) => poi.path === pathname)

  const toolbar = (openFeedback: (rating: FeedbackRatingType) => void) => (
    <LocationToolbar openFeedbackModal={openFeedback} viewportSmall={false} />
  )

  const languageChangePaths = languages.map(({ code, name }) => {
    const rootPath = createPath(POIS_ROUTE, { cityCode, languageCode: code })
    return {
      path: poi ? poi.availableLanguages.get(code) || null : rootPath,
      name,
      code
    }
  })

  const locationLayoutParams = {
    cityModel,
    viewportSmall,
    feedbackTargetInformation: poi ? { path: poi.path } : null,
    languageChangePaths,
    route: POIS_ROUTE,
    languageCode,
    pathname,
    toolbar
  }

  if (loading) {
    return (
      <LocationLayout isLoading {...locationLayoutParams}>
        <LoadingSpinner />
      </LocationLayout>
    )
  }

  if (!pois || (poiId && !poi)) {
    const error =
      poisError ||
      new NotFoundError({
        type: 'poi',
        id: pathname,
        city: cityCode,
        language: languageCode
      })

    return (
      <LocationLayout isLoading={false} {...locationLayoutParams}>
        <FailureSwitcher error={error} />
      </LocationLayout>
    )
  }

  if (poi) {
    const { thumbnail, lastUpdate, content, title, location } = poi
    const pageTitle = `${title} - ${cityModel.name}`

    return (
      <LocationLayout isLoading={false} {...locationLayoutParams}>
        <Helmet pageTitle={pageTitle} languageChangePaths={languageChangePaths} cityModel={cityModel} />
        <Page
          defaultThumbnailSrc={thumbnail}
          lastUpdate={lastUpdate}
          content={content}
          title={title}
          formatter={formatter}
          onInternalLinkClick={history.push}>
          {location.location && <PageDetail identifier={t('location')} information={location.location} />}
        </Page>
      </LocationLayout>
    )
  }
  const sortedPois = pois.sort((poi1: PoiModel, poi2: PoiModel) => poi1.title.localeCompare(poi2.title))
  const renderPoiListItem = (poi: PoiModel) => <PoiListItem key={poi.path} poi={poi} />
  const pageTitle = `${t('pageTitle')} - ${cityModel.name}`
  const featureLocations = pois.map(poi => poi.featureLocation).filter((feature): feature is Feature => !!feature)

  return (
    <LocationLayout isLoading={false} {...locationLayoutParams}>
      <Helmet pageTitle={pageTitle} languageChangePaths={languageChangePaths} cityModel={cityModel} />
      <Caption title={t('pois')} />
      <MapView
        featureCollection={embedInCollection(featureLocations)}
        defaultViewport={
          cityModel.boundingBox ? moveViewToBBox(cityModel.boundingBox, defaultViewportConfig) : undefined
        }
      />
      <List noItemsMessage={t('noPois')} items={sortedPois} renderItem={renderPoiListItem} />
    </LocationLayout>
  )
}

export default PoisPage
