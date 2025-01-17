import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { ChangeEvent, ReactNode } from 'react'
import styled from 'styled-components'

const searchLogoWidth = '25px'

const Spacer = styled.div<{ space: boolean }>`
  ${props => props.space && 'margin: 15px 0;'}
`

const TextInput = styled.input.attrs({ type: 'text' })`
  width: calc(100% - ${searchLogoWidth} - 5px);
  height: 25px;
  box-sizing: border-box;
  margin-left: 5px;
  color: ${props => props.theme.colors.textColor};
  background: transparent;
  border-width: 0 0 1px;
  border-color: ${props => props.theme.colors.textSecondaryColor};
  outline: none;
  border-radius: 0;

  &::placeholder {
    color: ${props => props.theme.colors.textColor};
  }
`

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  box-sizing: border-box;
  padding: 10px 10%;
  background-color: ${props => props.theme.colors.backgroundColor};
`

const SearchIcon = styled(FontAwesomeIcon).attrs({ icon: faSearch })`
  width: 25px;
  font-size: 1.2em;
  text-align: center;
`

type PropsType = {
  placeholderText: string
  filterText: string
  onFilterTextChange: (filterText: string) => void
  spaceSearch: boolean
  onClickInput?: () => void
}

export class SearchInput extends React.PureComponent<PropsType> {
  static defaultProps = { spaceSearch: false }
  handleFilterTextChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { onFilterTextChange } = this.props
    if (typeof event.target.value === 'string') {
      onFilterTextChange(event.target.value)
    }
  }

  render(): ReactNode {
    const { onClickInput, filterText, placeholderText, spaceSearch } = this.props
    return (
      <Spacer space={spaceSearch}>
        <Wrapper>
          <SearchIcon />
          {/* eslint-disable-next-line styled-components-a11y/no-autofocus -- in a dedicated search modal autofocus is fine */}
          <TextInput
            placeholder={placeholderText}
            aria-label={placeholderText}
            defaultValue={filterText}
            onChange={this.handleFilterTextChange}
            onClick={onClickInput}
            autoFocus
          />
        </Wrapper>
      </Spacer>
    )
  }
}

export default SearchInput
