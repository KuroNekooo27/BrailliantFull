import React, { useState } from 'react';
import "./Grade2.css";
import SideNavigation from '../../../../global/components/user/SideNavigation';
import DropDownMenu from '../../../../global/components/user/DropDownMenu';
import Header from '../../../../global/components/user/Header';
import braille from '../grade 1/Braille1.js';
import { useNavigate } from 'react-router-dom';
import { useDevice } from "../../devide settings/context/DeviceContext";
import ErrorHandler from "../../../../global/components/user/ErrorHandler";

export default function Grade2() {
    const navigate = useNavigate();
    const page = "Grade 2 Braille";
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
            <div className='g2-container'>
                <div className='g2-header'>
                    <Header page={page} searchBar={searchBar} />
                </div>
                {showDropdown && <DropDownMenu />}
                <div className='g2-body'>
                    <div className='g2-body-container'>
                        <div className='g2-title'>
                            <div>
                                <button className='back-btn' onClick={() => { navigate(-1) }}>
                                    <img src={require('../../../../global/asset/back.png')} alt="back" />Back
                                </button>
                                <label className='g2-title-main'>Braille Characters</label>
                            </div>
                            <label className='g2-title-sub'>Click a character to sync it to the display!</label>
                        </div>
                        <div className='g2-detail-container'>
                            <div className='g2-braille-container'>
                                {braille.map((item, index) => (
                                    <div
                                        key={index}
                                        className='g2-braille-char'
                                        onClick={() => sendToDevice(item.name.charAt(0))}
                                    >
                                        <img src={item.img} alt={item.name} />
                                        <label>{item.name}</label>
                                    </div>
                                ))}
                            </div>
                            <div className='g2-about-container'>
                                <label className='g2-about'>About</label>
                                <label className='g2-grade'>Grade 2 Braille</label>
                                <label className='g2-desc'>
                                    Grade 2 braille uses both letters and contractions to represent words and common letter combinations.
                                    This system is more compact than Grade 1, allowing faster reading and writing because it reduces the number of cells needed to represent text.
                                    Grade 2 braille includes the full alphabet, punctuation, and also introduces special symbols that stand for entire words or groups of letters.
                                    Since it is more efficient, Grade 2 is the standard form of braille used in books, magazines, and everyday reading materials.
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
