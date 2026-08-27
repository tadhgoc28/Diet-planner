/**
 * Best-effort shopping-list categorizer. Keyword match on the (lowercased)
 * ingredient name, first rule wins. Deliberately simple — it just needs to
 * group the list roughly by aisle, not be correct for every edge case.
 */

export const SHOPPING_CATEGORIES = [
  "produce",
  "meat-fish",
  "dairy-eggs",
  "bakery",
  "frozen",
  "pantry",
  "other",
] as const;

export type ShoppingCategory = (typeof SHOPPING_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<ShoppingCategory, string> = {
  produce: "Produce",
  "meat-fish": "Meat & fish",
  "dairy-eggs": "Dairy & eggs",
  bakery: "Bakery",
  frozen: "Frozen",
  pantry: "Pantry",
  other: "Other",
};

// Order matters: earlier rules win. `frozen` and `meat-fish` come before
// `produce` so "frozen peas" / "chicken breast" land correctly, and `produce`
// comes before `dairy-eggs` so "eggplant" isn't read as "egg".
const RULES: [ShoppingCategory, string[]][] = [
  ["frozen", ["frozen", "ice cream", "ice-cream"]],
  [
    "meat-fish",
    [
      "chicken", "beef", "pork", "lamb", "turkey", "bacon", "sausage", "mince",
      "steak", "salmon", "tuna", "cod", "haddock", "prawn", "shrimp", "fish",
      "anchovy", "chorizo", "ham", "duck", "mackerel", "sardine",
    ],
  ],
  [
    "bakery",
    [
      "bread", "tortilla", "pita", "pitta", "naan", "bun", "bread roll",
      "baguette", "bagel", "croissant", "brioche", "focaccia", "ciabatta",
    ],
  ],
  [
    "produce",
    [
      "lettuce", "spinach", "kale", "arugula", "rocket", "tomato", "potato",
      "onion", "garlic", "ginger", "carrot", "celery", "bell pepper", "pepper",
      "cucumber", "courgette", "zucchini", "aubergine", "eggplant", "broccoli",
      "cauliflower", "mushroom", "lemon", "lime", "orange", "apple", "banana",
      "berry", "blueberr", "strawberr", "raspberr", "avocado", "basil",
      "parsley", "cilantro", "coriander", "mint", "dill", "chive", "scallion",
      "spring onion", "leek", "sweetcorn", "corn on", "pea", "bean sprout",
      "cabbage", "chilli", "chili", "shallot", "squash", "sweet potato",
      "green bean", "asparagus", "radish", "beet", "fresh herb",
    ],
  ],
  [
    "dairy-eggs",
    [
      "milk", "cream", "butter", "cheese", "parmesan", "parmigiano",
      "mozzarella", "feta", "halloumi", "yogurt", "yoghurt", "egg",
      "creme fraiche", "crème fraîche", "mascarpone", "ricotta", "custard",
    ],
  ],
  [
    "pantry",
    [
      "flour", "sugar", "salt", "oil", "vinegar", "rice", "pasta", "noodle",
      "spaghetti", "penne", "lentil", "chickpea", "bean", "tomato paste",
      "passata", "stock", "broth", "bouillon", "soy sauce", "fish sauce",
      "honey", "maple", "spice", "cumin", "paprika", "curry", "cinnamon",
      "oregano", "thyme", "bay leaf", "baking powder", "baking soda",
      "bicarbonate", "yeast", "cornflour", "cornstarch", "cocoa", "chocolate",
      "vanilla", "almond", "cashew", "peanut", "walnut", "pecan", "hazelnut",
      "sesame", "seed", "oat", "cereal", "coconut milk", "coconut", "miso",
      "mustard", "ketchup", "mayonnaise", "mayo", "jam", "marmalade",
      "peanut butter", "tahini", "wine", "tea", "coffee", "capers", "olive",
      "sun-dried", "breadcrumb", "gelatin", "cornmeal", "polenta", "couscous",
      "quinoa", "syrup", "extract", "food colouring", "nut",
    ],
  ],
];

// A few explicit overrides that would otherwise be caught by a broader rule.
const OVERRIDES: [ShoppingCategory, string[]][] = [
  ["pantry", ["black pepper", "white pepper", "peppercorn", "chili flake", "chilli flake", "chili powder", "cayenne", "red pepper flake"]],
  ["pantry", ["canned", "tinned", "tin of", "jar of", "jarred"]],
  // Shelf-stable "milks" that would otherwise read as dairy.
  ["pantry", ["coconut milk", "coconut cream", "almond milk", "oat milk", "soy milk", "soya milk", "condensed milk", "evaporated milk", "coconut water"]],
];

export function categorize(name: string): ShoppingCategory {
  const n = name.toLowerCase().trim();

  for (const [cat, kws] of OVERRIDES) {
    if (kws.some((k) => n.includes(k))) return cat;
  }
  for (const [cat, kws] of RULES) {
    if (kws.some((k) => n.includes(k))) return cat;
  }
  return "other";
}
