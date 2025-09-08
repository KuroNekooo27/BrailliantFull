import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './AccountActivation.css'
import SideNavigation from '../../../../global/components/user/SideNavigation'
import DropDownMenu from '../../../../global/components/user/DropDownMenu';
import axios from 'axios';
import './ConfirmationModal.css'
import Header from '../../../../global/components/user/Header';
import ErrorHandler from "../../../../global/components/user/ErrorHandler";
import Loading from "../../../../global/components/user/Loading";

export default function AccountActivation() {
    const navigate = new useNavigate()

    const [modal, setModal] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false);
    const [hasSentEmail, setHasSentEmail] = useState(true)
    const [otp, setOtp] = useState('');
    const [inputOtp, setInputOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const [errorHandler, setErrorHandler] = useState(false);
    const [message, setMessage] = useState('');

    const user = JSON.parse(localStorage.getItem('users'));
    if (!user) {
        navigate(-1)
    }


    const sendEmail = async (generatedOtp) => {
        try {
            const response = await axios.post('https://brailliantweb.onrender.com/send-email', {
                context: "activate",
                otp: generatedOtp,
                email: user.user_email
            });
            setMessage("Email sent!.");
            setErrorHandler(true)
        } catch (err) {
            alert("Failed to send email");
        }
    };

    const generateOTP = () => {
        const digits = '0123456789';
        let otp = '';
        for (let i = 0; i < 6; i++) {
            otp += digits[Math.floor(Math.random() * 10)];
        }
        return otp;
    };

    if (hasSentEmail) {
        const newOtp = generateOTP();
        setOtp(newOtp);
        sendEmail(newOtp);
        setHasSentEmail(false)
    }

    const handleVerify = async () => {
        setLoading(true)
        const updatedData = { ...user, isActivated: true };

        if (inputOtp === otp) {
            axios.put(`https://brailliantweb.onrender.com/api/update/user/${user._id}`, updatedData)
                .then(() => {
                    localStorage.setItem('users', JSON.stringify(updatedData));
                    toggleModal()
                    setLoading(false)
                })

            const newAudit = {
                at_user: user.user_email,
                at_date: new Date(),
                at_action: 'Activated Account'
            };
            await axios.post('https://brailliantweb.onrender.com/api/newaudittrail', newAudit);
        }
        else {
            setLoading(false)
            setMessage("Invalid OTP");
            setErrorHandler(true)
        }
    };

    const toggleModal = () => {
        setModal(!modal)
    }
    if (modal) {
        document.body.classList.add('active-modal')
    }
    else {
        document.body.classList.remove('active-modal')
    }

    const toggleErrorHandlerModal = () => {
        setErrorHandler(!errorHandler)
    }

    return (
        <div className='container'>

            {modal && (
                <div className='modal'>
                    <div className='overlay' onClick={() => navigate('/profile')} ></div>
                    <div className='otp-modal-content'>
                        <div className='otp-loginmodal'>
                            <button className='close-modal' onClick={() => navigate('/profile')}>x </button>
                            <label className='otp-head'>Verification Successful</label>
                            <label className='otp-text'>Explore more of Brailliant features for activated users!</label>
                            <img src={require('../assets/check.png')} />

                            <button className='otp-login-modal' onClick={() => { navigate('/profile') }}>Proceed</button>
                        </div>
                    </div>
                </div>
            )}
            {errorHandler && (
                <ErrorHandler message={message} onClose={toggleErrorHandlerModal} />
            )
            }
            {loading && (
                <Loading />
            )
            }
            <div>
                <SideNavigation />
            </div>
            <div className='aa-container'>
                <div className='aa-header'>
                    <Header page={"Account Activation"} searchBar={false} />
                </div>
                {showDropdown && <DropDownMenu />}
                <div className='aa-body'>
                    <div className='account-activation'>
                        <button className='back-btn' onClick={() => { navigate(-1) }}><img src={require('../../../../global/asset/back.png')} />Back</button>

                        <label className='aa-title'>Account Activation</label>
                        <div className='aa'>
                            <img className='mail' src={require('../assets/mail.png')} />
                            <label className='aa-title'>We just sent an Email</label>
                            <label className='aa-text'>Enter the One-Time-Pin (OTP) we have sent in your email</label>
                            <input
                                placeholder='Enter OTP'
                                value={inputOtp}
                                onChange={(e) => setInputOtp(e.target.value)}
                            />
                            <button className='verify-btn' onClick={handleVerify} >Verify</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
