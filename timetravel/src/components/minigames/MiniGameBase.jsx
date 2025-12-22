import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';

export class MiniGameBase extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isActive: false,
      score: 0,
      timeLeft: 
        typeof props.duration === 'number' && props.duration > 0 
          ? props.duration
          : 30,
      gameStarted: false,
      showInstructions: true,
    };
    
    this.timer = null;
    this.gameTimer = null;
  }

  componentDidMount() {
    // Initialize any game-specific state
    this.initGame();
  }

  componentWillUnmount() {
    // Cleanup timers
    if (this.timer) clearInterval(this.timer);
    if (this.gameTimer) clearInterval(this.gameTimer);
  }

  initGame() {
    // Override in child classes
  }

  startGame() {
    this.setState({ 
      isActive: true, 
      gameStarted: true, 
      showInstructions: false 
    });
    
    // Start countdown timer
    this.timer = setInterval(() => {
      this.setState(prevState => {
        const newTimeLeft = prevState.timeLeft - 1;
        if (newTimeLeft <= 0) {
          this.endGame();
          return { timeLeft: 0, isActive: false };
        }
        return { timeLeft: newTimeLeft };
      });
    }, 1000);

    // Start game logic timer
    this.gameTimer = setInterval(() => {
      if (this.gameLogic) {
        this.gameLogic();
      }
    }, 100);
  }

  endGame() {
    if(!this.state.isActive) return;
    
    this.setState({ isActive: false });
    clearInterval(this.timer);
    clearInterval(this.gameTimer);
    
    // Calculate rewards based on score
    const rewards = this.calculateRewards();
    
    // Complete the mini-game
    this.props.onComplete(
      this.props.timeline,
      this.props.gameId,
      this.state.score,
      rewards
    );
  }

  calculateRewards() {
    // Override in child classes
    return {
      credits: Math.floor(this.state.score * 10),
      energy: 0,
      stability: 0,
      coinsPerSecond: 0,
      resources: {}
    };
  }

  addScore(points) {
    this.setState(prevState => ({
      score: prevState.score + points
    }));
  }


  addTime(seconds) {
    this.setState({ timeLeft: Math.max(0, this.state.timeLeft + seconds) });
  }

  renderInstructions() {
    return (
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold mb-2">{this.props.title}</h3>
        <p className="text-sm mb-4">{this.props.instructions}</p>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <strong>Objective:</strong>
            <p>{this.props.objective}</p>
          </div>
          <div>
            <strong>Scoring:</strong>
            <p>{this.props.scoring}</p>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { timeline, title, difficulty = 'medium' } = this.props;
    const { gameStarted, showInstructions, isActive, score, timeLeft } = this.state;
    
    // Timeline-specific styling
    const timelineStyles = {
      past: 'bg-amber-900 border-amber-600 text-amber-100',
      present: 'bg-blue-900 border-blue-600 text-blue-100',
      future: 'bg-purple-900 border-purple-600 text-purple-100'
    };

    const difficultyColors = {
      easy: 'border-green-500',
      medium: 'border-yellow-500',
      hard: 'border-red-500'
    };

    return (
      <div className={`min-h-screen p-4 ${timelineStyles[timeline]} border-4 ${difficultyColors[difficulty]}`}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">{title}</h1>
            <div className="flex gap-4 text-lg">
              <div>Score: {score}</div>
              <div>Time: {timeLeft}s</div>
            </div>
          </div>

          {/* Game Area */}
          <div className="bg-black bg-opacity-30 rounded-lg p-6 min-h-96">
            {!gameStarted ? (
              // Instructions Screen
              <div className="text-center">
                {this.renderInstructions()}
                <button
                  onClick={() => this.startGame()}
                  className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-lg text-xl font-bold transition-colors"
                >
                  Start Game
                </button>
              </div>
            ) : (
              // Game Screen
              <div>
                {this.renderGame()}
                <button
                  onClick={() => this.endGame()}
                  className="mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
                >
                  End Game
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

// Hook for easy integration with game store
export const useMiniGame = (timeline, gameId, title, instructions, objective, scoring, duration = 30) => {
  const { startMiniGame, completeMiniGame } = useGameStore();
  
  const handleStart = () => {
    startMiniGame(gameId);
  };
  
  const handleComplete = (timeline, gameId, score, rewards) => {
    completeMiniGame(timeline, gameId, score, rewards);
  };

  return {
    handleStart,
    handleComplete,
    title,
    instructions,
    objective,
    scoring,
    duration
  };
};

