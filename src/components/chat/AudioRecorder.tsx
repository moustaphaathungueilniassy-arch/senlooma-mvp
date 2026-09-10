'use client';

import { useState, useRef } from 'react';
import { Mic, Square, Loader2, Send } from 'lucide-react';

interface AudioRecorderProps {
  onAudioReady: (audioUrl: string) => void;
}

export default function AudioRecorder({ onAudioReady }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        await uploadAudio(audioBlob);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Erreur d\'accès au microphone:', error);
      alert('Impossible d\'accéder au microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      // Arrêter tous les tracks audio
      mediaRecorder.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const uploadAudio = async (blob: Blob) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload de l\'audio');
      }

      const data = await response.json();
      if (data.url) {
        onAudioReady(data.url);
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'envoi du message vocal');
    } finally {
      setIsUploading(false);
    }
  };

  if (isUploading) {
    return (
      <button disabled className="p-2 text-gray-500 rounded-full bg-gray-100">
        <Loader2 className="w-5 h-5 animate-spin" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={isRecording ? stopRecording : startRecording}
      className={`p-2 rounded-full ${
        isRecording 
          ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse' 
          : 'bg-green-100 text-green-600 hover:bg-green-200'
      }`}
    >
      {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
    </button>
  );
}
