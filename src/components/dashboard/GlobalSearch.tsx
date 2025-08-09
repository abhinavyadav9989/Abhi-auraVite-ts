import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Search, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";

const useVoiceSearch = (onResult) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-IN';
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [onResult]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsListening(!isListening);
  };

  return { isListening, toggleListening };
};

export default function GlobalSearch({ onSearch }) {
  const [query, setQuery] = useState("");
  
  const handleVoiceResult = (transcript) => {
    setQuery(transcript);
    onSearch(transcript); // Optionally trigger search immediately
  };

  const { isListening, toggleListening } = useVoiceSearch(handleVoiceResult);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative max-w-md w-full">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
      <Input
        type="text"
        placeholder="Search vehicles, deals, or say '2022 Swift Dzire'"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-10 pr-12 bg-slate-50 border-slate-200 focus:bg-white"
      />
      <Button 
        type="button" 
        variant="ghost" 
        size="icon" 
        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
        onClick={toggleListening}
      >
        {isListening ? (
          <MicOff className="w-4 h-4 text-red-500 animate-pulse" />
        ) : (
          <Mic className="w-4 h-4 text-slate-500 hover:text-blue-600" />
        )}
      </Button>
    </form>
  );
}