const express = require('express');
const router = express.Router();

// Static urban issues data for India
const ISSUES = [
  {
    id: 'pollution',
    title: 'Air & Water Pollution',
    titleHi: 'वायु और जल प्रदूषण',
    emoji: '🏭',
    color: '#ef4444',
    description: 'India faces severe air and water pollution crises with major cities consistently ranking among the world\'s most polluted. Vehicle emissions, industrial discharge, and burning of crop residue contribute to hazardous air quality indices.',
    descriptionHi: 'भारत में वायु और जल प्रदूषण की गंभीर समस्या है। प्रमुख शहर दुनिया के सबसे प्रदूषित शहरों में शामिल हैं।',
    stats: [
      { label: 'Cities with poor AQI', value: '14 of top 20 globally', icon: '💨' },
      { label: 'Annual deaths from pollution', value: '1.67 million', icon: '⚠️' },
      { label: 'Rivers severely polluted', value: '275+', icon: '🌊' },
      { label: 'Hazardous waste sites', value: '1000+', icon: '☣️' },
    ],
    causes: ['Vehicle exhaust', 'Industrial emissions', 'Crop burning', 'Coal power plants', 'Construction dust'],
    solutions: ['Switch to EVs', 'Industrial filtration', 'Solar energy', 'Phasing out fossil fuels'],
    govtScheme: 'National Clean Air Programme (NCAP)',
    govtUrl: 'https://moef.gov.in/en/division/environment-divisions-currently-in-deas/cpch/national-clean-air-programme/',
  },
  {
    id: 'traffic',
    title: 'Traffic Congestion',
    titleHi: 'यातायात जाम',
    emoji: '🚗',
    color: '#f97316',
    description: 'India\'s urban road infrastructure is overwhelmed by the rapid growth in vehicle numbers. Cities like Mumbai, Bengaluru, and Delhi consistently rank among the most congested globally, with commuters losing hundreds of hours annually.',
    descriptionHi: 'भारत के शहरों में यातायात जाम एक गंभीर समस्या है। मुंबई, बेंगलुरु और दिल्ली दुनिया के सबसे जाम शहरों में हैं।',
    stats: [
      { label: 'Hours lost in traffic/year (Bengaluru)', value: '243 hours', icon: '⏱️' },
      { label: 'Vehicles on Indian roads', value: '300+ million', icon: '🚗' },
      { label: 'Economic loss due to congestion', value: '₹1.5 lakh crore/yr', icon: '💸' },
      { label: 'Delhi daily vehicles', value: '11+ million', icon: '🏙️' },
    ],
    causes: ['Rapid urbanization', 'Poor public transport', 'Road encroachments', 'Inadequate infrastructure'],
    solutions: ['Metro expansion', 'Smart traffic signals', 'Carpooling apps', 'Cycling infrastructure'],
    govtScheme: 'National Urban Transport Policy',
    govtUrl: 'https://mohua.gov.in/content/national-urban-transport-policy',
  },
  {
    id: 'waste',
    title: 'Waste Management',
    titleHi: 'कचरा प्रबंधन',
    emoji: '🗑️',
    color: '#84cc16',
    description: 'Urban India generates over 1.50 lakh metric tonnes of solid waste daily, yet a large fraction goes uncollected and untreated, ending up in overflowing landfills or open dumps that contaminate soil and groundwater.',
    descriptionHi: 'शहरी भारत प्रतिदिन 1.50 लाख मीट्रिक टन कचरा उत्पन्न करता है। अधिकांश कचरा अनुपचारित रहता है।',
    stats: [
      { label: 'Daily solid waste generated', value: '1.5 lakh MT', icon: '🗑️' },
      { label: 'Waste processed appropriately', value: 'Only 20%', icon: '♻️' },
      { label: 'Landfill sites overflowing', value: '3000+', icon: '⛰️' },
      { label: 'Plastic waste/year', value: '26 lakh tonnes', icon: '🧴' },
    ],
    causes: ['Weak waste collection systems', 'No source segregation', 'Inadequate landfills', 'Lack of awareness'],
    solutions: ['Source segregation', 'Composting programs', 'Waste-to-energy plants', 'Swachh Bharat Abhiyan'],
    govtScheme: 'Swachh Bharat Mission (Urban)',
    govtUrl: 'https://sbmurban.org/',
  },
  {
    id: 'housing',
    title: 'Housing & Slums',
    titleHi: 'आवास और झुग्गी-झोपड़ी',
    emoji: '🏚️',
    color: '#8b5cf6',
    description: 'India has the world\'s largest urban slum population. Rapid migration to cities has outpaced housing supply, pushing millions into informal settlements lacking access to clean water, sanitation, and secure tenure.',
    descriptionHi: 'भारत में दुनिया की सबसे बड़ी शहरी झुग्गी-बस्ती जनसंख्या है। तेज शहरीकरण ने आवास आपूर्ति को पीछे छोड़ दिया है।',
    stats: [
      { label: 'Urban slum dwellers', value: '65 million+', icon: '🏚️' },
      { label: 'Cities with slum settlements', value: '2613', icon: '🏙️' },
      { label: 'Urban housing shortage', value: '18.78 million units', icon: '🏠' },
      { label: 'Homeless in urban India', value: '17 lakh+', icon: '😔' },
    ],
    causes: ['Rural-urban migration', 'Unaffordable housing', 'Land hoarding', 'Lack of low-income housing'],
    solutions: ['Affordable housing schemes', 'Slum rehabilitation', 'Rental housing policy', 'Smart cities'],
    govtScheme: 'Pradhan Mantri Awas Yojana (Urban)',
    govtUrl: 'https://pmay-urban.gov.in/',
  },
  {
    id: 'infrastructure',
    title: 'Infrastructure Gaps',
    titleHi: 'बुनियादी ढांचे की कमी',
    emoji: '🏗️',
    color: '#06b6d4',
    description: 'India\'s cities struggle with crumbling roads, frequent power cuts, inadequate water supply, poor drainage systems, and creaking civic infrastructure. Rapid growth has far outpaced infrastructure investment.',
    descriptionHi: 'भारत के शहर टूटी सड़कों, बिजली कटौती, अपर्याप्त जल आपूर्ति और खराब बुनियादी ढांचे से जूझ रहे हैं।',
    stats: [
      { label: 'Roads in poor condition', value: '40%+', icon: '🛣️' },
      { label: 'Urban areas with water shortages', value: '65%', icon: '💧' },
      { label: 'Cities with 24/7 water supply', value: 'Fewer than 10', icon: '🚰' },
      { label: 'Sewage treated before release', value: 'Only 28%', icon: '🌊' },
    ],
    causes: ['Insufficient urban investment', 'Corruption', 'Poor planning', 'Rapid population growth'],
    solutions: ['Smart City Mission', 'AMRUT scheme', 'PPP models', 'Urban local body strengthening'],
    govtScheme: 'AMRUT 2.0 (Atal Mission)',
    govtUrl: 'https://amrut.gov.in/',
  },
  {
    id: 'overcrowding',
    title: 'Overcrowding',
    titleHi: 'अत्यधिक भीड़',
    emoji: '👥',
    color: '#ec4899',
    description: 'India\'s metros are bursting at the seams. The five major cities — Mumbai, Delhi, Kolkata, Chennai, Bengaluru — collectively house over 100 million people. Overcrowding strains every public resource, from hospitals and schools to water and roads.',
    descriptionHi: 'भारत के महानगर क्षमता से अधिक भरे हुए हैं। पांच प्रमुख शहरों में 10 करोड़ से अधिक लोग रहते हैं।',
    stats: [
      { label: 'Urban population (2024)', value: '600+ million', icon: '👥' },
      { label: 'Mumbai population density', value: '20,482/km²', icon: '🏙️' },
      { label: 'Annual urban migration', value: '10 million+', icon: '🚆' },
      { label: 'Urban population by 2050', value: '1 billion', icon: '📈' },
    ],
    causes: ['Rural-to-urban migration', 'Economic opportunities', 'Lack of satellite city development', 'Poor regional planning'],
    solutions: ['Develop Tier-2 cities', 'Remote work policies', 'Satellite towns', 'Industrial decentralization'],
    govtScheme: 'National Urban Policy Framework',
    govtUrl: 'https://mohua.gov.in/',
  },
];

// GET /api/issues
router.get('/', (req, res) => {
  const lite = ISSUES.map(({ id, title, titleHi, emoji, color, description, descriptionHi, govtScheme }) => ({
    id, title, titleHi, emoji, color, description, descriptionHi, govtScheme,
  }));
  res.json({ issues: lite });
});

// GET /api/issues/:id
router.get('/:id', (req, res) => {
  const issue = ISSUES.find(i => i.id === req.params.id);
  if (!issue) return res.status(404).json({ message: 'Issue not found' });
  res.json({ issue });
});

module.exports = router;
