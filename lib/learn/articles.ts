import type { Article } from './types';

// Drafted with AI assistance from the sources in sources.ts; numbers checked against each study's abstract.
// `reviewed: false` until a registered dietitian or doctor has checked the article (required before public launch).

export const ARTICLES: Article[] = [
  {
    slug: 'seed-oils',
    title: 'Seed oils',
    summary: 'Why the oils used in most fried and packaged food are worth avoiding — and where the science disagrees.',
    readMinutes: 4,
    avoid: ['seedOils'],
    shortVersion:
      'Seed oils like soybean, corn, sunflower and canola are now the biggest source of omega-6 fat in the modern diet. ' +
      'When they are heated for frying — especially reused fryer oil — they break down into oxidation products that are toxic in lab studies. ' +
      'Whether everyday amounts harm your heart is genuinely debated, but cooking with olive oil, avocado oil or animal fats avoids the question entirely.',
    claims: [
      {
        text: 'Omega-6 intake, mostly from seed oils, has risen sharply over the last century, shifting the omega-6 to omega-3 balance of the diet from roughly even to heavily omega-6.',
        evidence: 'strong',
        sources: ['simopoulos2002'],
      },
      {
        text: 'Heating oils rich in polyunsaturated fat at frying temperatures forms aldehydes and other lipid oxidation products. Reused fryer oil and fried foods are major sources.',
        evidence: 'strong',
        sources: ['grootveld2020'],
      },
      {
        text: 'Eating these oxidation products and repeatedly heated oils raises blood pressure and damages blood vessels in animal studies. Human evidence is still limited.',
        evidence: 'emerging',
        sources: ['ng2014', 'grootveld2020'],
      },
      {
        text: 'In a randomized trial, cutting dietary linoleic acid (the main omega-6 in seed oils) lowered the oxidized linoleic acid compounds circulating in the body.',
        evidence: 'emerging',
        sources: ['ramsden2012'],
      },
      {
        text: 'When researchers recovered unpublished data from two older trials, replacing saturated fat with linoleic-acid-rich oils lowered cholesterol but did not reduce deaths — and in the Sydney trial, deaths from heart disease went up.',
        evidence: 'debated',
        sources: ['ramsden2013', 'ramsden2016'],
      },
      {
        text: 'The other side: the American Heart Association and a large meta-analysis of cohort studies link higher linoleic acid intake with lower heart disease risk when it replaces saturated fat or refined carbs.',
        evidence: 'debated',
        sources: ['sacks2017', 'farvid2014'],
      },
      {
        text: 'Extra-virgin olive oil has the strongest evidence of any cooking fat: in a large trial, a Mediterranean diet with extra-virgin olive oil cut heart attacks, strokes and heart deaths by about 30% compared with a low-fat diet.',
        evidence: 'strong',
        sources: ['estruch2018'],
      },
    ],
    whereItHides: [
      'Restaurant fryers and most chain restaurant cooking',
      'Chips, crackers, cookies and other packaged snacks',
      'Salad dressings and mayonnaise',
      'Store-bought baked goods and frozen meals',
      'Plant-based "butters", spreads and many dairy-free products',
    ],
    labelNames: [
      'Canola oil / rapeseed oil',
      'Soybean oil',
      'Corn oil',
      'Sunflower or safflower oil',
      'Cottonseed oil',
      'Grapeseed oil',
      'Rice bran oil',
      '"Vegetable oil"',
    ],
    swaps: [
      'Extra-virgin olive oil for dressings and low-to-medium heat cooking',
      'Avocado oil, ghee or beef tallow for high-heat searing and frying',
      'Butter for baking',
      'At restaurants, ask what oil they cook with — or choose grilled, roasted or steamed dishes',
    ],
    reviewed: false,
  },
  {
    slug: 'added-sugar',
    title: 'Added sugar',
    summary: 'The best-proven ingredient to cut — and the many names it hides behind.',
    readMinutes: 3,
    avoid: ['addedSugar'],
    shortVersion:
      'Added sugar is sugar put into food during processing or cooking — not the sugar naturally in whole fruit or plain milk. ' +
      'It is one of the most clearly harmful parts of the modern diet, especially in drinks. ' +
      'The World Health Organization says to keep it under 10% of calories, and ideally under 5%.',
    claims: [
      {
        text: 'Drinking 1–2 sugar-sweetened drinks a day was linked to a 26% higher risk of type 2 diabetes compared with rarely drinking them.',
        evidence: 'strong',
        sources: ['malik2010'],
      },
      {
        text: 'In a 15-year study of US adults, people getting the most calories from added sugar had about twice the risk of dying from heart disease as those getting the least.',
        evidence: 'strong',
        sources: ['yang2014'],
      },
      {
        text: 'In a controlled feeding study, drinks sweetened with fructose (half of table sugar) increased belly fat around the organs and reduced insulin sensitivity, while glucose-sweetened drinks did not.',
        evidence: 'emerging',
        sources: ['stanhope2009'],
      },
      {
        text: 'Sugar is the main dietary cause of tooth decay, and decay goes down when sugar intake stays below 10% of calories.',
        evidence: 'strong',
        sources: ['moynihan2014'],
      },
      {
        text: 'Official limits: the WHO recommends keeping free sugars under 10% of daily calories (ideally under 5%). The American Heart Association suggests no more than about 6 teaspoons (25 g) a day for women and 9 teaspoons (36 g) for men.',
        evidence: 'strong',
        sources: ['who2015', 'johnson2009'],
      },
    ],
    whereItHides: [
      'Soda, sweet tea, energy drinks, juice drinks and coffee-shop drinks',
      'Sauces: ketchup, BBQ sauce, teriyaki, pasta sauce',
      'Salad dressings',
      'Flavored yogurt, granola and "healthy" cereal',
      'Protein bars and smoothies',
      'Bread and restaurant burger buns',
    ],
    labelNames: [
      'Sugar, cane sugar, brown sugar, coconut sugar',
      'High-fructose corn syrup, corn syrup',
      'Dextrose, sucrose, maltose',
      'Maltodextrin',
      'Brown rice syrup, malt syrup, barley malt',
      'Agave, honey, molasses',
      'Fruit juice concentrate, evaporated cane juice',
    ],
    swaps: [
      'Water, sparkling water, unsweetened tea or black coffee instead of sweet drinks',
      'Plain Greek yogurt with fresh berries instead of flavored yogurt',
      'Olive oil and vinegar instead of bottled dressing',
      'Whole fruit when you want something sweet',
    ],
    reviewed: false,
  },
  {
    slug: 'hfcs',
    title: 'High-fructose corn syrup',
    summary: 'A cheap liquid sugar in most sodas and packaged foods. Is it worse than table sugar?',
    readMinutes: 3,
    avoid: ['addedSugar'],
    shortVersion:
      'High-fructose corn syrup (HFCS) is a liquid sweetener made from corn starch, used in most US sodas and many packaged foods. ' +
      'Chemically it is close to table sugar — roughly half fructose, half glucose — and current evidence says it is about as harmful as sugar, not uniquely worse. ' +
      'The real problem is how much of it ends up in the diet, and that it mostly appears in ultra-processed food and drinks.',
    claims: [
      {
        text: 'The common forms of HFCS contain 42% or 55% fructose, with the rest mostly glucose — a similar ratio to table sugar. The FDA knows of no evidence that HFCS is less safe than equal amounts of sugar or honey.',
        evidence: 'strong',
        sources: ['fdaHfcs'],
      },
      {
        text: 'Researchers have pointed out that the rise of HFCS in drinks tracked the rise in obesity, suggesting it may have played a role.',
        evidence: 'debated',
        sources: ['bray2004'],
      },
      {
        text: 'Drinks sweetened with either sugar or HFCS deliver large amounts of fructose and calories that pose health risks, especially for people who drink a lot of them.',
        evidence: 'emerging',
        sources: ['bray2013'],
      },
      {
        text: 'Fructose-sweetened drinks increased fat around the organs and reduced insulin sensitivity in a controlled feeding study.',
        evidence: 'emerging',
        sources: ['stanhope2009'],
      },
    ],
    whereItHides: [
      'Regular soda and fruit-flavored drinks',
      'Candy, cookies and snack cakes',
      'Ketchup, BBQ sauce and salad dressings',
      'Sweetened yogurts and breakfast cereals',
      'Packaged bread and cereal bars',
    ],
    labelNames: ['High-fructose corn syrup', 'HFCS', 'Glucose-fructose syrup', 'Corn syrup', 'Isoglucose'],
    swaps: [
      'Choose drinks with no sweetener, or whole-fruit options',
      'Pick sauces and dressings with no added sugar listed in the first few ingredients',
      "Treat HFCS as a sign you're looking at an ultra-processed product",
    ],
    reviewed: false,
  },
  {
    slug: 'maltodextrin',
    title: 'Maltodextrin',
    summary: 'A fast-digesting starch powder in protein shakes, "sugar-free" sweeteners and snacks.',
    readMinutes: 3,
    avoid: ['addedSugar', 'ultraProcessed'],
    shortVersion:
      "Maltodextrin is a white powder made by breaking down corn, rice, potato or wheat starch. It's used to add bulk, texture and shelf life. " +
      "It isn't listed as \"sugar\" on nutrition labels, but your body breaks it down into glucose very quickly. " +
      'Early research also suggests it may weaken the protective lining of the gut.',
    claims: [
      {
        text: 'Maltodextrin is made of chains of glucose that are digested and absorbed quickly, so it raises blood sugar fast. Swapping whole starches for maltodextrin increases the glycemic load of a diet.',
        evidence: 'strong',
        sources: ['hofman2016'],
      },
      {
        text: 'In mice, maltodextrin in the diet thinned the protective mucus layer of the gut and made intestinal inflammation worse.',
        evidence: 'emerging',
        sources: ['laudisi2019'],
      },
      {
        text: "In lab studies, maltodextrin helped a type of E. coli linked to Crohn's disease stick to gut cells and form biofilms.",
        evidence: 'emerging',
        sources: ['nickerson2012'],
      },
    ],
    whereItHides: [
      'Protein powders, mass gainers and sports drinks',
      '"Sugar-free" sweetener packets (often the main ingredient by weight)',
      'Chips and seasoning blends',
      'Instant soups, sauces and gravies',
      'Supplements and meal-replacement shakes',
    ],
    labelNames: ['Maltodextrin', 'Corn maltodextrin', 'Modified food starch (often related)'],
    swaps: [
      'Protein powders with a short ingredient list (protein + natural flavor)',
      'Water with electrolytes or real fruit instead of sports drinks',
      'Whole-food snacks over seasoned, packaged ones',
    ],
    reviewed: false,
  },
  {
    slug: 'ages',
    title: 'AGEs (advanced glycation end products)',
    summary: 'Compounds formed by high-heat cooking that build up in the body as you age.',
    readMinutes: 3,
    avoid: [],
    shortVersion:
      'AGEs form when sugars react with proteins or fats. Your body makes some naturally, and they build up with age. ' +
      'But food cooked with dry, high heat — grilled, broiled, roasted or fried — contains far more of them. ' +
      'How you cook matters as much as what you cook.',
    claims: [
      {
        text: 'Dry, high-heat cooking greatly increases the AGEs in food. Cooking with moist heat, shorter times, lower temperatures, or acidic marinades like lemon juice or vinegar significantly reduces them.',
        evidence: 'strong',
        sources: ['uribarri2010'],
      },
      {
        text: 'AGEs from food add to the body\'s AGE load and are linked to oxidative stress and inflammation, which are tied to diabetes, heart disease and aging.',
        evidence: 'emerging',
        sources: ['uribarri2015', 'uribarri2010'],
      },
      {
        text: 'In a randomized trial in people with type 2 diabetes, a low-AGE diet lowered insulin resistance and inflammation markers.',
        evidence: 'emerging',
        sources: ['uribarri2011'],
      },
    ],
    whereItHides: [
      'Grilled, broiled or charred meat',
      'Bacon and processed meats',
      'Fried food and fast food',
      'Roasted nuts and browned, crispy crusts',
      'Processed and aged cheeses',
    ],
    swaps: [
      'Stew, braise, poach, steam or slow-cook more often',
      'Marinate meat in lemon juice or vinegar before cooking',
      'Cook at lower temperatures and avoid charring',
      'At restaurants, try braised, poached or steamed dishes',
    ],
    reviewed: false,
  },
  {
    slug: 'fried-fast-food',
    title: 'Fried food & fast food',
    summary: 'What regular fried and fast food does to your heart, weight and blood sugar.',
    readMinutes: 4,
    avoid: ['seedOils', 'ultraProcessed'],
    shortVersion:
      'Fried food combines several problems in one: oils broken down by high heat, AGEs, and — for fried potatoes and grains — acrylamide. ' +
      'Studies following hundreds of thousands of people link frequent fried and fast food to heart disease, weight gain and type 2 diabetes. ' +
      'Occasional fried food is not the issue; making it a habit is.',
    claims: [
      {
        text: 'A meta-analysis of 17 studies found people eating the most fried food had a 28% higher risk of major heart events. It did not find a clear link to overall death.',
        evidence: 'strong',
        sources: ['qin2021'],
      },
      {
        text: 'Eating fried food 4–6 times a week was linked to a 39% higher risk of type 2 diabetes, and daily fried food to a 55% higher risk — largely through weight gain.',
        evidence: 'strong',
        sources: ['cahill2014'],
      },
      {
        text: 'In a 15-year study, young adults who ate fast food more than twice a week gained about 4.5 kg (10 lb) more and had twice the increase in insulin resistance compared with those eating it less than once a week.',
        evidence: 'strong',
        sources: ['pereira2005'],
      },
      {
        text: 'In a large study of older US women, eating fried chicken or fried fish at least weekly was linked to a higher risk of death.',
        evidence: 'emerging',
        sources: ['sun2019'],
      },
      {
        text: 'Frying starchy foods like potatoes forms acrylamide, which causes cancer in animals at high doses. Whether the amounts in food affect people is still being studied.',
        evidence: 'emerging',
        sources: ['fdaAcrylamide'],
      },
      {
        text: 'Restaurant fryer oil is reused many times, building up oxidation products that end up in the food.',
        evidence: 'strong',
        sources: ['grootveld2020'],
      },
    ],
    whereItHides: [
      'Fries, chips and onion rings',
      'Fried chicken, nuggets and fried fish',
      '"Crispy" sandwiches and salads with fried toppings',
      'Tempura, egg rolls and fried appetizers',
      'Donuts and fried desserts',
    ],
    swaps: [
      'Grilled or roasted instead of fried or "crispy"',
      'A side salad or vegetables instead of fries',
      'Air-fry or oven-roast at home',
      "Use the app's Nearby filters to find places that cook in tallow, olive or avocado oil",
    ],
    reviewed: false,
  },
  {
    slug: 'ultra-processed',
    title: 'Ultra-processed foods',
    summary: 'Industrial food products built from extracted ingredients and additives — and why they make you eat more.',
    readMinutes: 4,
    avoid: ['ultraProcessed'],
    shortVersion:
      "Ultra-processed foods are industrial products made mostly from extracted ingredients — refined starches, oils, sugars, protein isolates — plus additives you wouldn't use at home. " +
      'In a tightly controlled trial, people ate about 500 more calories a day on them without noticing. ' +
      'Large reviews link them to dozens of health problems.',
    claims: [
      {
        text: "Ultra-processed foods are defined (by the NOVA system) as formulations of ingredients mostly of industrial use, often including flavors, colors, emulsifiers and other additives rarely used in home cooking.",
        evidence: 'strong',
        sources: ['monteiro2019'],
      },
      {
        text: 'In an inpatient randomized trial, people offered ultra-processed meals ate about 500 more calories per day and gained weight; on unprocessed meals they lost weight — even though the meals were matched for sugar, fat and fiber.',
        evidence: 'strong',
        sources: ['hall2019'],
      },
      {
        text: 'A 2024 umbrella review of 45 pooled analyses linked ultra-processed food to 32 health problems, with the most convincing evidence for heart-disease death, type 2 diabetes, anxiety, and common mental health problems.',
        evidence: 'strong',
        sources: ['lane2024'],
      },
    ],
    whereItHides: [
      'Soda and energy drinks',
      'Packaged snacks, chips, cookies and candy',
      'Breakfast cereals, cereal bars and protein bars',
      'Instant noodles, frozen meals and processed meats',
      'Most fast food',
    ],
    labelNames: [
      'Long ingredient lists with things you would not cook with',
      'Hydrolyzed or isolated proteins',
      'Maltodextrin, dextrose, high-fructose corn syrup',
      'Emulsifiers (lecithins, mono- and diglycerides, gums)',
      'Artificial colors and "flavors"',
    ],
    swaps: [
      'Build meals from foods that look like they did in nature',
      'Pick products with a short ingredient list you recognize',
      'Cook in batches so a fast option is always ready',
      'Use the scanner — it flags ultra-processed products automatically',
    ],
    reviewed: false,
  },
  {
    slug: 'artificial-sweeteners',
    title: 'Artificial sweeteners & additives',
    summary: 'Zero-calorie sweeteners and synthetic dyes — what the newest research and the WHO say.',
    readMinutes: 4,
    avoid: ['artificialSweeteners'],
    shortVersion:
      'Sweeteners like sucralose, aspartame and erythritol let products say "zero sugar", and synthetic dyes make food look brighter. ' +
      'They were long assumed to be harmless, but newer research suggests they may affect blood sugar control, the gut and the heart. ' +
      'In 2023 the WHO advised against using them to control weight.',
    claims: [
      {
        text: "The WHO recommends against using non-sugar sweeteners to control body weight, finding no long-term fat loss and possible long-term risks such as type 2 diabetes and heart disease. It's a conditional recommendation because the evidence is mostly observational.",
        evidence: 'emerging',
        sources: ['who2023nss'],
      },
      {
        text: 'In a randomized trial of 120 adults, two weeks of saccharin or sucralose — at doses below official safe limits — changed gut bacteria and worsened blood sugar responses in some people.',
        evidence: 'emerging',
        sources: ['suez2022'],
      },
      {
        text: 'Higher blood levels of erythritol (a popular "natural" zero-calorie sweetener) were linked to more heart attacks and strokes, and erythritol made blood platelets clot more easily in lab tests.',
        evidence: 'emerging',
        sources: ['witkowski2023'],
      },
      {
        text: 'The WHO\'s cancer agency classified aspartame as "possibly carcinogenic to humans" (its weakest category, based on limited evidence), while a separate WHO committee kept its daily safe limit — equal to about 9–14 cans of diet soda for an adult.',
        evidence: 'debated',
        sources: ['whoAspartame2023'],
      },
      {
        text: 'In a randomized trial, a mix of artificial food colors and a common preservative increased hyperactivity in children from the general population.',
        evidence: 'emerging',
        sources: ['mccann2007'],
      },
    ],
    whereItHides: [
      'Diet soda, "zero sugar" drinks and flavored waters',
      'Protein bars, protein powders and "keto" snacks',
      'Sugar-free gum, candy and syrups',
      'Light or low-fat yogurts',
      'Brightly colored candy, cereals, sports drinks and frosting',
    ],
    labelNames: [
      'Sucralose, aspartame, acesulfame K, saccharin',
      'Erythritol and other sugar alcohols ending in "-itol"',
      'Red 40, Yellow 5, Yellow 6, Blue 1',
      'Caramel color',
    ],
    swaps: [
      'Water, sparkling water or unsweetened tea instead of diet soda',
      'Small amounts of real fruit to sweeten yogurt or oats',
      'Products colored with fruit and vegetable extracts instead of synthetic dyes',
      'Get used to less sweetness overall — taste adjusts within a few weeks',
    ],
    reviewed: false,
  },
  {
    slug: 'alcohol',
    title: 'Alcohol',
    summary: 'Why the "a glass of wine is good for your heart" idea has fallen apart.',
    readMinutes: 3,
    avoid: ['alcohol'],
    shortVersion:
      'Alcohol is a known cause of cancer and harms sleep even in small amounts. ' +
      'The old idea that moderate drinking protects the heart came from studies that compared drinkers with people who had quit for health reasons. ' +
      'Better analyses find no health benefit — less is better, and none is best.',
    claims: [
      {
        text: 'Alcohol is classified as a Group 1 carcinogen — the same category as tobacco and asbestos — and causes at least seven types of cancer, including bowel and breast cancer.',
        evidence: 'strong',
        sources: ['whoAlcohol2023'],
      },
      {
        text: 'A global analysis across 195 countries found that the risk of death and cancer rises with every level of drinking, and the amount that minimizes health loss is zero.',
        evidence: 'strong',
        sources: ['gbd2018alcohol'],
      },
      {
        text: 'Older studies suggested moderate drinking lowers the risk of death. An updated analysis of 107 studies with nearly 5 million people found no such benefit once study design flaws were accounted for — and higher risk at higher intakes, starting at lower amounts for women.',
        evidence: 'debated',
        sources: ['zhao2023', 'whoAlcohol2023'],
      },
      {
        text: 'Alcohol helps you fall asleep faster but disrupts the second half of the night, delays and reduces REM sleep — so sleep after drinking is less restorative.',
        evidence: 'strong',
        sources: ['ebrahim2013'],
      },
    ],
    whereItHides: [
      'Wine, beer, spirits and cocktails (cocktails also add a lot of sugar)',
      'Hard seltzers and "low-calorie" drinks',
      'Some sauces and desserts, where it may not fully cook off',
    ],
    swaps: [
      'Sparkling water with lime, bitters or a splash of juice',
      'Non-alcoholic beer or alcohol-free spirits for social occasions',
      'If you drink, have alcohol-free days each week and avoid drinking close to bedtime',
    ],
    reviewed: false,
  },
  {
    slug: 'trans-fats',
    title: 'Trans fats',
    summary: 'The most harmful fat for your heart — now mostly banned in the US, but not gone everywhere.',
    readMinutes: 3,
    avoid: ['transFats'],
    shortVersion:
      'Industrial trans fats are made by partially hydrogenating vegetable oils, which makes them solid and shelf-stable. ' +
      'They are the most harmful fat for the heart, so the US removed them from the food supply. ' +
      "They're rare in US food now, but still worth checking for in imported products and older recipes.",
    claims: [
      {
        text: 'Trans fats raise LDL ("bad") cholesterol, lower HDL ("good") cholesterol and drive inflammation. Per calorie, they are more strongly linked to heart disease than any other fat.',
        evidence: 'strong',
        sources: ['mozaffarian2006'],
      },
      {
        text: 'Because of this, the FDA determined in 2015 that partially hydrogenated oils are no longer "generally recognized as safe" and removed them from US foods, with a final deadline in 2021.',
        evidence: 'strong',
        sources: ['fdaTransFat'],
      },
    ],
    whereItHides: [
      'Imported snacks, baked goods and margarines',
      'Some frying shortenings and older bakery recipes',
      'Non-dairy creamers and microwave popcorn made before the ban (check old pantry items)',
    ],
    labelNames: ['Partially hydrogenated oil', 'Hydrogenated vegetable oil', 'Shortening'],
    swaps: [
      'Butter, ghee or olive oil instead of margarine and shortening',
      'Check "trans fat" on the nutrition label of imported products',
      'Use the scanner — it flags partially hydrogenated oils automatically',
    ],
    reviewed: false,
  },
];

export const articleBySlug = (slug: string) => ARTICLES.find((a) => a.slug === slug) ?? null;
