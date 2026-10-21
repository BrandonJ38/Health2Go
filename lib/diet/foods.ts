// Whole foods the Diet Builder can recommend. Tags drive the rules in builder.ts.
import type { Allergy, FoodCategory } from '../profile/options';

export type FoodGroup = 'protein' | 'vegetables' | 'fruit' | 'fats' | 'carbs' | 'dairy';

export type Tag =
  | 'meat' // beef, pork, poultry
  | 'redMeat'
  | 'fish'
  | 'shellfish'
  | 'egg'
  | 'dairy'
  | 'grain'
  | 'gluten'
  | 'legume'
  | 'soy'
  | 'peanut'
  | 'treeNut'
  | 'sesame'
  | 'starchy' // potatoes, rice, grains — limited on keto
  | 'sweetFruit' // higher-sugar fruit — limited on keto
  | 'highProtein'
  | 'highVolume'; // filling and low in calories — good for fat loss

export type Food = {
  id: string;
  name: string;
  group: FoodGroup;
  reason: string;
  tags: Tag[];
  categories: FoodCategory[]; // links to onboarding likes/dislikes
};

export const FOODS: Food[] = [
  // Protein
  { id: 'beef', name: 'Grass-fed beef', group: 'protein', reason: 'Complete protein, iron, zinc and B12', tags: ['meat', 'redMeat', 'highProtein'], categories: ['beef', 'american'] },
  { id: 'chicken', name: 'Chicken (thighs or breast)', group: 'protein', reason: 'Lean, versatile protein', tags: ['meat', 'highProtein'], categories: ['chicken'] },
  { id: 'pork', name: 'Pork tenderloin', group: 'protein', reason: 'Lean protein rich in B vitamins', tags: ['meat', 'redMeat', 'highProtein'], categories: ['pork'] },
  { id: 'salmon', name: 'Wild salmon', group: 'protein', reason: 'Protein plus omega-3 fats', tags: ['fish', 'highProtein'], categories: ['seafood'] },
  { id: 'sardines', name: 'Sardines or mackerel', group: 'protein', reason: 'Cheap, rich in omega-3s and calcium', tags: ['fish', 'highProtein'], categories: ['seafood'] },
  { id: 'shrimp', name: 'Shrimp', group: 'protein', reason: 'Very lean protein', tags: ['shellfish', 'highProtein'], categories: ['seafood'] },
  { id: 'eggs', name: 'Pasture-raised eggs', group: 'protein', reason: 'Protein, choline and healthy fats', tags: ['egg', 'highProtein'], categories: ['eggs', 'breakfast'] },
  { id: 'tofu', name: 'Tofu or tempeh', group: 'protein', reason: 'Plant protein with all essential amino acids', tags: ['soy', 'legume', 'highProtein'], categories: ['asian'] },
  { id: 'lentils', name: 'Lentils', group: 'protein', reason: 'Plant protein and lots of fiber', tags: ['legume', 'starchy'], categories: ['legumes', 'indian', 'mediterranean'] },
  { id: 'beans', name: 'Black beans or chickpeas', group: 'protein', reason: 'Fiber, protein and minerals', tags: ['legume', 'starchy'], categories: ['legumes', 'mexican', 'mediterranean'] },

  // Vegetables
  { id: 'greens', name: 'Leafy greens (spinach, kale, arugula)', group: 'vegetables', reason: 'Folate, vitamin K and fiber for very few calories', tags: ['highVolume'], categories: ['vegetables', 'salads'] },
  { id: 'cruciferous', name: 'Broccoli, cauliflower, Brussels sprouts', group: 'vegetables', reason: 'Fiber and vitamin C', tags: ['highVolume'], categories: ['vegetables'] },
  { id: 'peppers', name: 'Bell peppers and tomatoes', group: 'vegetables', reason: 'Vitamin C and antioxidants', tags: ['highVolume'], categories: ['vegetables', 'salads', 'mexican', 'italian'] },
  { id: 'zucchini', name: 'Zucchini, cucumber, asparagus', group: 'vegetables', reason: 'Filling, low in calories', tags: ['highVolume'], categories: ['vegetables'] },
  { id: 'mushrooms', name: 'Mushrooms', group: 'vegetables', reason: 'Savory flavor, B vitamins, few calories', tags: ['highVolume'], categories: ['vegetables', 'asian', 'italian'] },
  { id: 'sweetPotato', name: 'Sweet potatoes', group: 'carbs', reason: 'Whole-food carbs with fiber and vitamin A', tags: ['starchy'], categories: ['vegetables', 'american'] },

  // Fruit
  { id: 'berries', name: 'Berries', group: 'fruit', reason: 'Lower in sugar than most fruit, high in fiber and antioxidants', tags: [], categories: ['fruit', 'bowls', 'breakfast'] },
  { id: 'citrus', name: 'Oranges, apples, pears', group: 'fruit', reason: 'Whole fruit with fiber, unlike juice', tags: ['sweetFruit'], categories: ['fruit'] },
  { id: 'bananas', name: 'Bananas', group: 'fruit', reason: 'Easy carbs and potassium around workouts', tags: ['sweetFruit'], categories: ['fruit', 'bowls'] },

  // Fats
  { id: 'evoo', name: 'Extra-virgin olive oil', group: 'fats', reason: 'Best-studied cooking fat', tags: [], categories: ['mediterranean', 'italian', 'salads'] },
  { id: 'avocado', name: 'Avocado and avocado oil', group: 'fats', reason: 'Monounsaturated fat and fiber; avocado oil handles high heat', tags: [], categories: ['fruit', 'mexican', 'salads'] },
  { id: 'butter', name: 'Grass-fed butter or ghee', group: 'fats', reason: 'Stable for cooking, no seed oils', tags: ['dairy'], categories: ['dairy'] },
  { id: 'tallow', name: 'Beef tallow', group: 'fats', reason: 'Very stable for high-heat cooking', tags: ['meat'], categories: ['beef'] },
  { id: 'nuts', name: 'Almonds and walnuts', group: 'fats', reason: 'Healthy fats, fiber and magnesium', tags: ['treeNut'], categories: ['nuts'] },
  { id: 'seeds', name: 'Chia and flax seeds', group: 'fats', reason: 'Plant omega-3s and fiber', tags: [], categories: ['nuts', 'bowls'] },
  { id: 'olives', name: 'Olives', group: 'fats', reason: 'Healthy fats and a salty snack', tags: [], categories: ['mediterranean'] },

  // Carbs
  { id: 'oats', name: 'Steel-cut or rolled oats', group: 'carbs', reason: 'Slow-digesting carbs and soluble fiber', tags: ['grain', 'starchy'], categories: ['grains', 'breakfast'] },
  { id: 'rice', name: 'White or brown rice', group: 'carbs', reason: 'Simple, easy-to-digest carbs', tags: ['grain', 'starchy'], categories: ['rice', 'asian', 'mexican', 'indian'] },
  { id: 'quinoa', name: 'Quinoa', group: 'carbs', reason: 'Carbs with more protein than most grains', tags: ['grain', 'starchy'], categories: ['grains', 'salads'] },
  { id: 'potatoes', name: 'Potatoes (boiled or baked)', group: 'carbs', reason: 'Very filling whole-food carbs', tags: ['starchy'], categories: ['vegetables', 'american'] },
  { id: 'sourdough', name: 'Real sourdough bread', group: 'carbs', reason: 'Simple ingredients, fermented', tags: ['grain', 'gluten', 'starchy'], categories: ['grains'] },

  // Dairy
  { id: 'greekYogurt', name: 'Plain Greek yogurt', group: 'dairy', reason: 'High protein, probiotics — skip the flavored kind', tags: ['dairy', 'highProtein'], categories: ['dairy', 'breakfast'] },
  { id: 'cottage', name: 'Cottage cheese', group: 'dairy', reason: 'High protein, slow-digesting', tags: ['dairy', 'highProtein'], categories: ['dairy'] },
  { id: 'kefir', name: 'Kefir', group: 'dairy', reason: 'Fermented, rich in probiotics', tags: ['dairy'], categories: ['dairy'] },
  { id: 'cheese', name: 'Aged cheese', group: 'dairy', reason: 'Protein and calcium, naturally low in lactose', tags: ['dairy'], categories: ['dairy', 'italian'] },
];

export const ALLERGY_TAGS: Record<Allergy, Tag[]> = {
  gluten: ['gluten'],
  dairy: ['dairy'],
  eggs: ['egg'],
  peanuts: ['peanut'],
  treeNuts: ['treeNut'],
  shellfish: ['shellfish'],
  fish: ['fish'],
  soy: ['soy'],
  sesame: ['sesame'],
};

export const GROUP_LABEL: Record<FoodGroup, string> = {
  protein: 'Protein',
  vegetables: 'Vegetables',
  fruit: 'Fruit',
  fats: 'Fats & oils',
  carbs: 'Carbs',
  dairy: 'Dairy',
};
