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
    { name: 'Calendrier', href: '/calendrier' },
    { name: 'Contact', href: '/contact' },
  ],
  footer: [
    {
      title: 'Formation',
      links: [
        { name: 'Nos formations', href: '/formations' },
        { name: 'Cours en ligne', href: '/courses' },
        { name: 'Webinaires', href: '/calendrier' },
      ],
    },
    {
      title: 'Support',
      links: [
        { name: 'Contact', href: '/contact' },
        { name: 'FAQ', href: '/faq' },
        { name: 'Documentation', href: '/docs' },
      ],
    },
    {
      title: 'Légal',
      links: [
        { name: 'Mentions légales', href: '/mentions' },
        { name: 'CGU', href: '/cgu' },
        { name: 'Politique de confidentialité', href: '/privacy' },
      ],
    },
  ],
}
