import React from 'react'
import { Provider } from 'react-redux'
import { ThemeProvider } from 'styled-components'

import createReduxStore from '../createReduxStore'
import createHistory from '../createHistory'
import I18nProvider from '../../i18n/containers/I18nProvider'

import PlatformContext from '../../platform/containers/PlatformProvider'
import routesMap from '../routesMap'
import Switcher from './Switcher'
import theme from '../constants/theme'

class App extends React.Component {
  store

  componentWillMount () {
    this.store = createReduxStore(createHistory, {}, routesMap)
  }

  render () {
    return <Provider store={this.store}>
      <PlatformContext.Provider>
        <I18nProvider>
          <ThemeProvider theme={theme}>
            <Switcher />
          </ThemeProvider>
        </I18nProvider>
      </PlatformContext.Provider>
    </Provider>
  }
}

export default App
