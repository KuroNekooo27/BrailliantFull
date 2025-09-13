import React, { useState, useEffect } from 'react';
import './AdminCreateAccountTempt.css'
import AdminSideNavigation from '../../../../global/components/admin/AdminSideNavigation'
import AdminHeader from '../../../../global/components/admin/AdminHeader'
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import ErrorHandler from "../../../../global/components/user/ErrorHandler";
import Loading from "../../../../global/components/user/Loading";


export default function AdminCreateAccountTempt() {


    const navigate = new useNavigate()

    const [newUser, setNewUser] = useState({
        user_fname: '',
        user_lname: '',
        user_email: '',
        user_password: '',
        user_cpassword: '',
        user_dob: '',
    });


    const confirmPassword = (e) => {
        e.preventDefault();
        if (validateForm()) {
            handleCreateUser();
        }
    };
    const clearForm = () => {
        setNewUser({
            user_fname: '',
            user_lname: '',
            user_email: '',
            user_password: '',
            user_cpassword: '',
            user_dob: '',
        });
    };
    const [loading, setLoading] = useState(false);

    const [errorHandler, setErrorHandler] = useState(false);
    const [message, setMessage] = useState('');

    const handleCreateUser = async () => {
        setLoading(true)
        try {
            const response = await axios.post('https://brailliantweb.onrender.com/send-email', {
                context: "create",
                password: newUser.user_password,
                email: newUser.user_email
            });
            console.log(response)
        } catch (err) {
            console.error("Failed to send email", err);
            alert("Failed to send email");
        }

        axios.post('https://brailliantweb.onrender.com/api/newuser', newUser)
            .then(() => {
                setMessage("User created successfully!.");
                setErrorHandler(true)
                clearForm();
                setLoading(false)
            })
            .catch((error) => {
                console.log(error);
            });
    };

    ////////////

    const validateForm = () => {
        const { user_fname, user_lname, user_email, user_password, user_cpassword, user_dob } = newUser;

        const nameRegex = /^[A-Za-z\s]+$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!nameRegex.test(user_fname)) {
            setMessage("First name must only contain letters.");
            setErrorHandler(true)
            return false;
        }

        if (!nameRegex.test(user_lname)) {
            setMessage("Last name must only contain letters.");
            setErrorHandler(true)
            return false;
        }

        if (!emailRegex.test(user_email)) {
            setMessage("Please enter a valid email address.");
            setErrorHandler(true)
            return false;
        }

        if (user_password.length < 6) {
            setMessage("Password must be at least 6 characters.");
            setErrorHandler(true)
            return false;
        }

        if (user_password !== user_cpassword) {
            setMessage("Password does not match.");
            setErrorHandler(true)
            return false;
        }

        const dob = new Date(user_dob);
        const today = new Date();
        if (dob >= today) {
            setMessage("Date of birth must be in the past.");
            setErrorHandler(true)
            return false;
        }

        return true;
    };
    const toggleErrorHandlerModal = () => {
        setErrorHandler(!errorHandler)
    }
    return (
        <div className='container'>
            <div>
                {loading && (
                    <Loading />
                )
                }
                {errorHandler && (
                    <ErrorHandler message={message} onClose={toggleErrorHandlerModal} />
                )
                }
                <AdminSideNavigation />

            </div>
            <div className='admin-cs-container'>
                <div className='admin-cs-header'>
                    <AdminHeader page={"Create Account"} />
                </div>
                <div className='admin-cs-body'>
                    <div className='admin-create-account'>
                        <button className='back-btn' onClick={() => { navigate(-1) }}><img src={require('../../../../global/asset/back.png')} />Back</button>
                        <div className='admin-create'>
                            <div>
                                <div className='create-form-container' >
                                    <form className="create-form" onSubmit={confirmPassword}>
                                        <div className='row1-cont'>
                                            <div className='create-form-row1' >
                                                <p>First Name</p>
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="First Name"
                                                    value={newUser.user_fname}
                                                    onChange={(e) => setNewUser({ ...newUser, user_fname: e.target.value })}
                                                />
                                            </div>
                                            <div className="create-form-row2">
                                                <p>Last Name</p>
                                                <input
                                                    required
                                                    type="text"
                                                    name="lname"
                                                    placeholder="Last Name"
                                                    value={newUser.user_lname}
                                                    onChange={(e) => setNewUser({ ...newUser, user_lname: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <p>Email</p>
                                        <input
                                            required
                                            type="email"
                                            name="email"
                                            placeholder="Email"
                                            value={newUser.user_email}
                                            onChange={(e) => setNewUser({ ...newUser, user_email: e.target.value })}
                                        />
                                        <p>Date of Birth</p>
                                        <input
                                            required
                                            type="date"
                                            name="dob"
                                            placeholder="Date of Birth"
                                            value={newUser.user_dob}
                                            onChange={(e) => setNewUser({ ...newUser, user_dob: e.target.value })}
                                        />
                                        <p>Password</p>
                                        <input
                                            required
                                            type="password"
                                            name="password"
                                            placeholder="Enter new password"
                                            value={newUser.user_password}
                                            onChange={(e) => setNewUser({ ...newUser, user_password: e.target.value })}
                                        />
                                        <p>Confirm Password</p>
                                        <input
                                            required
                                            type="password"
                                            name="cpassword"
                                            placeholder="Enter new password"
                                            value={newUser.user_cpassword}
                                            onChange={(e) => setNewUser({ ...newUser, user_cpassword: e.target.value })}
                                        />
                                        <button className='sync'>Create Account</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
