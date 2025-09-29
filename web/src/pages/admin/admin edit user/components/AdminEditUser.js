import React, { useState, useEffect } from 'react';
import './AdminEditUser.css'
import AdminSideNavigation from '../../../../global/components/admin/AdminSideNavigation'
import AdminHeader from '../../../../global/components/admin/AdminHeader'
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import ErrorHandler from "../../../../global/components/user/ErrorHandler";
import Loading from "../../../../global/components/user/Loading";

export default function AdminEditUser() {
    const location = useLocation();
    const selectedUser = location.state.user;

    const navigate = new useNavigate();

    const [users, setUsers] = useState([]);
    const [editUser, setEditUser] = useState({
        user_fname: '',
        user_lname: '',
        user_email: '',
        user_dob: '',
        user_password: '',
    });
    const [cpassword, setCpassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [errorHandler, setErrorHandler] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({
        user_fname: '',
        user_lname: '',
        user_email: '',
        user_dob: '',
        user_password: '',
        cpassword: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    useEffect(() => {
        if (selectedUser) {
            setUsers(selectedUser);
            setEditUser(selectedUser);
        }
    }, [selectedUser]);


    const validateField = (name, value) => {
        let error = '';

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
                else if (!emailRegex.test(value)) error = 'Enter a valid email address';
                break;
            case 'user_dob':
                if (!value) error = 'Date of birth is required';
                else {
                    const dob = new Date(value);
                    if (dob >= new Date()) error = 'Date of birth must be in the past';
                }
                break;
            case 'user_password':
                if (value && value.length < 6) error = 'Password must be at least 6 characters';
                break;
            case 'cpassword':
                if (editUser.user_password && value !== editUser.user_password) {
                    error = 'Passwords do not match';
                }
                break;
            default:
                break;
        }

        setErrors((prev) => ({ ...prev, [name]: error }));
        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'cpassword') {
            setCpassword(value);
            validateField(name, value);
        } else {
            setEditUser({ ...editUser, [name]: value });
            validateField(name, value);
        }
    };


    const confirmPassword = () => {
        setSubmitted(true);

        const newErrors = {
            user_fname: validateField('user_fname', editUser.user_fname),
            user_lname: validateField('user_lname', editUser.user_lname),
            user_email: validateField('user_email', editUser.user_email),
            user_dob: validateField('user_dob', editUser.user_dob),
            user_password: validateField('user_password', editUser.user_password),
            cpassword: validateField('cpassword', cpassword)
        };

        setErrors(newErrors);
        // setMessage('Provide valid information')
        // setErrorHandler(true)

        if (Object.values(newErrors).some((err) => err)) return;

        handleUpdateUser(editUser._id);
    };

    const handleUpdateUser = (id) => {
        setLoading(true)
        axios.put(`https://brailliantweb.onrender.com/api/update/user/${id}`, editUser)
            .then(() => {
                setEditUser({ ...editUser, user_password: '' });
                setCpassword('');
                setUsers(editUser);
                setLoading(false)
                navigate('/admin/accounts');
            })
            .catch((error) => {
                console.log(error);
            });
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
            <div className='admin-ed-container'>
                <div className='admin-ed-header'>
                    <AdminHeader page={"Edit User"} />
                </div>
                <div className='admin-ed-body'>
                    <div className='admin-edit-account'>
                        <div className="profile-page">
                            <button className='back-btn' onClick={() => { navigate(-1) }}>
                                <img src={require('../../../../global/asset/back.png')} alt="back" />Back
                            </button>

                            <main className="profile-container">
                                <div className="profile-grid">
                                    <table className="profile-table">
                                        <tbody>
                                            <tr>
                                                <td><strong>Last Name:</strong></td>
                                                <td>{users.user_lname?.charAt(0).toUpperCase() + users.user_lname?.slice(1)}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>First Name:</strong></td>
                                                <td>{users.user_fname?.charAt(0).toUpperCase() + users.user_fname?.slice(1)}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Date of Birth:</strong></td>
                                                <td>{users.user_dob}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Email:</strong></td>
                                                <td>{users.user_email}</td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <div className='form-container'>
                                        <div className="aed-profile-form">
                                            <div className='aed-form'>
                                                <div className='name-form'>
                                                    <p>First Name</p>
                                                    <input
                                                        type="text"
                                                        name="user_fname"
                                                        placeholder="First Name"
                                                        value={editUser.user_fname}
                                                        onChange={handleChange}
                                                    />
                                                    {(submitted || editUser.user_fname) && errors.user_fname && (
                                                        <span className="error">{errors.user_fname}</span>
                                                    )}
                                                </div>
                                                <div className='name-form'>
                                                    <p>Last Name</p>
                                                    <input
                                                        type="text"
                                                        name="user_lname"
                                                        placeholder="Last Name"
                                                        value={editUser.user_lname}
                                                        onChange={handleChange}
                                                    />
                                                    {(submitted || editUser.user_lname) && errors.user_lname && (
                                                        <span className="error">{errors.user_lname}</span>
                                                    )}
                                                </div>
                                            </div>

                                            <p>Email</p>
                                            <input
                                                type="email"
                                                name="user_email"
                                                placeholder="Email"
                                                value={editUser.user_email}
                                                onChange={handleChange}
                                            />
                                            {(submitted || editUser.user_email) && errors.user_email && (
                                                <span className="error">{errors.user_email}</span>
                                            )}

                                            <p>Date of Birth</p>
                                            <input
                                                type="date"
                                                name="user_dob"
                                                placeholder="Date of Birth"
                                                value={editUser.user_dob}
                                                onChange={handleChange}
                                            />
                                            {(submitted || editUser.user_dob) && errors.user_dob && (
                                                <span className="error">{errors.user_dob}</span>
                                            )}

                                            <p>Change Password</p>
                                            <input
                                                type="password"
                                                name="user_password"
                                                placeholder="Enter new password"
                                                value={editUser.user_password}
                                                onChange={handleChange}
                                            />
                                            {(submitted || editUser.user_password) && errors.user_password && (
                                                <span className="error">{errors.user_password}</span>
                                            )}

                                            <p>Confirm Change Password</p>
                                            <input
                                                type="password"
                                                name="cpassword"
                                                placeholder="Re-enter new password"
                                                value={cpassword}
                                                onChange={handleChange}
                                            />
                                            {(submitted || cpassword) && errors.cpassword && (
                                                <span className="error">{errors.cpassword}</span>
                                            )}

                                            <div className="form-actions">
                                                <button onClick={confirmPassword} type="button" className="editsave-btn">Save</button>
                                                <button onClick={() => { navigate('/admin/accounts') }} type="button" className="cancel-btn">Back</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </main>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
