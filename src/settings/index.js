/* globals chrome */

import React from 'react'
import Restore from 'react-restore'
import ReactDOM from 'react-dom'
import styled from 'styled-components'

import { Cluster, ClusterValue, ClusterRow, ClusterBoxMain } from './Cluster'

const APPEAR_AS_MM = '__frameAppearAsMM__'
const AUGMENT_OFF = '__frameAugmentOff__'

const initialState = {
  frameConnected: false,
  appearAsMM: false,
  augmentOff: false
}

const actions = {
  setChains: (u, chains) => {
    u('availableChains', () => chains)
  },
  setCurrentChain: (u, chain) => {
    u('currentChain', () => chain)
  },
  setFrameConnected: (u, connected) => {
    u('frameConnected', () => connected)
  }
}

const store = Restore.create(initialState, actions)

const getScrollBarWidth = () => {
  if (typeof document === 'undefined') return 0
  const inner = document.createElement('p')
  inner.style.width = '100%'
  inner.style.height = '200px'
  const outer = document.createElement('div')
  outer.style.position = 'absolute'
  outer.style.top = '0px'
  outer.style.left = '0px'
  outer.style.visibility = 'hidden'
  outer.style.width = '200px'
  outer.style.height = '150px'
  outer.style.overflow = 'hidden'
  outer.appendChild(inner)
  document.body.appendChild(outer)
  var w1 = inner.offsetWidth
  outer.style.overflow = 'scroll'
  var w2 = inner.offsetWidth
  if (w1 == w2) w2 = outer.clientWidth
  document.body.removeChild(outer)
  return w1 - w2
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  return tabs[0]
}

async function executeScript(tabId, func, args) {
  try {
    const result = await chrome.scripting.executeScript({
      target: { tabId },
      func,
      args
    })

    return result
  } catch (e) {
    // this can happen when trying to open the settings panel while on a tab that doesn't support
    // script injection, such as a chrome:// tab
    return []
  }
}

async function getLocalSetting(tabId, key) {
  const results = await executeScript(tabId, (key) => localStorage.getItem(key), [key])

  if (results && results.length > 0) {
    try {
      return JSON.parse(results[0].result || false)
    } catch (e) {
      return false
    }
  }

  return false
}

async function setLocalSetting(tabId, setting, val) {
  return executeScript(
    tabId,
    (key, val) => {
      localStorage.setItem(key, val)
      window.location.reload()
    },
    [setting, val]
  )
}

async function toggleLocalSetting(key) {
  const activeTab = await getActiveTab()

  if (activeTab) {
    const currentValue = await getLocalSetting(activeTab.id, key)
    setLocalSetting(activeTab.id, key, !currentValue)

    window.close()
  }
}

const SettingsScroll = styled.div`
  overflow-x: hidden;
  overflow-y: scroll;
  box-sizing: border-box;
  max-height: 580px;
  margin-right: -${(props) => props.scrollBar || 0}px;
  background: var(--ghostY);
  margin: 10px;
  border-radius: 30px;
`

const AugmentStateOn = styled.div`
  color: var(--good);
`

const AugmentStateOff = styled.div`
  color: var(--bad);
`

const Augment = styled.div`
  position: relative;
  height: 50px;
  border-radius: 4px;
  font-weight: 600;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  cursor: pointer;
  font-size: 12px;
  overflow: hidden;
`

const FrameConnected = styled.div`
  font-size: 14px;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 1px;
  padding-left: 1px;
`

const LogoWrap = styled.div`
  width: 80px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;

  img {
    height: 20px;
  }
`

const SummonFrameButton = styled.div`
  width: 80px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;

  svg {
    height: 20px;
    transform: scaleX(1.2);
  }
`

const FrameButton = styled.div`
  width: 140px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  font-size: 16px;
  font-weight: 400;
`

const AppearDescription = styled.div`
  font-weight: 600;
  text-transform: uppercase;
  font-size: 14px;
  padding-left: 1px;
  letter-spacing: 1px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-left: 1px;
  letter-spacing: 1px;
  height: 50px;

  svg {
    height: 16px;
    margin-right: 8px;
  }
`
const AppearDescriptionFrame = styled.div`
  font-weight: 600;
  text-transform: uppercase;
  font-size: 14px;
  padding-left: 1px;
  letter-spacing: 1px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-left: 1px;
  letter-spacing: 1px;
  height: 50px;

  svg {
    height: 16px;
    margin-right: 8px;
    transform: scale(1.5) translateY(15%);
  }
`

const AppearToggle = styled.div`
  position: relative;
  height: 32px;
  font-weight: 600;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  cursor: pointer;
  font-size: 12px;
  overflow: hidden;
  padding-left: 1px;
  letter-spacing: 1px;
`

