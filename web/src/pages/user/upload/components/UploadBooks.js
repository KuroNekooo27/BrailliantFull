import React, { useState, useEffect } from 'react'
import './UploadBooks.css'
import SideNavigation from '../../../../global/components/user/SideNavigation'
import Header from '../../../../global/components/user/Header'
import axios from 'axios'
import "./confirmationModal.css"
import { useNavigate } from 'react-router-dom'


export default function UploadBooks() {

    const navigate = new useNavigate()
    const page = "Upload Books"
    const searchBar = false

    const [newBook, setNewBook] = useState({
        request_book_title: '',
        request_book_author: '',
        request_book_genre: '',
        request_book_date_published: '',
        request_book_level: '',
        request_book_img: '',
        request_book_file: '',
        request_book_description: '',
        request_by: ''
    });
    const [confirmationModal, setConfirmationModal] = useState(false)

    const [file, setFile] = useState('')
    const [user, setUser] = useState([])

    const [selectedImage, setSelectedImage] = useState('')

    const [image, setImage] = useState(null)



    const clearForm = () => {
        setNewBook({
            request_book_title: '',
            request_book_author: '',
            request_book_genre: '',
            request_book_date_published: '',
            request_book_level: '',
            request_book_img: '',
            request_book_file: '',
            request_book_description: '',
            request_by: '',
        });
    };

    const toggleConfirmationModal = () => {
        setConfirmationModal(!confirmationModal)
    }

    const uploadBook = async () => {
        const updatedData = { user_recent_act: 'Requested Upload Material' };
        axios.put(`https://brailliantweb.onrender.com/api/update/user/${user._id}`, updatedData)
            .then(() => {
                console.log(updatedData, "this after update");
            })
            .catch((error) => {
                console.log(error);
            });
        try {
            const updatedBook = {
                ...newBook,
                request_by: user.user_email,
                request_book_status: ''
            };

            const response = await axios.post('https://brailliantweb.onrender.com/api/newrequestbook', updatedBook);
            const createdBook = response.data.book;

            console.log("Book created:", createdBook);
            alert("Book uploaded for request successfully!");
            navigate('/library')

            var fileUrl = null
            var imageUrl = null
            if (file) {
                fileUrl = await submitImage(createdBook._id);
                imageUrl = await submitimage(createdBook._id);
            }

            clearForm();

            const auditData = {
                at_user: user.user_email,
                at_date: new Date(),
                at_action: 'Requested Upload Material',
                at_details: {
                    at_request_book_upload: {
                        rb_title: newBook.request_book_title,
                        rb_author: newBook.request_book_author,
                        rb_genre: newBook.request_book_genre,
                        rb_date_published: newBook.request_book_date_published,
                        rb_level: newBook.request_book_level,
                        rb_description: newBook.request_book_description,
                        rb_img: imageUrl,
                        rb_file: fileUrl,
                        request_by: user.user_email,
                    }
                }
            }

            const result = await axios.post('https://brailliantweb.onrender.com/api/newaudittrail', auditData);
            console.log(result);

        } catch (error) {
            console.error(error);
            alert("Failed to upload book");
        }
    }

    const handleUploadBook = () => {
        if (!image) {
            toggleConfirmationModal()
        }
    };

    useEffect(() => {
        setUser(JSON.parse(localStorage.getItem('users')))
    }, [])


    const submitImage = async (bookId) => {
        try {
            const formData = new FormData();
            formData.append('bookFile', file);

            const result = await axios.put(
                `https://brailliantweb.onrender.com/upload-requestfiles/${bookId}`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            console.log("File uploaded:", result.data);
            console.log("File uploaded:", result.data.fileUrl);
            return result.data.fileUrl
        } catch (error) {
            console.error("File upload error:", error);
        }
    };



    const submitimage = async (bookId) => {
        if (image) {
            const formData = new FormData();
            formData.append('bookImage', image);

            const result = await axios.put(
                `https://brailliantweb.onrender.com/upload-requestimage/${bookId}`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            console.log("Image uploaded:", result.data);
            return result.data.imageUrl
        }

    };


    const onInputChange = (e) => {
        console.log('this is png', e.target.files[0])
        setImage(e.target.files[0])
        const file = e.target.files?.[0]
        setSelectedImage(
            file ? URL.createObjectURL(file) : undefined
        )
    }


    return (
        <div className='container'>
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
            <div>
                <SideNavigation />
            </div>
            <div className='upload-container'>
                <div className='upload-header'>
                    <Header page={page} searchBar={searchBar} />
                </div>
                <div className='upload-body'>
                    <div className='upload-body-container'>
                        <label className='up'>
                            <button className='back-btn' onClick={() => { navigate(-1) }}><img src={require('../assets/back.png')} />Back</button>
                            Upload Books</label>
                        <form className="uploadmaterial-container" onSubmit={(e) => {
                            e.preventDefault()
                            handleUploadBook()

                        }}>
                            <div className='left-container'>

                                <img
                                    className='upload-image-container'
                                    src={selectedImage}
                                />

                                <div>

                                    <label for="image-upload" className='upload-image'>
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

                                    <label for="file-upload" class="custom-file-upload">
                                        {file.name ? file.name : "Attach file here"}
                                    </label>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept='application/pdf'
                                        required
                                        onChange={(e) => {
                                            setFile(e.target.files[0])
                                        }}

                                    />


                                </div>
                            </div>



                            <div className='right-container'>
                                <label>Title</label>
                                <input
                                    required
                                    type='text'
                                    placeholder='Enter book title here'
                                    value={newBook.request_book_title}
                                    onChange={(e) => setNewBook({ ...newBook, request_book_title: e.target.value })}
                                />
                                <label>Author</label>
                                <input
                                    required
                                    type='text'
                                    placeholder='Enter author name here'
                                    value={newBook.request_book_author}
                                    onChange={(e) => setNewBook({ ...newBook, request_book_author: e.target.value })}
                                />
                                <label>Genre</label>
                                <input
                                    required
                                    type='text'
                                    placeholder=' Enter genre here'
                                    value={newBook.request_book_genre}
                                    onChange={(e) => setNewBook({ ...newBook, request_book_genre: e.target.value })}
                                />
                                <label>Description</label>
                                <textarea
                                    required
                                    type='text'
                                    placeholder='Enter description here'
                                    value={newBook.request_book_description}
                                    onChange={(e) => setNewBook({ ...newBook, request_book_description: e.target.value })}
                                />
                                <label>Level</label>
                                <input
                                    required
                                    type='text'
                                    placeholder=' Enter book level here'
                                    value={newBook.request_book_level}
                                    onChange={(e) => setNewBook({ ...newBook, request_book_level: e.target.value })}
                                />
                                <label>Date Published</label>
                                <input
                                    required
                                    type='date'
                                    placeholder='MM/DD/YYYY'
                                    value={newBook.request_book_date_published}
                                    onChange={(e) => setNewBook({ ...newBook, request_book_date_published: e.target.value })}
                                />
                                <button type='submit'>Submit Upload Request</button>
                            </div>
                        </form>
                    </div>


                </div>
            </div>
        </div>
    )
}
