'use client';

import React, { useState } from 'react';
import { getRecipeImageUrl } from '@/lib/recipe-images';
import { Recipe } from '@/lib/types';
import { Utensils } from 'lucide-react';

interface RecipeImageProps {
  recipe: Partial<Recipe>;
  alt?: string;
  className?: string;
  aspectRatio?: '16/9' | 'square' | 'banner' | 'auto';
  sizes?: string;
}

export const RecipeImage: React.FC<RecipeImageProps> = ({
  recipe,
  alt,
  className = '',
  aspectRatio = '16/9',
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const imageUrl = getRecipeImageUrl(recipe);
  const title = alt || recipe.title || 'Rezeptbild';

  const aspectClass =
    aspectRatio === '16/9'
      ? 'aspect-16/9'
      : aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'banner'
      ? 'aspect-21/9 md:aspect-24/9'
      : '';

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${aspectClass} ${className}`}>
      {/* Skeleton Shimmer while loading */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-linear-to-r from-slate-100 via-slate-200/60 to-slate-100 animate-pulse flex items-center justify-center">
          <Utensils className="w-5 h-5 text-slate-300 animate-bounce opacity-40" />
        </div>
      )}

      {/* Fallback if offline or image error */}
      {error ? (
        <div className="absolute inset-0 bg-linear-to-br from-[#EBF2F2] to-[#DEE9E8] flex flex-col items-center justify-center text-[#586F73] p-2 text-center">
          <Utensils className="w-6 h-6 text-[#789A99] mb-1 opacity-80" />
          <span className="text-[10px] font-semibold text-slate-500 line-clamp-1">{recipe.category || 'fit & healthy'}</span>
        </div>
      ) : (
        /* Native responsive WebP image */
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-all duration-500 ${
            loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        />
      )}
    </div>
  );
};