const NotConnected = styled.div`
  padding: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
`

const CannotConnectSub = styled.div`
  padding: 0px 32px 0px 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  flex-direction: column;
`

const UnsupportedTab = styled.div`
  padding: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
`

const UnsupportedOrigin = styled.div`
  color: var(--moon);
  padding-top: 4px;
  padding-bottom: 4px;
  font-size: 18px;
`

const Download = styled.a`
  color: var(--good);
  height: 64px;
  width: 100%;
  font-weight: 700;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  cursor: pointer;
  font-size: 17px;
  letter-spacing: 1px;
  padding-right: 1px;

  * {
    pointer-events: none;
  }

  &:visited {
    color: var(--good);
  }
`

const CurrentOriginTitle = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 15px;
  height: 44px;
  padding-top: 8px;
  margin-top: 0px;
  font-weight: 400;
  svg {
    position: relative;
    top: 1px;
    margin-right: 10px;
    height: 15px;
  }
`

const ChainButtonIcon = styled.div`
  position: absolute;
  top: 12px;
  left: 10px;
  width: 20px;
  height: 20px;
  background: ${(props) => (props.selected ? 'var(--lighton)' : 'var(--ghostAZ)')};
  border-radius: 10px;
  box-sizing: border-box;
  border: solid 3px var(--ghostZ);
`

const ChainButtonLabel = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  font-size: 14px;
  padding-left: 4px;
  font-weight: 500;
  height: 44px;
`

const Overlay = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(-35deg, var(--overlayA) 0%, var(--overlayB) 100%);
  z-index: 9999999999999;
  pointer-events: none;
