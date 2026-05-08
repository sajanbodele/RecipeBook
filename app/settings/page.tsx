'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SharedHeader } from '@/components/shared-header'
import { SharedFooter } from '@/components/shared-footer'
import { useRecipes } from '@/hooks/use-recipes'
import { exportRecipes, importRecipes } from '@/lib/recipe-storage'
import {
  ArrowLeftIcon,
  DownloadIcon,
  UploadIcon,
  TrashIcon,
  BookOpenIcon,
} from 'lucide-react'

export default function SettingsPage() {
  const { recipes, refreshRecipes } = useRecipes()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null)

  const handleExport = useCallback(() => {
    const json = exportRecipes()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `recipes_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Recipes exported!')
  }, [])

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const result = importRecipes(text)
        setImportResult(result)
        refreshRecipes()
        toast.success(`Imported ${result.imported} recipes`)
      } catch {
        toast.error('Failed to import recipes. Invalid file format.')
      }

      // Reset file input
      e.target.value = ''
    },
    [refreshRecipes]
  )

  const handleClearAll = useCallback(() => {
    localStorage.removeItem('recipebook_recipes')
    refreshRecipes()
    setShowClearDialog(false)
    toast.success('All recipes deleted')
  }, [refreshRecipes])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SharedHeader />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeftIcon className="size-4 mr-1" />
              Back
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpenIcon className="size-5" />
              Your Recipes
            </CardTitle>
            <CardDescription>
              You have {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} saved
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Export */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Export Recipes</CardTitle>
            <CardDescription>
              Download all your recipes as a JSON file for backup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleExport}
              disabled={recipes.length === 0}
              variant="outline"
            >
              <DownloadIcon className="size-4 mr-2" />
              Export as JSON
            </Button>
          </CardContent>
        </Card>

        {/* Import */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Import Recipes</CardTitle>
            <CardDescription>
              Import recipes from a JSON backup file. Duplicates will be skipped.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button onClick={handleImportClick} variant="outline">
              <UploadIcon className="size-4 mr-2" />
              Import JSON File
            </Button>
            {importResult && (
              <p className="text-sm text-muted-foreground">
                Last import: {importResult.imported} added, {importResult.skipped} skipped
              </p>
            )}
          </CardContent>
        </Card>

        {/* Clear Data */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Permanently delete all your saved recipes. This cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => setShowClearDialog(true)}
              disabled={recipes.length === 0}
            >
              <TrashIcon className="size-4 mr-2" />
              Delete All Recipes
            </Button>
          </CardContent>
        </Card>
      </main>

      <SharedFooter />

      {/* Clear Confirmation Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete All Recipes?</DialogTitle>
            <DialogDescription>
              This will permanently delete all {recipes.length} saved recipes.
              This action cannot be undone. Consider exporting a backup first.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowClearDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearAll}>
              Delete All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
