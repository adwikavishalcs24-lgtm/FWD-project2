
import React, { useState, useEffect, useRef } from 'react';
import { MiniGameBase } from '../EnhancedMiniGameBase';

export const StockMarketDecisionGame = ({
  title = "Wall Street Trader",
  timeline = "present",
  difficulty = "medium"
}) => {
  const [stocks, setStocks] = useState([
    { symbol: 'TECH', price: 150, trend: 0, history: Array(20).fill(150), volatility: 2 },
    { symbol: 'BIO', price: 80, trend: 0, history: Array(20).fill(80), volatility: 4 },
    { symbol: 'AUTO', price: 120, trend: 0, history: Array(20).fill(120), volatility: 1.5 }
  ]);
  const [portfolio, setPortfolio] = useState({ cash: 1000, holdings: { 'TECH': 0, 'BIO': 0, 'AUTO': 0 } });
  const [news, setNews] = useState(null);

  const gameLoopRef = useRef();
  const gameRef = useRef(null);

  // Generate market movements
  useEffect(() => {
    gameLoopRef.current = setInterval(() => {
      setStocks(prev => prev.map(stock => {
        const change = (Math.random() - 0.5) * stock.volatility + stock.trend;
        const newPrice = Math.max(10, stock.price + change);
        const newHistory = [...stock.history.slice(1), newPrice];

        // Occasional trend reset
        let newTrend = stock.trend;
        if (Math.random() < 0.05) newTrend = (Math.random() - 0.5) * 2;

        return { ...stock, price: newPrice, history: newHistory, trend: newTrend };
      }));

      // Random News Events
      if (Math.random() < 0.02) {
        const events = [
          { msg: "TECH Breakthrough! Sector Booming!", impact: { symbol: 'TECH', trend: 2 } },
          { msg: "Regulation hits BIO sector hard.", impact: { symbol: 'BIO', trend: -2 } },
          { msg: "AUTO strike causes delays.", impact: { symbol: 'AUTO', trend: -1.5 } }
        ];
        const event = events[Math.floor(Math.random() * events.length)];
        setNews(event.msg);
        setTimeout(() => setNews(null), 3000);

        setStocks(prev => prev.map(s =>
          s.symbol === event.impact.symbol ? { ...s, trend: event.impact.trend } : s
        ));
      }

    }, 500); // Update every 500ms

    return () => clearInterval(gameLoopRef.current);
  }, []);

  // Periodic net worth check for passive scoring or just rely on trades
  // Let's rely on trades for "action" scoring, but maybe bonus for high net worth
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (gameRef.current?.isGameStarted) {
        const value = getTotalValue();
        if (value > 2000) {
          // Passive income score
          gameRef.current.addPoints(5, 0, 0, 'good');
        }
      }
    }, 2000);
    return () => clearInterval(checkInterval);
  }, [portfolio, stocks]);

  const trade = (symbol, action) => {
    if (!gameRef.current?.isGameStarted) return;

    setPortfolio(prev => {
      const stock = stocks.find(s => s.symbol === symbol);
      const currentPrice = stock.price;
      const currentCash = prev.cash;
      const currentHolding = prev.holdings[symbol];

      if (action === 'buy' && currentCash >= currentPrice) {
        return {
          ...prev,
          cash: currentCash - currentPrice,
          holdings: { ...prev.holdings, [symbol]: currentHolding + 1 }
        };
      } else if (action === 'sell' && currentHolding > 0) {
        // Calculate if profit made? Hard to track individual basis without more state.
        // Simplified: Selling is good if price is high relative to history, or just reward activity + profit check logic
        // We'll just give points for selling to encourage liquidity, maybe check trend?
        // Better: Just assume generic successful trade mechanics don't check basis cost for simplicity here,
        // or we add points based on total portfolio growth.
        // Let's simplify: Award points for every Sell action (taking profit presumably)
        if (gameRef.current) {
          // If selling at a "high" (price > avg of last 20), nice trade
          const avg = stock.history.reduce((a, b) => a + b, 0) / stock.history.length;
          if (currentPrice > avg) {
            gameRef.current.addPoints(50, 0, 0, 'perfect'); // Great trade
          } else {
            gameRef.current.addPoints(10, 0, 0, 'good'); // Activity
          }
        }

        return {
          ...prev,
          cash: currentCash + currentPrice,
          holdings: { ...prev.holdings, [symbol]: currentHolding - 1 }
        };
      }
      return prev;
    });
  };

  const getTotalValue = () => {
    let value = portfolio.cash;
    stocks.forEach(stock => {
      value += portfolio.holdings[stock.symbol] * stock.price;
    });
    return value;
  };

  const renderChart = (stock) => {
    const min = Math.min(...stock.history) * 0.9;
    const max = Math.max(...stock.history) * 1.1;
    const range = max - min;

    return (
      <div className="h-24 flex items-end gap-1 mt-2 bg-gray-800/50 p-2 rounded relative overflow-hidden">
        {stock.history.map((price, idx) => {
          const height = ((price - min) / range) * 100;
          const prevPrice = idx > 0 ? stock.history[idx - 1] : price;
          const color = price >= prevPrice ? 'bg-green-500' : 'bg-red-500';
          return (
            <div key={idx} className={`flex-1 ${color} opacity-80 hover:opacity-100 transition-all`} style={{ height: `${height}%` }}></div>
          );
        })}
      </div>
    );
  };

  return (
    <MiniGameBase
      ref={gameRef}
      title={title}
      timeline={timeline}
      instructions="Buy low, sell high! Watch the news ticker for market trends. Try to maximize your portfolio value."
      objective="Profit over $2000."
      scoring="+1 point for every $10 profit."
      duration={90}
      difficulty={difficulty}
    >
      <div className="w-full h-full p-4 flex flex-col">
        {/* Header Stats */}
        <div className="flex justify-between items-center bg-gray-900 p-4 rounded-lg mb-4 border border-gray-700">
          <div>
            <div className="text-gray-400 text-sm">Portfolio Value</div>
            <div className="text-2xl font-bold text-green-400">${getTotalValue().toFixed(2)}</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">Cash Available</div>
            <div className="text-2xl font-bold text-white">${portfolio.cash.toFixed(2)}</div>
          </div>
        </div>

        {/* News Ticker */}
        <div className="h-10 bg-black mb-4 flex items-center overflow-hidden rounded border border-gray-800 relative">
          {news && <div className="absolute animate-pulse text-yellow-400 font-bold px-4 w-full text-center">BREAKING: {news}</div>}
          {!news && <div className="text-gray-600 px-4 w-full text-center italic">Market is stable...</div>}
        </div>

        {/* Stocks Grid */}
        <div className="grid gap-4 flex-1 overflow-y-auto">
          {stocks.map(stock => (
            <div key={stock.symbol} className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-lg">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-xl text-blue-400">{stock.symbol}</span>
                  <span className="ml-2 text-xs text-gray-500">Owned: {portfolio.holdings[stock.symbol]}</span>
                </div>
                <div className={`font-mono text-xl ${stock.price > stock.history[stock.history.length - 2] ? 'text-green-400' : 'text-red-400'}`}>
                  ${stock.price.toFixed(2)}
                </div>
              </div>

              {renderChart(stock)}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => trade(stock.symbol, 'buy')}
                  disabled={portfolio.cash < stock.price}
                  className="flex-1 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-2 rounded transition-colors"
                >
                  BUY
                </button>
                <button
                  onClick={() => trade(stock.symbol, 'sell')}
                  disabled={portfolio.holdings[stock.symbol] <= 0}
                  className="flex-1 bg-red-700 hover:bg-red-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-2 rounded transition-colors"
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
