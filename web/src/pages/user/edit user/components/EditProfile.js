import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from "react-router-dom";
import './EditProfile.css'
import SideNavigation from '../../../../global/components/user/SideNavigation';
import DropDownMenu from '../../../../global/components/user/DropDownMenu';
import axios from 'axios';
import Header from '../../../../global/components/user/Header';
import "./ConfirmationModal.css"
import ErrorHandler from "../../../../global/components/user/ErrorHandler";
import Loading from '../../../../global/components/user/Loading';

export default function EditProfile() {
    const navigate = useNavigate()
    const [showDropdown, setShowDropdown] = useState(false);
    const [activeForm, setActiveForm] = useState('profile');
    const [users, setUsers] = useState([]);
    const [inputOtp, setInputOtp] = useState('');
    const [otp, setOtp] = useState('');

    const [editUser, setEditUser] = useState({
        user_fname: '',
        user_lname: '',
        user_email: '',
        user_dob: '',
        user_password: '',
        user_img: ''
    });
    const [cemail, setCemail] = useState('')
    const [cpassword, setCpassword] = useState('')
    const [selectedImage, setSelectedImage] = useState('')
    const [image, setImage] = useState(null)
    const [modal, setModal] = useState(false)
    const [errorHandler, setErrorHandler] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('users'));
        if (storedUser) {
            setUsers(storedUser);
            setEditUser(storedUser);
        }

    }, []);

    const toggleModal = () => {
        setModal(!modal)
    }
    if (modal) {
        document.body.classList.add('active-modal')
    }
    else {
        document.body.classList.remove('active-modal')
    }

    const generateOTP = () => {
        const digits = '0123456789';
        let otp = '';
        for (let i = 0; i < 6; i++) {
            otp += digits[Math.floor(Math.random() * 10)];
        }
        return otp;
    };

    const handleNewEmail = async (generatedOtp) => {
        try {
            const response = await axios.post('https://brailliantweb.onrender.com/send-email', {
                context: "edit",
                otp: generatedOtp,
                email: cemail
            });
            setMessage("Email sent!");
            setErrorHandler(true)
        } catch (err) {
            alert("Failed to send email");
        }
    }

    const confirmPassword = () => {
        const { user_fname, user_lname, user_email, user_dob, user_password } = editUser;

        if (!user_fname.trim()) {
            setMessage("First name is required");
            setErrorHandler(true)
            return;
        }
        if (!/^[A-Za-z]+$/.test(user_fname)) {
            setMessage("First name must only contain letters.");
            setErrorHandler(true)
            return;
        }

        if (!user_lname.trim()) {
            setMessage("Last name is required.");
            setErrorHandler(true)
            return;
        }
        if (!/^[A-Za-z]+$/.test(user_lname)) {
            setMessage("Last name must only contain letters.");
            setErrorHandler(true)
            return;
        }

        if (!user_email.trim()) {
            setMessage("Email is required");
            setErrorHandler(true)
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user_email)) {
            setMessage("Invalid email format.");
            setErrorHandler(true)
            return;
        }

        if (!user_dob) {
            setMessage("Date of birth is required");
            setErrorHandler(true)
            return;
        }
        const today = new Date();
        const enteredDate = new Date(user_dob);
        if (enteredDate > today) {
            setMessage("Date of birth cannot be in the future");
            setErrorHandler(true)
            return;
        }
        handleProfileUpdate(editUser._id);
        setMessage("Update successful!");
        setErrorHandler(true)
    };


    const handleProfileUpdate = async (id) => {
        setLoading(true)
        try {
            let updatedImage = null;
            if (image) {
                const formData = new FormData();
                formData.append('image', image);
                const result = await axios.put(
                    `https://brailliantweb.onrender.com/upload-profile-icon/${id}`,
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );

                updatedImage = result.data.imageUrl;

                setEditUser(prev => ({ ...prev, user_img: updatedImage }));
                setUsers(prev => ({ ...prev, user_img: updatedImage }));
                console.log('Image updated to:', updatedImage);
            }

            const updatedData = {
                ...editUser,
                user_recent_act: 'Edited Profile',
                ...(updatedImage && { user_img: updatedImage })
            };

            await axios.put(`https://brailliantweb.onrender.com/api/update/user/${id}`, updatedData);

            const newAudit = {
                at_user: users.user_email,
                at_date: new Date(),
                at_action: 'Edited Profile',
                at_details: {
                    at_edit_profile: {
                        at_ep_fn_old: users.user_fname,
                        at_ep_ln_old: users.user_lname,
                        at_ep_dob_old: users.user_dob,
                        at_ep_email_old: users.user_email,
                        at_ep_img_old: users.user_img,

                        at_ep_fn_new: editUser.user_fname,
                        at_ep_ln_new: editUser.user_lname,
                        at_ep_dob_new: editUser.user_dob,
                        at_ep_email_new: editUser.user_email,
                        at_ep_img_new: editUser.user_img,
                    }
                }
            };
            const result = await axios.post('https://brailliantweb.onrender.com/api/newaudittrail', newAudit);
            console.log('Audit trail logged:', result);

            console.log('Profile updated:', updatedData);

            setLoading(false)
            localStorage.setItem('users', JSON.stringify(updatedData));
            setEditUser(prev => ({ ...prev, user_password: '' }));
            setCpassword('');
            setUsers(updatedData);
            navigate(-1);


        } catch (error) {
            console.error('Profile update failed:', error);
        }
    };

    const handlePasswordSave = async () => {
        try {
            const response = await axios.put('https://brailliantweb.onrender.com/api/update-password', {
                password: editUser.user_password,
                email: editUser.user_email
            });

            setMessage("Password updated successfully");
            setErrorHandler(true)
            setActiveForm('profile');
            setEditUser({ ...editUser, user_password: '' });
            setCpassword('');
            navigate(-1);

            const newAudit = {
                at_user: editUser.user_email,
                at_date: new Date(),
                at_action: 'Password Changed',
            };
            await axios.post('https://brailliantweb.onrender.com/api/newaudittrail', newAudit);


        } catch (error) {
            console.error("Password update failed:", error);
            alert("Password update failed.");
        }
    };

    const handleVerify = async () => {
        const newOtp = generateOTP()
        setOtp(newOtp)

        if (!cemail) {
            setMessage("Enter new email.");
            setErrorHandler(true)
            return;
        }
        if (editUser.user_password !== cpassword) {
            setMessage("Passwords do not match.");
            setErrorHandler(true)
            return;
        }
        if (!editUser.user_password || !cpassword) {
            setMessage("Enter password.");
            setErrorHandler(true)
            return;
        }
        try {
            const response = await axios.post("https://brailliantweb.onrender.com/api/handle-credentials", {
                email: cemail,
                password: editUser.user_password
            })
        } catch (error) {
            alert("Invalid email or password. Please try again.");
            return
        }
        handleNewEmail(newOtp)
        toggleModal()
    }
    const handleInputOTP = () => {
        if (!inputOtp) {
            setMessage("OTP is required.");
            setErrorHandler(true)
            return
        }
        if (inputOtp == otp) {
            handleEmailSave()
        }
    }

    const handleEmailSave = async () => {
        try {
            const updatedData = {
                user_email: cemail,
                user_recent_act: 'Changed Email',
            };

            const result = await axios.put(`https://brailliantweb.onrender.com/api/update/user/${editUser._id}`, updatedData);

            setMessage("Email successfully changed!");
            setErrorHandler(true)

            const updatedUser = { ...editUser, ...updatedData };
            localStorage.setItem('users', JSON.stringify(updatedUser));

            setEditUser(updatedUser);
            setCpassword('');
            setActiveForm('profile');
            navigate(-1);

            const newAudit = {
                at_user: cemail,
                at_date: new Date(),
                at_action: 'Edited Profile',
                at_details: {
                    at_edit_profile: {
                        at_ep_fn_old: users.user_fname,
                        at_ep_ln_old: users.user_lname,
                        at_ep_dob_old: users.user_dob,
                        at_ep_email_old: users.user_email,
                        at_ep_img_old: users.user_img,

                        at_ep_fn_new: editUser.user_fname,
                        at_ep_ln_new: editUser.user_lname,
                        at_ep_dob_new: editUser.user_dob,
                        at_ep_email_new: cemail,
                        at_ep_img_new: editUser.user_img,
                    }
                }
            };
            await axios.post('https://brailliantweb.onrender.com/api/newaudittrail', newAudit);

        } catch (error) {
            setMessage("Incorrect password!");
            setErrorHandler(true)
        }
    };

    const toggleErrorHandlerModal = () => {
        setErrorHandler(!errorHandler)
    }


    return (
        <div className='container'>
            {loading && (
                <Loading />
            )}
            {errorHandler && (
                <ErrorHandler message={message} onClose={toggleErrorHandlerModal} />
            )
            }
            {modal && (
                <div className='modal'>
                    <div className='overlay' onClick={toggleModal} ></div>
                    <div className='otpl-modal-content'>
                        <div className='otpl-loginmodal'>
                            <button className='close-modal' onClick={toggleModal}>x </button>
                            <label className='otpl-head'>We just sent an OTP to your new email</label>
                            <label className='otpl-text'>Enter the One-Time-Pin (OTP) we have sent in your new email.</label>
                            <input
                                placeholder='Enter OTP'
                                value={inputOtp}
                                onChange={(e) => setInputOtp(e.target.value)}
                            />
                            <button className='otpl-login-modal' onClick={handleInputOTP}>Verify</button>
                        </div>
                    </div>
                </div>
            )}
            <div>
                <SideNavigation />
            </div>
            <div className='ep-container'>
                <div className='ep-header'>
                    <Header page={"Edit Profile"} searchBar={false} />
                </div>
                <div className='ep-body'>
                    <div className="profile-page">
                        <main className="profile-container">
                            <h1>Your Profile</h1>
                            <div className="profile-grid">

                                <div className="profile-table">

                                    <img
                                        className="edit-profile-img"
                                        src={
                                            selectedImage
                                                ? selectedImage
                                                : users?.user_img
                                                    ? users.user_img
                                                    : "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png"
                                        }
                                        alt="Preview"
                                    />


                                    <label for="image-upload" className='edit-profile-upload' >
                                        <img src={require('../assets/upload.png')} />Upload Picture
                                    </label>

                                    <input
                                        id='image-upload'
                                        type='file'
                                        accept='image/*'
                                        onChange={(e) => {
                                            setImage(e.target.files[0])
                                            const file = e.target.files?.[0]
                                            console.log(file)

                                            setSelectedImage(
                                                file ? URL.createObjectURL(file) : undefined
                                            )
                                        }}
                                        required
                                    />
                                </div>
                                <div className='form-container' >

                                    {activeForm === 'profile' && (
                                        <div className="profile-form">
                                            <div className='form-row1' >
                                                <p>First Name</p>
                                                <p>Last Name</p>
                                            </div>
                                            <div className="form-row2">
                                                <input
                                                    type="text"
                                                    placeholder="First Name"
                                                    value={editUser.user_fname}
                                                    onChange={(e) => setEditUser({ ...editUser, user_fname: e.target.value })}

                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Last Name"
                                                    value={editUser.user_lname}
                                                    onChange={(e) => setEditUser({ ...editUser, user_lname: e.target.value })}
                                                />
                                            </div>

                                            <p>Date of Birth</p>
                                            <input
                                                type="date"
                                                placeholder="Date of Birth"
                                                value={editUser.user_dob}
                                                onChange={(e) => setEditUser({ ...editUser, user_dob: e.target.value })}
                                            />
                                            <div className='change-actions'>
                                                <button type="button" onClick={() => setActiveForm('password')}>Change Password</button>
                                                <button type="button" onClick={() => setActiveForm('email')}>Change Email</button>
                                            </div>
                                            <div className="form-actions">
                                                <button onClick={confirmPassword} className="editsave-btn">Save</button>
                                                <button onClick={() => { navigate('/profile') }} type="button" className="cancel-btn">Back</button>
                                            </div>
                                        </div>
                                    )}

                                    {/* CHANGE PASSWORD FORM */}
                                    {activeForm === 'password' && (
                                        <div className='change-password-form'>
                                            <p>New Password</p>
                                            <input
                                                type="password"
                                                placeholder="Enter new password"
                                                value={editUser.user_password}
                                                onChange={(e) => setEditUser({ ...editUser, user_password: e.target.value })}
                                            />
                                            <p>Confirm Password</p>
                                            <input
                                                type="password"
                                                placeholder="Re-enter new password"
                                                value={cpassword}
                                                onChange={(e) => setCpassword(e.target.value)}
                                            />
                                            <div className="form-actions">
                                                <button className="editsave-btn" onClick={handlePasswordSave}>Save</button>
                                                <button type="button" className="cancel-btn" onClick={() => {
                                                    setActiveForm('profile')
                                                    setCpassword('')
                                                    setEditUser({ ...editUser, user_password: '' });
                                                }}>Back</button>
                                            </div>
                                        </div>
                                    )}

                                    {/* CHANGE EMAIL FORM */}
                                    {activeForm === 'email' && (
                                        <div className='change-email-form'>
                                            <p>New Email</p>
                                            <input
                                                type="email"
                                                placeholder="Email"
                                                value={cemail}
                                                onChange={(e) => setCemail(e.target.value)}
                                            />
                                            <p>Password</p>
                                            <input
                                                type="password"
                                                placeholder="Enter new password"
                                                value={editUser.user_password}
                                                onChange={(e) => setEditUser({ ...editUser, user_password: e.target.value })}
                                            />
                                            <p>Confirm Password</p>
                                            <input
                                                type="password"
                                                placeholder="Re-enter new password"
                                                value={cpassword}
                                                onChange={(e) => setCpassword(e.target.value)}
                                            />
                                            <div className="form-actions">
                                                <button className="editsave-btn" onClick={handleVerify}>Save</button>
                                                <button type="button" className="cancel-btn" onClick={() => {
                                                    setActiveForm('profile')
                                                    setCpassword('')
                                                    setEditUser({ ...editUser, user_password: '' });
                                                }}>Back</button>
                                            </div>
                                        </div>
                                    )}

                                </div>

                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </div>
    )
}
