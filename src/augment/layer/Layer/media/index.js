import React from 'react'
import Restore from 'react-restore'
import styled from 'styled-components'
import svg from '../../../svg'
import { dash, rotate } from '../style'


const LoadingSpinner = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  svg {
    animation: ${rotate} 2s linear infinite;
    z-index: 2;
    width: 26px;
    height: 26px;
    
    & circle {
      stroke: ${props => props.theme.top0};
      stroke-linecap: round;
      animation: ${dash} 1.5s ease-in-out infinite;
    }
  }
`

class _Video extends React.Component {
  componentDidMount () {
    const location = this.props.src.replace(/\./g,'-').replace('://','-').replace(/\//g, '-')
    const storeBlob = this.store('blobMap', location)
    if (!storeBlob) {
      chrome?.runtime?.sendMessage({ method: 'media_blob', src: this.props.src, location })
    }
  }
  render () {
    const location = this.props.src.replace(/\./g,'-').replace('://','-').replace(/\//g, '-')
    const storeBlob = this.store('blobMap', location)
    if (!storeBlob) {
      return (
        <LoadingSpinner>
          <svg viewBox='0 0 50 50'>
            <circle cx='25' cy='25' r='20' fill='none' strokeWidth='5' />
          </svg>
        </LoadingSpinner>
      )
    } else {
      if (this.props.soundOff) {
        return (
          <video key={storeBlob} muted>
            <source src={storeBlob} type={'video/mp4'} />
          </video> 
        )
      } else {
        return (
          <video key={storeBlob} autoPlay loop>
            <source src={storeBlob} type={'video/mp4'} />
          </video> 
        )
      }
    }
  }
}

export const Video = Restore.connect(_Video)

class _Image extends React.Component {
  render () {
    const svg = this.props.src.endsWith('.svg')
    if (svg) {
      return (
        <img width='100%' height='100%' src={this.props.src} /> 
      )
    } else {
      return (
        <img src={this.props.src} /> 
      )
    }
  }
}

export const Image = Restore.connect(_Image)