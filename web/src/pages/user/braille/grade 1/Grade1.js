import React, { useState, useEffect } from 'react';
import "./Grade1.css"
import SideNavigation from '../../../../global/components/user/SideNavigation'
import DropDownMenu from '../../../../global/components/user/DropDownMenu';
import Header from '../../../../global/components/user/Header';
import braille from '../grade 1/Braille1.js'
import { useNavigate } from 'react-router-dom';

export default function Grade1() {
    const navigate = useNavigate()
    const page = "Grade 1 Braille"
    const searchBar = false
    console.log(braille)
    const [showDropdown, setShowDropdown] = useState(false);
    const users = JSON.parse(localStorage.getItem('users'))

    return (
        <div className='container'>
            <div>
                <SideNavigation />
            </div>
            <div className='g1-container'>
                <div className='g1-header'>
                    <Header page={page} searchBar={searchBar} />
                </div>
                {showDropdown && <DropDownMenu />}
                <div className='g1-body'>
                    <div className='g1-body-container'>
                        <div className='g1-title'>
                            <div>
                                <button className='back-btn' onClick={() => { navigate(-1) }}><img src={require('../../../../global/asset/back.png')} /></button>
                                <label className='g1-title-main'>Braille Characters</label>

                            </div>
                            <label className='g1-title-sub'>Click a character to sync it to the display!</label>
                        </div>
                        <div className='g1-detail-container'>
                            <div className='g1-braille-container'>

                                {braille.map((item, index) => (
                                    <div key={index} className='g1-braille-char'>

                                        <img src={item.img} alt={item.name} />
                                        <label>{item.name}</label>
                                    </div>
                                ))}

                            </div>

                            <div className='g1-about-container'>
                                <label className='g1-about'>About</label>
                                <label className='g1-grade'>Grade 1 Braille</label>
                                <label className='g1-desc'>
                                    Grade 1 braille is a letter-for-letter substitution of its printed counterpart.
                                    This is the preferred code for beginners because it allows people to get familiar
                                    with, and recognize different aspects of, the code while learning how to read braille.
                                    English grade 1 braille consists of the 26 standard letters of the alphabet as well as punctuation.
                                </label>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    )
}
