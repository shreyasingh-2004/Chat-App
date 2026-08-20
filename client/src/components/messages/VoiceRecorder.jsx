import { useRef, useState } from "react";
import { Mic, Square } from "lucide-react";

const VoiceRecorder = ({ onRecordingComplete, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        // Stop the microphone
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        if (blob.size > 0) {
          onRecordingComplete(blob, mimeType);
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access denied:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <button
      type="button"
      tabIndex="-1"
      disabled={disabled}
      onClick={isRecording ? stopRecording : startRecording}
      title={isRecording ? "Stop recording" : "Record voice message"}
      className={`composer-tool ${isRecording ? "text-red-500 animate-pulse" : ""}`}
    >
      {isRecording ? (
        <Square className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </button>
  );
};

export default VoiceRecorder;