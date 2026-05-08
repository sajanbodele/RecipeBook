'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

interface IngredientChecklistProps {
  ingredients: string[]
  checkedItems: string[]
  onToggle: (ingredient: string) => void
  highlightedIngredient?: string
  compact?: boolean
}

export function IngredientChecklist({
  ingredients,
  checkedItems,
  onToggle,
  highlightedIngredient,
  compact = false,
}: IngredientChecklistProps) {
  const checkedCount = checkedItems.length
  const totalCount = ingredients.length

  return (
    <div className="space-y-3">
      {!compact && (
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-foreground">Ingredients</h3>
          <span className="text-sm text-muted-foreground">
            {checkedCount}/{totalCount} checked
          </span>
        </div>
      )}
      <div className={cn('space-y-2', compact && 'space-y-1.5')}>
        {ingredients.map((ingredient, index) => {
          const isChecked = checkedItems.includes(ingredient)
          const isHighlighted = highlightedIngredient === ingredient

          return (
            <label
              key={index}
              className={cn(
                'flex items-start gap-3 cursor-pointer group p-2 rounded-md transition-colors',
                isHighlighted && 'bg-accent-highlight/20 ring-2 ring-accent-highlight',
                !isHighlighted && 'hover:bg-muted/50',
                compact && 'p-1.5'
              )}
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={() => onToggle(ingredient)}
                className="mt-0.5"
              />
              <span
                className={cn(
                  'text-sm leading-relaxed transition-colors',
                  isChecked && 'text-muted-foreground line-through',
                  compact && 'text-xs'
                )}
              >
                {ingredient}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
