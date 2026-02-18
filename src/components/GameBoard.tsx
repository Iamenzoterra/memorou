import { useState } from 'react'
import { Card } from './Card'
import { useMemoryGame } from '../hooks/useMemoryGame'
import type { Difficulty } from '../types'

const DIFFICULTIES: { key: Difficulty; label: string }[] = [
  { key: 'easy', label: 'Easy' },
  { key: 'medium', label: 'Medium' },
  { key: 'hard', label: 'Hard' },
]

const GRID_CLASSES: Record<Difficulty, string> = {
  easy: 'grid-cols-3 max-w-[264px] md:max-w-[330px]',
  medium: 'grid-cols-4 max-w-[352px] md:max-w-[436px]',
  hard: 'grid-cols-6 max-w-[528px] md:max-w-[654px]',
}

function getStarRating(moves: number, thresholds: { three: number; two: number }): string {
  if (moves <= thresholds.three) return '⭐⭐⭐'
  if (moves <= thresholds.two) return '⭐⭐'
  return '⭐'
}

function GameContent({ difficulty }: { difficulty: Difficulty }) {
  const {
    cards,
    moves,
    matches,
    totalPairs,
    seconds,
    isWon,
    isChecking,
    flipCard,
    restart,
    starThresholds,
  } = useMemoryGame(difficulty)

  return (
    <>
      {/* Stats bar */}
      <div className="flex gap-4 md:gap-8 mb-6 text-sm md:text-base">
        <span className="bg-white/10 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg font-medium">
          🎯 Moves: {moves}
        </span>
        <span className="bg-white/10 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg font-medium">
          ✅ {matches}/{totalPairs}
        </span>
        <span className="bg-white/10 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg font-medium">
          ⏱️ {seconds}s
        </span>
      </div>

      {/* Card grid */}
      <div className={`grid gap-2 md:gap-3 ${GRID_CLASSES[difficulty]}`}>
        {cards.map((card) => (
          <Card
            key={card.id}
            emoji={card.emoji}
            isFlipped={card.isFlipped}
            isMatched={card.isMatched}
            disabled={isChecking}
            onClick={() => flipCard(card.id)}
          />
        ))}
      </div>

      {/* Restart button */}
      <button
        onClick={restart}
        className="mt-6 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
      >
        🔄 New Game
      </button>

      {/* Win overlay */}
      {isWon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-sm w-full text-center animate-[scaleIn_0.3s_ease-out]">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              You Won!
            </h2>
            <div className="text-3xl mb-4">{getStarRating(moves, starThresholds)}</div>
            <div className="space-y-1 text-gray-600 mb-6">
              <p>
                Moves: <span className="font-semibold text-gray-800">{moves}</span>
              </p>
              <p>
                Time: <span className="font-semibold text-gray-800">{seconds}s</span>
              </p>
            </div>
            <button
              onClick={restart}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export function GameBoard() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')

  return (
    <div className="flex flex-col items-center">
      {/* Difficulty selector */}
      <div className="flex gap-2 mb-4">
        {DIFFICULTIES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setDifficulty(key)}
            className={`px-4 py-1.5 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer ${
              difficulty === key
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <GameContent key={difficulty} difficulty={difficulty} />
    </div>
  )
}
