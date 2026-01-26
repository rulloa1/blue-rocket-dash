import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { createClient, LiveTranscriptionEvents, type LiveClient } from "@deepgram/sdk";

export const DeepgramVoiceAgent = () => {
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const connectionRef = useRef<LiveClient | null>(null);
  const microphoneRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    return () => {
        // Cleanup on unmount
        if (isListening) {
            stopListening();
        }
    }
  }, [isListening]);

  const startListening = async () => {
    setIsLoading(true);
    try {
      // 1. Get token
      const { data, error } = await supabase.functions.invoke('deepgram-token');
      
      if (error) {
        console.error("Supabase function error:", error);
        throw new Error("Failed to get API key from server");
      }
      
      if (!data?.key) {
         throw new Error("No API key returned from server");
      }

      const deepgram = createClient(data.key);
      
      // 2. Setup microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      microphoneRef.current = mediaRecorder;

      // 3. Connect to Deepgram
      const conn = deepgram.listen.live({
        model: "nova-2",
        language: "en-US",
        smart_format: true,
      });

      conn.on(LiveTranscriptionEvents.Open, () => {
        connectionRef.current = conn;
        setIsListening(true);
        setIsLoading(false);
        
        mediaRecorder.addEventListener("dataavailable", (event) => {
          if (event.data.size > 0 && conn.getReadyState() === 1) {
            conn.send(event.data);
          }
        });
        
        mediaRecorder.start(100);
        toast({
          title: "Connected",
          description: "Voice agent connected. Start speaking.",
        });
      });

      conn.on(LiveTranscriptionEvents.Transcript, (data) => {
         // Use optional chaining for safe access
         const transcript = data.channel?.alternatives?.[0]?.transcript;
         if (transcript && data.is_final) {
             toast({
               title: "Transcript",
               description: "You said: " + transcript,
             });
         }
      });
      
      conn.on(LiveTranscriptionEvents.Error, (err) => {
        console.error(err);
        toast({
          title: "Error",
          description: "Deepgram connection error",
          variant: "destructive"
        });
        stopListening();
      });
      
      conn.on(LiveTranscriptionEvents.Close, () => {
          // stopListening(); // Don't call this here to avoid recursion loops if close triggers something
          setIsListening(false);
      });

    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to start voice agent. Check console.",
        variant: "destructive"
      });
      setIsLoading(false);
      // Ensure cleanup if start fails
      if (microphoneRef.current) {
          microphoneRef.current.stop();
      }
    }
  };

  const stopListening = () => {
    if (microphoneRef.current && microphoneRef.current.state !== 'inactive') {
      microphoneRef.current.stop();
      microphoneRef.current.stream.getTracks().forEach(track => track.stop());
    }
    if (connectionRef.current) {
      connectionRef.current.finish();
      connectionRef.current = null;
    }
    setIsListening(false);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={isListening ? stopListening : startListening}
        disabled={isLoading}
        className={`rounded-full w-14 h-14 shadow-lg flex items-center justify-center transition-colors ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'}`}
      >
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin text-white" />
        ) : isListening ? (
          <MicOff className="h-6 w-6 text-white" />
        ) : (
          <Mic className="h-6 w-6 text-white" />
        )}
      </Button>
    </div>
  );
};
