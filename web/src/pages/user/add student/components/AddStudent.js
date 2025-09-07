import React, { useState, useEffect } from 'react';
import './AddStudent.css'
import SideNavigation from '../../../../global/components/user/SideNavigation'
import Header from '../../../../global/components/user/Header'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import ErrorHandler from "../../../../global/components/user/ErrorHandler";
import Loading from "../../../../global/components/user/Loading";


export default function AddStudent() {

    const navigate = new useNavigate()

    const user = JSON.parse(localStorage.getItem('users'));
    if (!user) {
        navigate(-1)
    }

    const [users, setUsers] = useState([])
    const [sections, setSections] = useState([])
    const [students, setStudents] = useState([])
    const [selectedSection, setSelectedSection] = useState('')

    const [newStudent, setNewStudent] = useState({
        student_lname: '',
        student_fname: '',
        student_mi: '',
        student_dob: '',
        student_gender: '',
        student_section: '',
        student_section_name: '',
    });
    const [loading, setLoading] = useState(false);
    const [errorHandler, setErrorHandler] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        axios.get(`https://brailliantweb.onrender.com/api/allsections/${user._id}`)
            .then((response) => {
                setSections(response.data)
            })
        setUsers(JSON.parse(localStorage.getItem('users')))
    }, [])

    const studentList = (id) => {
        setLoading(true)
        axios.get(`https://brailliantweb.onrender.com/api/allstudents/section/${id}`)
            .then((response) => {
                setStudents(response.data)
                setLoading(false)
            })
    };

    const handleAddStudent = async (e) => {
        setLoading(true)
        e.preventDefault();
        ///////////////////////VALIDATIONS
        if (!newStudent.student_lname.trim()) {
            setLoading(false)
            setMessage("Last name is required.");
            setErrorHandler(true)
            return;
        }
        if (!newStudent.student_fname.trim()) {
            setLoading(false)
            setMessage("First name is required.");
            setErrorHandler(true)
            return;
        }
        if (!/^[A-Za-z]+$/.test(newStudent.student_fname)) {
            setLoading(false)
            setMessage("First name must only contain letters.");
            setErrorHandler(true)
            return;
        }
        if (!/^[A-Za-z]+$/.test(newStudent.student_lname)) {
            setLoading(false)
            setMessage("Last name must only contain letters.");
            setErrorHandler(true)
            return;
        }
        if (newStudent.student_mi && !/^[A-Za-z]{1}$/.test(newStudent.student_mi)) {
            setLoading(false)
            setMessage("Middle initial must only be a single letter.");
            setErrorHandler(true)
            return;
        }
        if (!newStudent.student_dob) {
            setLoading(false)
            setMessage("Date of birth is required.");
            setErrorHandler(true)
            return;
        }

        const today = new Date();
        const enteredDate = new Date(newStudent.student_dob);
        if (enteredDate > today) {
            setLoading(false)
            setMessage("Date of birth cannot be in the future.");
            setErrorHandler(true)
            return;
        }
        if (!newStudent.student_gender) {
            setLoading(false)
            setMessage("Please select a gender.");
            setErrorHandler(true)
            return;
        }
        if (!newStudent.student_section) {
            setLoading(false)
            setMessage("Please select a section.");
            setErrorHandler(true)
            return;
        }
        ///////////////////////////////////////////////////////////////////
        var section = null
        await axios.get(`https://brailliantweb.onrender.com/api/section/id/${selectedSection}`,)
            .then((res) => {
                section = res.data.section.section_name
                const updatedNewStudent = { ...newStudent, student_section_name: section, student_instructor: user._id }
                axios.post('https://brailliantweb.onrender.com/api/newstudent', updatedNewStudent)
                    .then((res) => {
                        setLoading(false)
                        setMessage("Student added successfully!");
                        setErrorHandler(true)
                        setNewStudent({
                            student_lname: '',
                            student_fname: '',
                            student_mi: '',
                            student_dob: '',
                            student_gender: '',
                            student_section: selectedSection,
                            student_section_name: section,
                        });
                        studentList(newStudent.student_section)
                    })
            })



        /////////////////////////////////////////////////////////////////////
        const updatedData = { user_recent_act: 'Added Student' };
        axios.put(`https://brailliantweb.onrender.com/api/update/user/${users._id}`, updatedData)

        const newAudit = {
            at_user: users.user_email,
            at_date: new Date(),
            at_action: 'Added Student',
            at_details: {
                at_add_student: {
                    student_lname: newStudent.student_lname,
                    student_fname: newStudent.student_fname,
                    student_mi: newStudent.student_mi,
                    student_dob: newStudent.student_dob,
                    student_gender: newStudent.student_gender,
                    student_section: newStudent.student_section,
                    student_section_name: section,
                    student_instructor: user.user_email,
                },
            }
        };
        await axios.post('https://brailliantweb.onrender.com/api/newaudittrail', newAudit);
    };

    const toggleErrorHandlerModal = () => {
        setErrorHandler(!errorHandler)
    }

    return (
        <div className='container'>
            <div>
                {loading && (
                    <Loading />
                )
                }
                {errorHandler && (
                    <ErrorHandler message={message} onClose={toggleErrorHandlerModal} />
                )
                }
                <SideNavigation />
            </div>
            <div className='as-container'>
                <div className='as-header'>
                    <Header page={"Add Student"} searchBar={false} />
                </div>
                <div className='as-body'>
                    <div className='back-container'>
                        <button className='back-btn' onClick={() => { navigate(-1) }}><img src={require('../../../../global/asset/back.png')} />Back</button>
                    </div>
                    <div className='as-body-cont'>
                        <form className='as'>
                            <div className='as1'>

                                <div className='as2'>
                                    <label>Section:</label>
                                    <select
                                        value={newStudent.student_section}
                                        onChange={(e) => {
                                            setSelectedSection(e.target.value)
                                            setNewStudent({ ...newStudent, student_section: e.target.value })
                                            studentList(e.target.value)
                                        }
                                        }
                                    >
                                        <option value="">Select Section</option>
                                        {sections.sections?.map((section) => (
                                            <option key={section._id} value={section._id}>
                                                {section.section_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className='as1'>
                                <div className='as2'>
                                    <label>Last Name:</label>
                                    <input
                                        type='text'
                                        value={newStudent.student_lname}
                                        onChange={(e) => setNewStudent({ ...newStudent, student_lname: e.target.value })}
                                    />
                                </div>
                                <div className='as2'>
                                    <label>First Name:</label>
                                    <input
                                        type='text'
                                        value={newStudent.student_fname}
                                        onChange={(e) => setNewStudent({ ...newStudent, student_fname: e.target.value })}
                                    />
                                </div>
                                <div className='as2'>
                                    <label>Middle Initial:</label>
                                    <input
                                        type='text'
                                        value={newStudent.student_mi}
                                        onChange={(e) => setNewStudent({ ...newStudent, student_mi: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className='as1'>
                                <div className='as2'>
                                    <label>Date of Birth:</label>
                                    <input
                                        type='date'
                                        value={newStudent.student_dob}
                                        onChange={(e) => setNewStudent({ ...newStudent, student_dob: e.target.value })}
                                    />
                                </div>
                                <div className='as2'>
                                    <label>Gender:</label>
                                    <select
                                        value={newStudent.student_gender}
                                        onChange={(e) => setNewStudent({ ...newStudent, student_gender: e.target.value })}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                            </div>
                            <button className='as-add' onClick={handleAddStudent} > <img src={require('../assets/add.png')} />Add Student</button>
                        </form>
                        <div className='add-students'>
                            <table>
                                <tr>
                                    <th>Last Name</th>
                                    <th>First Name</th>
                                    <th>Middle Initial</th>
                                    <th>Birthdate</th>
                                    <th>Age</th>
                                    <th>Gender</th>
                                </tr>

                                {students.students?.map((student) => (
                                    <tr
                                        key={student._id}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <td>{student.student_lname}</td>
                                        <td>{student.student_fname}</td>
                                        <td>{student.student_mi}</td>
                                        <td>{new Date(student.student_dob).toLocaleDateString()}</td>
                                        <td>{student.student_age}</td>
                                        <td>{student.student_gender}</td>
                                    </tr>
                                ))}

                            </table>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    )
}
