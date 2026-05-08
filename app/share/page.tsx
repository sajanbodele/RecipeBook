'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty } from '@/components/ui/empty'
import { SharedHeader } from '@/components/shared-header'
import { SharedFooter } from '@/components/shared-footer'
import { decodeSharedRecipe, generateId, saveRecipe, getRecipeByUrl } from '@/lib/recipe-storage'
import type { Recipe } from '@/lib/types'
import { BookmarkIcon, HomeIcon, CheckIcon, ExternalLinkIcon } from 'lucide-react'

function SharedRecipeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [recipe, setRecipe] = useState<Partial<Recipe> | null>(null)
  const [error, setError] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const data = searchParams.get('data')
    if (data) {
      const decoded = decodeSharedRecipe(data)
      if (decoded && decoded.title) {
        setRecipe(decoded)
        // Check if already saved
        if (decoded.url && getRecipeByUrl(decoded.url)) {
          setSaved(true)
        }
      } else {
        setError(true)
      }
    } else {
      setError(true)
    }
  }, [searchParams])

  const handleSave = () => {
    if (!recipe) return

    const fullRecipe: Recipe = {
      id: generateId(),
      title: recipe.title || 'Untitled Recipe',
      url: recipe.url || '',
      ingredients: recipe.ingredients || [],
      steps: recipe.steps || [],
      savedDate: new Date().toISOString(),
      notes: '',
      checkedIngredients: [],
    }

    saveRecipe(fullRecipe)
    setSaved(true)
    toast.success('Recipe saved to your collection!')
    setTimeout(() => {
      router.push(`/recipe/${fullRecipe.id}`)
    }, 1000)
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Empty
          title="Invalid Recipe Link"
          description="This recipe link appears to be invalid or expired."
          className="max-w-md"
        >
          <Button asChild className="mt-4">
            <Link href="/">
              <HomeIcon className="size-4 mr-2" />
              Go to RecipeBook
            </Link>
          </Button>
        </Empty>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading recipe...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SharedHeader />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 space-y-6">
        <p className="text-sm text-muted-foreground">Shared Recipe</p>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground text-balance">
            {recipe.title}
          </h1>
          {recipe.url && (
            <a
              href={recipe.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent-action"
            >
              <ExternalLinkIcon className="size-3.5" />
              View original
            </a>
          )}
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saved}
          size="lg"
          className="w-full bg-accent-action text-white hover:bg-accent-action/90 disabled:opacity-100 disabled:bg-green-600"
        >
          {saved ? (
            <>
              <CheckIcon className="size-5 mr-2" />
              Saved to Your Recipes
            </>
          ) : (
            <>
              <BookmarkIcon className="size-5 mr-2" />
              Save to My Recipes
            </>
          )}
        </Button>

        {/* Ingredients */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Ingredients ({recipe.ingredients.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    {ing}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Steps */}
        {recipe.steps && recipe.steps.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Instructions ({recipe.steps.length} steps)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {recipe.steps.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                      {i + 1}
                    </span>
                    <p className="text-sm text-foreground leading-relaxed pt-0.5">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}
      </main>

      <SharedFooter />
    </div>
  )
}

export default function SharedRecipePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading recipe...</div>
      </div>
    }>
      <SharedRecipeContent />
    </Suspense>
  )
}
