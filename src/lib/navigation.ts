// Simple navigation configuration
export interface NavigationItem {
  name: string
  href: string
  external?: boolean
}

export interface NavigationSection {
  title: string
  links: NavigationItem[]
}

export interface NavigationConfig {
  main: NavigationItem[]
  footer: NavigationSection[]
}

export const navigationConfig: NavigationConfig = {
  main: [
    { name: 'Accueil', href: '/' },
    { name: 'Formations', href: '/courses' },
    { name: 'Concept', href: '/concept' },
    { name: 'Sessions', href: '/sessions' },
    { name: 'Coin des docs', href: '/coins-des-docs' },
    { name: 'Contact', href: '/contact' },
  ],
  footer: [
    {
      title: 'Formation',
      links: [
        { name: 'Formations', href: '/courses' },
        { name: 'Sessions', href: '/sessions' },
      ],
    },
    {
      title: 'Articles',
      links: [
        { name: 'Articles', href: '/posts' },
        { name: 'Coin des docs', href: '/coins-des-docs' },
      ],
    },
    {
      title: 'Légal',
      links: [
        { name: 'Mentions légales', href: '/mentions' },
        { name: 'Politique de confidentialité', href: '/privacy' },
      ],
    },
  ],
}
