import type { Source } from './types';

// Every entry was checked against PubMed or the publisher's page (2026-10-19). Titles are exact.
const pubmed = (pmid: string) => `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;

export const SOURCES: Record<string, Source> = {
  // Seed oils & heated oils
  simopoulos2002: {
    title: 'The importance of the ratio of omega-6/omega-3 essential fatty acids',
    publisher: 'Biomedicine & Pharmacotherapy',
    year: 2002,
    url: pubmed('12442909'),
  },
  grootveld2020: {
    title: 'Potential Adverse Public Health Effects Afforded by the Ingestion of Dietary Lipid Oxidation Product Toxins: Significance of Fried Food Sources',
    publisher: 'Nutrients',
    year: 2020,
    url: pubmed('32244669'),
  },
  ng2014: {
    title: 'Heated vegetable oils and cardiovascular disease risk factors',
    publisher: 'Vascular Pharmacology',
    year: 2014,
    url: pubmed('24632108'),
  },
  ramsden2012: {
    title: 'Lowering dietary linoleic acid reduces bioactive oxidized linoleic acid metabolites in humans',
    publisher: 'Prostaglandins, Leukotrienes and Essential Fatty Acids',
    year: 2012,
    url: pubmed('22959954'),
  },
  ramsden2013: {
    title: 'Use of dietary linoleic acid for secondary prevention of coronary heart disease and death: evaluation of recovered data from the Sydney Diet Heart Study and updated meta-analysis',
    publisher: 'BMJ',
    year: 2013,
    url: pubmed('23386268'),
  },
  ramsden2016: {
    title: 'Re-evaluation of the traditional diet-heart hypothesis: analysis of recovered data from Minnesota Coronary Experiment (1968-73)',
    publisher: 'BMJ',
    year: 2016,
    url: pubmed('27071971'),
  },
  sacks2017: {
    title: 'Dietary Fats and Cardiovascular Disease: A Presidential Advisory From the American Heart Association',
    publisher: 'Circulation',
    year: 2017,
    url: pubmed('28620111'),
  },
  farvid2014: {
    title: 'Dietary linoleic acid and risk of coronary heart disease: a systematic review and meta-analysis of prospective cohort studies',
    publisher: 'Circulation',
    year: 2014,
    url: pubmed('25161045'),
  },
  estruch2018: {
    title: 'Primary Prevention of Cardiovascular Disease with a Mediterranean Diet Supplemented with Extra-Virgin Olive Oil or Nuts',
    publisher: 'New England Journal of Medicine',
    year: 2018,
    url: pubmed('29897866'),
  },

  // Sugar, HFCS, maltodextrin
  malik2010: {
    title: 'Sugar-sweetened beverages and risk of metabolic syndrome and type 2 diabetes: a meta-analysis',
    publisher: 'Diabetes Care',
    year: 2010,
    url: pubmed('20693348'),
  },
  yang2014: {
    title: 'Added sugar intake and cardiovascular diseases mortality among US adults',
    publisher: 'JAMA Internal Medicine',
    year: 2014,
    url: pubmed('24493081'),
  },
  stanhope2009: {
    title: 'Consuming fructose-sweetened, not glucose-sweetened, beverages increases visceral adiposity and lipids and decreases insulin sensitivity in overweight/obese humans',
    publisher: 'Journal of Clinical Investigation',
    year: 2009,
    url: pubmed('19381015'),
  },
  moynihan2014: {
    title: 'Effect on caries of restricting sugars intake: systematic review to inform WHO guidelines',
    publisher: 'Journal of Dental Research',
    year: 2014,
    url: pubmed('24323509'),
  },
  who2015: {
    title: 'Guideline: sugars intake for adults and children',
    publisher: 'World Health Organization',
    year: 2015,
    url: 'https://www.who.int/publications/i/item/9789241549028',
  },
  johnson2009: {
    title: 'Dietary sugars intake and cardiovascular health: a scientific statement from the American Heart Association',
    publisher: 'Circulation',
    year: 2009,
    url: pubmed('19704096'),
  },
  fdaHfcs: {
    title: 'High Fructose Corn Syrup Questions and Answers',
    publisher: 'U.S. Food and Drug Administration',
    year: 2018,
    url: 'https://www.fda.gov/food/food-additives-petitions/high-fructose-corn-syrup-questions-and-answers',
  },
  bray2004: {
    title: 'Consumption of high-fructose corn syrup in beverages may play a role in the epidemic of obesity',
    publisher: 'American Journal of Clinical Nutrition',
    year: 2004,
    url: pubmed('15051594'),
  },
  bray2013: {
    title: 'Energy and fructose from beverages sweetened with sugar or high-fructose corn syrup pose a health risk for some people',
    publisher: 'Advances in Nutrition',
    year: 2013,
    url: pubmed('23493538'),
  },
  hofman2016: {
    title: 'Nutrition, Health, and Regulatory Aspects of Digestible Maltodextrins',
    publisher: 'Critical Reviews in Food Science and Nutrition',
    year: 2016,
    url: pubmed('25674937'),
  },
  laudisi2019: {
    title: 'The Food Additive Maltodextrin Promotes Endoplasmic Reticulum Stress-Driven Mucus Depletion and Exacerbates Intestinal Inflammation',
    publisher: 'Cellular and Molecular Gastroenterology and Hepatology',
    year: 2019,
    url: pubmed('30765332'),
  },
  nickerson2012: {
    title: "Crohn's disease-associated adherent-invasive Escherichia coli adhesion is enhanced by exposure to the ubiquitous dietary polysaccharide maltodextrin",
    publisher: 'PLoS One',
    year: 2012,
    url: pubmed('23251695'),
  },

  // AGEs
  uribarri2010: {
    title: 'Advanced glycation end products in foods and a practical guide to their reduction in the diet',
    publisher: 'Journal of the American Dietetic Association',
    year: 2010,
    url: pubmed('20497781'),
  },
  uribarri2011: {
    title: 'Restriction of advanced glycation end products improves insulin resistance in human type 2 diabetes: potential role of AGER1 and SIRT1',
    publisher: 'Diabetes Care',
    year: 2011,
    url: pubmed('21709297'),
  },
  uribarri2015: {
    title: 'Dietary advanced glycation end products and their role in health and disease',
    publisher: 'Advances in Nutrition',
    year: 2015,
    url: pubmed('26178030'),
  },

  // Fried & fast food
  qin2021: {
    title: 'Fried-food consumption and risk of cardiovascular disease and all-cause mortality: a meta-analysis of observational studies',
    publisher: 'Heart',
    year: 2021,
    url: pubmed('33468573'),
  },
  sun2019: {
    title: 'Association of fried food consumption with all cause, cardiovascular, and cancer mortality: prospective cohort study',
    publisher: 'BMJ',
    year: 2019,
    url: pubmed('30674467'),
  },
  cahill2014: {
    title: 'Fried-food consumption and risk of type 2 diabetes and coronary artery disease: a prospective study in 2 cohorts of US women and men',
    publisher: 'American Journal of Clinical Nutrition',
    year: 2014,
    url: pubmed('24944061'),
  },
  pereira2005: {
    title: 'Fast-food habits, weight gain, and insulin resistance (the CARDIA study): 15-year prospective analysis',
    publisher: 'The Lancet',
    year: 2005,
    url: pubmed('15639678'),
  },
  fdaAcrylamide: {
    title: 'Acrylamide and Diet, Food Storage, and Food Preparation',
    publisher: 'U.S. Food and Drug Administration',
    year: 2022,
    url: 'https://www.fda.gov/food/process-contaminants-food/acrylamide-and-diet-food-storage-and-food-preparation',
  },

  // Ultra-processed food
  monteiro2019: {
    title: 'Ultra-processed foods: what they are and how to identify them',
    publisher: 'Public Health Nutrition',
    year: 2019,
    url: pubmed('30744710'),
  },
  hall2019: {
    title: 'Ultra-Processed Diets Cause Excess Calorie Intake and Weight Gain: An Inpatient Randomized Controlled Trial of Ad Libitum Food Intake',
    publisher: 'Cell Metabolism',
    year: 2019,
    url: pubmed('31105044'),
  },
  lane2024: {
    title: 'Ultra-processed food exposure and adverse health outcomes: umbrella review of epidemiological meta-analyses',
    publisher: 'BMJ',
    year: 2024,
    url: pubmed('38418082'),
  },
// Artificial sweeteners & additives
  who2023nss: {
    title: 'WHO advises not to use non-sugar sweeteners for weight control in newly released guideline',
    publisher: 'World Health Organization',
    year: 2023,
    url: 'https://www.who.int/news/item/15-05-2023-who-advises-not-to-use-non-sugar-sweeteners-for-weight-control-in-newly-released-guideline',
  },
  whoAspartame2023: {
    title: 'Aspartame hazard and risk assessment results released',
    publisher: 'World Health Organization',
    year: 2023,
    url: 'https://www.who.int/news/item/14-07-2023-aspartame-hazard-and-risk-assessment-results-released',
  },
  witkowski2023: {
    title: 'The artificial sweetener erythritol and cardiovascular event risk',
    publisher: 'Nature Medicine',
    year: 2023,
    url: pubmed('36849732'),
  },
  suez2022: {
    title: 'Personalized microbiome-driven effects of non-nutritive sweeteners on human glucose tolerance',
    publisher: 'Cell',
    year: 2022,
    url: pubmed('35987213'),
  },
  mccann2007: {
    title: 'Food additives and hyperactive behaviour in 3-year-old and 8/9-year-old children in the community: a randomised, double-blinded, placebo-controlled trial',
    publisher: 'The Lancet',
    year: 2007,
    url: pubmed('17825405'),
  },

  // Alcohol
  whoAlcohol2023: {
    title: 'No level of alcohol consumption is safe for our health',
    publisher: 'World Health Organization (Europe)',
    year: 2023,
    url: 'https://www.who.int/europe/news/item/04-01-2023-no-level-of-alcohol-consumption-is-safe-for-our-health',
  },
  gbd2018alcohol: {
    title: 'Alcohol use and burden for 195 countries and territories, 1990-2016: a systematic analysis for the Global Burden of Disease Study 2016',
    publisher: 'The Lancet',
    year: 2018,
    url: pubmed('30146330'),
  },
  zhao2023: {
    title: 'Association Between Daily Alcohol Intake and Risk of All-Cause Mortality: A Systematic Review and Meta-analyses',
    publisher: 'JAMA Network Open',
    year: 2023,
    url: pubmed('37000449'),
  },
  ebrahim2013: {
    title: 'Alcohol and sleep I: effects on normal sleep',
    publisher: 'Alcoholism: Clinical and Experimental Research',
    year: 2013,
    url: pubmed('23347102'),
  },

  // Trans fats
  mozaffarian2006: {
    title: 'Trans fatty acids and cardiovascular disease',
    publisher: 'New England Journal of Medicine',
    year: 2006,
    url: pubmed('16611951'),
  },
  fdaTransFat: {
    title: 'Trans Fat',
    publisher: 'U.S. Food and Drug Administration',
    year: 2023,
    url: 'https://www.fda.gov/food/food-additives-petitions/trans-fat',
  },
};

