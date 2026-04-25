const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const buildImagePath = (category, index, title) =>
  `/product-images/${slugify(category)}/${index + 1}.svg?title=${encodeURIComponent(
    title
  )}&category=${encodeURIComponent(category)}`;

const categoryGroups = [
  {
    label: "Mens Western",
    items: ["T-Shirts", "Shirts", "Jeans", "Trousers", "Jackets"],
  },
  {
    label: "Mens Traditional",
    items: ["Kurtas", "Sherwanis", "Nehru Jackets", "Pajamas"],
  },
  {
    label: "Womens Western",
    items: ["Tops", "Shirts", "Jeans", "Dresses", "Palazzos"],
  },
  {
    label: "Womens Traditional",
    items: ["Kurtis", "Sarees", "Lehengas", "Gowns"],
  },
  {
    label: "Kids Boys Western",
    items: ["T-Shirts", "Shirts", "Jeans", "Jackets"],
  },
  {
    label: "Kids Boys Traditional",
    items: ["Kurtas", "Ethnic Sets", "Waistcoats", "Pajamas"],
  },
  {
    label: "Kids Girls Western",
    items: ["Frocks", "Tops", "Jeans", "Jumpsuits"],
  },
  {
    label: "Kids Girls Traditional",
    items: ["Lehengas", "Kurti Sets", "Ethnic Gowns", "Anarkalis"],
  },
];

const titlePools = {
  "T-Shirts": ["Core", "Drift", "Pulse"],
  Shirts: ["Loom", "Slate", "Crest"],
  Jeans: ["Indie", "Rivet", "Denim"],
  Trousers: ["Axis", "Cove", "Linea"],
  Jackets: ["Forge", "Blaze", "Crown"],
  Kurtas: ["Noor", "Aarz", "Sutra"],
  Sherwanis: ["Raj", "Veer", "Aman"],
  "Nehru Jackets": ["Noble", "Regal", "Ivor"],
  Pajamas: ["Ease", "Calm", "Soft"],
  Tops: ["Mira", "Bloom", "Elan"],
  Dresses: ["Gleam", "Belle", "Muse"],
  Palazzos: ["Flow", "Breeze", "Seren"],
  Kurtis: ["Meher", "Riva", "Ayla"],
  Sarees: ["Roop", "Veil", "Aura"],
  Lehengas: ["Abeer", "Noira", "Heer"],
  Gowns: ["Grace", "Velvet", "Lustre"],
  "Ethnic Sets": ["Yuva", "Raga", "Milan"],
  Waistcoats: ["Cedar", "Bronz", "Ridge"],
  Frocks: ["Twirl", "Pixie", "Charm"],
  Jumpsuits: ["Sky", "Jive", "Nori"],
  "Kurti Sets": ["Tuli", "Niva", "Siya"],
  "Ethnic Gowns": ["Noel", "Lace", "Rhea"],
  Anarkalis: ["Noor", "Jiya", "Aashi"],
};

