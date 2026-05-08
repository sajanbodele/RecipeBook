'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { HeartIcon, ExternalLinkIcon } from 'lucide-react'
import type { Recipe } from '@/lib/types'

interface RecipeCardProps {
  recipe: Recipe
  onToggleFavorite: (id: string) => void
  selectable?: boolean
  selected?: boolean
  onSelect?: (id: string) => void
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function RecipeCard({
  recipe,
  onToggleFavorite,
  selectable,
  selected,
  onSelect,
}: RecipeCardProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    if (selectable && onSelect) {
      e.preventDefault()
      onSelect(recipe.id)
    }
  }

  const cardContent = (
    <Card
      className={`group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-4 rounded-xl border cursor-pointer ${
        selected ? 'border-accent-action ring-1 ring-accent-action' : 'border-border'
      }`}
      onClick={selectable ? handleCardClick : undefined}
    >
      <CardContent className="p-0 space-y-3">
        {/* Header: Checkbox/Title + Heart */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            {selectable && (
              <Checkbox
                checked={selected}
                onCheckedChange={() => onSelect?.(recipe.id)}
                onClick={(e) => e.stopPropagation()}
                className="mt-0.5"
              />
            )}
            <h3 className="font-semibold text-foreground truncate group-hover:text-accent-action transition-colors text-base">
              {recipe.title}
            </h3>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleFavorite(recipe.id)
            }}
            className="shrink-0 p-1 -m-1 transition-colors"
            aria-label={recipe.favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <HeartIcon
              className={`size-5 transition-colors ${
                recipe.favorite
                  ? 'fill-red-500 text-red-500'
                  : 'text-muted-foreground hover:text-red-400'
              }`}
            />
          </button>
        </div>

        {/* Meta info */}
        <p className="text-sm text-muted-foreground">
          Added {formatDate(recipe.savedDate)} &bull; {recipe.ingredients.length} ingredients
        </p>

        {/* Go to site link */}
        {recipe.url && (
          <a
            href={recipe.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-sm font-medium text-accent-action hover:underline"
          >
            Go to site
            <ExternalLinkIcon className="size-3.5" />
          </a>
        )}
      </CardContent>
    </Card>
  )

  if (selectable) {
    return cardContent
  }

  return <Link href={`/recipe/${recipe.id}`}>{cardContent}</Link>
}
