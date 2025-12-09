import React, { useRef, useEffect, useState } from "react";

const FRUITS = ["🍉", "🍌", "🍎", "🍓", "🍊", "🍍"];
const BOMBS = ["💣"];
const FRUIT_SIZE = 48;
const BOMB_SIZE = 48;
const CANVAS_W = 900;
const CANVAS_H = 520;

function randomFruit() {
  return Math.random() < 0.85
    ? { type: "fruit", emoji: FRUITS[Math.floor(Math.random() * FRUITS.length)] }
    : { type: "bomb", emoji: BOMBS[0] };
}

function spawnObject() {
  const obj = randomFruit();
  return {
    ...obj,
    x: Math.random() * (CANVAS_W - FRUIT_SIZE),
    y: CANVAS_H + FRUIT_SIZE,
    vx: (Math.random() - 0.5) * 8,
    vy: -12 - Math.random() * 6,
    sliced: false,
    id: Math.random().toString(36).slice(2),
  };
}

export default function FruitNinjaGame() {
  const canvasRef = useRef();
  const [objects, setObjects] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(59);
  const [combo, setCombo] = useState(0);
  const [slicePath, setSlicePath] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const pointerDownRef = useRef(false);
  const [strokeColor, setStrokeColor] = useState("#091d1fff");

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setObjects((prev) => [...prev, spawnObject()]);
    }, 700);
    return () => clearInterval(interval);
  }, [gameOver]);

  // Countdown timer (59 seconds per game)
  useEffect(() => {
    if (gameOver) return;
    if (timeLeft <= 0) {
      setGameOver(true);
      setShowPopup(true);
      setStrokeColor("black");
      return;
    }
    const t = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(t);
  }, [timeLeft, gameOver]);

  useEffect(() => {
    let animation;
    let last = performance.now();
    function loop(now) {
      const dt = (now - last) / 16;
      last = now;
      setObjects((prev) =>
        prev
          .map((obj) => ({
            ...obj,
            x: obj.x + obj.vx * dt,
            y: obj.y + obj.vy * dt,
            vy: obj.vy + 0.5 * dt,
          }))
          .filter((obj) => obj.y < CANVAS_H + FRUIT_SIZE)
      );
      animation = requestAnimationFrame(loop);
    }
    if (!gameOver) animation = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animation);
  }, [gameOver]);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    objects.forEach((obj) => {
      ctx.font = `${FRUIT_SIZE}px serif`;
      ctx.globalAlpha = obj.sliced ? 0.3 : 1;
      ctx.fillText(obj.emoji, obj.x, obj.y);
      ctx.globalAlpha = 1;
    });
    if (slicePath.length > 1) {
      ctx.strokeStyle = strokeColor || "#091d1fff";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(slicePath[0].x, slicePath[0].y);
      slicePath.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    }
  }, [objects, slicePath]);

  function handleSlice(start, end) {
    if (gameOver) return;
    let slicedAny = false;
    setObjects((prev) =>
      prev.map((obj) => {
        if (obj.sliced) return obj;
        const dx = obj.x - end.x;
        const dy = obj.y - end.y;
        if (Math.hypot(dx, dy) < FRUIT_SIZE) {
          if (obj.type === "bomb") {
            // Bomb was sliced — apply a small penalty but do NOT end the game.
            setScore((s) => Math.max(0, s - 1));
            setCombo(0);
            slicedAny = true;
            return { ...obj, sliced: true };
          } else {
            setScore((s) => s + 1);
            setCombo((c) => c + 1);
            slicedAny = true;
            return { ...obj, sliced: true };
          }
        }
        return obj;
      })
    );
    if (!slicedAny) setCombo(0);
  }

  function handlePointerDown(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    pointerDownRef.current = true;
    setSlicePath([{ x, y }]);
  }
  function handlePointerMove(e) {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

    // Only record path while pointer is down (prevents persistent stroke)
    setSlicePath((prev) => {
      if (!pointerDownRef.current) return [];
      if (!prev || prev.length === 0) {
        return [{ x, y }];
      }
      const last = prev[prev.length - 1];
      // check slice against objects
      handleSlice(last, { x, y });
      return [...prev, { x, y }];
    });
  }
  function handlePointerUp() {
    pointerDownRef.current = false;
    setSlicePath([]);
  }

  function handlePointerCancel() {
    pointerDownRef.current = false;
    setSlicePath([]);
  }

  function handlePointerLeave() {
    // When user moves pointer/finger outside canvas, remove stroke
    pointerDownRef.current = false;
    setSlicePath([]);
  }

  function handlePlayAgain() {
    setScore(0);
    setCombo(0);
    setObjects([]);
    setGameOver(false);
    setShowPopup(false);
    setTimeLeft(59);
    setStrokeColor("#091d1fff");
  }

  return (
    <div className="fn-root">
      <div className="fn-ui">
        <div className="fn-score">Score: {score}</div>
      </div>
        <div className="fn-timer">Time: {timeLeft}s</div>
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="fn-canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={handlePointerLeave}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      />
      {showPopup && (
        <div className="fn-popup">
          <h2>Game Over</h2>
          <div>Score: {score}</div>
          <div>Coins: {Math.floor(score * 3)}</div>
          <button className="fn-btn" onClick={handlePlayAgain}>Play Again</button>
        </div>
      )}
    </div>
  );
}
