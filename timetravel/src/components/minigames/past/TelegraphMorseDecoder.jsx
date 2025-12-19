
import React, { useState, useEffect, useRef } from 'react';
import { MiniGameBase } from '../EnhancedMiniGameBase';

const MORSE_CODE = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---', 
  '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', 
  '8': '---..', '9': '----.'
};

export const TelegraphMorseDecoder = ({
  title = "Telegraph Decoder",
  timeline = "past",
  difficulty = "medium"
}) => {
  const [currentWord, setCurrentWord] = useState("STEAM");
  const [userInput, setUserInput] = useState("");
  const [morseDisplay, setMorseDisplay] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'correct', 'wrong'

  const words = ["TRAIN", "COAL", "GEAR", "IRON", "TIME", "WATT", "BELL", "SHIP"];

  useEffect(() => {
    generateNewWord();
  }, []);

  const generateNewWord = () => {
    const word = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(word);
    setUserInput("");
    setMorseDisplay(word.split('').map(char => ({
        char,
        code: MORSE_CODE[char],
        revealed: false
    })));
  };

  const handleInput = (char) => {
    if (userInput.length < currentWord.length) {
        const newInput = userInput + char;
        setUserInput(newInput);
        
        // Auto-check if full word entered
        if (newInput.length === currentWord.length) {
            if (newInput === currentWord) {
                setFeedback('correct');
                setTimeout(() => {
                    setFeedback(null);
                    generateNewWord();
                }, 1000);
            } else {
                setFeedback('wrong');
                setTimeout(() => {
                    setFeedback(null);
                    setUserInput("");
                }, 1000);
            }
        }
    }
  };

  const playMorseSound = () => {
    // Visual only for this implementation, but simulates "playing"
    setIsPlaying(true);
    let delay = 0;
    
    currentWord.split('').forEach((char, idx) => {
        const code = MORSE_CODE[char];
        
        // Highlight logic simulation
        setTimeout(() => {
            setMorseDisplay(prev => prev.map((item, i) => i === idx ? {...item, active: true} : {...item, active: false}));
        }, delay);

        delay += 1000;
    });

    setTimeout(() => {
        setIsPlaying(false);
        setMorseDisplay(prev => prev.map(item => ({...item, active: false})));
    }, delay);
  };

  return (
    <MiniGameBase
      title={title}
      timeline={timeline}
      instructions="Translate the Morse Code signals into letters. Watch the sequence and type the word."
      objective="Decode as many words as possible."
      scoring="+100 points per correct word."
      duration={60}
      difficulty={difficulty}
    >
      <div className="w-full h-full flex flex-col items-center justify-center p-4">
        
        {/* Morse Paper Tape Display */}
        <div className="bg-[#f0e6d2] text-black font-mono text-2xl p-6 rounded shadow-inner w-full text-center tracking-widest mb-8 border-4 border-[#8B4513] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-black/10"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-black/10"></div>
            
            <div className="flex justify-center gap-8">
                {morseDisplay.map((item, idx) => (
                    <div key={idx} className={`flex flex-col items-center transition-all duration-300 ${item.active ? 'scale-125 text-amber-800 font-bold' : 'opacity-70'}`}>
                        <div className="text-3xl mb-2">{item.code}</div>
                        {/* Hidden letter for difficulty, could be toggled */}
                        <div className="text-sm text-gray-500 opacity-50">?</div> 
                    </div>
                ))}
            </div>
        </div>

        {/* Input Display */}
        <div className="mb-8 flex gap-2">
            {currentWord.split('').map((_, idx) => (
                <div key={idx} className={`w-12 h-16 border-b-4 flex items-center justify-center text-3xl font-bold bg-gray-900 rounded-t
                    ${feedback === 'correct' ? 'border-green-500 text-green-400' : 
                      feedback === 'wrong' ? 'border-red-500 text-red-400' : 'border-gray-500 text-white'}`}>
                    {userInput[idx] || ""}
                </div>
            ))}
        </div>

        {/* Keyboard */}
        <div className="grid grid-cols-7 gap-2 max-w-2xl">
            {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('').map(char => (
                <button
                    key={char}
                    onClick={() => handleInput(char)}
                    className="p-3 bg-gray-800 hover:bg-gray-700 rounded text-white font-bold shadow active:translate-y-1 active:shadow-none transition-all border-b-4 border-gray-900"
                >
                    {char}
                </button>
            ))}
            <button 
                onClick={() => setUserInput(prev => prev.slice(0, -1))}
                className="col-span-2 p-3 bg-red-900 hover:bg-red-800 rounded text-white font-bold border-b-4 border-red-950"
            >
                DEL
            </button>
        </div>
        
        <div className="mt-6 flex gap-4">
             <div className="text-xs text-gray-500 border border-gray-700 p-2 rounded">
                Ref: A(.-) B(-...) C(-.-.) D(-..) E(.) S(...) T(-) O(---)
             </div>
        </div>

      </div>
    </MiniGameBase>
  );
};

