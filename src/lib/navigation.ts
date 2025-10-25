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
    // { name: 'E-learning', href: '/e-learning' }, // Hidden from navbar for now
    { name: 'Concept', href: '/concept' },
    { name: 'Sessions', href: '/sessions' },
    { name: 'Coin des docs', href: '/coin-des-docs' },
    { name: 'Contact', href: '/contact' },
  ],
  footer: [
    {
      title: 'Ressources',
      links: [
        { name: 'Sessions', href: '/sessions' },
        { name: 'Coin des docs', href: '/coin-des-docs' },
      ],
    },
    {
      title: 'Contact',
      links: [
        { name: 'Email', href: 'mailto:contact@helvetiforma.ch' },
        { name: 'Téléphone', href: 'tel:+41234567890' },
        { name: 'Adresse', href: '#' },
      ],
    },
  ],
}
