import { useState, useRef, useEffect, useCallback } from 'react'
import type { CardData } from '../types'

const DEFAULT_EMOJIS = ['🐶', '🐱', '🐼', '🦊', '🐸', '🐵', '🦁', '🐧']

function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function createCards(emojis: string[]): CardData[] {
  const paired = [...emojis, ...emojis]
  const shuffled = shuffle(paired)
  return shuffled.map((emoji, index) => ({
    id: index,
    emoji,
    isFlipped: false,
    isMatched: false,
  }))
}

export function useMemoryGame(emojis: string[] = DEFAULT_EMOJIS) {
  const totalPairs = emojis.length

  const [cards, setCards] = useState<CardData[]>(() => createCards(emojis))
  const [moves, setMoves] = useState(0)
  const [matches, setMatches] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [isChecking, setIsChecking] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hasStartedRef = useRef(false)
  const flippedIdsRef = useRef<number[]>([])

  const isWon = matches === totalPairs

  const startTimer = useCallback(() => {
    if (timerRef.current !== null) return
    timerRef.current = setInterval(() => {
      setSeconds((s) => s + 1)
    }, 1000)
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // Stop timer on win
  useEffect(() => {
    if (isWon) {
      stopTimer()
    }
  }, [isWon, stopTimer])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer()
    }
  }, [stopTimer])

  const flipCard = useCallback(
    (id: number) => {
      if (isChecking) return

      const card = cards.find((c) => c.id === id)
      if (!card || card.isFlipped || card.isMatched) return

      // Start timer on first flip
      if (!hasStartedRef.current) {
        hasStartedRef.current = true
        startTimer()
      }

      const newCards = cards.map((c) =>
        c.id === id ? { ...c, isFlipped: true } : c
      )
      setCards(newCards)

      const newFlipped = [...flippedIdsRef.current, id]
      flippedIdsRef.current = newFlipped

      if (newFlipped.length === 2) {
        setMoves((m) => m + 1)
        setIsChecking(true)

        const [firstId, secondId] = newFlipped
        const firstCard = newCards.find((c) => c.id === firstId)!
        const secondCard = newCards.find((c) => c.id === secondId)!

        setTimeout(() => {
          if (firstCard.emoji === secondCard.emoji) {
            // Match found
            setCards((prev) =>
              prev.map((c) =>
                c.id === firstId || c.id === secondId
                  ? { ...c, isMatched: true }
                  : c
              )
            )
            setMatches((m) => m + 1)
          } else {
            // No match — flip both back
            setCards((prev) =>
              prev.map((c) =>
                c.id === firstId || c.id === secondId
                  ? { ...c, isFlipped: false }
                  : c
              )
            )
          }
          flippedIdsRef.current = []
          setIsChecking(false)
        }, 800)
      }
    },
    [cards, isChecking, startTimer]
  )

  const restart = useCallback(() => {
    stopTimer()
    hasStartedRef.current = false
    flippedIdsRef.current = []
    setCards(createCards(emojis))
    setMoves(0)
    setMatches(0)
    setSeconds(0)
    setIsChecking(false)
  }, [emojis, stopTimer])

  return {
    cards,
    moves,
    matches,
    totalPairs,
    seconds,
    isWon,
    isChecking,
    flipCard,
    restart,
  }
}
