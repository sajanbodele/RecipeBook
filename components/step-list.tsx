'use client'

import { cn } from '@/lib/utils'

interface StepListProps {
  steps: string[]
  currentStep?: number
  onStepClick?: (index: number) => void
}

export function StepList({ steps, currentStep, onStepClick }: StepListProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-medium text-foreground">Instructions</h3>
      <ol className="space-y-4">
        {steps.map((step, index) => {
          const isActive = currentStep === index
          const isPast = currentStep !== undefined && index < currentStep

          return (
            <li
              key={index}
              className={cn(
                'flex gap-4 cursor-pointer p-3 rounded-lg transition-colors',
                isActive && 'bg-accent-action/10 ring-1 ring-accent-action',
                isPast && 'opacity-60',
                !isActive && !isPast && 'hover:bg-muted/50'
              )}
              onClick={() => onStepClick?.(index)}
            >
              <span
                className={cn(
                  'shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium',
                  isActive
                    ? 'bg-accent-action text-white'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {index + 1}
              </span>
              <p className="text-sm leading-relaxed pt-0.5">{step}</p>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
