import React, { useState, useEffect } from 'react';
import './Home.css'
import SideNavigation from '../../../../global/components/user/SideNavigation'
import DashboardHeader from '../../../../global/components/user/DashboardHeader'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);


export default function Home() {
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem("users"));

    const [topBooks, setTopBooks] = useState([]);

    useEffect(() => {
        axios.get('https://brailliantweb.onrender.com/api/books/ranked')
            .then((response) => {
                setTopBooks(response.data);
                console.log(response.data)
            })
    }, [])

    const chartData = {
        labels: topBooks.slice(0, 5).map(book => book.book_title),
        datasets: [
            {
                data: topBooks.slice(0, 5).map(book => book.book_count),
                backgroundColor: [
                    '#FFD700',
                    '#FF7F50',
                    '#9370DB',
                    '#1E90FF',
                    '#32CD32'
                ],
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        plugins: {
            legend: {
                display: false,
            },
        },
    };


    return (
        <div className='container'>
            <SideNavigation />
            <div className='home-container'>
                <DashboardHeader />
                <div className='home-body'>
                    <div className='home-braille-char'>
                        <label className='braillechar'>Braille Characters</label>
                        <div className='home-braille-1' onClick={() => navigate("/braille/1")}>
                            <div className='home-modules'>
                                <img src={require('../assets/Module 1.png')} />
                                <img src={require('../assets/Module 2.png')} />
                            </div>
                            <div className='home-text'>
                                <label className='t1'>Grade 1 Braille</label>
                                <label className='t3'>Grade 1 - Braille Material</label>
                            </div>
                        </div>
                        <div className='home-braille-2' onClick={() => navigate("/braille/2")}>
                            <div className='home-modules'>
                                <img src={require('../assets/Module 1.png')} />
                                <img src={require('../assets/Module 3.png')} />
                            </div>
                            <div className='home-text'>
                                <label className='t1'>Grade 2 Braille</label>
                                <label className='t3'>Grade 2 - Braille Material</label>
                            </div>
                        </div>
                    </div>
                    <div className='home-braille-books'>
                        <label className='braillechar'>Books</label>
                        <div className='home-top-books'>
                            <div>
                                <label>Top Books</label>
                                <div className='home-books'>
                                    {topBooks.length > 0 && (
                                        <img
                                            src={topBooks[0].book_img}
                                            alt={topBooks[0].book_title}
                                            className={`top-book-image ${!user.isActivated ? "disabled-book" : ""}`}
                                            onClick={() => {
                                                if (user.isActivated) {
                                                    navigate('/book/detail', { state: { book: topBooks[0] } });
                                                }
                                            }}
                                        />
                                    )}
                                    <div>
                                        <ul className="home-top-books-list">
                                            {topBooks.length > 0 ? (
                                                topBooks.map((book, index) => (
                                                    <li
                                                        key={book._id}
                                                        className={!user.isActivated ? "disabled-book" : ""}
                                                        onClick={() => {
                                                            if (user.isActivated) {
                                                                navigate('/book/detail', { state: { book } });
                                                            }
                                                        }}
                                                    >
                                                        <span>{index + 1}. {book.book_title}</span>
                                                    </li>
                                                ))
                                            ) : (
                                                <li>No data available</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label>Categories</label>
                                <div className='home-categories'>
                                    <ul className="chart-legend">
                                        {topBooks.slice(0, 5).map((book, index) => (
                                            <li key={book._id}>
                                                <span
                                                    className="legend-color"
                                                    style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}
                                                ></span>
                                                {book.book_title}
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="chart-container">
                                        <Doughnut data={chartData} options={chartOptions} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}
