// @flow

import integreatTestCmsPlatformBuildConfigs from '../integreat-test-cms'
import type {
  AndroidBuildConfigType,
  CommonBuildConfigType,
  iOSBuildConfigType,
  WebBuildConfigType
} from '../BuildConfigType'

const integreatE2e = {
  appName: 'IntegreatE2E',
  e2e: true,
  development: false,
  featureFlags: {
    pois: true,
    newsStream: true,
    pushNotifications: false,
    introSlides: false,
    sentry: false
  }
}

const commonIntegreatE2eBuildConfig: CommonBuildConfigType = {
  ...integreatTestCmsPlatformBuildConfigs.common,
  ...integreatE2e
}

const webIntegreatE2eBuildConfig: WebBuildConfigType = {
  ...integreatTestCmsPlatformBuildConfigs.web,
  ...integreatE2e
}

const androidIntegreatE2eBuildCOnfig: AndroidBuildConfigType = {
  ...integreatTestCmsPlatformBuildConfigs.android,
  ...integreatE2e,
  googleServices: null
}

const iosIntegreatE2eBuildConfig: iOSBuildConfigType = {
  ...integreatTestCmsPlatformBuildConfigs.ios,
  ...integreatE2e,
  googleServices: null
}

const platformBuildConfigs = {
  common: commonIntegreatE2eBuildConfig,
  web: webIntegreatE2eBuildConfig,
  android: androidIntegreatE2eBuildCOnfig,
  ios: iosIntegreatE2eBuildConfig,
}

export default platformBuildConfigs
