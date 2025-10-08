import React, { useState } from 'react';
import "./Grade1.css";
import SideNavigation from '../../../../global/components/user/SideNavigation';
import DropDownMenu from '../../../../global/components/user/DropDownMenu';
import Header from '../../../../global/components/user/Header';
import braille from '../grade 1/Braille1.js';
import { useNavigate } from 'react-router-dom';
import { useDevice } from "../../devide settings/context/DeviceContext";
import ErrorHandler from "../../../../global/components/user/ErrorHandler";

export default function Grade1() {
    const navigate = useNavigate();
    const page = "Grade 1 Braille";
    const searchBar = false;
    const [showDropdown, setShowDropdown] = useState(false);
    const users = JSON.parse(localStorage.getItem('users'));
    const { characteristic, isConnected } = useDevice();
    const [errorHandler, setErrorHandler] = useState(false);
    const [message, setMessage] = useState('');

    const sendToDevice = async (char) => {
        if (!isConnected || !characteristic) {
            setMessage("Make sure device is connected.");
            setErrorHandler(true);
            return;
        }

        const plainText = char.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!plainText) return;

        try {
            const data = new TextEncoder().encode(plainText + "\n");
            if (characteristic.properties?.writeWithoutResponse) {
                await characteristic.writeValueWithoutResponse(data);
            } else {
                await characteristic.writeValue(data);
            }
            console.log("Sent:", plainText);
        } catch (err) {
            console.error("Send error:", err);
            setMessage("Failed to send data to device.");
            setErrorHandler(true);
        }
    };

    const toggleErrorHandlerModal = () => setErrorHandler(!errorHandler);

    return (
        <div className='container'>
            {errorHandler && (
                <ErrorHandler message={message} onClose={toggleErrorHandlerModal} />
            )}
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
                                <button className='back-btn' onClick={() => { navigate(-1) }}><img src={require('../../../../global/asset/back.png')} />Back</button>
                                <label className='g2-title-main'>Braille Characters</label>
                            </div>
                            <label className='g2-title-sub'>Click a character to sync it to the display!</label>
                        </div>
                        <div className='g1-detail-container'>
                            <div className='g1-braille-container'>
                                {braille.map((item, index) => (
                                    <div
                                        key={index}
                                        className='g1-braille-char'
                                        onClick={() => sendToDevice(item.name.charAt(0))}
                                    >
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
    );
}
