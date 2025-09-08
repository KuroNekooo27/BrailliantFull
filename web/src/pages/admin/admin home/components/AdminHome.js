import React, { useState, useEffect } from 'react';
import AdminSideNavigation from '../../../../global/components/admin/AdminSideNavigation';
import AdminHeader from '../../../../global/components/admin/AdminHeader';
import './AdminHome.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loading from '../../../../global/components/user/Loading';

export default function AdminHome() {
    const navigate = useNavigate();

    const admin = JSON.parse(localStorage.getItem('admin'));
    if (!admin) {
        navigate(-1);
    }

    const [bookCount, setBookCount] = useState(0);
    const [allUsers, setAllUsers] = useState(0);
    const [activatedUsers, setActivatedUsers] = useState(0);
    const [teacherActivity, setTeacherActivity] = useState([]);
    const [pendingRequest, setPendingRequest] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);

        axios.get('https://brailliantweb.onrender.com/api/books/count')
            .then((response) => {
                setBookCount(response.data.count);
            });

        axios.get('https://brailliantweb.onrender.com/api/allusers')
            .then((response) => {
                setAllUsers(response.data);
                const activated = response.data.users?.filter(user => user.user_status === "Activated").length || 0;
                setActivatedUsers(activated);
            });

        axios.get('https://brailliantweb.onrender.com/api/admin/teacher-recent-activity')
            .then((response) => {
                setTeacherActivity(response.data);
                console.log(response.data)

            });

        axios.get('https://brailliantweb.onrender.com/api/admin/pending-request')
            .then((response) => {
                setPendingRequest(response.data);
                console.log(response.data)
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className='container'>
            <div>
                {loading && <Loading />}
                <AdminSideNavigation />
            </div>
            <div className='admin-home-container'>
                <AdminHeader page={"Dashboard"} />
                <div className='admin-home-body'>
                    <div className='admin-home'>
                        <div className='admin-home-summary'>
                            <div className='admin-summary'>
                                <label className='admin-summary-text'>Summary</label>
                                <div className='summary-content'>
                                    <div>
                                        <label className='admin-summary-sub'>Recent Teacher Activity</label>
                                        <ul className="summary-activity-list">
                                            {teacherActivity && teacherActivity.length ? (
                                                teacherActivity.map((teacher) => (
                                                    <li
                                                        key={teacher._id}
                                                    >
                                                        <span>
                                                            {teacher.user_fname} {teacher.user_lname} ({teacher.user_email})
                                                        </span>
                                                        <span>{teacher.user_recent_act}</span>
                                                    </li>
                                                ))
                                            ) : (
                                                <li>No activity available</li>
                                            )}
                                        </ul>
                                    </div>

                                    <div>
                                        <label className='admin-summary-sub'>New Pending Requests</label>
                                        <ul className="summary-request-list">
                                            {pendingRequest && pendingRequest.length ? (
                                                pendingRequest.map((req) => (
                                                    <li
                                                        key={req._id}
                                                        onClick={() => navigate('/admin/approval/book', { state: { book: req } })}
                                                    >
                                                        <span>{req.request_book_title}</span>
                                                        <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                                                        <span>{req.request_by}</span>
                                                    </li>
                                                ))
                                            ) : (
                                                <li>No requests available</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className='admin-home-info'>
                                <div className='admin-home-active'>
                                    <div className='ah-users'>
                                        <label>Active User Accounts</label>
                                    </div>
                                    <div className='ah-div'>
                                        <label className='ah-count'>{activatedUsers}</label>
                                        <img src={require('../assets/users.png')} alt="users" />
                                    </div>
                                </div>
                                <div className='admin-home-approved'>
                                    <div>
                                        <label>Approved Books</label>
                                    </div>
                                    <div className='ah-div'>
                                        <label className='ah-count'>{bookCount}</label>
                                        <img src={require('../assets/books.png')} alt="books" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='admin-home-navigation'>
                            <div className='admin-ml' onClick={() => { navigate('/admin/library') }}>
                                <img className='ml-book' src={require('../assets/library.png')} alt="library" />
                                <label>Manage Library</label>
                            </div>
                            <div className='admin-ma' onClick={() => { navigate('/admin/accounts') }}>
                                <img src={require('../assets/acc.png')} alt="accounts" />
                                <label>Manage Accounts</label>
                            </div>
                            <div className='admin-cr' onClick={() => { navigate('/admin/content-request') }}>
                                <img src={require('../assets/content.png')} alt="content" />
                                <label>Content Request</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
