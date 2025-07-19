"use client"

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFavorites } from '@/hooks/useFavorites'
import { useUser } from '@clerk/nextjs'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
  indicator_type: string
  indicator_id?: string
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'ghost' | 'outline'
  className?: string
}

export function FavoriteButton({ 
  indicator_type, 
  indicator_id, 
  size = 'sm',
  variant = 'ghost',
  className 
}: FavoriteButtonProps) {
  const { isSignedIn } = useUser()
  const { isFavorite, toggleFavorite, loading } = useFavorites()
  const [isToggling, setIsToggling] = useState(false)

  const handleToggle = async () => {
    if (!isSignedIn) return
    
    setIsToggling(true)
    await toggleFavorite(indicator_type, indicator_id)
    setIsToggling(false)
  }

  if (!isSignedIn) {
    return null
  }

  const isStarred = isFavorite(indicator_type, indicator_id)

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={loading || isToggling}
      className={cn(
        "transition-colors",
        isStarred && "text-yellow-500 hover:text-yellow-600",
        className
      )}
    >
      <Star 
        className={cn(
          "h-4 w-4",
          isStarred && "fill-current"
        )} 
      />
    </Button>
  )
}