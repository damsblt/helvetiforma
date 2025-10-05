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
    { name: 'Concept', href: '/concept' },
    { name: 'Coin des docs', href: '/coins-des-docs' },
    { name: 'Sessions', href: '/sessions' },
  ],
  footer: [
    {
      title: 'Formation',
      links: [
        { name: 'Sessions', href: '/sessions' },
      ],
    },
    {
      title: 'Articles',
      links: [
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
