import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import normalizeUrl from 'normalize-url'
import compose from 'lodash/fp/compose'

import ContentList from 'routes/categories/components/ContentList'
import SearchInput from 'modules/common/components/SearchInput'

import style from './SearchPage.css'

import withFetcher from 'modules/endpoint/hocs/withFetcher'
import LANGUAGES_ENDPOINT from 'modules/endpoint/endpoints/languages'
import PAGE_ENDPOINT from 'modules/endpoint/endpoints/pages'
import PageModel from 'modules/endpoint/models/PageModel'
import { setLanguageChangeUrls } from 'modules/language/actions/setLanguageChangeUrls'
import LanguageModel from 'modules/endpoint/models/LanguageModel'

class SearchPage extends React.Component {
  static propTypes = {
    location: PropTypes.string.isRequired,
    languages: PropTypes.arrayOf(PropTypes.instanceOf(LanguageModel)).isRequired,
    language: PropTypes.string.isRequired,
    pages: PropTypes.instanceOf(PageModel).isRequired
  }

  constructor () {
    super()
    this.state = {filterText: ''}
  }

  mapLanguageToUrl = (language) => `/${this.props.location}/${language}/search`

  componentDidMount () {
    console.log(this.mapLanguageToUrl('abc'))
    this.props.dispatch(setLanguageChangeUrls(this.mapLanguageToUrl, this.props.languages))
  }

  getParentPath () {
    return `/${this.props.location}/${this.props.language}`
  }

  acceptPage (page) {
    let title = page.title.toLowerCase()
    let content = page.content
    let filterText = this.state.filterText.toLowerCase()
    // todo:  comparing the content like this is quite in-efficient and can cause lags
    // todo:  1) Do this work in an other thread 2) create an index
    return title.includes(filterText) || content.toLowerCase().includes(filterText)
  }

  /**
   * @param pages The result, can already contain some pages
   * @param baseUrl The base url
   * @param page The page
   */
  findPages (pages, baseUrl, page) {
    const url = baseUrl + '/' + page.id
    if (this.acceptPage(page)) {
      pages.push({url, page})
    }
    page.children.forEach(page => this.findPages(pages, url, page))
  }

  render () {
    const url = normalizeUrl(this.getParentPath(), {removeTrailingSlash: true})
    const pages = []
    this.props.pages.children.forEach(page => this.findPages(pages, url, page))

    return (
      <div>
        <SearchInput className={style.searchSpacing}
                     filterText={this.state.filterText}
                     onFilterTextChange={(filterText) => this.setState({filterText: (filterText)})}
        />
        <ContentList pages={pages} />
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  languages: state.languages,
  language: state.router.params.language,
  location: state.router.params.location
})

export default compose(
  connect(mapStateToProps),
  withFetcher(PAGE_ENDPOINT),
  withFetcher(LANGUAGES_ENDPOINT)
)(SearchPage)
