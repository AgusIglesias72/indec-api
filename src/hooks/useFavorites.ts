"use client"

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'

interface Favorite {
  id: number
  indicator_type: string
  indicator_id?: string
  created_at: string
}

export function useFavorites() {
  const { isSignedIn } = useUser()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isSignedIn) {
      fetchFavorites()
    }
  }, [isSignedIn])

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/user/favorites')
      if (response.ok) {
        const data = await response.json()
        setFavorites(data.favorites || [])
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
    }
  }

  const addFavorite = async (indicator_type: string, indicator_id?: string) => {
    if (!isSignedIn) {
      toast.error('Debes iniciar sesión para agregar favoritos')
      return false
    }

    setLoading(true)
    try {
      const response = await fetch('/api/user/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ indicator_type, indicator_id }),
      })

      if (response.ok) {
        const data = await response.json()
        setFavorites(prev => [data.favorite, ...prev])
        toast.success('Agregado a favoritos')
        return true
      } else if (response.status === 409) {
        toast.error('Ya está en tus favoritos')
      } else {
        toast.error('Error al agregar favorito')
      }
    } catch (error) {
      console.error('Error adding favorite:', error)
      toast.error('Error al agregar favorito')
    } finally {
      setLoading(false)
    }
    return false
  }

  const removeFavorite = async (indicator_type: string, indicator_id?: string) => {
    if (!isSignedIn) return false

    setLoading(true)
    try {
      const params = new URLSearchParams({ indicator_type })
      if (indicator_id) params.append('indicator_id', indicator_id)

      const response = await fetch(`/api/user/favorites?${params}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setFavorites(prev => 
          prev.filter(fav => 
            !(fav.indicator_type === indicator_type && 
              (fav.indicator_id || null) === (indicator_id || null))
          )
        )
        toast.success('Eliminado de favoritos')
        return true
      } else {
        toast.error('Error al eliminar favorito')
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
      toast.error('Error al eliminar favorito')
    } finally {
      setLoading(false)
    }
    return false
  }

  const isFavorite = (indicator_type: string, indicator_id?: string) => {
    return favorites.some(fav => 
      fav.indicator_type === indicator_type && 
      (fav.indicator_id || null) === (indicator_id || null)
    )
  }

  const toggleFavorite = async (indicator_type: string, indicator_id?: string) => {
    if (isFavorite(indicator_type, indicator_id)) {
      return await removeFavorite(indicator_type, indicator_id)
    } else {
      return await addFavorite(indicator_type, indicator_id)
    }
  }

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    refetch: fetchFavorites
  }
}