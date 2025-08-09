import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, CheckCircle } from "lucide-react";

// LS-01: Enhanced for sun-friendly overlay and sound/vibration
const SHOT_CHECKLIST = [
  { id: 'front', name: 'Front View', icon: '🚗' },
  { id: 'rear', name: 'Rear View', icon: '🚙' },
  { id: 'left', name: 'Left Side', icon: '🚘' },
  { id: 'right', name: 'Right Side', icon: '🚖' },
  { id: 'interior', name: 'Interior', icon: '🪑' },
  { id: 'dashboard', name: 'Dashboard', icon: '⚡' }
];

export default function MobileCameraCapture({ onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedShots, setCapturedShots] = useState([]);
  const [activeShot, setActiveShot] = useState(SHOT_CHECKLIST[0].id);
  const audioRef = useRef(null); // For shutter sound

  useEffect(() => {
    // Initialize shutter sound
    audioRef.current = new Audio('/shutter-sound.mp3'); // Ensure this file exists in public folder
    
    // Initialize camera
    const getCameraStream = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" } // Prioritize rear camera
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        alert("Could not access the camera. Please check permissions.");
      }
    };

    getCameraStream();

    return () => {
      // Cleanup: stop camera stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      
      canvas.toBlob(blob => {
        onCapture(blob, activeShot); // Pass blob and shot type to parent
        setCapturedShots(prev => [...prev, activeShot]);

        // LS-01: Play shutter sound
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.log('Audio play failed:', e));
        }
        
        // LS-01 bonus: Vibrate on success
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }

        // Move to the next shot
        const currentIndex = SHOT_CHECKLIST.findIndex(s => s.id === activeShot);
        if (currentIndex < SHOT_CHECKLIST.length - 1) {
          setActiveShot(SHOT_CHECKLIST[currentIndex + 1].id);
        } else {
          setActiveShot(null); // All shots done
        }
      }, 'image/jpeg');
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col p-4">
      {/* Sun-friendly Overlay - High contrast */}
      <div className="relative flex-1">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />

        {/* Overlay UI */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 bg-black bg-opacity-20">
          <div className="text-center text-white font-bold text-lg drop-shadow-lg">
            {activeShot ? `Capture: ${SHOT_CHECKLIST.find(s=>s.id===activeShot).name}` : "All Shots Captured!"}
          </div>
          
          <div className="flex justify-center">
            <Button 
              onClick={handleCapture}
              disabled={!activeShot}
              className="w-20 h-20 rounded-full bg-white text-black border-4 border-slate-300 hover:bg-slate-200"
            >
              <Camera className="w-8 h-8" />
            </Button>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="bg-slate-800 p-3 rounded-b-lg">
        <div className="grid grid-cols-3 gap-2">
          {SHOT_CHECKLIST.map(shot => (
            <Button
              key={shot.id}
              variant="ghost"
              size="sm"
              onClick={() => setActiveShot(shot.id)}
              className={`flex items-center justify-start gap-2 text-white ${
                activeShot === shot.id ? 'bg-blue-500' : ''
              }`}
            >
              <span className="text-xl">{shot.icon}</span>
              <span className="text-xs">{shot.name}</span>
              {capturedShots.includes(shot.id) && (
                <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}