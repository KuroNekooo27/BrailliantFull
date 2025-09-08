import React, { useState, useEffect } from 'react';
import SideNavigation from '../../../../global/components/user/SideNavigation'
import Header from '../../../../global/components/user/Header'
import './BookDetails.css'
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loading from '../../../../global/components/user/Loading';
import ErrorHandler from '../../../../global/components/user/ErrorHandler';
export default function BookDetails() {

    const navigate = new useNavigate()

    const location = useLocation();
    const selectedBook = location.state;

    const [students, setStudents] = useState([])
    const [sections, setSections] = useState([])
    const [selectedSection, setSelectedSection] = useState('')
    const [selectedStudent, setSelectedStudent] = useState('')
    const [book, setBook] = useState('')
    const [resultText, setResultText] = useState('')
    const [loading, setLoading] = useState(false)
    const [errorHandler, setErrorHandler] = useState(false)
    const [message, setMessage] = useState('');

    const user = JSON.parse(localStorage.getItem('users'));
    if (!user) {
        navigate(-1)
    }


    useEffect(() => {
        setLoading(true)
        axios.get(`https://brailliantweb.onrender.com/api/allsections/${user?._id}`)
            .then((response) => {
                setSections(response.data)
            })

        axios.get('https://brailliantweb.onrender.com/api/allstudents')
            .then((response) => {
                setStudents(response.data)
            })


        axios.post('https://brailliantweb.onrender.com/extract-text', {
            pdfUrl: selectedBook.book.book_file
        })
            .then((response) => {
                setLoading(false)
                setResultText(response.data.trim());
            })

    }, [])

    useEffect(() => {
        if (selectedStudent?.student_prev_book) {
            axios.get(`https://brailliantweb.onrender.com/book/${selectedStudent.student_prev_book}`)
                .then((response) => {
                    setBook(response.data.book.book_title)
                })
        }
        else {
            setBook("")
        }
    }, [selectedStudent]);


    const startSession = async () => {
        setLoading(true)
        if (!selectedSection || !selectedStudent) {
            setLoading(false)
            setMessage("Select a student");
            setErrorHandler(true)
            return
        }
        await axios.put(`https://brailliantweb.onrender.com/increment/${selectedBook.book._id}`);
        await axios.put(`https://brailliantweb.onrender.com/api/update/student/${selectedStudent._id}`, { student_prev_book: selectedBook.book._id });
        navigate('/book/session', {
            state: {
                book: selectedBook,
                studentId: selectedStudent._id
            }
        });
        setLoading(false)
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
            <div>
                <SideNavigation />
            </div>
            <div className='bd-container'>
                <div className='bd-header'>
                    <Header page={"Book Details"} searchBar={false} />
                </div>
                <div className='bd-body'>
                    <div className='book-details'>
                        <button className='back-btn' onClick={() => { navigate(-1) }}><img src={require('../../../../global/asset/back.png')} /> Back</button>
                        <div className='bd-details'>
                            <div className='bd-left'>
                                <div className='bd-left-cont'>
                                    {selectedBook.book.book_img ? (
                                        <img
                                            className='bd-cover'
                                            src={selectedBook.book.book_img}
                                        />
                                    ) : (
                                        <img
                                            className='bd-cover'
                                            src={require('../assets/noimg.png')}
                                        />
                                    )
                                    }
                                    <div className='bd-info'>
                                        <label><strong>Title:</strong> {selectedBook.book.book_title}</label>
                                        <label><strong>Author:</strong> {selectedBook.book.book_author}</label>
                                        <label><strong>Genre:</strong> {selectedBook.book.book_genre}</label>
                                        {/* <label><strong>Title:</strong> {new Date(selectedBook.book.book_date_published).toLocaleDateString().split("T")[0]}</label> */}
                                        <label><strong>Book Description:</strong> {selectedBook.book.book_description}</label>
                                    </div>
                                </div>
                                <label className='bd-file-preview'>Book Preview</label>
                                <div className='bd-highlighted-textarea'>
                                    {resultText}
                                </div>
                            </div>

                            <div className='bd-right'>
                                <label className='class-list'>Class List</label>
                                <div className='bd-class-list'>
                                    <label>Section:</label>

                                    <select
                                        value={selectedSection.student_section}
                                        onChange={(e) => {
                                            setSelectedSection(e.target.value)
                                            setBook('')
                                        }}
                                    >
                                        <option value="">Select Section</option>
                                        {sections.sections?.map((section) => (
                                            <option key={section._id} value={section._id}>
                                                {section.section_level} {section.section_name}
                                            </option>
                                        ))}
                                    </select>

                                    <label>Student</label>

                                    <select
                                        value={selectedStudent?._id || ""}
                                        onChange={(e) => {
                                            const student = students.students?.find(s => s._id === e.target.value);
                                            setSelectedStudent(student || "");
                                            setBook('');
                                        }}
                                    >
                                        <option value="">Select Student</option>
                                        {selectedSection !== '' &&
                                            students.students
                                                ?.filter((student) => student.student_section === selectedSection)
                                                .map((student) => (
                                                    <option key={student._id} value={student._id}>
                                                        {student.student_fname} {student.student_lname}
                                                    </option>
                                                ))}
                                    </select>

                                    <label>Last Viewed:</label>
                                    <div className='bd-history'>
                                        <p>{book}</p>
                                    </div>
                                </div>
                                <button
                                    className='bd-start-session'
                                    onClick={startSession}
                                ><img src={require('../assets/session.png')} />START SESSION</button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div >
    )
}
