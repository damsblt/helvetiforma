'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const menuItems = [
  {
    category: 'Contenu',
    items: [
      { name: 'Pages', href: '/admin/content/pages', icon: '📄' },
      { name: 'Formations', href: '/admin/content/formations', icon: '🎓' },
      { name: 'Navigation', href: '/admin/content/navigation', icon: '🧭' },
    ]
  },
  {
    category: 'Médias',
    items: [
      { name: 'Bibliothèque', href: '/admin/media', icon: '🖼️' },
      { name: 'Upload', href: '/admin/media/upload', icon: '📤' },
    ]
  },
  {
    category: 'Intégrations',
    items: [
      { name: 'TutorLMS', href: '/admin/integrations/tutor', icon: '🎯' },
      { name: 'Microsoft Teams', href: '/admin/integrations/teams', icon: '👥' },
      { name: 'Supabase', href: '/admin/integrations/supabase', icon: '🗄️' },
    ]
  },
  {
    category: 'Paramètres',
    items: [
      { name: 'Général', href: '/admin/settings', icon: '⚙️' },
      { name: 'SEO', href: '/admin/settings/seo', icon: '🔍' },
      { name: 'Sauvegardes', href: '/admin/settings/backups', icon: '💾' },
    ]
  }
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-background border-r border-border min-h-screen">
      <div className="p-6">
        {/* Dashboard Link */}
        <Link
          href="/admin"
          className={`flex items-center gap-3 p-3 rounded-lg mb-6 transition-colors ${
            pathname === '/admin' 
              ? 'bg-primary text-primary-foreground' 
              : 'hover:bg-muted'
          }`}
        >
          <span className="text-xl">📊</span>
          <span className="font-medium">Tableau de bord</span>
        </Link>

        {/* Menu Sections */}
        <nav className="space-y-6">
          {menuItems.map((section, sectionIndex) => (
            <div key={section.category}>
              {/* Section Title */}
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {section.category}
              </h3>
              
              {/* Section Items */}
              <div className="space-y-1">
                {section.items.map((item, itemIndex) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-200 ${
                        isActive 
                          ? 'bg-primary/10 text-primary border-r-2 border-primary' 
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Quick Stats */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium text-foreground mb-3">Statistiques rapides</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pages</span>
              <span className="font-medium">5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Formations</span>
              <span className="font-medium">12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Images</span>
              <span className="font-medium">28</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
