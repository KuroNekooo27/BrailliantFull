import React, { useState, useEffect } from 'react';
import './TextToBraille.css'
import './UploadModal.css'
import BrailleLetter from "./index";
import Header from '../../../../global/components/user/Header';
import convertTextToBrailleDots from "../components/api/translate";
import axios from "axios"
import SideNavigation from '../../../../global/components/user/SideNavigation'

export default function TextToBraille() {
    const page = "Text-to-Braille"
    const searchBar = false

    const [text, setText] = useState("hello");
    const [loading, setLoading] = useState(false);
    const [brailleDots, setBrailleDots] = useState("");

    const [uploadModal, setUploadModal] = useState(false)
    const [file, setFile] = useState(false)



    const toArduino = () => {
        const result = convertTextToBrailleDots(text);
        setBrailleDots(result);

        const brailleArray = result.split(" ");
        const formatted = brailleArray.map((dots, index) => `M${index + 1}:${dots}`).join('\n');

        if (formatted.length != 0) {
            axios.post('https://brailliantweb.onrender.com/send-text', {
                message: formatted
            });
            console.log("hello")
        }
    }
    
    const handleTranslate = (text) => {
        setText(text)
        setLoading(true);
        const result = convertTextToBrailleDots(text);
        setBrailleDots(result);
        setLoading(false);
    }


    useEffect(() => {
        const result = convertTextToBrailleDots(text);
        setBrailleDots(result);
    }, [])

    const toggleUploadModal = () => {
        setUploadModal(!uploadModal)
        setFile(false)
    }


    ///////////////

    const handleConvertToBrf = async () => {
        if (!file) {
            alert('Please attach a PDF file first.');
            return;
        }
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(
                'https://brailliantweb-6bwq.onrender.com/upload-pdf-to-brf',
                formData,
                {
                    responseType: 'blob',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
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
            setFile(false);

        } catch (error) {
            console.error("Error converting file to BRF:", error);
            alert('Failed to convert the PDF to BRF.');
        }
    };

    return (
        <>
            <div className='container'>
                {uploadModal && (
                    <div className='modal'>
                        <div className='overlay' onClick={toggleUploadModal} ></div>
                        <div className='upload-modal-content'>
                            <button className='close-modal' onClick={toggleUploadModal}>x</button>
                            <div className='upload-modal'>
                                <label htmlFor="file-upload" className="brf-file-upload">
                                    {file.name ? file.name : "Attach file here"}
                                </label>
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept='application/pdf'
                                    required
                                    onChange={(e) => setFile(e.target.files[0])}
                                />
                                <button className='convert-btn' onClick={handleConvertToBrf}>Convert to BRF</button>
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
                                <button className='brf-btn' onClick={toggleUploadModal}><img src={require('../assets/upload.png')} />PDF to BRF</button>
                            </div>
                        </div>
                        <div className='ttb-translate'>
                            <textarea
                                placeholder='Input text here'
                                className='custom'
                                value={text}
                                onChange={(e) => {
                                    if (e.target.value.length <= 8) {
                                        handleTranslate(e.target.value)
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
                        <button className='ttb-syc' onClick={() => toArduino()}><img src={require('../assets/sync.png')} />Sync Text</button>
                    </div>
                </div>
            </div>
        </>

    )
}
