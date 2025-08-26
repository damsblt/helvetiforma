'use client';
import React, { useState } from 'react';

export default function DocsList({ docs, categories }: { docs: any[]; categories: string[] }) {
  const [selected, setSelected] = useState('Toutes');

  const filteredDocs =
    selected === 'Toutes'
      ? docs
      : docs.filter((doc) => doc.Categories === selected);

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Coin des Docs</h1>
        <select
          className="border rounded px-3 py-2 text-gray-700"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-8">
        {filteredDocs.map((doc: any) => {
          const { id, title, excerpt, price, free_paid, Categories, preview } = doc;
          const isFree = free_paid === true || price === 0;
          const hasPreview = Array.isArray(preview) && preview.length > 0;
          const previewFile = hasPreview ? preview[0] : null;
          const isPDF = previewFile && previewFile.mime === 'application/pdf';
          const previewUrl = previewFile ? `http://localhost:1337${previewFile.url}` : null;

          return (
            <div key={id} className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row gap-6 items-center">
              <div className="w-32 h-32 bg-blue-100 rounded flex items-center justify-center overflow-hidden group">
                {isPDF ? (
                  <div className="flex flex-col items-center justify-center w-full h-full">
                    <span role="img" aria-label="PDF" className="text-4xl">📄</span>
                    <span className="text-xs mt-2">PDF</span>
                  </div>
                ) : (
                  <div className="text-gray-400">Aucun aperçu</div>
                )}
              </div>
              <div className="flex-1 w-full">
                <div className="flex items-center gap-4 mb-2">
                  <h2 className="text-lg font-semibold">{title}</h2>
                  {isFree ? (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold">Gratuit</span>
                  ) : (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                      CHF {price} <span role="img" aria-label="lock">🔒</span>
                    </span>
                  )}
                </div>
                <div className="text-gray-600 mb-2 line-clamp-2">{excerpt || '[Extrait à compléter]'}</div>
                <div className="text-sm text-blue-700 mb-2">{Categories || '[Catégorie]'}</div>
                {isPDF && previewUrl ? (
                  <a
                    href={previewUrl}
                    download={previewFile.name}
                    className="px-5 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition text-center inline-block"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Télécharger
                  </a>
                ) : (
                  <button className="px-5 py-2 bg-gray-300 text-gray-500 rounded cursor-not-allowed" disabled>
                    Pas de fichier
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
} 