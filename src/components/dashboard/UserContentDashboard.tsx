'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import PurchasedArticles from './PurchasedArticles'
import EnrolledCourses from './EnrolledCourses'

interface UserContentDashboardProps {
  userId: string
}

export default function UserContentDashboard({ userId }: UserContentDashboardProps) {
  const [activeTab, setActiveTab] = useState<'purchases' | 'courses'>('purchases')

  // Pas besoin de loading/error ici car c'est géré dans PurchasedArticles

  return (
    <div className="space-y-8">
      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('purchases')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'purchases'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Articles achetés
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'courses'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Cours suivis
          </button>
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="mt-6">
        {activeTab === 'purchases' && (
          <PurchasedArticles userId={userId} />
        )}
        {activeTab === 'courses' && (
          <EnrolledCourses userId={userId} />
        )}
      </div>
    </div>
  )
}

