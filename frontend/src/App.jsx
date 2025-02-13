import { useState, useEffect } from "react";

export default function App() {
  const [text, setText] = useState("Hello, this is a text-to-speech app!");
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0].name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const speakText = () => {
    if (!window.speechSynthesis) {
      alert("Your browser does not support text-to-speech.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) utterance.voice = voice;

    window.speechSynthesis.speak(utterance);
  };

  const generateHighQualityAudio = async () => {
    setAudioUrl(null);

    const response = await fetch("http://localhost:5000/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg border border-gray-300">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Text-to-Speech Converter</h1>

        <div className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Enter Text</label>
            <textarea
              className="border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg w-full p-3 resize-none h-28"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text here..."
            ></textarea>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Select Voice</label>
            <select
              className="border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg w-full p-3"
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
            >
              {voices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg w-1/2"
              onClick={speakText}
            >
              Speak (Preview)
            </button>

            <button
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg w-1/2"
              onClick={generateHighQualityAudio}
            >
              Get MP3
            </button>
          </div>

          {audioUrl && (
            <div className="mt-5 text-center">
              <audio controls className="w-full rounded-lg border border-gray-300">
                <source src={audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
              <a
                href={audioUrl}
                download="speech.mp3"
                className="mt-3 inline-block text-blue-600 font-medium underline"
              >
                Download MP3
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}