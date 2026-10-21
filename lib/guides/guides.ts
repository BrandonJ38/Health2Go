// Best-order guides for the go-to restaurants picked in onboarding. Hand-curated (researched 2026-10-19).
// Rule: cooking-oil facts must link to a source; `official` = the company's own site, statement or document.
// Picks only rely on things that are verifiable (grilled vs fried, options the chain offers, drinks/sauces);
// they don't claim exact recipes of individual items. Recipes change and vary by location — re-check periodically.
import { RESTAURANTS, type RestaurantKey } from '../profile/options';

export type GuideVerdict = 'good' | 'mixed' | 'tough';

export type Guide = {
  restaurant: RestaurantKey;
  verdict: GuideVerdict;
  oil: { text: string; source: string; url: string; official: boolean };
  bestPicks: string[];
  skip: string[];
  howToOrder: string[];
  checked: string; // YYYY-MM
};

export const VERDICT_LABEL: Record<GuideVerdict, string> = {
  good: 'Seed-oil free kitchen',
  mixed: 'Some good options',
  tough: 'Tough — order carefully',
};

const CHECKED = '2026-10';

export const GUIDES: Guide[] = [
  {
    restaurant: 'sweetgreen',
    verdict: 'good',
    oil: {
      text: 'Removed seed oils from the menu in January 2025; cooks with extra-virgin olive oil and avocado oil.',
      source: 'Salon, reporting the CEO’s announcement',
      url: 'https://www.salon.com/2025/01/24/sweetgreen-ditches-seed-oils-launches-seed-oil-free-menu/',
      official: false,
    },
    bestPicks: ['Any bowl or salad with a protein (chicken, steak, salmon, tofu)', 'Extra vegetables or double protein'],
    skip: ['Sweetened drinks', 'Dressings with honey or sugar if you’re avoiding added sugar — check the menu ingredients'],
    howToOrder: ['Ask for dressing on the side and use about half', 'Swap grains for extra greens if you want fewer carbs'],
    checked: CHECKED,
  },
  {
    restaurant: 'truefoodkitchen',
    verdict: 'good',
    oil: {
      text: 'Went 100% seed-oil free in February 2025, cooking with avocado oil and olive oil.',
      source: 'Nation’s Restaurant News',
      url: 'https://www.nrn.com/casual-dining/true-food-kitchen-goes-seed-oil-free',
      official: false,
    },
    bestPicks: ['Grilled fish or steak with vegetables', 'Bowls with a lean protein', 'Seasonal vegetable sides'],
    skip: ['Desserts and sweetened drinks or cocktails'],
    howToOrder: ['Most of the menu fits — focus on protein + vegetables', 'Ask about added sugar in sauces if you’re strict'],
    checked: CHECKED,
  },
  {
    restaurant: 'cava',
    verdict: 'mixed',
    oil: {
      text: 'Uses pressed sunflower oil blended with extra-virgin olive oil in many recipes (company statement).',
      source: 'CAVA statement to the Daily Dot',
      url: 'https://www.dailydot.com/news/cava-olive-oil-seed-oil-blend/',
      official: true,
    },
    bestPicks: ['Greens bowl with grilled chicken or steak', 'Hummus, tzatziki and fresh vegetable toppings', 'Lemon or tahini-based dressings in small amounts'],
    skip: ['Pita chips', 'Falafel and other fried items', 'Sweetened juices and lemonades'],
    howToOrder: ['Go greens-first, then add a grilled protein and plenty of vegetables', 'Dressings and some toppings use the sunflower/olive blend — keep them light'],
    checked: CHECKED,
  },
  {
    restaurant: 'chipotle',
    verdict: 'mixed',
    oil: {
      text: 'Cooks with sunflower oil and rice bran oil (switched from soybean oil in the mid-2010s). Which oil goes in which item isn’t clearly published.',
      source: 'The Daily Meal',
      url: 'https://www.thedailymeal.com/1803395/chipotle-cooking-oil-rice-bran',
      official: false,
    },
    bestPicks: ['Burrito bowl or salad (skip the tortilla)', 'Grilled meat + fajita vegetables + salsa + guacamole', 'Lettuce base with half rice or no rice'],
    skip: ['Chips and crispy taco shells (fried)', 'Large flour tortillas', 'Sweet vinaigrette (contains honey)'],
    howToOrder: ['Pico, salsas and guacamole add flavor without seed oil-heavy sauces', 'Ask for extra fajita veggies instead of rice'],
    checked: CHECKED,
  },
  {
    restaurant: 'fiveguys',
    verdict: 'mixed',
    oil: {
      text: 'Fries are cooked only in 100% refined peanut oil, and the fryers cook nothing else. Peanut oil isn’t one of the usual "seed oils," but it is high in omega-6.',
      source: 'Five Guys FAQ',
      url: 'https://www.fiveguys.com/support-hub/faqs/',
      official: true,
    },
    bestPicks: ['Burger in a lettuce wrap with fresh toppings', 'Little burger (one patty) if you want less'],
    skip: ['Fries (large orders are huge)', 'Milkshakes', 'BBQ sauce and ketchup if avoiding sugar'],
    howToOrder: ['Ask for a lettuce wrap instead of the bun', 'Load up on free vegetable toppings — grilled onions, mushrooms, lettuce, tomato'],
    checked: CHECKED,
  },
  {
    restaurant: 'innout',
    verdict: 'mixed',
    oil: {
      text: 'Fries are cooked in 100% sunflower oil, which In-N-Out has used for decades.',
      source: 'Food Republic, quoting In-N-Out',
      url: 'https://www.foodrepublic.com/1805658/in-n-out-fries-ingredients/',
      official: false,
    },
    bestPicks: ['"Protein Style" burger (wrapped in lettuce instead of a bun)', 'Double-Double Protein Style for more protein'],
    skip: ['Fries', 'Shakes and sodas'],
    howToOrder: ['Ask for no spread (it contains sugar) — mustard instead', 'Add grilled onions for flavor'],
    checked: CHECKED,
  },
  {
    restaurant: 'chickfila',
    verdict: 'mixed',
    oil: {
      text: 'Breaded chicken is fried in refined peanut oil; waffle fries are cooked in canola oil.',
      source: 'Tasting Table, citing Chick-fil-A’s website',
      url: 'https://www.tastingtable.com/1781493/oil-chick-fil-a-fries-canola/',
      official: false,
    },
    bestPicks: ['Grilled Nuggets', 'Grilled chicken sandwich or wrap', 'Fruit cup or side salad instead of fries'],
    skip: ['Waffle fries (canola oil)', 'Sweet tea, lemonade and milkshakes', 'Dipping sauces — most are sugar plus seed oil'],
    howToOrder: ['Choose anything "grilled" over the breaded, fried versions', 'Ask for unsweetened tea'],
    checked: CHECKED,
  },
  {
    restaurant: 'popeyes',
    verdict: 'mixed',
    oil: {
      text: 'Fries its chicken (and Cajun fries) in beef tallow, often blended with vegetable oil; the blend can vary by location.',
      source: 'Chowhound',
      url: 'https://www.chowhound.com/1877958/fried-chicken-chain-use-beef-tallow',
      official: false,
    },
    bestPicks: ['Bone-in chicken pieces instead of tenders or sandwiches', 'The lightest side available, or skip sides'],
    skip: ['Biscuits with honey butter', 'Sweet tea and sodas', 'Sugary dipping sauces'],
    howToOrder: ['If you’re having fried chicken, tallow is a better fat than a pure seed-oil fryer — but it’s still fried, so keep it occasional', 'Ask your location what they fry in'],
    checked: CHECKED,
  },
  {
    restaurant: 'mcdonalds',
    verdict: 'tough',
    oil: {
      text: 'Fries are cooked in a vegetable oil blend (canola, corn and soybean oil) in the US.',
      source: 'Food Republic',
      url: 'https://www.foodrepublic.com/1713513/oil-type-mcdonalds-french-fries/',
      official: false,
    },
    bestPicks: ['Burger patties without the bun (grilled, not fried)', 'Quarter Pounder patty with lettuce, onion, pickles', 'Apple slices or a side salad'],
    skip: ['Fries, nuggets and fried chicken or fish sandwiches', 'Sodas, sweet tea, shakes and McFlurries', 'Big Mac sauce and other sugary sauces'],
    howToOrder: ['Order patties à la carte or a burger with no bun and no sauce', 'Black coffee or water to drink'],
    checked: CHECKED,
  },
  {
    restaurant: 'burgerking',
    verdict: 'tough',
    oil: {
      text: 'Fryer oil is a blend of corn, canola, soy and/or cottonseed oils, shared by fries, onion rings and fried chicken.',
      source: 'Reported, quoting Burger King’s FAQ',
      url: 'https://lacocinadegisele.com/knowledgebase/what-oil-does-burger-king-use',
      official: false,
    },
    bestPicks: ['Flame-grilled burger or Whopper patty without the bun', 'Side salad with little or no dressing'],
    skip: ['Fries, onion rings and chicken fries', 'Shakes and sodas'],
    howToOrder: ['Ask for no bun, no mayo, no ketchup — mustard, lettuce, tomato, onion, pickles instead'],
    checked: CHECKED,
  },
  {
    restaurant: 'wendys',
    verdict: 'tough',
    oil: {
      text: 'Fries are cooked in vegetable oil (soybean, canola and/or cottonseed, and possibly corn), shared with fried chicken.',
      source: 'Tasting Table, citing Wendy’s ingredient list',
      url: 'https://www.tastingtable.com/1901234/frying-oil-wendys-uses-fries-chicken/',
      official: false,
    },
    bestPicks: ['Plain baked potato', 'Chili', 'Burger patties without the bun', 'Grilled chicken if available'],
    skip: ['Fries, nuggets and crispy chicken', 'Frosty and sodas'],
    howToOrder: ['A baked potato plus chili is one of the better fast-food meals', 'Skip sour cream and cheese sauce if you’re watching additives'],
    checked: CHECKED,
  },
  {
    restaurant: 'tacobell',
    verdict: 'tough',
    oil: {
      text: 'Switched its US restaurants to canola oil for frying (company announcement, 2007 — the most recent official statement found). Fried items include chips, shells and cinnamon twists.',
      source: 'QSR Magazine, reporting Taco Bell’s announcement',
      url: 'https://www.qsrmagazine.com/news/taco-bell-switch-zero-grams-trans-fat-canola-oil/',
      official: true,
    },
    bestPicks: ['Bowls or soft tacos with grilled chicken or steak', 'Order "Fresco style" (swaps cheese and sauces for pico de gallo)'],
    skip: ['Chalupas, crunchy shells, nacho chips and cinnamon twists (fried)', 'Baja Blast and other sodas', 'Creamy sauces'],
    howToOrder: ['Ask for "Fresco style" on any item', 'Add extra lettuce, tomato and pico instead of sauces'],
    checked: CHECKED,
  },
  {
    restaurant: 'raisingcanes',
    verdict: 'tough',
    oil: {
      text: 'Fried foods are cooked in a soybean and canola oil blend (company allergen sheet, 2018).',
      source: 'Raising Cane’s allergen & nutrition info (2018)',
      url: 'https://dining.ecu.edu/wp-content/uploads/2020/02/Raising-Canes-Allergen-and-Nutrition-Info.pdf',
      official: true,
    },
    bestPicks: ['Chicken fingers without fries or toast', 'Coleslaw as a side'],
    skip: ['Crinkle-cut fries', 'Texas toast', 'Lemonade and sweet tea'],
    howToOrder: ['The menu is almost all fried in seed oils — best kept as an occasional meal'],
    checked: CHECKED,
  },
  {
    restaurant: 'pandaexpress',
    verdict: 'tough',
    oil: {
      text: 'Most dishes are cooked in soybean oil, per the company’s ingredient statement. Steamed rice is one of the few items without it.',
      source: 'Tasting Table, citing Panda Express’s ingredient statement',
      url: 'https://www.tastingtable.com/2046834/panda-express-cooking-oil/',
      official: false,
    },
    bestPicks: ['Grilled teriyaki chicken with sauce on the side', 'Steamed white rice', 'Super Greens (still cooked in soybean oil, but mostly vegetables)'],
    skip: ['Orange chicken and other battered, saucy entrées (fried and very sugary)', 'Chow mein and fried rice', 'Egg rolls and rangoons'],
    howToOrder: ['Ask for sauce on the side', 'A bowl with half greens, half rice and a grilled protein is the least-bad combo'],
    checked: CHECKED,
  },
  {
    restaurant: 'shakeshack',
    verdict: 'tough',
    oil: {
      text: 'Most locations cook fries and fried items in soybean oil (a sugarcane-oil test ran at only two NYC locations).',
      source: 'Tasting Table',
      url: 'https://www.tastingtable.com/1397024/shake-shack-testing-new-sustainable-oil-sugarcane',
      official: false,
    },
    bestPicks: ['ShackBurger in a lettuce wrap', 'Single patty with lettuce, tomato, onion'],
    skip: ['Crinkle-cut fries', 'Fried chicken sandwiches and the fried ’Shroom Burger', 'Shakes and lemonades'],
    howToOrder: ['Ask for a lettuce wrap and no ShackSauce'],
    checked: CHECKED,
  },
  {
    restaurant: 'subway',
    verdict: 'tough',
    oil: {
      text: 'No fryers, but the breads contain soybean oil and sugar.',
      source: 'Food Republic',
      url: 'https://www.foodrepublic.com/1490421/most-nutritious-sandwich-bread-subway',
      official: false,
    },
    bestPicks: ['Protein bowl (any sandwich as a salad, no bread)', 'Grilled chicken, turkey or steak with lots of vegetables'],
    skip: ['Bread, wraps and cookies', 'Sweet sauces like sweet onion teriyaki and honey mustard', 'Chips'],
    howToOrder: ['Ask for a bowl, then vinegar, mustard, salt and pepper instead of creamy sauces'],
    checked: CHECKED,
  },
  {
    restaurant: 'panera',
    verdict: 'mixed',
    oil: {
      text: 'Removed artificial colors, flavors, sweeteners and preservatives from its US menu in 2017. Cooking oils aren’t publicly detailed.',
      source: 'Christian Science Monitor, reporting Panera’s announcement',
      url: 'https://proof.csmonitor.com/Business/The-Bite/2017/0119/As-promised-Panera-dumps-all-food-additives',
      official: true,
    },
    bestPicks: ['Salads with grilled chicken, dressing on the side', 'Broth-based soups', 'Bowls with greens and a protein'],
    skip: ['Pastries, bagels and bread bowls', 'Sweetened drinks and lemonades'],
    howToOrder: ['Ask for oil and vinegar if available, or use half the dressing', 'Choose "you pick two" with a salad and a soup instead of a sandwich'],
    checked: CHECKED,
  },
  {
    restaurant: 'olivegarden',
    verdict: 'tough',
    oil: {
      text: 'The signature Italian dressing lists soybean oil as its second ingredient, plus sugar (retail bottle label). Breadsticks are reported to be brushed with a soybean oil blend.',
      source: 'Retail label of Olive Garden Signature Italian Dressing',
      url: 'https://shop.lowesfoods.com/products/olive-garden-signature-italian-dressing-16-oz/4341425',
      official: true,
    },
    bestPicks: ['Grilled salmon or grilled chicken with vegetables', 'Salad with dressing on the side (or oil and vinegar)', 'Minestrone soup'],
    skip: ['Unlimited breadsticks', 'Fried calamari and other fried appetizers', 'Cream sauces and desserts'],
    howToOrder: ['Ask for broccoli or another vegetable instead of pasta', 'Ask if they have olive oil and vinegar for the salad'],
    checked: CHECKED,
  },
  {
    restaurant: 'dominos',
    verdict: 'tough',
    oil: {
      text: 'Hand-tossed crust ingredients include soybean oil and sugar.',
      source: 'Reported ingredient list (pizzamaking.com forum, quoting Domino’s label)',
      url: 'https://www.pizzamaking.com/forum/index.php?msg=312041',
      official: false,
    },
    bestPicks: ['Thin crust with meat and vegetable toppings', 'Fewer slices plus a side salad'],
    skip: ['Breadsticks, cheesy bread and dessert items', 'Wings with sweet sauces', 'Sodas'],
    howToOrder: ['Pile on vegetables and lean proteins', 'Ask for light sauce if you’re watching sugar'],
    checked: CHECKED,
  },
  {
    restaurant: 'starbucks',
    verdict: 'mixed',
    oil: {
      text: 'No fryers. The bigger issue is sugar: each pump of Classic syrup adds about 5 g of sugar (reported), and many drinks use several pumps.',
      source: 'Reported nutrition data',
      url: 'https://baristalife.co/blogs/blog/starbucks-syrup-pumps-sugar',
      official: false,
    },
    bestPicks: ['Brewed coffee, Americano or unsweetened cold brew', 'Unsweetened iced tea', 'Latte with no syrup (or ask for 1 pump)'],
    skip: ['Frappuccinos', 'Refreshers and lemonades', 'Pastries and loaf cakes'],
    howToOrder: ['Ask for fewer pumps — sweetened drinks usually get several', 'Add cinnamon instead of syrup for flavor'],
    checked: CHECKED,
  },
];

export const guideFor = (key: string) => GUIDES.find((g) => g.restaurant === key) ?? null;

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

// Matches a restaurant name from Google ("Chipotle Mexican Grill", "CAVA") to a guide.
export function guideKeyForName(name: string): RestaurantKey | null {
  const n = norm(name);
  const hit = RESTAURANTS.find((r) => {
    const label = norm(r.label);
    // Short names ("CAVA") must match exactly so "Cava Bistro" doesn't get CAVA's guide.
    if (label.length <= 5) return n === label;
    return n.startsWith(label) || (r.value === 'panera' && n.startsWith('panera'));
  });
  return hit && guideFor(hit.value) ? hit.value : null;
}
