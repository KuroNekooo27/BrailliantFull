import React, { useState, useEffect } from 'react';
import './Analytics.css'
import DropDownMenu from '../../../../global/components/user/DropDownMenu';
import SideNavigation from '../../../../global/components/user/SideNavigation'
import Header from '../../../../global/components/user/Header';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loading from '../../../../global/components/user/Loading';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function Analytics() {
    const page = "Analytics"
    const searchBar = false
    const [loading, setLoading] = useState(false);
    const [topBooksAvg, setTopBooksAvg] = useState([]);

    const [studentcount, setStudentCount] = useState(0)
    const [booksCount, setBooksCount] = useState(0)
    const [topBooks, setTopBooks] = useState([]);
    const [sectionReads, setSectionReads] = useState([]);
    const [participationRate, setParticipationRate] = useState([]);


    const navigate = new useNavigate()

    const user = JSON.parse(localStorage.getItem('users'));
    if (!user) {
        navigate(-1)
    }

    useEffect(() => {
        setLoading(true)

        axios.get('https://brailliantweb.onrender.com/api/students/count')
            .then((response) => {
                setStudentCount(response.data.count);
            })
        axios.get('https://brailliantweb.onrender.com/api/books/count')
            .then((response) => {
                setBooksCount(response.data.count);

            })
        axios.get('https://brailliantweb.onrender.com/api/books/ranked')
            .then((response) => {
                setTopBooks(response.data);
                setLoading(false)
            })
        axios.get(`https://brailliantweb.onrender.com/reads-per-section/${user?._id}`)
            .then((response) => {
                setSectionReads(response.data);
            });
        axios.get('https://brailliantweb.onrender.com/top-books-avg')
            .then((response) => {
                setTopBooksAvg(response.data);
            });
        axios.get(`https://brailliantweb.onrender.com/participation-rate/${user?._id}`)
            .then((response) => {
                setParticipationRate(response.data)
            });
    }, [])

    const formatTime = (secs) => {
        const h = String(Math.floor(secs / 3600)).padStart(2, "0");
        const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
        const s = String(secs % 60).padStart(2, "0");
        return `${h}:${m}:${s}`;
    };


    const data = {
        labels: sectionReads.map(item => item.sectionName),
        datasets: [
            {
                label: 'Book Sessions',
                data: sectionReads.map(item => item.totalReads),
                backgroundColor: 'rgba(249, 173, 129)',
                borderColor: 'rgba(249, 173, 130)',
                borderWidth: 2,
            },
        ],
    };


    const options = {
        scales: {
            y: {
                beginAtZero: true,
            },
        },
        plugins: {
            title: {
                display: true,
                text: 'Total Sessions per Section',
            },
        },
    };

    return (
        <div className='container'>
            <div>
                {loading && (
                    <Loading />
                )}
                <SideNavigation />
            </div>
            <div className='analytics-container'>
                <div className='analytics-header'>
                    <Header page={page} searchBar={searchBar} />
                </div>
                <div className='analytics-body'>
                    <div className='analytics'>
                        <div className='analytics-details'>
                            <div className='analytics-student'>
                                <label className='analytics-title'>Students</label>
                                <div className='students-count'>
                                    <label className='analytics-count'>{studentcount}</label>
                                    <img src={require('../assets/Users.png')} />
                                </div>
                            </div>
                            <div className='analytics-books-approved'>
                                <label className='analytics-title'>Books Approved</label>
                                <div className='students-count'>
                                    <label className='analytics-count'>{booksCount}</label>
                                    <img src={require('../assets/Book open.png')} />
                                </div>
                            </div>
                            <div className='analytics-completion-rate'>
                                <label className='analytics-title'>Participation Rate</label>
                                <div className='students-count'>
                                    <label className='analytics-count'>{participationRate}%</label>
                                    <img src={require('../assets/check.png')} />
                                </div>
                            </div>
                        </div>
                        <div className='analytics-performance'>
                            <div className='analytics-cp'>
                                <label>Class Performance</label>
                                <div className='cp'>
                                    <Bar data={data} options={options} />
                                </div>
                            </div>
                            <div className='analytics-tb'>
                                <label>Top Books</label>
                                <div className='tb'>
                                    <ul className="top-books-list">
                                        {topBooks.length > 0 ? (
                                            topBooks.map((book, index) => (
                                                <li
                                                    key={book._id}
                                                    onClick={() => {
                                                        navigate('/book/detail', { state: { book: book } });
                                                    }}>
                                                    <span>{index + 1}. {book.book_title}</span>  {book.book_count} views
                                                </li>
                                            ))
                                        ) : (
                                            <li>No data available</li>
                                        )}
                                    </ul>

                                </div>
                            </div>
                            <div className='analytics-tba'>
                                <label>Top Books Average Time</label>
                                <div className='tba'>
                                    <ul className="top-books-average-list">
                                        {topBooksAvg.length > 0 ? (
                                            topBooksAvg.map((book, index) => (
                                                <li
                                                    key={book.book_title}
                                                    onClick={() => {
                                                        // navigate('/book/detail', { state: { book: book } });
                                                        console.log(book)
                                                    }}>
                                                    <span>{index + 1}. {book.book_title}</span>
                                                    {formatTime(Math.floor(book.avg_time))}
                                                </li>
                                            ))
                                        ) : (
                                            <li>No data available</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
