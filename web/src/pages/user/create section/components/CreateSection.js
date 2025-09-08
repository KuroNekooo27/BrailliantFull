import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from "react-router-dom";
import './CreateSection.css'
import SideNavigation from '../../../../global/components/user/SideNavigation'
import Header from '../../../../global/components/user/Header';
import axios from 'axios'
import ErrorHandler from "../../../../global/components/user/ErrorHandler";


export default function CreateSection() {

    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem('users'));
    if (!user) {
        navigate(-1)
    }

    const [users, setUsers] = useState([])
    const [sectionId, setSectionId] = useState('')
    const [students, setStudents] = useState([])

    const [section, setSection] = useState([])

    const [newStudent, setNewStudent] = useState({
        student_lname: '',
        student_fname: '',
        student_mi: '',
        student_dob: '',
        student_gender: '',
    });
    const [newSection, setNewSection] = useState({
        section_name: '',
        section_level: '',
    });
    const [auditTrail, setAuditTrail] = useState({
        at_action: '',
        at_date: '',
        at_user: '',
    });

    const [isStudentFormEnabled, setIsStudentFormEnabled] = useState(false);
    const [isSectionFormEnabled, setIsSectionFormEnabled] = useState(true);

    const [isCreateButtonDisabled, setIsCreateButtonDisabled] = useState(false);
    const [errorHandler, setErrorHandler] = useState(false);
    const [message, setMessage] = useState('');

    const clearStudentForm = () => {
        setNewStudent({
            student_lname: '',
            student_fname: '',
            student_mi: '',
            student_dob: '',
            student_gender: '',
        });
    };

    const handleAddStudent = (e) => {
        e.preventDefault();

        const dob = new Date(newStudent.student_dob);
        const today = new Date();
        if (dob >= today) {
            setMessage("Date of birth must be in the past");
            setErrorHandler(true)
            return false;
        }
        axios.put(`https://brailliantweb.onrender.com/api/update/user/${users._id}`, { user_recent_act: 'Added Student' })

        const updatedData = {
            ...newStudent,
            student_section_name: section.section.section_name,
            student_section: sectionId,
            student_instructor: users._id
        }

        axios.post('https://brailliantweb.onrender.com/api/newstudent', updatedData)
            .then((res) => {
                setMessage("Student added successfully!.");
                setErrorHandler(true)
                setNewStudent({
                    student_lname: '',
                    student_fname: '',
                    student_mi: '',
                    student_dob: '',
                    student_gender: '',
                });
                studentList()
            })
            .catch((error) => {
                setMessage("Failed to add student. Please try again");
                setErrorHandler(true)
            });

    };

    const handleCreateSection = async (e) => {
        e.preventDefault();
        if (!newSection.section_name) {
            setMessage("Please enter a section name.");
            setErrorHandler(true)
            return;
        }
        if (!newSection.section_level) {
            setMessage("Please select a section level.");
            setErrorHandler(true)
            return;
        }

        setMessage("Section created successfully!.");
        setErrorHandler(true)
        setIsSectionFormEnabled(false)
        setIsStudentFormEnabled(true);
        setIsCreateButtonDisabled(true);


        axios.put(`https://brailliantweb.onrender.com/api/update/user/${users._id}`, { user_recent_act: 'Created Section' })

        axios.post('https://brailliantweb.onrender.com/api/newsection', {
            ...newSection,
            section_instructor: users._id
        })
            .then(async (response) => {

                //clearForm();
                const newId = response.data.section._id;
                setSectionId(newId);

                try {
                    const result = await axios.get(`https://brailliantweb.onrender.com/api/section/${newId}`);
                    setSection(result.data);
                } catch (fetchError) {
                    console.error("Error fetching newly created section:", fetchError);
                }
            })



        const newAudit = {
            at_user: users.user_email,
            at_date: new Date(),
            at_action: 'Created Section',
            at_details: {
                at_create_section: {
                    section_name: newSection.section_name,
                    section_level: newSection.section_level,
                    section_instructor: users._id
                }
            }
        };

        setAuditTrail(newAudit);
        await axios.post('https://brailliantweb.onrender.com/api/newaudittrail', newAudit);
    };

    useEffect(() => {
        setUsers(JSON.parse(localStorage.getItem('users')))
    }, [])

    const studentList = () => {
        axios.get('https://brailliantweb.onrender.com/api/allstudents')
            .then((response) => {
                setStudents(response.data)
            })

    };

    const toggleErrorHandlerModal = () => {
        setErrorHandler(!errorHandler)
    }

    return (
        <div className='container'>
            <div>
                {errorHandler && (
                    <ErrorHandler message={message} onClose={toggleErrorHandlerModal} />
                )
                }
                <SideNavigation />
            </div>
            <div className='createsection-container'>
                <div className='createsection-header'>
                    <Header page={"Create Section"} searchBar={false} />
                </div>
                <div className='createsection-body'>
                    <div className='cre-s'>

                        <div className='cre-try'>
                            <button className='back-btn' onClick={() => { navigate(-1) }}><img src={require('../../../../global/asset/back.png')} />Back</button>

                            <form className='section-create'>
                                <div className='c1'>
                                    <div className='c2'>
                                        <label>Section Name</label>
                                        <input
                                            required
                                            type='text'
                                            className='section-name'
                                            value={newSection.section_name}
                                            onChange={(e) => setNewSection({ ...newSection, section_name: e.target.value })}
                                            readOnly={!isSectionFormEnabled}

                                        />
                                    </div>
                                    <div className='c2'>
                                        <label>Grade Level</label>
                                        <input
                                            required
                                            className='grade-level'
                                            value={newSection.section_level}
                                            onChange={(e) => setNewSection({ ...newSection, section_level: e.target.value })}
                                            readOnly={!isSectionFormEnabled}
                                        />

                                    </div>
                                </div>
                                <div>
                                    <button
                                        onClick={handleCreateSection}
                                        className='sect-save'
                                        disabled={isCreateButtonDisabled}
                                    >
                                        Create
                                    </button>
                                </div>
                            </form>
                            <div className='cr-frm'>
                                <form className='section-form' onSubmit={handleAddStudent}>
                                    <h2>Add Student</h2>
                                    <label>Last Name</label>
                                    <input
                                        className='last-name'
                                        required
                                        value={newStudent.student_lname}
                                        onChange={(e) => setNewStudent({ ...newStudent, student_lname: e.target.value })}
                                        disabled={!isStudentFormEnabled}

                                    />
                                    <div className='c1'>
                                        <div className='c2'>
                                            <label>First Name</label>
                                            <input
                                                className='first-name'
                                                required
                                                value={newStudent.student_fname}
                                                onChange={(e) => setNewStudent({ ...newStudent, student_fname: e.target.value })}
                                                disabled={!isStudentFormEnabled}
                                            />
                                        </div>
                                        <div className='c2'>
                                            <label>Middle Initial</label>
                                            <input
                                                className='middle-initial'
                                                required
                                                type='text'
                                                value={newStudent.student_mi}
                                                onChange={(e) => setNewStudent({ ...newStudent, student_mi: e.target.value })}
                                                disabled={!isStudentFormEnabled}
                                            />
                                        </div>
                                    </div>
                                    <div className='c1'>
                                        <div className='c2'>
                                            <label>Date of Birth</label>
                                            <input
                                                className='dob'
                                                required
                                                type='date'
                                                value={newStudent.student_dob}
                                                onChange={(e) => setNewStudent({ ...newStudent, student_dob: e.target.value })}
                                                disabled={!isStudentFormEnabled}
                                            />
                                        </div>
                                        <div className='c2'>
                                            <label>Gender</label>
                                            <select
                                                required
                                                value={newStudent.student_gender}
                                                onChange={(e) => setNewStudent({ ...newStudent, student_gender: e.target.value })}
                                                disabled={!isStudentFormEnabled}
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>

                                        </div>
                                    </div>
                                    <div className='create-section-buttons'>
                                        <button
                                            type='submit'
                                            className='add-section'
                                            disabled={!isStudentFormEnabled}
                                        >Add</button>
                                        <button
                                            type='reset'
                                            className='clear-form'
                                            onClick={clearStudentForm}
                                            disabled={!isStudentFormEnabled}
                                        >Clear</button>
                                    </div>
                                </form>

                                <div className='section-student-list'>
                                    <div className='section-student-list-top'>
                                        <label>Student List</label>
                                        {/* <div></div><button className='section-import'><img src={require('../assets/upload.png')} />Import List</button> */}
                                    </div>
                                    <div className='create-section-students'>
                                        <table>
                                            <tr>
                                                <th>Last Name</th>
                                                <th>First Name</th>
                                                <th>Middle Initial</th>
                                                <th>Birthdate</th>
                                                <th>Age</th>
                                                <th>Gender</th>
                                            </tr>

                                            {students.students
                                                ?.filter((student) =>
                                                    sectionId ? student.student_section === sectionId : true
                                                )
                                                .map((student) => (
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
                </div>
            </div>
        </div>
    )
}
