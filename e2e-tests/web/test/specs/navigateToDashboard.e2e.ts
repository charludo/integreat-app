import { URL } from 'url'

import { defaultCity, filter, Routes } from '../../../shared/constants'
import LandingPage from '../pageobjects/landing.page'

describe('navigate to dashboard', () => {
  it('filter and navigate to City', async () => {
    const dashboardPath = Routes.dashboard
    await LandingPage.open()

    const cities = await LandingPage.cities
    const search = await LandingPage.search
    await search.click()
    await browser.keys(filter)

    const filteredCities = await LandingPage.cities
    const filteredCity = await LandingPage.city(defaultCity)

    expect(cities.length).toBeGreaterThan(0)
    expect(filteredCities.length).toBeLessThan(cities.length)
    expect(filteredCity).toExist()

    // navigate to dashboard
    await filteredCity.click()

    const dashboardUrl = await browser.getUrl()
    const parsedDashboardUrl = new URL(dashboardUrl)

    expect(parsedDashboardUrl.pathname).toContain(dashboardPath)
  })
})
