import React from 'react';
import DocsList from './DocsList';

async function getDocs() {
  const res = await fetch('http://localhost:1337/api/coin-docs?populate=*', { cache: 'no-store' });
  const data = await res.json();
  return data.data;
}

export default async function DocsPage() {
  const docs = await getDocs();

  const categorySet = new Set<string>();
  categorySet.add('Toutes');
  
  docs.forEach((doc: any) => {
    const category = doc.Categories || 'Autre';
    if (category) {
      categorySet.add(category as string);
    }
  });

  const categories: string[] = Array.from(categorySet);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-0">
      <div className="container mx-auto max-w-3xl">
        <DocsList docs={docs} categories={categories} />
      </div>
    </div>
  );
} 