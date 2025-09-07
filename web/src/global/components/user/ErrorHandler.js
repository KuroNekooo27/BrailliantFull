import React from 'react'
import './ErrorHandler.css'

export default function ErrorHandler({ message, onClose }) {
    return (
        <div className='error-overlay'>
            <div className='error-handler-container'>
                <label className='error-head'>{message}</label>

                <button className='error-exit' onClick={onClose}>Close</button>
            </div>
        </div>
    )
}
