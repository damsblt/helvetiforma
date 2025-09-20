// Test the filtering logic
const formation = {
  id: 'salaires',
  title: 'Gestion des Salaires',
  description: 'Maîtrisez la gestion complète des salaires...'
};

const eLearningProducts = [
  {
    id: 150,
    name: 'Gestion des salaires - 30000',
    description: 'Description du cours de gestion des salaires',
    price: '30000'
  }
];

console.log('Formation:', formation);
console.log('Products:', eLearningProducts);

const filterProducts = () => {
  if (!formation) return;
  
  let filtered = eLearningProducts.filter(product => {
    const titleMatch = product.name.toLowerCase().includes(formation.title.toLowerCase());
    const idMatch = product.name.toLowerCase().includes(formation.id.toLowerCase());
    const descMatch = product.description.toLowerCase().includes(formation.title.toLowerCase());
    
    console.log('Product:', product.name);
    console.log('  Title match:', titleMatch, `("${product.name.toLowerCase()}" includes "${formation.title.toLowerCase()}")`);
    console.log('  ID match:', idMatch, `("${product.name.toLowerCase()}" includes "${formation.id.toLowerCase()}")`);
    console.log('  Desc match:', descMatch, `("${product.description.toLowerCase()}" includes "${formation.title.toLowerCase()}")`);
    
    return titleMatch || idMatch || descMatch;
  });

  return filtered;
};

const result = filterProducts();
console.log('Filtered products:', result);