`

const originDomainRegex = /^(?<protocol>.+:(?:\/\/)?)(?<origin>[^\#\/]*)/

function parseOrigin(url = '') {
  const m = url.match(originDomainRegex)

  if (!m) {
    console.warn(`could not parse origin: ${url}`)
    return url
  }

  return m.groups || { origin: url, protocol: '' }
}

const chainConnected = ({ connected }) => connected === undefined || connected

const isInjectedUrl = (url = '') => url.startsWith('http') || url.startsWith('file')

const ChainButton = ({ index, chain, tab, selected }) => {
  const { chainId, name } = chain
  const isSelectable = chainConnected(chain)
  return (
    <ClusterValue
      style={{
        flexGrow: 0,
        width: 'calc(50% - 3px)',
        borderBottomRightRadius: index === 0 ? '8px' : 'auto',
        opacity: isSelectable ? 1 : 0.4,
        cursor: isSelectable ? 'pointer' : 'default'
      }}
      onClick={() => {
        if (isSelectable) {
          chrome.runtime.sendMessage({
            tab,
            method: 'wallet_switchEthereumChain',
            params: [{ chainId }]
          })
          updateCurrentChain(tab)
        }
      }}
    >
      <ChainButtonIcon selected={selected} />
      <ChainButtonLabel>{name}</ChainButtonLabel>
    </ClusterValue>
  )
}

// const isFirefox = Boolean(window?.browser && browser?.runtime)

class _Settings extends React.Component {
  notConnected() {
    return (
      <Cluster>
        <ClusterRow>
          <ClusterValue>
            <div style={{ paddingBottom: '32px' }}>
              <NotConnected>Unable to connect to Frame</NotConnected>
              <CannotConnectSub>Make sure the Frame desktop app is running</CannotConnectSub>
              <CannotConnectSub>on your machine or download it below</CannotConnectSub>
            </div>
          </ClusterValue>
        </ClusterRow>
        <ClusterRow>
          <ClusterValue pointerEvents={true}>
            <Download href='https://frame.sh' target='_newtab'>
              Download Frame
            </Download>
          </ClusterValue>
        </ClusterRow>
      </Cluster>
    )
  }

  unsupportedTab(origin) {
    return (
      <Cluster>
        <ClusterRow>
          <ClusterValue>
            <div style={{ paddingBottom: '32px' }}>
              <UnsupportedTab>Unsupported tab</UnsupportedTab>
              <CannotConnectSub>
                <div>Frame does not have access to</div>
                <UnsupportedOrigin>{origin}</UnsupportedOrigin>
                <div>tabs in this browser</div>
              </CannotConnectSub>
            </div>
          </ClusterValue>
        </ClusterRow>
      </Cluster>
    )
  }

  frameConnected() {
    const isConnected = this.store('frameConnected')

    return (
      <Cluster>
        <ClusterRow>
          <ClusterValue
            onClick={() => {
              if (isConnected) chrome.runtime.sendMessage({ method: 'frame_summon', params: [] })
            }}
            style={{
              flexGrow: 1,
              color: isConnected ? 'var(--good)' : 'var(--moon)',
              justifyContent: 'space-between',
              height: '64px'
            }}
          >
            <LogoWrap>
              <img src={isConnected ? '../icons/icon96good.png' : '../icons/icon96moon.png'} />
            </LogoWrap>
            {isConnected ? (
              <FrameConnected style={{ color: 'var(--good)' }}>{'Frame Connected'}</FrameConnected>
            ) : (
              <FrameConnected style={{ color: 'var(--moon)' }}>{'Frame Disconnected'}</FrameConnected>
            )}
            <SummonFrameButton>
              <svg viewBox='0 0 512 512'>
                <path
                  fill='currentColor' transform='scale(21.3)'
                  d='M18.575,11,16.44,7.453A3.016,3.016,0,0,0,13.87,6H5.392L3.115,10.553l1.789.894L6.628,8H9.464L7.711,12.273a3,3,0,0,0,1.172,3.674L13,18.551V24h2V17.449L12.392,15.8l2.767-6.6L17.444,13H22.01V11ZM12.51,2.5A2.5,2.5,0,1,1,15.01,5,2.5,2.5,0,0,1,12.51,2.5ZM7.815,17.638l.665.42L7.679,20H1.01V18H6.34l.5-1.2A4.987,4.987,0,0,0,7.815,17.638Z'
                />
              </svg>
            </SummonFrameButton>
          </ClusterValue>
        </ClusterRow>
      </Cluster>
    )
  }

  appearAsMMToggle() {
    return this.props.mmAppear ? (
      <>
        <ClusterRow>
          <ClusterValue>
            <AppearDescription>
              <svg viewBox='0 0 576 512'>
                <path
                  fill='var(--mm)'
                  d='M288 64C39.52 64 0 182.1 0 273.5C0 379.5 78.8 448 176 448c27.33 0 51.21-6.516 66.11-36.79l19.93-40.5C268.3 358.6 278.1 352.4 288 352.1c9.9 .3711 19.7 6.501 25.97 18.63l19.93 40.5C348.8 441.5 372.7 448 400 448c97.2 0 176-68.51 176-174.5C576 182.1 536.5 64 288 64zM160 320c-35.35 0-64-28.65-64-64s28.65-64 64-64c35.35 0 64 28.65 64 64S195.3 320 160 320zM416 320c-35.35 0-64-28.65-64-64s28.65-64 64-64c35.35 0 64 28.65 64 64S451.3 320 416 320z'
                />
              </svg>
              <span>
                Injecting as <span className='mm'>Metamask</span>
              </span>
            </AppearDescription>
          </ClusterValue>
        </ClusterRow>
        <ClusterRow>
          <ClusterValue onClick={() => toggleLocalSetting(APPEAR_AS_MM)}>
            <AppearToggle>
              <span>
                Appear As <span className='frame'>Frame</span> Instead
              </span>
            </AppearToggle>
          </ClusterValue>
        </ClusterRow>
      </>
    ) : (
      <>
        <ClusterRow>
          <ClusterValue>
            <AppearDescriptionFrame>
              <svg viewBox='0 0 448 512'>
                <path
                  fill='var(--good)' fill-rule='evenodd' clip-rule='evenodd' transform='scale(21.3)'
                  d='M0 7L7 16H9L16 7V5L13 1H3L0 5V7ZM8 14H8.02183L13.4663 7H10.625L8 14ZM10.25 5H13.5L12 3H8.75L10.25 5Z'
                />
              </svg>
              <span>
                Injecting as <span className='frame'>Frame</span>
              </span>
            </AppearDescriptionFrame>
          </ClusterValue>
        </ClusterRow>
        <ClusterRow>
          <ClusterValue onClick={() => toggleLocalSetting(APPEAR_AS_MM)}>
            <AppearToggle>
              <span>
                Appear As <span className='mm'>Metamask</span> Instead
              </span>
            </AppearToggle>
          </ClusterValue>
        </ClusterRow>
      </>
    )
  }

  chainSelect() {
    const chains = this.store('availableChains') || []
    const currentChain = this.store('currentChain')

    const rows = chains.reduce((result, value, index, array) => {
      if (index % 2 === 0) result.push(array.slice(index, index + 2))
      return result
    }, [])

    return rows.map((row) => (
      <ClusterRow style={{ justifyContent: 'flex-start' }}>
        {row.map((chain, i) => (
          <ChainButton
            index={i}
            chain={chain}
            tab={this.props.tab}
            selected={chain.chainId === parseInt(currentChain, 16)}
          />
        ))}
      </ClusterRow>
    ))
  }

  currentChain() {
    try {
      const availableChains = this.store('availableChains')
      const currentChain = this.store('currentChain')
      const currentChainDetails = availableChains.find(({ chainId }) => chainId === currentChain)
      if (currentChainDetails && currentChainDetails.name) {
        return currentChainDetails.name
      } else {
        const chainInt = parseInt(currentChain)
        if (isNaN(chainInt)) {
          return '?'
        } else {
          return chainInt
        }
      }
    } catch (e) {
      return '?'
    }
  }

  renderMainPanel() {
    const isConnected = this.store('frameConnected')
    const {
      tab: { url },
      isSupportedTab,
      augmentOff
    } = this.props
    const { protocol, origin } = parseOrigin(url)

    if (!isConnected) {
      return <ClusterBoxMain style={{ marginTop: '12px' }}>{this.notConnected()}</ClusterBoxMain>
    }

    if (!isSupportedTab) {
      return (
        <ClusterBoxMain style={{ marginTop: '12px' }}>
          {this.unsupportedTab(protocol + origin)}
        </ClusterBoxMain>
      )
    }

    return (
      <>
        <ClusterBoxMain style={{ marginTop: '12px' }}>
          <CurrentOriginTitle>
            <svg viewBox='0 0 512 512'>
              <path
                fill='currentColor'
                d='M448 32C483.3 32 512 60.65 512 96V416C512 451.3 483.3 480 448 480H64C28.65 480 0 451.3 0 416V96C0 60.65 28.65 32 64 32H448zM96 96C78.33 96 64 110.3 64 128C64 145.7 78.33 160 96 160H416C433.7 160 448 145.7 448 128C448 110.3 433.7 96 416 96H96z'
              />
            </svg>
            {origin}
          </CurrentOriginTitle>
          <Cluster>
            {this.store('availableChains').length ? (
              <>
                {this.chainSelect()}
                <div style={{ height: '9px' }} />
              </>
            ) : null}
            {this.appearAsMMToggle()}
            {origin === 'twitter.com' ? (
              <>
                <div style={{ height: '9px' }} />
                <ClusterRow>
                  {augmentOff ? (
                    <>
                      <ClusterValue>
                        <Augment>Verify ENS Names</Augment>
                      </ClusterValue>
                      <ClusterValue onClick={() => toggleLocalSetting(AUGMENT_OFF)} style={{ flexGrow: '0' }}>
                        <FrameButton>
                          <AugmentStateOff>OFF</AugmentStateOff>
                        </FrameButton>
                      </ClusterValue>
                    </>
                  ) : (
                    <>
                      <ClusterValue>
                        <Augment>Verify ENS Names</Augment>
                      </ClusterValue>
                      <ClusterValue onClick={() => toggleLocalSetting(AUGMENT_OFF)} style={{ flexGrow: '0' }}>
                        <FrameButton>
                          <AugmentStateOn>ON</AugmentStateOn>
                        </FrameButton>
                      </ClusterValue>
                    </>
                  )}
                </ClusterRow>
              </>
            ) : null}
          </Cluster>
        </ClusterBoxMain>
      </>
    )
  }

  render() {
    return (
      <>
        <Overlay />
        <SettingsScroll scrollBar={getScrollBarWidth()}>
          <ClusterBoxMain>{this.frameConnected()}</ClusterBoxMain>
          {this.renderMainPanel()}
        </SettingsScroll>
      </>
    )
  }
}

const Settings = Restore.connect(_Settings, store)

const frameConnect = chrome.runtime.connect({ name: 'frame_connect' })

frameConnect.onMessage.addListener((state) => {
  store.setFrameConnected(state.connected)
  store.setChains(state.availableChains)
  store.setCurrentChain(state.currentChain)
})

const updateCurrentChain = (tab) => {
  chrome.tabs.sendMessage(tab.id, {
    type: 'embedded:action',
    action: { type: 'getChainId' }
  })
}

async function getInitialSettings(tabId) {
  return Promise.all([getLocalSetting(tabId, APPEAR_AS_MM), getLocalSetting(tabId, AUGMENT_OFF)])
}

document.addEventListener('DOMContentLoaded', async function () {
  console.info('Settings panel loaded')

  const activeTab = await getActiveTab()
  const isInjectedTab = isInjectedUrl(activeTab?.url)

  const [mmAppear, augmentOff] = isInjectedTab ? await getInitialSettings(activeTab.id) : [false, false]

  if (isInjectedTab) {
    setInterval(() => {
      updateCurrentChain(activeTab)
    }, 1000)
  }

  console.debug('Initial settings', { activeTab, isInjectedTab, mmAppear, augmentOff })

  const root = document.getElementById('root')

  ReactDOM.render(
    <Settings tab={activeTab} isSupportedTab={isInjectedTab} mmAppear={mmAppear} augmentOff={augmentOff} />,
    root
  )
})
