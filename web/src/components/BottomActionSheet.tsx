import React, { ReactElement, ReactNode, useEffect, useRef } from 'react'
import { BottomSheet, BottomSheetRef } from 'react-spring-bottom-sheet'
import 'react-spring-bottom-sheet/dist/style.css'
import styled, { useTheme } from 'styled-components'

import '../styles/BottomActionSheet.css'
import { getSnapPoints } from '../utils/getSnapPoints'
import Spacer from './Spacer'

const ListContainer = styled.div`
  padding: 0 30px;
`

const Title = styled.h1`
  font-size: 1.25rem;
  font-family: ${props => props.theme.fonts.web.contentFont};
`

const ToolbarContainer = styled.div`
  margin-top: 16px;
`

const StyledSpacer = styled(Spacer)`
  margin: 12px 30px;
`

type BottomActionSheetProps = {
  title?: string
  children: ReactNode
  toolbar: ReactNode
}

const BottomActionSheet = React.forwardRef(
  ({ title, children, toolbar }: BottomActionSheetProps, ref: React.Ref<BottomSheetRef>): ReactElement => {
    const theme = useTheme()
    const listRef = useRef<HTMLDivElement>(null)

    // ScrollToTop while title changes for indicating switch list/detail view
    useEffect(() => {
      if (listRef.current) {
        listRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }, [title])

    return (
      <BottomSheet
        ref={ref}
        open
        blocking={false}
        header={title && <Title>{title}</Title>}
        snapPoints={({ maxHeight }) => getSnapPoints(maxHeight)}
        defaultSnap={({ snapPoints }) => snapPoints[1]!}>
        <ListContainer ref={listRef}>{children}</ListContainer>
        <StyledSpacer borderColor={theme.colors.poiBorderColor} />
        <ToolbarContainer>{toolbar}</ToolbarContainer>
      </BottomSheet>
    )
  }
)

export default BottomActionSheet