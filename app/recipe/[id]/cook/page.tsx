'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { IngredientChecklist } from '@/components/ingredient-checklist'
import { useRecipes } from '@/hooks/use-recipes'
import type { Recipe } from '@/lib/types'
import {
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ListIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CookingModePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { getRecipe, saveRecipe } = useRecipes()

  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [showIngredients, setShowIngredients] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const r = getRecipe(id)
    if (r) {
      setRecipe(r)
    } else {
      router.replace('/')
    }
  }, [id, getRecipe, router])

  const handleNext = useCallback(() => {
    if (!recipe) return
    if (currentStep < recipe.steps.length - 1) {
      setCurrentStep((s) => s + 1)
    } else {
      setIsComplete(true)
    }
  }, [currentStep, recipe])

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1)
    }
  }, [currentStep])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isComplete) return

      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault()
        handleNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrevious()
      } else if (e.key === 'Escape') {
        router.push(`/recipe/${id}`)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentStep, recipe, isComplete, id, router, handleNext, handlePrevious])

  const handleToggleIngredient = useCallback(
    (ingredient: string) => {
      if (!recipe) return

      const newChecked = recipe.checkedIngredients.includes(ingredient)
        ? recipe.checkedIngredients.filter((i) => i !== ingredient)
        : [...recipe.checkedIngredients, ingredient]

      const updatedRecipe = { ...recipe, checkedIngredients: newChecked }
      setRecipe(updatedRecipe)
      saveRecipe(updatedRecipe)
    },
    [recipe, saveRecipe]
  )

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900">
        <div className="animate-pulse text-zinc-400">Loading...</div>
      </div>
    )
  }

  const progressPercent = ((currentStep + 1) / recipe.steps.length) * 100
  const checkedCount = recipe.checkedIngredients.length
  const totalIngredients = recipe.ingredients.length

  // Completion screen
  if (isComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-900 p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-orange-500/20 flex items-center justify-center">
            <CheckCircleIcon className="size-10 text-orange-500" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            You finished cooking!
          </h1>
          <p className="text-zinc-400">{recipe.title}</p>
          <div className="flex flex-col gap-3 pt-4">
            <Button
              asChild
              size="lg"
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              <Link href="/">Back to Recipes</Link>
            </Button>
            <Button
              variant="outline"
              asChild
              size="lg"
              className="border-zinc-600 text-white hover:bg-zinc-800 hover:text-white"
            >
              <Link href={`/recipe/${recipe.id}`}>View Recipe</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-900">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-zinc-300 hover:text-white hover:bg-zinc-800"
        >
          <Link href={`/recipe/${recipe.id}`}>
            <XIcon className="size-4 mr-1" />
            Exit
          </Link>
        </Button>
        <span className="text-sm text-zinc-400">
          Step {currentStep + 1} of {recipe.steps.length}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowIngredients(!showIngredients)}
          className={cn(
            'text-zinc-300 hover:text-white hover:bg-zinc-800',
            showIngredients && 'bg-zinc-800 text-white'
          )}
        >
          <ListIcon className="size-4 mr-1" />
          Ingredients
        </Button>
      </header>

      {/* Progress */}
      <div className="h-1 bg-zinc-800">
        <div
          className="h-full bg-orange-500 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Content - Fixed width layout to prevent shift */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Steps Area - Takes remaining space, doesn't shrink */}
        <div className="flex-1 min-w-0 flex flex-col p-6 lg:p-12">
          {/* Recipe Title - Larger and more prominent */}
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-6 text-balance">
            {recipe.title}
          </h1>

          {/* Current Step */}
          <div className="flex-1 flex items-center">
            <div className="max-w-2xl w-full space-y-6">
              <div className="flex items-start gap-6">
                <span className="shrink-0 w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center text-xl font-bold">
                  {currentStep + 1}
                </span>
                <p className="text-xl lg:text-2xl leading-relaxed text-white pt-2">
                  {recipe.steps[currentStep]}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6">
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="min-w-[120px] border-zinc-600 text-white hover:bg-zinc-800 hover:text-white disabled:opacity-40 disabled:text-zinc-500"
            >
              <ChevronLeftIcon className="size-5 mr-1" />
              Previous
            </Button>

            <Button
              size="lg"
              onClick={handleNext}
              className="min-w-[120px] bg-orange-500 text-white hover:bg-orange-600"
            >
              {currentStep === recipe.steps.length - 1 ? (
                <>
                  Finish
                  <CheckCircleIcon className="size-5 ml-1" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRightIcon className="size-5 ml-1" />
                </>
              )}
            </Button>
          </div>

          {/* Keyboard hint */}
          <p className="text-xs text-zinc-600 text-center mt-4">
            Use arrow keys or Enter to navigate
          </p>
        </div>

        {/* Ingredients Sidebar - Fixed width, doesn't affect main content */}
        <div
          className={cn(
            'lg:w-80 lg:shrink-0 border-t lg:border-t-0 lg:border-l border-zinc-700 bg-zinc-800 overflow-y-auto transition-all duration-200',
            showIngredients
              ? 'max-h-[40vh] lg:max-h-none p-6'
              : 'max-h-0 lg:max-h-none lg:w-0 p-0 overflow-hidden'
          )}
        >
          <div className={cn('transition-opacity duration-200', showIngredients ? 'opacity-100' : 'opacity-0 lg:hidden')}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-white">Ingredients</h3>
              <span className="text-sm text-zinc-400">
                {checkedCount}/{totalIngredients}
              </span>
            </div>
            <Progress
              value={(checkedCount / totalIngredients) * 100}
              className="h-2 mb-4 bg-zinc-700"
            />
            <div className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => {
                const isChecked = recipe.checkedIngredients.includes(ingredient)
                return (
                  <label
                    key={index}
                    className="flex items-start gap-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleIngredient(ingredient)}
                      className="mt-0.5 size-4 rounded border-zinc-600 bg-zinc-700 text-orange-500 focus:ring-orange-500"
                    />
                    <span
                      className={cn(
                        'text-sm transition-colors',
                        isChecked ? 'text-zinc-500 line-through' : 'text-zinc-300'
                      )}
                    >
                      {ingredient}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
