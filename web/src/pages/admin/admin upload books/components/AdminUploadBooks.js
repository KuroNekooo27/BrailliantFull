import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import './AdminUploadBooks.css'
import axios from 'axios'
import AdminSideNavigation from '../../../../global/components/admin/AdminSideNavigation'
import AdminHeader from '../../../../global/components/admin/AdminHeader'
import Loading from '../../../../global/components/user/Loading';
import ErrorHandler from "../../../../global/components/user/ErrorHandler";

export default function AdminUploadBooks() {

    const navigate = new useNavigate()

    const [newBook, setNewBook] = useState({
        book_title: '',
        book_author: '',
        book_genre: '',
        book_date_published: '',
        book_level: '',
        book_description: '',
        book_img: '',
        book_file: '',
    });

    const [file, setFile] = useState('')
    const [image, setImage] = useState(null)
    const [user, setUser] = useState([])
    const [selectedImage, setSelectedImage] = useState('')
    const [loading, setLoading] = useState(false)
    const [confirmationModal, setConfirmationModal] = useState(false)

    const [errorHandler, setErrorHandler] = useState(false);
    const [message, setMessage] = useState('');

    const [errors, setErrors] = useState({
        book_title: '',
        book_author: '',
        book_genre: '',
        book_description: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const clearForm = () => {
        setNewBook({
            book_title: '',
            book_author: '',
            book_genre: '',
            book_date_published: '',
            book_level: '',
            book_description: '',
            book_img: '',
            book_file: '',
        });
    };

    const validateField = (name, value) => {
        let error = '';
        if (!value.trim()) {
            switch (name) {
                case 'book_title':
                    error = 'Title is required';
                    break;
                case 'book_author':
                    error = 'Author is required';
                    break;
                case 'book_genre':
                    error = 'Genre is required';
                    break;
                case 'book_description':
                    error = 'Description is required';
                    break;
                default:
                    break;
            }
        }
        setErrors((prev) => ({ ...prev, [name]: error }));
        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewBook({ ...newBook, [name]: value });
        validateField(name, value);
    };

    const handleUploadBook = () => {
        setSubmitted(true);

        const newErrors = {
            book_title: validateField('book_title', newBook.book_title),
            book_author: validateField('book_author', newBook.book_author),
            book_genre: validateField('book_genre', newBook.book_genre),
            book_description: validateField('book_description', newBook.book_description)
        };

        setErrors(newErrors);

        if (Object.values(newErrors).some((err) => err)) {
            return;
        }

        if (!file) {
            setMessage("Please attach a file");
            setErrorHandler(true);
            return;

        }

        if (!image) {
            toggleConfirmationModal()
        }
        else {
            uploadBook();
        }

    };

    const uploadBook = async () => {
        setLoading(true)
        try {
            const updatedBook = {
                ...newBook,
                book_last_modified: new Date(),
            };

            const response = await axios.post('https://brailliantweb.onrender.com/api/newbook', updatedBook);
            const createdBook = response.data.book;

            if (file) {
                await submitImage(createdBook._id);
                await submitimage(createdBook._id);
            }

            setMessage("Book uploaded successfully!.");
            setErrorHandler(true)
            setLoading(false)
            clearForm();
            navigate(-1)

        } catch (error) {
            console.error(error);
            setMessage("Failed to upload book!.");
            setErrorHandler(true)
        }
    };

    useEffect(() => {
        setUser(JSON.parse(localStorage.getItem('admin')))
    }, [])

    const submitImage = async (bookId) => {
        try {
            const formData = new FormData();
            formData.append('bookFile', file);

            await axios.put(`https://brailliantweb.onrender.com/upload-files/${bookId}`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
        } catch (error) {
            console.error("File upload error:", error);
        }
    };


    const submitimage = async (bookId) => {
        if (image) {
            const formData = new FormData();
            formData.append('bookImage', image);

            const result = await axios.put(
                `https://brailliantweb.onrender.com/upload-image/${bookId}`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            return result.data.imageUrl
        }
    }

    const onInputChange = (e) => {
        setImage(e.target.files[0])
        const file = e.target.files?.[0]
        setSelectedImage(file ? URL.createObjectURL(file) : undefined)
    }

    const toggleErrorHandlerModal = () => {
        setErrorHandler(!errorHandler)
    }
    const toggleConfirmationModal = () => {
        setConfirmationModal(!confirmationModal)
    }
    return (
        <div className='container'>
            <div>
                {loading && (<Loading />)}
                {errorHandler && (
                    <ErrorHandler message={message} onClose={toggleErrorHandlerModal} />
                )}
                {confirmationModal && (
                    <div className='modal'>
                        <div className='overlay'></div>
                        <div className='confirmationmodal-content'>
                            <div className='confirmationmodal'>
                                <label className='upload-label'>Are you sure you want to upload without an image attached?</label>
                                <div className='upload-btn'>
                                    <button className='upload-yes' onClick={uploadBook} >Yes</button>
                                    <button className='upload-no' onClick={toggleConfirmationModal} >No</button>
                                </div>


                            </div>
                        </div>
                    </div>
                )}
                <AdminSideNavigation />
            </div>
            <div className='upload-container'>
                <div className='upload-header'>
                    <AdminHeader page={"Upload Books"} />
                </div>
                <div className='upload-body'>
                    <div className='upload-body-container'>
                        <button className='back-btn' onClick={() => { navigate(-1) }}>
                            <img src={require('../../../../global/asset/back.png')} />Back
                        </button>
                        <label className='up'>Upload Books</label>

                        <form className="uploadmaterial-container" onSubmit={(e) => {
                            e.preventDefault()
                            handleUploadBook()
                        }}>
                            <div className='left-container'>
                                <img className='upload-image-container' src={selectedImage} />

                                <div>
                                    <label htmlFor="image-upload" className='upload-image'>
                                        Upload Book Cover
                                    </label>
                                    <input
                                        id='image-upload'
                                        type='file'
                                        accept='image/*'
                                        onChange={onInputChange}
                                    />
                                </div>

                                <div className='lower-left-container'>
                                    <label htmlFor="file-upload" className="custom-file-upload">
                                        {file ? file.name : "Attach file here"}
                                    </label>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept='application/pdf'
                                        onChange={(e) => setFile(e.target.files[0])}
                                    />
                                </div>
                            </div>

                            <div className='right-container'>
                                <div className='aub-container'>
                                    <label>Title</label>
                                    <input
                                        type='text'
                                        name="book_title"
                                        placeholder='Enter book title here'
                                        value={newBook.book_title}
                                        onChange={handleChange}
                                    />
                                    {(submitted || newBook.book_title) && errors.book_title && (
                                        <span className="error">{errors.book_title}</span>
                                    )}
                                </div>
                                <div className='aub-container'>
                                    <label>Author</label>
                                    <input
                                        type='text'
                                        name="book_author"
                                        placeholder='Enter author name here'
                                        value={newBook.book_author}
                                        onChange={handleChange}
                                    />
                                    {(submitted || newBook.book_author) && errors.book_author && (
                                        <span className="error">{errors.book_author}</span>
                                    )}
                                </div>
                                <div className='aub-container'>
                                    <label>Genre</label>
                                    <input
                                        type='text'
                                        name="book_genre"
                                        placeholder='Enter genre here'
                                        value={newBook.book_genre}
                                        onChange={handleChange}
                                    />
                                    {(submitted || newBook.book_genre) && errors.book_genre && (
                                        <span className="error">{errors.book_genre}</span>
                                    )}
                                </div>
                                <div className='aub-container'>
                                    <label>Description</label>
                                    <input
                                        type='text'
                                        name="book_description"
                                        placeholder='Enter description here'
                                        value={newBook.book_description}
                                        onChange={handleChange}
                                    />
                                    {(submitted || newBook.book_description) && errors.book_description && (
                                        <span className="error">{errors.book_description}</span>
                                    )}
                                </div>
                                <button type='submit'>
                                    <img src={require('../assets/upload.png')} /> Upload Book
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            </div>
        </div>
    )
}
