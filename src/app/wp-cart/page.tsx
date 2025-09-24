"use client";
import React from 'react';

const WORDPRESS_CART_URL = (process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch').replace(/\/$/, '') + '/cart/';

export default function WordPressCartPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">Panier (WordPress)</h1>
      <div className="rounded border overflow-hidden" style={{height: '80vh'}}>
        <iframe
          title="WordPress Cart"
          src={WORDPRESS_CART_URL}
          className="w-full h-full border-0"
        />
      </div>
      <p className="text-sm text-gray-500 mt-3">Si le panier ne s'affiche pas, ouvrez <a className="underline" href={WORDPRESS_CART_URL} target="_blank" rel="noreferrer">le lien direct</a>.</p>
    </div>
  );
}


