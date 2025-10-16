import React, { useState, useEffect } from 'react';
import './TextToBraille.css'
import './UploadModal.css'
import BrailleLetter from "./index";
import Header from '../../../../global/components/user/Header';
import convertTextToBrailleDots from "../components/api/translate";
import axios from "axios";
import SideNavigation from '../../../../global/components/user/SideNavigation';
import Loading from '../../../../global/components/user/Loading';
import ErrorHandler from "../../../../global/components/user/ErrorHandler";
import { useDevice } from "../../devide settings/context/DeviceContext";

export default function TextToBraille() {

    const { characteristic, isConnected } = useDevice();

    const page = "Text-to-Braille";
    const searchBar = false;

    const [text, setText] = useState("hello");
    const [loading, setLoading] = useState(false);
    const [brailleDots, setBrailleDots] = useState("");

    const [uploadModal, setUploadModal] = useState(false);
    const [file, setFile] = useState(null);
    const [speedModal, setSpeedModal] = useState(false);

    const [errorHandler, setErrorHandler] = useState(false);
    const [message, setMessage] = useState('');

    const [brailleSeconds, setBrailleSeconds] = useState(1750);


    // const toArduino = async () => {
    //     if (!isConnected || !characteristic) {
    //         setMessage("Make sure device is connected.");
    //         setErrorHandler(true);
    //         return;
    //     }

    //     const plainText = text.toLowerCase().replace(/[^a-z]/g, '');
    //     try {
    //         const encoder = new TextEncoder();
    //         await characteristic.writeValue(encoder.encode(plainText));
    //         console.log("Sent:", plainText);
    //     } catch (err) {
    //         setMessage("Failed to send data to device.");
    //         setErrorHandler(true);
    //     }
    // };

    const toArduino = async () => {
        if (!isConnected || !characteristic) {
            setMessage("Make sure device is connected.");
            setErrorHandler(true);
            return;
        }

        const plainText = text.toLowerCase().replace(/[^a-z]/g, '');
        if (!plainText) return;

        try {
            const data = new TextEncoder().encode(plainText + "|" + brailleSeconds + "\n");

            if (characteristic.properties?.writeWithoutResponse) {
                await characteristic.writeValueWithoutResponse(data);
            } else {
                await characteristic.writeValue(data);
            }
            console.log("Sent:", plainText);
        } catch (err) {
            console.error("Send error:", err);
            setMessage("Failed to send data to device.");
            setErrorHandler(true);
        }
    };


    const handleTranslate = (txt) => {
        const result = convertTextToBrailleDots(txt);
        setBrailleDots(result);
    };

    useEffect(() => {
        console.log(isConnected)
        handleTranslate(text);
    }, [text]);

    const toggleUploadModal = () => {
        setUploadModal(!uploadModal);
        setFile(null);
    };

    const handleConvertToBrf = async () => {
        if (!file) {
            setMessage("Please attach a PDF file first.");
            setErrorHandler(true);
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        // const toArduino = () => {
        //     const result = convertTextToBrailleDots(text);
        //     setBrailleDots(result);

        //     const brailleArray = result.split(" ");
        //     const formatted = brailleArray.map((dots, index) => `M${index + 1}:${dots}`).join('\n');

        //     if (formatted.length != 0) {
        //         try {
        //             axios.post('https://brailliantweb.onrender.com/send-text', {
        //                 message: formatted
        //             });
        //         } catch (error) {
        //             setMessage("Make sure device is connected.");
        //             setErrorHandler(true)
        //         }
        //     }
        // }

        try {
            const response = await axios.post(
                'https://brailliantweb-6bwq.onrender.com/upload-pdf-to-brf',
                formData,
                {
                    responseType: 'blob',
                    headers: { 'Content-Type': 'multipart/form-data' }
                }
            );

            const originalName = file.name.replace(/\.pdf$/i, "");
            const brfFileName = `${originalName}.brf`;

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', brfFileName);
            document.body.appendChild(link);
            link.click();
            link.remove();

            setUploadModal(false);
            setFile(null);
        } catch (error) {
            setMessage("Failed to convert PDF to BRF.");
            setErrorHandler(true);
        } finally {
            setLoading(false);
        }
    };

    const toggleErrorHandlerModal = () => setErrorHandler(!errorHandler);
    const toggleSpeedModal = () => setSpeedModal(!speedModal);

    return (
        <div className='container'>
            {loading && <Loading />}
            {errorHandler && (
                <ErrorHandler message={message} onClose={toggleErrorHandlerModal} />
            )}
            {uploadModal && (
                <div className='modal'>
                    <div className='overlay' onClick={toggleUploadModal}></div>
                    <div className='upload-modal-content'>
                        <button className='close-modal' onClick={toggleUploadModal}>x</button>
                        <div className='upload-modal'>
                            <label htmlFor="file-upload" className="brf-file-upload">
                                {file ? file.name : "Attach file here"}
                            </label>
                            <input
                                id="file-upload"
                                type="file"
                                accept="application/pdf"
                                required
                                onChange={(e) => setFile(e.target.files[0])}
                            />
                            <button className='convert-btn' onClick={handleConvertToBrf}>
                                Convert to BRF
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {speedModal && (
                <div className='speed-modal'>
                    <div className='speed-overlay'>
                        <div className='speed-modal-content'>
                            <div className='speed'>
                                <label className='speed-head'>Adjust Braille Speed</label>
                                <input
                                    type="range"
                                    id="my-range-slider"
                                    min="500"
                                    max="5000"
                                    step="50"
                                    value={brailleSeconds}
                                    onChange={(e) => {
                                        const value = Number(e.target.value);
                                        setBrailleSeconds(value);
                                    }}
                                />
                                <label>
                                    Current Speed: {brailleSeconds}
                                </label>
                                <button className='speed-btn' onClick={toggleSpeedModal}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div>
                <SideNavigation />
            </div>
            <div className='ttb-container'>
                <div className='ttb-header'>
                    <Header page={page} searchBar={searchBar} />
                </div>
                <div className='ttb-body'>
                    <div className='ttb-top'>
                        <div className='ttb-text'>
                            <label>Text-to-Braille</label>
                            <p>Type and sync in simple Braille sentences with the Brailliant RBD!</p>
                        </div>
                        <div>
                            <button className='brf-btn' onClick={toggleUploadModal}>
                                <img src={require('../assets/upload.png')} alt="upload" />
                                PDF to BRF
                            </button>
                        </div>
                    </div>
                    <div className='ttb-translate'>
                        <textarea
                            placeholder='Input text here'
                            className='custom'
                            value={text}
                            onChange={(e) => {
                                if (e.target.value.length <= 8) {
                                    setText(e.target.value);
                                }
                            }}
                            type="text"
                            id="text"
                            name="text"
                        />
                        <div className='ttb-preview'>
                            {brailleDots.split(" ").map((word, index) => (
                                <BrailleLetter key={index} dots={word} />
                            ))}
                        </div>
                    </div>
                    <label className='char-limit'>{text.length} / 8 characters</label>

                    <button className='ttb-syc' onClick={toArduino}>
                        <img src={require('../assets/sync.png')} alt="sync" />
                        Sync Text
                    </button>
                    <button className='ttb-syc'>Adjust Braille Speed</button>
                </div>
            </div>
        </div>
    );
}


