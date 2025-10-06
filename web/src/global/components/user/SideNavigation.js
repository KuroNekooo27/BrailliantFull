import React from 'react'
import { Link } from 'react-router-dom'
import './SideNavigation.css'
import { useDevice } from "../../../pages/user/devide settings/context/DeviceContext";


export default function SideNavigation() {
  const user = JSON.parse(localStorage.getItem('users'))
  const { isConnected } = useDevice();


  return (
    <div className='sidenav-container'>
      <img className='sidenav-logo' src={require('../../asset/Brailliant-Logo.png')} /><br />
      <label>MENU</label>

      <Link to='/home'><img src={require('../../asset/Home.png')} /> Home</Link>

      {user?.isActivated ? (
        <Link to='/library'><img src={require('../../asset/off.png')} /> Library</Link>
      ) : (
        <span className="disabled-link"><img src={require('../../asset/off.png')} /> Library</span>
      )}

      <Link to='/class'><img src={require('../../asset/Users.png')} /> Class Settings</Link>
      <Link to='/text-to-braille'><img src={require('../../asset/Type.png')} /> Text-to-Braille</Link>

      {user?.isActivated ? (
        <Link to='/analytics'><img src={require('../../asset/Bar chart-2.png')} /> Analytics</Link>
      ) : (
        <span className="disabled-link"><img src={require('../../asset/Bar chart-2.png')} /> Analytics</span>
      )}

      <hr />
      <Link to='/profile'><img src={require('../../asset/User.png')} /> Profile</Link>
      <hr />
      {isConnected ? (
        <label>Device: Connected</label>
      ) : (
        <label>Device: Not Connected</label>
      )
      }

      <Link to='/device-settings'><img src={require('../../asset/Settings.png')} /> Device Settings</Link>
    </div>
  )
}
