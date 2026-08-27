/**
 * Seed data so the app looks populated on first run.
 *
 * Creates one demo user and six recipes (varied cuisine / diet / meal type),
 * each with ingredients and ordered instruction steps.
 *
 *   Email:    demo@mealboard.app
 *   Password: mealboard123
 *
 * Safe to re-run: it upserts the user and replaces that user's recipes.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { serializeStringArray } from "../lib/tags";

const prisma = new PrismaClient();

type SeedIngredient = { name: string; quantity?: number; unit?: string };
type SeedRecipe = {
  title: string;
  description: string;
  imageUrl: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  cuisine: string;
  diet?: string;
  mealTypes: string[];
  ingredients: SeedIngredient[];
  steps: string[];
};

const RECIPES: SeedRecipe[] = [
  {
    title: "Weeknight Tomato & Basil Pasta",
    description:
      "A fast, comforting bowl of spaghetti in a bright tomato sauce finished with torn basil and plenty of parmesan.",
    imageUrl:
      "https://images.unsplash.com/photo-1608219992759-8d74ed8d76eb?auto=format&fit=crop&w=1200&q=70",
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    servings: 4,
    cuisine: "Italian",
    diet: "Vegetarian",
    mealTypes: ["dinner"],
    ingredients: [
      { name: "spaghetti", quantity: 400, unit: "g" },
      { name: "canned crushed tomatoes", quantity: 800, unit: "g" },
      { name: "garlic", quantity: 3, unit: "clove" },
      { name: "olive oil", quantity: 2, unit: "tbsp" },
      { name: "fresh basil", quantity: 1, unit: "bunch" },
      { name: "parmesan", quantity: 50, unit: "g" },
      { name: "salt", quantity: 1, unit: "tsp" },
      { name: "chili flakes", quantity: 0.5, unit: "tsp" },
    ],
    steps: [
      "Bring a large pot of salted water to the boil and cook the spaghetti until al dente.",
      "Meanwhile, warm the olive oil in a wide pan over medium heat and soften the sliced garlic with the chili flakes for 1 minute.",
      "Add the crushed tomatoes and salt, then simmer for 12–15 minutes until thickened.",
      "Drain the pasta, reserving a splash of pasta water, and toss it through the sauce with a little of that water.",
      "Finish with torn basil and grated parmesan.",
    ],
  },
  {
    title: "Sunday Morning Blueberry Pancakes",
    description:
      "Fluffy buttermilk-style pancakes studded with blueberries. Makes a tall stack for a slow weekend breakfast.",
    imageUrl:
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=1200&q=70",
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 3,
    cuisine: "American",
    diet: "Vegetarian",
    mealTypes: ["breakfast"],
    ingredients: [
      { name: "plain flour", quantity: 200, unit: "g" },
      { name: "baking powder", quantity: 2, unit: "tsp" },
      { name: "caster sugar", quantity: 2, unit: "tbsp" },
      { name: "milk", quantity: 300, unit: "ml" },
      { name: "eggs", quantity: 2 },
      { name: "butter", quantity: 40, unit: "g" },
      { name: "blueberries", quantity: 150, unit: "g" },
      { name: "salt", quantity: 1, unit: "pinch" },
    ],
    steps: [
      "Whisk the flour, baking powder, sugar and salt in a bowl.",
      "In a jug, beat the eggs with the milk and melted butter.",
      "Pour the wet mix into the dry and stir just until combined — lumps are fine.",
      "Heat a non-stick pan over medium and ladle in rounds of batter. Scatter a few blueberries over each.",
      "Flip when bubbles form and the edges look set, then cook 1–2 minutes more. Keep warm while you finish the batch.",
    ],
  },
  {
    title: "Chickpea & Spinach Curry",
    description:
      "A weeknight coconut curry that comes together from mostly pantry staples. Vegan and freezer-friendly.",
    imageUrl:
      "https://images.unsplash.com/photo-1631292784640-2b24be784d5d?auto=format&fit=crop&w=1200&q=70",
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    servings: 4,
    cuisine: "Indian",
    diet: "Vegan",
    mealTypes: ["dinner", "lunch"],
    ingredients: [
      { name: "canned chickpeas", quantity: 800, unit: "g" },
      { name: "coconut milk", quantity: 400, unit: "ml" },
      { name: "onion", quantity: 1 },
      { name: "garlic", quantity: 3, unit: "clove" },
      { name: "fresh ginger", quantity: 1, unit: "tbsp" },
      { name: "curry powder", quantity: 2, unit: "tbsp" },
      { name: "chopped tomatoes", quantity: 400, unit: "g" },
      { name: "baby spinach", quantity: 200, unit: "g" },
      { name: "vegetable oil", quantity: 1, unit: "tbsp" },
      { name: "salt", quantity: 1, unit: "tsp" },
    ],
    steps: [
      "Soften the diced onion in the oil over medium heat for 6–8 minutes.",
      "Stir in the grated garlic, ginger and curry powder and cook for 1 minute until fragrant.",
      "Add the tomatoes, drained chickpeas and coconut milk. Simmer for 15 minutes.",
      "Stir through the spinach a handful at a time until wilted, then season with salt.",
      "Serve with rice or flatbread.",
    ],
  },
  {
    title: "Halloumi & Grain Lunch Bowl",
    description:
      "A make-ahead bowl of nutty grains, crisp cucumber, herbs and pan-fried halloumi with a lemony dressing.",
    imageUrl:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=70",
    prepTimeMinutes: 15,
    cookTimeMinutes: 10,
    servings: 2,
    cuisine: "Middle Eastern",
    diet: "Vegetarian",
    mealTypes: ["lunch"],
    ingredients: [
      { name: "cooked mixed grains", quantity: 300, unit: "g" },
      { name: "halloumi", quantity: 225, unit: "g" },
      { name: "cucumber", quantity: 1 },
      { name: "cherry tomatoes", quantity: 200, unit: "g" },
      { name: "fresh parsley", quantity: 0.5, unit: "bunch" },
      { name: "lemon", quantity: 1 },
      { name: "olive oil", quantity: 2, unit: "tbsp" },
      { name: "salt", quantity: 0.5, unit: "tsp" },
    ],
    steps: [
      "Whisk the lemon juice, olive oil and salt in the base of a large bowl.",
      "Add the grains, diced cucumber, halved tomatoes and chopped parsley and toss.",
      "Slice the halloumi and fry in a dry non-stick pan for 2 minutes per side until golden.",
      "Top the bowls with the warm halloumi and serve.",
    ],
  },
  {
    title: "Sheet-Pan Chicken Fajitas",
    description:
      "Everything roasts on one tray: spiced chicken strips with peppers and onions, ready to pile into warm tortillas.",
    imageUrl:
      "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?auto=format&fit=crop&w=1200&q=70",
    prepTimeMinutes: 15,
    cookTimeMinutes: 25,
    servings: 4,
    cuisine: "Mexican",
    diet: "High-protein",
    mealTypes: ["dinner"],
    ingredients: [
      { name: "chicken breast", quantity: 600, unit: "g" },
      { name: "bell peppers", quantity: 3 },
      { name: "onion", quantity: 1 },
      { name: "olive oil", quantity: 2, unit: "tbsp" },
      { name: "smoked paprika", quantity: 2, unit: "tsp" },
      { name: "ground cumin", quantity: 1, unit: "tsp" },
      { name: "garlic powder", quantity: 1, unit: "tsp" },
      { name: "flour tortillas", quantity: 8 },
      { name: "lime", quantity: 1 },
      { name: "salt", quantity: 1, unit: "tsp" },
    ],
    steps: [
      "Heat the oven to 220°C / 200°C fan.",
      "Slice the chicken, peppers and onion into strips and spread on a large sheet pan.",
      "Toss with the oil, spices and salt until evenly coated.",
      "Roast for 22–25 minutes, stirring once, until the chicken is cooked through and the edges char.",
      "Squeeze over the lime and serve with warm tortillas.",
    ],
  },
  {
    title: "Miso-Glazed Salmon with Rice",
    description:
      "A quick pescatarian dinner: salmon fillets under a sweet-savoury miso glaze, broiled until caramelised.",
    imageUrl:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=70",
    prepTimeMinutes: 10,
    cookTimeMinutes: 12,
    servings: 2,
    cuisine: "Japanese",
    diet: "Pescatarian",
    mealTypes: ["dinner"],
    ingredients: [
      { name: "salmon fillets", quantity: 2 },
      { name: "white miso paste", quantity: 2, unit: "tbsp" },
      { name: "honey", quantity: 1, unit: "tbsp" },
      { name: "soy sauce", quantity: 1, unit: "tbsp" },
      { name: "rice vinegar", quantity: 1, unit: "tsp" },
      { name: "jasmine rice", quantity: 150, unit: "g" },
      { name: "spring onions", quantity: 2 },
      { name: "sesame seeds", quantity: 1, unit: "tsp" },
    ],
    steps: [
      "Cook the rice according to the packet instructions.",
      "Whisk the miso, honey, soy sauce and rice vinegar into a smooth glaze.",
      "Line a tray with foil, set the salmon on it and spoon over the glaze.",
      "Broil / grill on high for 8–10 minutes until the top is bubbling and the fish flakes.",
      "Serve over the rice, scattered with sliced spring onions and sesame seeds.",
    ],
  },
];

async function main() {
  const passwordHash = await bcrypt.hash("mealboard123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@mealboard.app" },
    update: { name: "Demo Cook", passwordHash },
    create: {
      name: "Demo Cook",
      email: "demo@mealboard.app",
      passwordHash,
    },
  });

  // Fresh start for this user's recipes (cascades to ingredients/steps/planner).
  await prisma.recipe.deleteMany({ where: { userId: user.id } });

  for (const r of RECIPES) {
    await prisma.recipe.create({
      data: {
        userId: user.id,
        title: r.title,
        description: r.description,
        imageUrl: r.imageUrl,
        prepTimeMinutes: r.prepTimeMinutes,
        cookTimeMinutes: r.cookTimeMinutes,
        servings: r.servings,
        cuisine: r.cuisine,
        diet: r.diet ?? null,
        mealTypes: serializeStringArray(r.mealTypes),
        ingredients: {
          create: r.ingredients.map((ing, i) => ({
            name: ing.name,
            quantity: ing.quantity ?? null,
            unit: ing.unit ?? null,
            order: i,
          })),
        },
        steps: {
          create: r.steps.map((text, i) => ({
            stepNumber: i + 1,
            text,
          })),
        },
      },
    });
  }

  console.log(
    `Seeded ${RECIPES.length} recipes for ${user.email} (password: mealboard123)`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
