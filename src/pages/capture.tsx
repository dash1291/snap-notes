import { useRef } from 'react';

export default function Home() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Error accessing camera: ", err);
    }
  };

  const captureImage = async () => {
    const context = canvasRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    const dataUrl = canvasRef.current.toDataURL('image/png');
    await uploadImage(dataUrl);
  };

  const uploadImage = async (dataUrl) => {
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: dataUrl }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      console.log('Image uploaded successfully:', result);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Capture Image</h1>
      <video ref={videoRef} autoPlay style={{ width: '100%', maxWidth: '500px' }}></video>
      <br />
      <button onClick={startCamera} style={{ margin: '20px', padding: '10px 20px', fontSize: '16px' }}>Start Camera</button>
      <button onClick={captureImage} style={{ margin: '20px', padding: '10px 20px', fontSize: '16px' }}>Capture</button>
      <br />
      <canvas ref={canvasRef} width="500" height="500" style={{ display: 'none' }}></canvas>
    </div>
  );
}
