import React, { useState, useEffect, useRef } from 'react';
import { MiniGameBase } from '../EnhancedMiniGameBase';

const MORSE_CODE = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.',
  G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..',
  M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.',
  S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..'
};

export const TelegraphMorseDecoder = ({
  title = "Telegraph Decoder",
  timeline = "past",
  difficulty = "medium",
  onComplete,
  onClose,
  gameId
}) => {
  const words = ["TRAIN", "COAL", "GEAR", "IRON", "TIME", "WATT", "BELL", "SHIP"];

  const [currentWord, setCurrentWord] = useState("");
  const [userInput, setUserInput] = useState("");
  const [morseDisplay, setMorseDisplay] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [correctCount, setCorrectCount] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  const [isGameOver, setIsGameOver] = useState(false);
  const [success, setSuccess] = useState(false);

  const gameRef = useRef(null);
  const playbackRef = useRef(null);

  /* ===================== WORD ===================== */
  useEffect(() => {
    generateNewWord();
  }, []);

  const generateNewWord = () => {
    const word = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(word);
    setUserInput("");
    setMorseDisplay(
      word.split("").map(char => ({
        char,
        code: MORSE_CODE[char],
        active: false,
        revealed: false
      }))
    );

    setTimeout(playMorseSignal, 400);
  };

  /* ===================== MORSE PLAY ===================== */
  const playMorseSignal = () => {
    if (isPlaying || isGameOver) return;

    clearTimeout(playbackRef.current);
    setIsPlaying(true);

    let delay = 0;

    currentWord.split("").forEach((_, idx) => {
      setTimeout(() => {
        setMorseDisplay(prev =>
          prev.map((item, i) => ({
            ...item,
            active: i === idx
          }))
        );
      }, delay);

      delay += 900;
    });

    playbackRef.current = setTimeout(() => {
      setIsPlaying(false);
      setMorseDisplay(prev => prev.map(i => ({ ...i, active: false })));
    }, delay);
  };

  /* ===================== INPUT ===================== */
  const handleInput = char => {
    if (!gameRef.current?.isGameStarted || isGameOver) return;
    if (userInput.length >= currentWord.length) return;

    const next = userInput + char;
    setUserInput(next);

    if (next.length === currentWord.length) {
      checkWord(next);
    }
  };

  const checkWord = input => {
    if (input === currentWord) {
      setFeedback('correct');
      setCorrectCount(c => c + 1);

      gameRef.current?.addPoints(100, 300, 300, 'perfect');

      // Reveal briefly
      setMorseDisplay(prev =>
        prev.map(item => ({ ...item, revealed: true }))
      );

      setTimeout(() => {
        setFeedback(null);
        if (correctCount + 1 >= 5) {
          triggerSuccess();
        } else {
          generateNewWord();
        }
      }, 1200);
    } else {
      setFeedback('wrong');
      setMistakes(m => m + 1);
      gameRef.current?.addPoints(-20, 300, 300, 'miss');

      setTimeout(() => {
        setFeedback(null);
        setUserInput("");
        if (mistakes + 1 >= 3) {
          triggerFailure();
        }
      }, 1000);
    }
  };

  /* ===================== END STATES ===================== */
  const triggerSuccess = () => {
    if (isGameOver) return;
    setIsGameOver(true);
    setSuccess(true);

    gameRef.current?.addPoints(200, 400, 300, 'perfect');

    setTimeout(() => {
      gameRef.current?.endGame({
        success: true,
        reason: 'signal_decoded'
      });
    }, 2200);
  };

  const triggerFailure = () => {
    if (isGameOver) return;
    setIsGameOver(true);
    setSuccess(false);

    gameRef.current?.addPoints(-100, 400, 300, 'critical');

    setTimeout(() => {
      gameRef.current?.endGame({
        success: false,
        reason: 'signal_lost'
      });
    }, 2200);
  };

  /* ===================== RENDER ===================== */
  return (
    <MiniGameBase
      ref={gameRef}
      title={title}
      timeline={timeline}
      gameId={gameId}
      instructions="Watch the Morse signals and decode the transmitted word."
      objective="Decode 5 correct messages."
      scoring="+100 correct · −20 wrong"
      duration={60}
      difficulty={difficulty}
      onComplete={onComplete}
      onClose={onClose}
    >
      <div className="relative w-full h-full flex flex-col items-center justify-center p-4">

        {/* ===== END OVERLAY ===== */}
        {isGameOver && (
          <div className="absolute inset-0 bg-black/85 z-50 flex flex-col items-center justify-center text-center">
            <h1 className={`text-5xl font-extrabold mb-4 animate-pulse ${success ? 'text-green-400' : 'text-red-500'}`}>
              {success ? '📡 TRANSMISSION DECODED' : '❌ SIGNAL LOST'}
            </h1>
            <p className="text-gray-300 mb-6 max-w-md">
              {success
                ? 'The message is clear. History advances by a single signal.'
                : 'Static overwhelms the line. The message is lost to time.'}
            </p>
            <button
              onClick={onClose}
              className={`px-6 py-3 rounded-lg font-bold ${success ? 'bg-green-600' : 'bg-red-600'}`}
            >
              Exit Timeline
            </button>
          </div>
        )}

        {/* ===== MORSE TAPE ===== */}
        <div className="bg-[#f0e6d2] text-black font-mono text-2xl p-6 rounded shadow-inner w-full max-w-3xl mb-8 border-4 border-[#8B4513]">
          <div className="flex justify-center gap-8">
            {morseDisplay.map((item, idx) => (
              <div
                key={idx}
                className={`flex flex-col items-center transition-all duration-300
                  ${item.active ? 'scale-125 text-amber-800 font-bold' : 'opacity-70'}`}
              >
                <div className="text-3xl mb-2">{item.code}</div>
                <div className="text-sm text-gray-500">
                  {item.revealed ? item.char : '?'}
                </div>
              </div>
            ))}
          </div>
          {isPlaying && (
            <div className="mt-2 text-xs text-amber-700 animate-pulse text-right">
              TRANSMITTING...
            </div>
          )}
        </div>

        {/* ===== INPUT ===== */}
        <div className="mb-8 flex gap-2">
          {currentWord.split("").map((_, i) => (
            <div
              key={i}
              className={`w-12 h-16 border-b-4 flex items-center justify-center text-3xl font-bold bg-gray-900 rounded-t
                ${feedback === 'correct' ? 'border-green-500 text-green-400' :
                  feedback === 'wrong' ? 'border-red-500 text-red-400' :
                  'border-gray-500 text-white'}`}
            >
              {userInput[i] || ""}
            </div>
          ))}
        </div>

        {/* ===== KEYBOARD ===== */}
        <div className="grid grid-cols-7 gap-2 max-w-2xl">
          {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(char => (
            <button
              key={char}
              disabled={isGameOver}
              onClick={() => handleInput(char)}
              className="p-3 bg-gray-800 hover:bg-gray-700 rounded text-white font-bold border-b-4 border-gray-900"
            >
              {char}
            </button>
          ))}
          <button
            disabled={isGameOver}
            onClick={() => setUserInput(p => p.slice(0, -1))}
            className="col-span-2 p-3 bg-red-900 hover:bg-red-800 rounded text-white font-bold border-b-4 border-red-950"
          >
            DEL
          </button>
        </div>

        <div className="mt-6 flex gap-4 text-xs text-gray-500">
          <div>Decoded: {correctCount}/5</div>
          <div>Mistakes: {mistakes}/3</div>
          <button
            disabled={isGameOver}
            onClick={playMorseSignal}
            className="text-amber-500 border border-amber-500 px-2 rounded hover:bg-amber-900"
          >
            Replay Signal
          </button>
        </div>

      </div>
    </MiniGameBase>
  );
};
