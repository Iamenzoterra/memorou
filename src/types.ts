export interface CardData {
  id: number
  emoji: string
  isFlipped: boolean
  isMatched: boolean
}

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface DifficultyConfig {
  pairs: number
  cols: number
  emojis: string[]
  stars: { three: number; two: number }
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    pairs: 3,
    cols: 3,
    emojis: ['🐶', '🐱', '🐼'],
    stars: { three: 6, two: 10 },
  },
  medium: {
    pairs: 8,
    cols: 4,
    emojis: ['🐶', '🐱', '🐼', '🦊', '🐸', '🐵', '🦁', '🐧'],
    stars: { three: 12, two: 18 },
  },
  hard: {
    pairs: 12,
    cols: 6,
    emojis: ['🐶', '🐱', '🐼', '🦊', '🐸', '🐵', '🦁', '🐧', '🎸', '🚀', '🎨', '🌈'],
    stars: { three: 18, two: 28 },
  },
}
