'use client'
import { useRef, useEffect, useState } from 'react';

export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);


  const startCamera = async () => {
    try {
      const constraints = {
        video: { facingMode: { exact: "environment" } }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream as MediaStream;
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'OverconstrainedError') {
        console.warn("Back camera not available, switching to any available camera.");
        try {
          const fallbackConstraints = {
            video: true // Use any available camera
          };
          const stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
          if (videoRef.current) {
            videoRef.current.srcObject = stream as MediaStream;
          }
        } catch (fallbackErr) {
          console.error("Error accessing any camera: ", fallbackErr);
        }
      } else {
        console.error("Error accessing camera: ", err);
      }
    }
  };

  const captureImage = async () => {
    if (videoRef.current && canvasRef.current) {
        const context = canvasRef.current.getContext('2d');
        if (context) {
          setShowOverlay(true);
          context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
          const dataUrl = canvasRef.current.toDataURL('image/png');
          uploadImage(dataUrl);
          setTimeout(() => setShowOverlay(false), 500);
        }
    }
  };

  useEffect(() => {
    startCamera();
  }, []);

  const uploadImage = async (dataUrl: string) => {
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
    <div className="relative" style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Capture Image</h1>
      <div>
        <canvas className={`${showOverlay ? "" : "hidden"} w-full h-96`} ref={canvasRef} width="500" height="500"></canvas>
        <video className={`${showOverlay ? "hidden" : ""} w-full h-96`} ref={videoRef} height="500" width="500" autoPlay></video>
      </div>
      <br />
       <button className="text-white bg-red-400" onClick={captureImage} style={{ margin: '20px', padding: '10px 20px', fontSize: '16px' }}>Capture</button>
      <br />
      
    </div>
  );
}
