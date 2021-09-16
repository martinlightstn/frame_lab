import React from 'react'
import Restore from 'react-restore'
import styled, { keyframes, ThemeProvider } from 'styled-components'

import InventoryItem from './InventoryItem'

import { float, shake } from '../../style'

const InventoryWrap = styled.div`
  position: absolute;
  top: 58px;
  left: 5px;
  bottom: 5px;
  right: 5px;
`

const InventoryNone = styled.div`
  position: absolute;
  top: 0px;
  left: 0px;
  bottom: 0px;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 400;
  span {
    letter-spacing: 2px;
    margin-left: 2px;
  }
  
`

const InventoryHeader = styled.div`
  position: relative;
  font-size: 10px;
  text-align: center;
  width; 100%;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 1px;
  // background: ${props => props.theme.base2};
  position: realative;
  height: 19px;
  display: flex;
  justify-content: center;
  align-items: center;
`

const InventoryHeaderBack = styled.div`
  position: absolute;
  left: 3px;
  top: 3px;
  bottom: 0px;
  width: 26px;
  height: 14px;
  border-radius: 7px;
  background: ${props => props.theme.good};
  color: ${props => props.theme.goodOver};
  cursor: pointer;

  svg {
    position: relative;
    width: 12px;
    top: 0px;
  }

  &:hover {
    animation: 5s ${float} ease-in-out infinite alternate;
    box-shadow: 0px 3px 5px 0px ${props => props.theme.baseShadow};
  }

  &:active {
    animation: ${shake} 2s ease-in-out infinite;
    box-shadow: 0px 1px 2px 0px ${props => props.theme.baseShadow};
  }
`

const InventoryHeaderText = styled.span`
  margin-left: 20px;
`

const ItemWrap = styled.div`
  position: absolute;
  top: 24px;
  left: 0px;
  bottom: 0px;
  right: 0px;
  border-radius: 6px;
  background: ${props => props.theme.base1};
`
const ItemScroll = styled.div`
  position: absolute;
  top: 0;
  right: -50px;
  bottom: 0;
  left: 0;
  padding-right: 50px;
  overflow-y: scroll;
  overflow-x: hidden;
  overscroll-behavior: contain;
`

const PopCollectionsWrapper = styled.div`
  text-align: center;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  border-radius: 7px;
  padding: 6px 5px 6px 5px;
  box-sizing: border-box;
  min-height: calc(100% + 1px);
`

class Inventory extends React.Component {
  constructor (...args) {
    super(...args)
    this.state = {
      hovered: false
    }
  }
  render () {
    const { userId } = this.store('layerPop')
    const user = this.store('users', userId) || {}
    const select = this.store('select')
    const collection = select?.collection

    let name = collection ? user?.inventory?.[collection]?.meta?.name : '' || ''
    if (name === 'ENS: Ethereum Name Service') name = 'Ethereum Name Service'
    if (name.length > 26) name = name.substr(0, 23) + '...' 
    const paddingRight = (50 - this.store('scrollBarWidth')) + 'px'
    return (
      <InventoryWrap>
        {!collection ? (
          <>
            <InventoryHeader>   
              Inventory
            </InventoryHeader>
            <ItemWrap>
              <ItemScroll style={{ paddingRight }}>
                <PopCollectionsWrapper>
                  {Object.keys(user.inventory).sort((key1, key2) => {
                    const c1 = user.inventory[key1]
                    const c2 = user.inventory[key2]
                    if (c1.meta.priority === c2.meta.priority) return 0
                    if (c1.meta.priority > c2.meta.priority) return -1
                    if (c1.meta.priority < c2.meta.priority) return 1
                  }).map(key => {
                    return <InventoryItem key={key} collection={key} />
                  })}
                  {Object.keys(user.inventory).length === 0 ? <InventoryNone><span>{'no items'}</span></InventoryNone> : null}
                </PopCollectionsWrapper>
              </ItemScroll>
            </ItemWrap>
          </>
        ) : (
          <>
            <InventoryHeader>
              <InventoryHeaderBack
                onClick={() => {
                  this.store.setSelect(false)
                  this.store.setHover(false)
                }}
              >
                <svg viewBox="0 0 448 512">
                  <path fill="currentColor" d="M134.059 296H436c6.627 0 12-5.373 12-12v-56c0-6.627-5.373-12-12-12H134.059v-46.059c0-21.382-25.851-32.09-40.971-16.971L7.029 239.029c-9.373 9.373-9.373 24.569 0 33.941l86.059 86.059c15.119 15.119 40.971 4.411 40.971-16.971V296z" />
                </svg>
              </InventoryHeaderBack>
              <InventoryHeaderText>
                {name}
              </InventoryHeaderText>
            </InventoryHeader>
            <ItemWrap>
              <ItemScroll>
                <PopCollectionsWrapper>
                  {Object.keys(user.inventory[collection].assets).map(key => {
                    return <InventoryItem key={key} collection={collection} asset={key} />
                  })}
                </PopCollectionsWrapper>
              </ItemScroll>
            </ItemWrap>
          </>
        )}
      </InventoryWrap>
    )
  }
}

export default Restore.connect(Inventory)