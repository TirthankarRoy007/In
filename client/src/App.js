import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [downloadLink, setDownloadLink] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    try {
      const formData = new FormData();
      formData.append('video', selectedFile);

      const response = await axios.post(process.env.UPLOAD, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const { videoPath, captions } = response.data;
      setDownloadLink(videoPath);

      console.log(captions);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownload = () => {
    window.open(downloadLink, '_blank');
  };

  return (
    <div>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <button onClick={handleFileUpload}>Upload and Process</button>
      {downloadLink && <button onClick={handleDownload}>Download Processed Video</button>}
    </div>
  );
}

export default App;
