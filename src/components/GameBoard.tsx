import { Card } from './Card'
import { useMemoryGame } from '../hooks/useMemoryGame'

function getStarRating(moves: number): string {
  if (moves <= 10) return '⭐⭐⭐'
  if (moves <= 16) return '⭐⭐'
  return '⭐'
}

export function GameBoard() {
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
  } = useMemoryGame()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
        Memorou
      </h1>

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
      <div className="grid grid-cols-4 gap-2 md:gap-3 max-w-[352px] md:max-w-[436px]">
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
            <div className="text-3xl mb-4">{getStarRating(moves)}</div>
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
    </div>
  )
}
