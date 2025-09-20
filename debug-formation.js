// Debug the formation matching logic
const formations = [
  {
    id: 'salaires',
    title: 'Gestion des Salaires',
    description: 'Maîtrisez la gestion complète des salaires...',
    duration: '3 jours',
    level: 'Intermédiaire',
    price: 'CHF 1,200',
    icon: '💰',
    color: 'blue',
    features: [
      'Calcul des salaires et avantages',
      'Conformité légale suisse',
      'Outils de gestion RH',
      'Gestion des congés et absences'
    ]
  }
];

const slug = 'salaires';
const foundFormation = formations.find(f => f.id === slug);

console.log('Slug:', slug);
console.log('Formations:', formations.map(f => ({ id: f.id, title: f.title })));
console.log('Found formation:', foundFormation);
console.log('Match result:', foundFormation ? 'FOUND' : 'NOT FOUND');
