import React, { useState, useEffect, useRef } from 'react';
import { MiniGameBase } from '../EnhancedMiniGameBase';

export const StockMarketDecisionGame = ({
  title = "Wall Street Trader",
  timeline = "present",
  difficulty = "medium",
  onComplete,
  onClose,
  gameId
}) => {
  /* ===================== STATE ===================== */
  const [stocks, setStocks] = useState([
    { symbol: 'TECH', price: 150, trend: 0, history: Array(20).fill(150), volatility: 2 },
    { symbol: 'BIO', price: 80, trend: 0, history: Array(20).fill(80), volatility: 4 },
    { symbol: 'AUTO', price: 120, trend: 0, history: Array(20).fill(120), volatility: 1.5 }
  ]);

  const [portfolio, setPortfolio] = useState({
    cash: 1000,
    holdings: { TECH: 0, BIO: 0, AUTO: 0 }
  });

  const [news, setNews] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [success, setSuccess] = useState(false);

  const gameLoopRef = useRef(null);
  const gameRef = useRef(null);

  const TARGET_VALUE = difficulty === 'hard' ? 2500 : 2000;

  /* ===================== HELPERS ===================== */
  const totalValue = () =>
    portfolio.cash +
    stocks.reduce(
      (sum, s) => sum + portfolio.holdings[s.symbol] * s.price,
      0
    );

  const avgPrice = stock =>
    stock.history.reduce((a, b) => a + b, 0) / stock.history.length;

  /* ===================== MARKET LOOP ===================== */
  useEffect(() => {
    gameLoopRef.current = setInterval(() => {
      if (isGameOver) return;

      setStocks(prev =>
        prev.map(stock => {
          let drift = (Math.random() - 0.5) * stock.volatility + stock.trend;

          // Mean reversion
          drift -= (stock.price - avgPrice(stock)) * 0.01;

          const newPrice = Math.max(5, stock.price + drift);
          const history = [...stock.history.slice(1), newPrice];

          // Trend decay
          let newTrend = stock.trend * 0.95;

          return { ...stock, price: newPrice, history, trend: newTrend };
        })
      );

      // Random news / crashes
      if (Math.random() < 0.03) {
        const events = [
          { msg: "TECH AI boom!", symbol: 'TECH', trend: 2 },
          { msg: "BIO drug trial fails.", symbol: 'BIO', trend: -3 },
          { msg: "AUTO recalls vehicles.", symbol: 'AUTO', trend: -2 },
          { msg: "Global market correction!", symbol: null, trend: -1.5 }
        ];

        const e = events[Math.floor(Math.random() * events.length)];
        setNews(e.msg);
        setTimeout(() => setNews(null), 3000);

        setStocks(prev =>
          prev.map(s =>
            e.symbol === null || s.symbol === e.symbol
              ? { ...s, trend: e.trend }
              : s
          )
        );
      }
    }, 500);

    return () => clearInterval(gameLoopRef.current);
  }, [isGameOver]);

  /* ===================== TRADING ===================== */
  const trade = (symbol, type) => {
    if (!gameRef.current?.isGameStarted || isGameOver) return;

    setPortfolio(prev => {
      const stock = stocks.find(s => s.symbol === symbol);
      const price = stock.price;

      if (type === 'buy' && prev.cash >= price) {
        return {
          ...prev,
          cash: prev.cash - price,
          holdings: { ...prev.holdings, [symbol]: prev.holdings[symbol] + 1 }
        };
      }

      if (type === 'sell' && prev.holdings[symbol] > 0) {
        const avg = avgPrice(stock);
        const profit = price - avg;

        if (gameRef.current) {
          if (profit > 5) gameRef.current.addPoints(50, 300, 200, 'perfect');
          else if (profit > 0) gameRef.current.addPoints(15, 300, 200, 'good');
          else gameRef.current.addPoints(-20, 300, 200, 'miss');
        }

        return {
          ...prev,
          cash: prev.cash + price,
          holdings: { ...prev.holdings, [symbol]: prev.holdings[symbol] - 1 }
        };
      }

      return prev;
    });
  };

  /* ===================== WIN / LOSE ===================== */
  useEffect(() => {
    if (!gameRef.current?.isGameStarted || isGameOver) return;

    const value = totalValue();

    if (value >= TARGET_VALUE) {
      setIsGameOver(true);
      setSuccess(true);
      gameRef.current.endGame({ success: true, reason: 'market_master' });
    }

    if (portfolio.cash <= 0 && value < 300) {
      setIsGameOver(true);
      setSuccess(false);
      gameRef.current.endGame({ success: false, reason: 'bankrupt' });
    }
  }, [portfolio, stocks]);

  /* ===================== CHART ===================== */
  const renderChart = stock => {
    const min = Math.min(...stock.history);
    const max = Math.max(...stock.history);
    const range = max - min || 1;

    return (
      <div className="h-20 flex items-end gap-1 mt-2 bg-black/40 p-2 rounded">
        {stock.history.map((p, i) => (
          <div
            key={i}
            className={`flex-1 ${p >= stock.history[i - 1] ? 'bg-green-500' : 'bg-red-500'}`}
            style={{ height: `${((p - min) / range) * 100}%` }}
          />
        ))}
      </div>
    );
  };

  /* ===================== RENDER ===================== */
  return (
    <MiniGameBase
      ref={gameRef}
      title={title}
      timeline={timeline}
      gameId={gameId}
      instructions="Buy low, sell high. React to market news and avoid crashes."
      objective={`Reach $${TARGET_VALUE} portfolio value.`}
      scoring="Profitable trades give bonus points."
      duration={90}
      difficulty={difficulty}
      onComplete={onComplete}
      onClose={onClose}
    >
      <div className="relative w-full h-full p-4">

        {/* END SCREEN */}
        {isGameOver && (
          <div className="absolute inset-0 bg-black/85 z-50 flex flex-col items-center justify-center">
            <h1 className={`text-5xl font-bold mb-4 ${success ? 'text-green-400' : 'text-red-500'}`}>
              {success ? '📈 MARKET MASTER' : '💥 BANKRUPT'}
            </h1>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-800 rounded-lg text-white"
            >
              Exit Trading Floor
            </button>
          </div>
        )}

        {/* HEADER */}
        <div className="flex justify-between mb-4 bg-gray-900 p-4 rounded">
          <div>
            <div className="text-gray-400 text-sm">Net Worth</div>
            <div className="text-2xl font-bold text-green-400">
              ${totalValue().toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">Cash</div>
            <div className="text-2xl font-bold text-white">
              ${portfolio.cash.toFixed(2)}
            </div>
          </div>
        </div>

        {/* NEWS */}
        <div className="h-10 bg-black flex items-center justify-center mb-4 rounded">
          {news ? (
            <span className="text-yellow-400 font-bold animate-pulse">{news}</span>
          ) : (
            <span className="text-gray-500 italic">Markets calm…</span>
          )}
        </div>

        {/* STOCKS */}
        <div className="grid gap-4 overflow-y-auto">
          {stocks.map(stock => (
            <div key={stock.symbol} className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xl font-bold text-blue-400">{stock.symbol}</span>
                  <span className="ml-2 text-xs text-gray-400">
                    Owned: {portfolio.holdings[stock.symbol]}
                  </span>
                </div>
                <div className="font-mono text-xl text-white">
                  ${stock.price.toFixed(2)}
                </div>
              </div>

              {renderChart(stock)}

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => trade(stock.symbol, 'buy')}
                  disabled={portfolio.cash < stock.price}
                  className="flex-1 bg-green-700 rounded py-2 disabled:bg-gray-600"
                >
                  BUY
                </button>
                <button
                  onClick={() => trade(stock.symbol, 'sell')}
                  disabled={portfolio.holdings[stock.symbol] <= 0}
                  className="flex-1 bg-red-700 rounded py-2 disabled:bg-gray-600"
                >
                  SELL
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </MiniGameBase>
  );
};
