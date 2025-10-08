import React, { useState, useEffect, useRef } from 'react';
import './Analytics.css';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { generateAnalyticsReportHtml } from '../utils/pdfTemplate';
import SideNavigation from '../../../../global/components/user/SideNavigation';
import Header from '../../../../global/components/user/Header';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loading from '../../../../global/components/user/Loading';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function Analytics() {
    const page = "Analytics";
    const searchBar = false;
    const chartRef = useRef();
    const [loading, setLoading] = useState(false);
    const [topBooksAvg, setTopBooksAvg] = useState([]);
    const [studentcount, setStudentCount] = useState(0);
    const [booksCount, setBooksCount] = useState(0);
    const [topBooks, setTopBooks] = useState([]);
    const [allBooks, setAllBooks] = useState([]);
    const [sectionReads, setSectionReads] = useState([]);
    const [participationRate, setParticipationRate] = useState([]);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('users'));
    if (!user) navigate(-1);

    useEffect(() => {
        setLoading(true);

        Promise.all([
            axios.get('https://brailliantweb.onrender.com/api/allbooks'),
            axios.get('https://brailliantweb.onrender.com/api/students/count'),
            axios.get('https://brailliantweb.onrender.com/api/books/count'),
            axios.get('https://brailliantweb.onrender.com/api/books/ranked'),
            axios.get(`https://brailliantweb.onrender.com/reads-per-section/${user?._id}`),
            axios.get('https://brailliantweb.onrender.com/top-books-avg'),
            axios.get(`https://brailliantweb.onrender.com/participation-rate/${user?._id}`)
        ])
            .then(([allBooksRes, studentRes, bookRes, rankedRes, sectionRes, avgRes, partRes]) => {
                const books = allBooksRes.data.books || allBooksRes.data;
                const sortedBooks = [...books].sort((a, b) => b.book_count - a.book_count);
                setAllBooks(sortedBooks);
                setStudentCount(studentRes.data.count);
                setBooksCount(bookRes.data.count);
                setTopBooks(rankedRes.data);
                setSectionReads(sectionRes.data);
                setTopBooksAvg(avgRes.data);
                setParticipationRate(partRes.data);
            })
            .catch(err => console.error("Error loading analytics:", err))
            .finally(() => setLoading(false));
    }, []);


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
                backgroundColor: 'rgba(16, 23, 52)',
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

    const topFiveBooks = allBooks.slice(0, 5);
    const others = allBooks.slice(5);
    const othersCount = others.reduce((sum, book) => sum + (book.book_count || 0), 0);
    const othersLabel = others.length > 0 ? `Others (${others.length} books)` : null;

    const doughnutData = {
        labels: [
            ...topFiveBooks.map(book => `${book.book_count} ${book.book_title}`),
            ...(othersLabel ? [othersLabel] : [])
        ],
        datasets: [
            {
                data: [
                    ...topFiveBooks.map(book => book.book_count),
                    ...(othersLabel ? [othersCount] : [])
                ],
                backgroundColor: [
                    '#FF6B6B',
                    '#4ECDC4',
                    '#FFD93D',
                    '#1A73E8',
                    '#9C27B0',
                    ...(othersLabel ? ['#CCCCCC'] : [])
                ],
                borderWidth: 1,
            },
        ],
    };

    const doughnutOptions = {
        plugins: {
            legend: {
                display: true,
                position: 'right',
                align: 'center',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    boxWidth: 10,
                    padding: 15,
                    font: { size: 12 },
                },
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.parsed;
                        return `${label}: ${value} accesses`;
                    },
                },
            },
        },
        maintainAspectRatio: false,
        responsive: true,
    };

    const handleExportPDF = async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            const chartCanvas = chartRef.current?.querySelector("canvas");
            if (!chartCanvas) {
                alert("Chart not ready. Please try again.");
                return;
            }

            const canvas = await html2canvas(chartCanvas, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            const chartBase64 = canvas.toDataURL("image/png");

            const totalAccess = topBooks.reduce((sum, b) => sum + b.book_count, 0);

            const html = generateAnalyticsReportHtml(allBooks, topBooksAvg, totalAccess, chartBase64);

            const pdf = new jsPDF("p", "pt", "a4");
            const now = new Date();
            const dateStr = `${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${now.getFullYear()}`;
            const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
            const fileName = `analytics_report_${dateStr}_${timeStr}.pdf`;

            // Render HTML into PDF
            pdf.html(html, {
                callback: function (pdf) {
                    pdf.save(fileName);
                },
                x: 20,
                y: 20,
                width: 560,
                windowWidth: 800,
            });

        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Error generating PDF report");
        }
    };


    return (
        <div className='container'>
            {loading && (
                <Loading />
            )}
            <SideNavigation />
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
                                                    <span>{index + 1}. {book.book_title}</span>  {book.book_count} sessions
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
                        <div
                            ref={chartRef}
                            style={{
                                position: 'absolute',
                                left: '-9999px',
                                top: 0,
                                width: '700px', // wider for legend on right
                                height: '400px', // taller for balance
                                padding: '20px',
                                backgroundColor: '#fff',
                                pointerEvents: 'none',
                            }}
                        >
                            <Doughnut data={doughnutData} options={doughnutOptions} />
                        </div>


                        <div className='export-btn'>
                            <button className='export-analytics' onClick={handleExportPDF}>
                                Export as PDF
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
