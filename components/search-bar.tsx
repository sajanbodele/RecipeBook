'use client'

import { Input } from '@/components/ui/input'
import { SearchIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  resultCount?: number
}

export function SearchBar({ value, onChange, resultCount }: SearchBarProps) {
  return (
    <div className="relative">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search recipes by title or ingredient..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-10 h-10"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onChange('')}
          className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground"
        >
          <XIcon className="size-4" />
        </Button>
      )}
      {value && resultCount !== undefined && (
        <p className="text-xs text-muted-foreground mt-2">
          {resultCount} {resultCount === 1 ? 'recipe' : 'recipes'} found
        </p>
      )}
    </div>
  )
}
