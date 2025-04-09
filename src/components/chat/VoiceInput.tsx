import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { backendURL } from "../../utils/constants";
import { FiMic, FiMicOff } from "react-icons/fi";

interface VoiceInputProps {
  onTranscriptionReceived: (text: string) => void;
  disabled?: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscriptionReceived,
  disabled = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animationRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  console.log(audioBlob);

  // Set up audio visualization
  const setupAudioVisualization = (stream: MediaStream) => {
    if (!canvasRef.current) return;

    // Create audio context
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;

    // Create analyser node
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    // Connect stream to analyser
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    sourceRef.current = source;

    // Start visualization
    visualize();
  };

  // Visualize audio
  const visualize = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!ctx) return;

      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      // Draw circular visualization
      ctx.fillStyle = "rgba(0, 0, 0, 0)";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      const centerX = WIDTH / 2;
      const centerY = HEIGHT / 2;
      const radius = Math.min(WIDTH, HEIGHT) / 2 - 10;

      // Draw background circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(99, 102, 241, 0.1)";
      ctx.fill();

      // Draw audio wave
      const barCount = 80;
      const barWidth = (2 * Math.PI) / barCount;

      for (let i = 0; i < barCount; i++) {
        const barIndex = Math.floor((i / barCount) * bufferLength);
        const barHeight =
          (dataArray[barIndex] / 255) * radius * 0.5 + radius * 0.5;

        const angle = i * barWidth;
        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * barHeight;
        const y2 = centerY + Math.sin(angle) * barHeight;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(99, 102, 241, ${dataArray[barIndex] / 255})`;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    };

    draw();
  };

  // Toggle recording
  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        streamRef.current = stream;

        setupAudioVisualization(stream);

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        // Reset audio chunks
        audioChunksRef.current = [];

        // Listen for data available
        mediaRecorder.ondataavailable = (e) => {
          audioChunksRef.current.push(e.data);
        };

        // When recording stops
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/wav",
          });
          setAudioBlob(audioBlob);

          // Clean up
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
          }

          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
          }

          if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
          }

          // Auto-send the audio for transcription
          sendAudioForTranscription(audioBlob);
        };

        // Start recording
        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Error accessing microphone:", err);
      }
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Send audio for transcription
  const sendAudioForTranscription = async (blob: Blob) => {
    if (!blob) return;

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", blob, "recording.wav");

      const response = await axios.post(
        `${backendURL}/api/transcribe-audio`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data && response.data.transcription) {
        // Pass transcribed text to parent component
        onTranscriptionReceived(response.data.transcription);
      }
    } catch (err) {
      console.error("Error transcribing audio:", err);
    } finally {
      setIsProcessing(false);
      setAudioBlob(null);
    }
  };

  // Effect to handle cleanup
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="relative flex items-center">
      {/* Canvas for visualization */}
      <div
        className={`relative w-10 h-10 mr-2 flex-shrink-0 ${
          isRecording ? "animate-pulse" : ""
        }`}
      >
        <canvas
          ref={canvasRef}
          width={48}
          height={48}
          className="absolute inset-0 w-full h-full"
        />
        <button
          onClick={toggleRecording}
          disabled={disabled || isProcessing}
          className={`absolute inset-0 rounded-full flex items-center justify-center focus:outline-none transition-all duration-200 ${
            isRecording
              ? "bg-red-500 !text-white shadow-lg"
              : "bg-indigo-600 !text-white hover:bg-indigo-700"
          } ${disabled || isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
          title={isRecording ? "Stop recording" : "Start recording"}
        >
          {isRecording ? <FiMicOff size={20} /> : <FiMic size={20} />}
        </button>
      </div>
    </div>
  );
};

export default VoiceInput;
