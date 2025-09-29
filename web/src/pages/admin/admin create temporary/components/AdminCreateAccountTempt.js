import React, { useState } from 'react';
import './AdminCreateAccountTempt.css'
import AdminSideNavigation from '../../../../global/components/admin/AdminSideNavigation'
import AdminHeader from '../../../../global/components/admin/AdminHeader'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ErrorHandler from "../../../../global/components/user/ErrorHandler";
import Loading from "../../../../global/components/user/Loading";

export default function AdminCreateAccountTempt() {
    const navigate = new useNavigate();

    const [newUser, setNewUser] = useState({
        user_fname: '',
        user_lname: '',
        user_email: '',
        user_password: '',
        user_cpassword: '',
        user_dob: '',
    });

    const [errors, setErrors] = useState({
        user_fname: '',
        user_lname: '',
        user_email: '',
        user_password: '',
        user_cpassword: '',
        user_dob: '',
    });

    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorHandler, setErrorHandler] = useState(false);
    const [message, setMessage] = useState('');

    const validateField = (name, value) => {
        let error = '';
        const nameRegex = /^[A-Za-z\s]+$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        switch (name) {
            case 'user_fname':
                if (!value.trim()) error = 'First name is required';
                else if (!nameRegex.test(value)) error = 'First name must only contain letters';
                break;
            case 'user_lname':
                if (!value.trim()) error = 'Last name is required';
                else if (!nameRegex.test(value)) error = 'Last name must only contain letters';
                break;
            case 'user_email':
                if (!value.trim()) error = 'Email is required';
                else if (!emailRegex.test(value)) error = 'Please enter a valid email address';
                break;
            case 'user_password':
                if (!value.trim()) error = 'Password is required';
                break;
            case 'user_cpassword':
                if (!value.trim()) error = 'Confirm Password is required';
                break;
            case 'user_dob':
                if (!value) error = 'Date of birth is required';
                else {
                    const dob = new Date(value);
                    const today = new Date();
                    if (dob >= today) error = 'Date of birth must be in the past';
                }
                break;
            default:
                break;
        }

        setErrors((prev) => ({ ...prev, [name]: error }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewUser({ ...newUser, [name]: value });
        validateField(name, value);
    };

    const confirmPassword = (e) => {
        e.preventDefault();
        setSubmitted(true);

        const newErrors = {};
        Object.entries(newUser).forEach(([name, value]) => {
            let error = '';
            if (name === 'user_fname') {
                if (!value.trim()) error = 'First name is required';
                else if (!/^[A-Za-z\s]+$/.test(value)) error = 'First name must only contain letters';
            }
            if (name === 'user_lname') {
                if (!value.trim()) error = 'Last name is required';
                else if (!/^[A-Za-z\s]+$/.test(value)) error = 'Last name must only contain letters';
            }
            if (name === 'user_email') {
                if (!value.trim()) error = 'Email is required';
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Please enter a valid email address';
            }
            if (name === 'user_password' && !value.trim()) {
                error = 'Password is required';
            }
            if (name === 'user_cpassword' && !value.trim()) {
                error = 'Confirm Password is required';
            }
            if (name === 'user_dob') {
                if (!value) error = 'Date of birth is required';
                else {
                    const dob = new Date(value);
                    const today = new Date();
                    if (dob >= today) error = 'Date of birth must be in the past';
                }
            }
            newErrors[name] = error;
            setMessage("Provide valid details");
            setErrorHandler(true);
        });

        setErrors(newErrors);

        if (Object.values(newErrors).some((err) => err)) return;

        if (newUser.user_password.length < 6) {
            setMessage("Password must be at least 6 characters.");
            setErrorHandler(true);
            return;
        }
        if (newUser.user_password !== newUser.user_cpassword) {
            setMessage("Password does not match.");
            setErrorHandler(true);
            return;
        }

        handleCreateUser();
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
        setErrors({
            user_fname: '',
            user_lname: '',
            user_email: '',
            user_dob: '',
        });
    };

    const handleCreateUser = async () => {
        setLoading(true);
        try {
            await axios.post('https://brailliantweb.onrender.com/send-email', {
                context: "create",
                password: newUser.user_password,
                email: newUser.user_email
            });

            await axios.post('https://brailliantweb.onrender.com/api/newuser', newUser);
            setMessage("User created successfully!");
            setErrorHandler(true);
            clearForm();
        } catch (err) {
            console.error("Failed to create user", err);
            alert("Failed to create user");
        } finally {
            setLoading(false);
        }
    };

    const toggleErrorHandlerModal = () => {
        setErrorHandler(!errorHandler);
    };

    return (
        <div className='container'>
            <div>
                {loading && <Loading />}
                {errorHandler && (
                    <ErrorHandler message={message} onClose={toggleErrorHandlerModal} />
                )}
                <AdminSideNavigation />
            </div>
            <div className='admin-cs-container'>
                <div className='admin-cs-header'>
                    <AdminHeader page={"Create Account"} />
                </div>
                <div className='admin-cs-body'>
                    <div className='admin-create-account'>
                        <button className='back-btn' onClick={() => { navigate(-1) }}>
                            <img src={require('../../../../global/asset/back.png')} alt="back" />Back
                        </button>
                        <div className='admin-create'>
                            <div className='create-form-container'>
                                <form className="create-form" onSubmit={confirmPassword}>
                                    <div className='row1-cont'>
                                        <div className='create-form-row1'>
                                            <p>First Name</p>
                                            <input
                                                type="text"
                                                name="user_fname"
                                                placeholder="First Name"
                                                value={newUser.user_fname}
                                                onChange={handleChange}
                                            />
                                            {(submitted || newUser.user_fname) && errors.user_fname && (
                                                <span className="error">{errors.user_fname}</span>
                                            )}
                                        </div>
                                        <div className="create-form-row2">
                                            <p>Last Name</p>
                                            <input
                                                type="text"
                                                name="user_lname"
                                                placeholder="Last Name"
                                                value={newUser.user_lname}
                                                onChange={handleChange}
                                            />
                                            {(submitted || newUser.user_lname) && errors.user_lname && (
                                                <span className="error">{errors.user_lname}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className='input-cont'>
                                        <p>Email</p>
                                        <input
                                            type="email"
                                            name="user_email"
                                            placeholder="Email"
                                            value={newUser.user_email}
                                            onChange={handleChange}
                                        />
                                        {(submitted || newUser.user_email) && errors.user_email && (
                                            <span className="error">{errors.user_email}</span>
                                        )}
                                    </div>

                                    <div className='input-cont'>
                                        <p>Date of Birth</p>
                                        <input
                                            type="date"
                                            name="user_dob"
                                            placeholder="Date of Birth"
                                            value={newUser.user_dob}
                                            onChange={handleChange}
                                        />
                                        {(submitted || newUser.user_dob) && errors.user_dob && (
                                            <span className="error">{errors.user_dob}</span>
                                        )}
                                    </div>

                                    <div className='input-cont'>
                                        <p>Password</p>
                                        <input
                                            type="password"
                                            name="user_password"
                                            placeholder="Enter new password"
                                            value={newUser.user_password}
                                            onChange={handleChange}
                                        />
                                        {(submitted || newUser.user_password) && errors.user_password && (
                                            <span className="error">{errors.user_password}</span>
                                        )}
                                    </div>

                                    <div className='input-cont'>
                                        <p>Confirm Password</p>
                                        <input
                                            type="password"
                                            name="user_cpassword"
                                            placeholder="Confirm new password"
                                            value={newUser.user_cpassword}
                                            onChange={handleChange}
                                        />
                                        {(submitted || newUser.user_cpassword) && errors.user_cpassword && (
                                            <span className="error">{errors.user_cpassword}</span>
                                        )}
                                    </div>





                                    <button className='sync'>Create Account</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