const shortDescriptions = {
  "T-Shirts": [
    "Relaxed cotton basic.",
    "Street-ready soft fit.",
    "Sharp everyday layer.",
  ],
  Shirts: [
    "Crisp office staple.",
    "Polished weekend shirt.",
    "Refined slim finish.",
  ],
  Jeans: [
    "Clean tapered denim.",
    "Relaxed urban blue.",
    "Dark premium wash.",
  ],
  Trousers: [
    "Tailored weekday essential.",
    "Smooth comfort drape.",
    "Sharp evening trouser.",
  ],
  Jackets: [
    "Lightweight city layer.",
    "Structured casual outerwear.",
    "Bold premium finish.",
  ],
  Kurtas: [
    "Subtle festive classic.",
    "Soft celebration kurta.",
    "Elegant cultural staple.",
  ],
  Sherwanis: [
    "Regal wedding statement.",
    "Rich embroidered presence.",
    "Grand ceremonial finish.",
  ],
  "Nehru Jackets": [
    "Smart festive topper.",
    "Clean occasion layer.",
    "Modern ethnic polish.",
  ],
  Pajamas: [
    "Breathable daily comfort.",
    "Soft lounge essential.",
    "Easy relaxed pair.",
  ],
  Tops: [
    "Fresh daily silhouette.",
    "Chic soft essential.",
    "Light polished finish.",
  ],
  Dresses: [
    "Easy brunch favourite.",
    "Flowy day statement.",
    "Refined evening shape.",
  ],
  Palazzos: [
    "Airy movement fit.",
    "Soft all-day comfort.",
    "Elegant wide drape.",
  ],
  Kurtis: [
    "Clean festive charm.",
    "Soft everyday ethnic.",
    "Graceful occasion wear.",
  ],
  Sarees: [
    "Fluid festive drape.",
    "Elegant woven shimmer.",
    "Classic celebration look.",
  ],
  Lehengas: [
    "Rich bridal glamour.",
    "Festive twirl volume.",
    "Luxe embroidered flair.",
  ],
  Gowns: [
    "Graceful party fall.",
    "Soft evening sheen.",
    "Statement occasion shape.",
  ],
  "Ethnic Sets": [
    "Coordinated festive outfit.",
    "Bright family-event set.",
    "Polished celebration pair.",
  ],
  Waistcoats: [
    "Smart festive layer.",
    "Sharp ethnic accent.",
    "Refined occasion piece.",
  ],
  Frocks: [
    "Playful twirl-ready dress.",
    "Bright soft favourite.",
    "Cute polished style.",
  ],
  Jumpsuits: [
    "Easy one-step outfit.",
    "Modern playful shape.",
    "Sharp comfy fit.",
  ],
  "Kurti Sets": [
    "Ready festive match.",
    "Soft coordinated look.",
    "Elegant ethnic set.",
  ],
  "Ethnic Gowns": [
    "Festive princess silhouette.",
    "Soft traditional shine.",
    "Grand family-event gown.",
  ],
  Anarkalis: [
    "Flowy festive volume.",
    "Graceful celebration flair.",
    "Rich twirl silhouette.",
  ],
};

const basePrices = {
  "T-Shirts": 799,
  Shirts: 1099,
  Jeans: 1499,
  Trousers: 1399,
  Jackets: 2299,
  Kurtas: 1699,
  Sherwanis: 4799,
  "Nehru Jackets": 2199,
  Pajamas: 899,
  Tops: 899,
  Dresses: 1799,
  Palazzos: 1199,
  Kurtis: 1499,
  Sarees: 2899,
  Lehengas: 4299,
  Gowns: 3199,
  "Ethnic Sets": 1899,
  Waistcoats: 1399,
  Frocks: 1299,
  Jumpsuits: 1599,
  "Kurti Sets": 1899,
  "Ethnic Gowns": 2299,
  Anarkalis: 2499,
};

const legacySeededCategories = [
  "Mens / T-Shirts",
  "Mens / Shirts",
  "Mens / Jeans",
  "Mens / Trousers",
  "Mens / Jackets",
  "Mens / Kurtas",
  "Womens Western / T-Shirts",
  "Womens Western / Shirts",
  "Womens Western / Jeans",
  "Womens Western / Tops",
  "Womens Western / Palazzos",
  "Womens Western / Frocks",
  "Womens Traditional / Kurtis",
  "Womens Traditional / Sarees",
  "Womens Traditional / Lehengas",
  "Womens Traditional / Gowns",
  "Kids Boys / T-Shirts",
  "Kids Boys / Shirts",
  "Kids Boys / Jeans",
  "Kids Boys / Ethnic Sets",
  "Kids Girls / Frocks",
  "Kids Girls / Tops",
  "Kids Girls / Lehengas",
  "Kids Girls / Party Dresses",
];

const products = [];
const seededCategories = [];

categoryGroups.forEach((group) => {
  group.items.forEach((item) => {
    const category = `${group.label} / ${item}`;
    seededCategories.push(category);

    titlePools[item].forEach((title, index) => {
      products.push({
        name: title,
        category,
        price: (basePrices[item] || 999) + index * 120,
        image: buildImagePath(category, index, title),
        description:
          shortDescriptions[item]?.[index] ||
          shortDescriptions[item]?.[0] ||
          "Clean fashion pick.",
      });
    });
  });
});

module.exports = { products, seededCategories, legacySeededCategories };
