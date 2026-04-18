import React from 'react';
import { Product } from '@/services/productService';
import Image from 'next/image';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
}) => {
  return (
    <div className="group relative bg-primary/60 backdrop-blur-md rounded-2xl shadow-glass hover:shadow-lg transition-all duration-300 overflow-hidden border border-foreground/20 hover:border-button/50">
      {/* Glass overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      {/* Gradient Accent on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-600/0 group-hover:from-primary-500/10 group-hover:to-primary-600/10 transition-all duration-300 rounded-2xl" />
      
      {/* Image Container */}
      <div className="relative h-64 w-full overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-primary-500/10 transition-colors duration-300" />
        {/* Button color accent line on hover */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-button to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-6 relative z-10">
        {/* Category Badge */}
        <span className="inline-block px-3 py-1 text-xs font-semibold text-foreground bg-primary/40 backdrop-blur-sm border border-foreground/30 rounded-full mb-3 group-hover:bg-primary/50 group-hover:border-button/50 group-hover:text-button transition-colors shadow-glass">
          {product.category}
        </span>

        {/* Product Name */}
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-red-600 transition-colors">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-foreground/70 text-sm mb-4 line-clamp-2 min-h-[2.5rem] group-hover:text-foreground/90 transition-colors">
          {product.description}
        </p>

        {/* Price and Stock */}
        <div className="flex items-center justify-between mb-4">
          <div>
            {product.salePrice ? (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-red-600 group-hover:text-gold-600 transition-colors">
                  ${product.salePrice.toFixed(2)}
                </span>
                <span className="text-sm text-foreground/50 line-through">
                  ${product.price.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-red-600 group-hover:text-gold-600 transition-colors">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
          {product.stock > 0 ? (
            <span className="text-xs font-semibold text-gold-500 bg-gold-500/20 border border-gold-500/30 px-2 py-1 rounded-full shadow-glass">
              In Stock
            </span>
          ) : (
            <span className="text-xs text-foreground/60 bg-primary/20 border border-foreground/20 px-2 py-1 rounded-full">
              Out of Stock
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart(product)}
          disabled={product.stock === 0}
          className="w-full bg-red-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-red-700 hover:shadow-xl hover:shadow-glow-red transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg border border-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
        >
          {product.stock > 0 ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Add to Cart
            </span>
          ) : (
            'Out of Stock'
          )}
        </button>
      </div>
    </div>
  );
};

