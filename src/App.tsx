import { GameBoard } from './components/GameBoard'

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#1a0533] to-[#0a1628] px-4 py-8">
      <header className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          🧠 Memory Game
        </h1>
        <p className="text-gray-400 mt-1">Find all matching pairs!</p>
      </header>

      <GameBoard />

      <footer className="mt-8 text-xs text-gray-500">
        Built by Project Orchestrator AI • Autonomy L3 ⚡
      </footer>
    </div>
  )
}

export default App
