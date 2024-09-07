import { useState } from 'react';
import axios from 'axios';

export default function FileUploader() {

    const MAX_FILE_SIZE = 500000; // defines maximum file size in bytes

    const [file, setFile] = useState(null);
    const [fileString, setFileString] = useState(null); // contains URL of response file for the browser to display

    function handleUploadChange(event) { // puts files attached to the component's form into the file state variable
        if (event.target.files[0].size > MAX_FILE_SIZE) {
            alert("Attached file is too large. Files be less than 0.5 MB");
            event.target.value = null;
        } else {
            setFile(event.target.files[0]);
        }
    }

    function handleUploadSubmit(event) { // uploads the file attached to the form submission
        event.preventDefault(); // prevents page refresh
        if (file === null) {
            alert("Please attach a file");
            return;
        }
        if (file.name === undefined) {
            alert("Please enter a file name");
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            alert("Attached file is too large. Files must have be less than 0.5 MB");
            return;
        }
        const url = "http://localhost:3001/cards/66cfd27b38e5367fabb70f8f/file" // this is ONLY FOR TESTING and should be modifiable
        const formData = new FormData();
        formData.append("file", file); 
        formData.append("fileName", file.fileName);
        const requestConfiguration = {
            headers: {
              'content-type': 'multipart/form-data', // important to tell the server what is in the request
            },
        };
        console.log(formData);
        axios.post(url, formData, requestConfiguration).then((response) => {
            console.log(response.data);
        }).catch((error) => {
            console.log(error);
        });
    }

    function handleDownloadSubmit(event) {
        event.preventDefault(); // prevents page refresh 
        const url = "http://localhost:3001/cards/66cfd27b38e5367fabb70f8f"
        axios.get(url).then((response) => {
            const fileBase64String = btoa(String.fromCharCode(...new Uint8Array(response.data.file.data.data)));
            setFileString(fileBase64String);
        }).catch((error) => {
            console.log(error);
        })
    }

    let uploadedImage = fileString ? <img src={`data:image/png;base64,${fileString}`} alt="upload"/> : <></>
    return <>
        <form onSubmit={handleUploadSubmit}>
            <input type="text" name="name" placeholder="File Name.." /><br />
            <input type="file" onChange={handleUploadChange}/> <br /> <br />
            <input type="submit" value="Upload File" />
        </form>
        <form onSubmit={handleDownloadSubmit}>
            <input type="submit" value="Download File" />
        </form>
        {uploadedImage}
    </>
}