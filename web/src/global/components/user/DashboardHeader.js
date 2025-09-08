import React, { useState, useEffect } from 'react';
import './DashboardHeader.css';
import DropDownMenu from './DropDownMenu';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loading from './Loading.js';

export default function DashboardHeader() {

    const navigate = new useNavigate()


    const user = JSON.parse(localStorage.getItem('users'));
    if (!user) {
        navigate(-1)
    }

    const [showDropdown, setShowDropdown] = useState(false);
    const [users, setUsers] = useState([])
    const [book, setAllBooks] = useState([])
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true)
        axios.get('https://brailliantweb.onrender.com/api/allbooks')
            .then((response) => {
                setLoading(false)
                setAllBooks(response.data)
            })
            .catch((error) => {
                console.log("eto ang error mo " + error)
            })
        setUsers(JSON.parse(localStorage.getItem('users')))

    }, [])



    const toggleDropdown = () => {
        setShowDropdown((prev) => !prev);
    };

    return (
        <>
            {loading && (
                <Loading />
            )}
            <div className="dashboardheader-container">
                <div className="dashboardheader-navigation">
                    <div className='dashboardheader-title-cont'>
                        <label className='dashboardheader-title'>Home</label>
                        <label className='dashboardheader-sub'>Hello, Teacher {users.user_fname}</label>
                    </div>


                    <nav onClick={toggleDropdown}>
                        <img
                            className='icon'
                            src={
                                users?.user_img
                                    ? users.user_img
                                    : "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png"
                            }

                        />
                        <p>{users?.user_fname}</p>
                    </nav>
                </div>

                {showDropdown && <DropDownMenu toggleDropdown={toggleDropdown} />}

                <div className="dashboardheader-navigation">
                    <label className='dashboardheader-library'>Library</label>
                    {users.isActivated ? (
                        <a href="/library">All Books</a>
                    ) : (
                        ""
                    )}
                </div>

                <div className="dashboardheader-books">
                    {book.books?.slice(0, 5).map((book) => {
                        const isClickable = users.isActivated; // only if activated

                        return book.book_img ? (
                            <img
                                key={book._id}
                                src={book.book_img}
                                className={`dashboardheader-book ${!isClickable ? "disabled-book" : ""}`}
                                onClick={() => {
                                    if (isClickable) {
                                        navigate('/book/detail', { state: { book } });
                                    }
                                }}
                            />
                        ) : (
                            <div
                                key={book._id}
                                className={`dashboardheader-book ${!isClickable ? "disabled-book" : ""}`}
                                onClick={() => {
                                    if (isClickable) {
                                        navigate('/book/detail', { state: { book } });
                                    }
                                }}
                            >
                                <label>{book.book_title}</label>
                            </div>
                        );
                    })}
                </div>

            </div>
        </>
    );
}
