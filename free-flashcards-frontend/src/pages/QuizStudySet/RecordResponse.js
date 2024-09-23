import { useRef, useState } from 'react';

export default function RecordResponse({setAudioData}) {

    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState(null);
    const mediaRecorder = useRef(null);
    const audioData = useRef([]);
  
    // Function to handle audio data availability, this is invoked once recording is complete
    function handleDataAvailable(event) { 
        audioData.current.push(event.data);
    }
  
    // Invoked when recording stops, this creates a URL that can be used to display the recorded audio
    function handleRecordingStop() {
        // creating a new audio URL for the recorded data
        const audioBlob = new Blob(audioData.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setAudioData(url);
        
        audioData.current = []; // we reset the audio data in case we need to record again
    }
  
    // handles beginning recording audio by initializing a MediaRecorder and its event handlers
    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);
  
            // defining the recorder's event handers for when recording stops
            mediaRecorder.current.ondataavailable = handleDataAvailable;
            mediaRecorder.current.onstop = handleRecordingStop;
  
            mediaRecorder.current.start();
            setIsRecording(true);
        } catch (error) {
            alert("Could not access the microphone. Please grant permission to use the microphone to record responses");
        }
    }
  
    function stopRecording() {
        mediaRecorder.current.stop();
        setIsRecording(false);
    }
  
    return (
      <div>
        <button onClick={isRecording ? stopRecording : startRecording}>
            {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        <br/>
        {audioURL === null ? <></> : <audio controls="controls" src={audioURL}/>}
      </div>
    )
  }