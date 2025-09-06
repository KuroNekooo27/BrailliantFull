import React, { useState, useEffect } from 'react'
import './AdminViewBook.css'
import AdminSideNavigation from '../../../../global/components/admin/AdminSideNavigation'
import AdminHeader from '../../../../global/components/admin/AdminHeader'
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loading from '../../../../global/components/user/Loading';
export default function AdminViewBook() {

    const navigate = new useNavigate()

    const [resultText, setResultText] = useState('')
    const [loading, setLoading] = useState(false)

    const location = useLocation();
    const selectedBook = location.state.book;


    useEffect(() => {
        setLoading(true)
        if (!selectedBook?.request_book_file) return;

        fetch('https://brailliantweb.onrender.com/extract-text', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pdfUrl: selectedBook.request_book_file })
        })
            .then(res => res.text())
            .then(text => {
                setLoading(false)
                const trimmedText = text.trim();
                setResultText(trimmedText);
            })
            .catch(err => console.error('Error extracting text:', err));
    }, []);

    const handleApprove = async () => {
        setLoading(true)
        axios.put(`https://brailliantweb.onrender.com/api/update/requestbook/${selectedBook._id}`, {
            request_book_status: 'Approved'
        })
        const approvedBook = {
            book_title: selectedBook.request_book_title,
            book_author: selectedBook.request_book_title,
            book_genre: selectedBook.request_book_genre,
            book_date_published: selectedBook.request_book_date_published,
            book_level: selectedBook.request_book_level,
            book_description: selectedBook.request_book_description,
            book_img: selectedBook.request_book_img,
            book_file: selectedBook.request_book_file,
            book_last_modified: new Date(),
        };
        await axios.post('https://brailliantweb.onrender.com/api/newbook', approvedBook);
        setLoading(false)
        navigate('/admin/content-request')
    }

    const handleDecline = async () => {
        setLoading(true)
        try {
            await axios.delete(`https://brailliantweb.onrender.com/api/delete/requestbook/${selectedBook._id}`);
            navigate('/admin/content-request');
        } catch (err) {
            console.error("Error deleting book:", err);
        }
        setLoading(false)
    };

    return (
        <div className='container'>
            <div>
                {loading && (
                    <Loading />
                )}
                <AdminSideNavigation />
            </div>
            <div className='a-crbd-container'>
                <div className='a-crbd-header'>
                    <AdminHeader page={"Book Details"} />

                </div>
                <div className='a-crbd-body'>
                    <div className='a-crbook-details'>
                        <button className='back-btn' onClick={() => { navigate(-1) }}><img src={require('../../../../global/asset/back.png')} />Back</button>

                        <label className='a-crbd-title'>{selectedBook.request_book_title}</label>
                        <div className='a-crbd-details'>
                            <div className='a-crbd-left'>
                                {selectedBook.request_book_img ? (
                                    <img
                                        className='a-crbd-cover'
                                        src={selectedBook.request_book_img}
                                    />
                                ) : (
                                    <img
                                        className='a-crbd-cover'
                                        src={require('../assets/noimg.png')}
                                    />
                                )
                                }
                                <div className='a-crbd-info'>
                                    <label>Title: {selectedBook.request_book_title}</label>
                                    <label>Author: {selectedBook.request_book_author}</label>
                                    <label>Genre: {selectedBook.request_book_genre}</label>
                                    <label>Description: {selectedBook.request_book_description}</label>
                                    <label>Level: {selectedBook.request_book_level}</label>
                                    <label>Request By: {selectedBook.request_by}</label>
                                </div>

                            </div>
                            <div className='a-crbd-right'>
                                <label className='a-crclass-list'>File Preview</label>
                                <div className='a-crhighlighted-textarea'>
                                    <span>{resultText}</span>
                                </div>
                            </div>

                        </div>
                        <button className='a-cravb-btn' onClick={handleApprove}>Approve Material</button>
                        <button className='a-cravb-btn' onClick={handleDecline}>Decline Material</button>
                    </div>
                </div>
            </div>
        </div >
    )
}
