'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Recipe } from '@/lib/types'
import {
  getRecipes,
  saveRecipe as saveRecipeToStorage,
  deleteRecipe as deleteRecipeFromStorage,
  getRecipeById,
  toggleFavorite as toggleFavoriteInStorage,
} from '@/lib/recipe-storage'

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setRecipes(getRecipes())
    setIsLoading(false)
  }, [])

  const refreshRecipes = useCallback(() => {
    setRecipes(getRecipes())
  }, [])

  const saveRecipe = useCallback((recipe: Recipe) => {
    saveRecipeToStorage(recipe)
    refreshRecipes()
  }, [refreshRecipes])

  const deleteRecipe = useCallback((id: string) => {
    deleteRecipeFromStorage(id)
    refreshRecipes()
  }, [refreshRecipes])

  const getRecipe = useCallback((id: string) => {
    return getRecipeById(id)
  }, [])

  const toggleFavorite = useCallback((id: string) => {
    toggleFavoriteInStorage(id)
    refreshRecipes()
  }, [refreshRecipes])

  return {
    recipes,
    isLoading,
    saveRecipe,
    deleteRecipe,
    getRecipe,
    refreshRecipes,
    toggleFavorite,
  }
}
