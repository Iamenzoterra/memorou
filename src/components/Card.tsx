interface CardProps {
  emoji: string
  isFlipped: boolean
  isMatched: boolean
  disabled: boolean
  onClick: () => void
}

export function Card({ emoji, isFlipped, isMatched, disabled, onClick }: CardProps) {
  const handleClick = () => {
    if (!isFlipped && !disabled) {
      onClick()
    }
  }

  return (
    <div
      className="w-20 h-20 md:w-[100px] md:h-[100px] cursor-pointer"
      style={{ perspective: '600px' }}
      onClick={handleClick}
    >
      <div
        className={[
          'relative w-full h-full transition-transform duration-[400ms]',
          '[transform-style:preserve-3d]',
          isFlipped || isMatched ? '[transform:rotateY(180deg)]' : '',
          isMatched ? 'scale-110' : '',
        ].join(' ')}
      >
        {/* Back face (visible when not flipped) */}
        <div
          className={[
            'absolute inset-0 flex items-center justify-center',
            'rounded-xl text-3xl md:text-4xl',
            'bg-gradient-to-br from-indigo-500 to-purple-600',
            'shadow-md [backface-visibility:hidden]',
          ].join(' ')}
        >
          <span>❓</span>
        </div>

        {/* Front face (visible when flipped) */}
        <div
          className={[
            'absolute inset-0 flex items-center justify-center',
            'rounded-xl text-3xl md:text-4xl',
            'bg-white shadow-md',
            '[backface-visibility:hidden] [transform:rotateY(180deg)]',
            isMatched ? 'ring-4 ring-green-400 shadow-[0_0_15px_rgba(74,222,128,0.5)]' : '',
          ].join(' ')}
        >
          <span>{emoji}</span>
        </div>
      </div>
    </div>
  )
}
