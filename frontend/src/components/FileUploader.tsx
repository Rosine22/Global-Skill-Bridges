import { ChangeEvent, useState } from 'react';
import axios from 'axios';

function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert('Please select a file first');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFileUrl(`http://localhost:5000${res.data.fileUrl}`);
    } catch (err) {
      console.error(err);
      alert('Error uploading file');
    }
  };

  return (
    <div style={{ marginTop: '40px', textAlign: 'center' }}>
      <input type="file" onChange={handleChange} />
      <button onClick={handleUpload}>Upload</button>

      {fileUrl && (
        <div style={{ marginTop: '20px' }}>
          <p>Uploaded File:</p>
          <img src={fileUrl} alt="uploaded" width="200" />
        </div>
      )}
    </div>
  );
}

export default FileUploader;
