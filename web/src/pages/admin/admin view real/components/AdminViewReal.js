import React, { useState, useEffect } from 'react'
import './AdminViewReal.css'
import AdminSideNavigation from '../../../../global/components/admin/AdminSideNavigation'
import AdminHeader from '../../../../global/components/admin/AdminHeader'
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loading from '../../../../global/components/user/Loading';
export default function AdminViewReal() {
    const navigate = new useNavigate()
    const [resultText, setResultText] = useState('')
    const [book, setBook] = useState([])
    const [loading, setLoading] = useState(false)

    const location = useLocation();
    const selectedBook = location.state.book;



    useEffect(() => {
        axios.get(`https://brailliantweb.onrender.com/api/book/${selectedBook}`)
            .then((response) => {
                setBook(response.data.book);
            })
            .catch((error) => {
                console.log("Section fetch error: ", error);
            });

    }, [selectedBook]);

    useEffect(() => {
        setLoading(true)
        if (!book?.book_file) return;

        fetch('https://brailliantweb.onrender.com/extract-text', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pdfUrl: book.book_file })
        })
            .then(res => res.text())
            .then(text => {
                setLoading(false)
                const trimmedText = text.trim();
                setResultText(trimmedText);
            })
            .catch(err => console.error('Error extracting text:', err));
    }, [book]);



    return (
        <div className='container'>
            <div>
                {loading && (
                    <Loading />
                )}
                <AdminSideNavigation />
            </div>
            <div className='a-bd-container'>
                <div className='a-bd-header'>
                    <AdminHeader page={"Book Details"} />
                </div>
                <div className='a-bd-body'>
                    <div className='a-book-details'>
                        <button className='back-btn' onClick={() => { navigate(-1) }}><img src={require('../../../../global/asset/back.png')} />Back</button>

                        <label className='a-bd-title'>{book.book_title}</label>
                        <div className='a-bd-details'>
                            <div className='a-bd-left'>
                                <div className='a-bd-left-img'>
                                    {book.book_img ? (
                                        <img
                                            className='a-bd-cover'
                                            src={book.book_img}
                                        />
                                    ) : (
                                        <img
                                            className='a-bd-cover'
                                            src={require('../assets/noimg.png')}
                                        />
                                    )
                                    }
                                    <button className='a-bd-edit-btn' onClick={() => navigate('/admin/edit-book', { state: book })}>Edit Book</button>

                                </div>

                                <div className='a-bd-info'>
                                    <label><strong>Title: </strong>{book.book_title}</label>
                                    <label><strong>Author: </strong> {book.book_author}</label>
                                    <label><strong>Genre: </strong>: {book.book_genre}</label>
                                    <label><strong>Description: </strong> {book.book_description}</label>
                                    {/* <label>Level: {book.book_level}</label> */}
                                </div>

                            </div>
                            <div className='a-bd-right'>
                                <label className='a-class-list'>File Preview</label>
                                <div className='a-highlighted-textarea'>
                                    <span>{resultText}</span>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div >
    )
}
