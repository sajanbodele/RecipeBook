'use client'

import Link from 'next/link'
import { UtensilsIcon, ExternalLinkIcon, CoffeeIcon } from 'lucide-react'

export function SharedHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <UtensilsIcon className="size-5 text-accent-action" />
          <span className="text-lg font-semibold text-foreground">RecipeBook</span>
        </Link>
        <div className="flex items-center gap-4">
          {/* Desktop: Text links */}
          <a
            href="https://linkedin.com/in/sajanbodele"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors items-center gap-1"
          >
            LinkedIn
            <ExternalLinkIcon className="size-3" />
          </a>
          <a
            href="https://buymeacoffee.com/sajanbodele"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors items-center gap-1"
          >
            <CoffeeIcon className="size-3.5" />
            Buy me a coffee
            <ExternalLinkIcon className="size-3" />
          </a>
          {/* Mobile: Icon only */}
          <a
            href="https://linkedin.com/in/sajanbodele"
            target="_blank"
            rel="noopener noreferrer"
            className="sm:hidden p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="LinkedIn"
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
          <a
            href="https://buymeacoffee.com/sajanbodele"
            target="_blank"
            rel="noopener noreferrer"
            className="sm:hidden p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Buy me a coffee"
          >
            <CoffeeIcon className="size-5" />
          </a>
        </div>
      </div>
    </header>
  )
}
