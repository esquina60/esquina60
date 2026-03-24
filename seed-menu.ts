import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'; 
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// We can read it from .env
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const newProducts = [
  // COMBOS DE WHISKY
  { name: "JACK DANIEL'S", description: "4 GELO DE SABOR + 4 RED BULL", price: 300.0, category: "combos de whisky", isAvailable: true, imageUrl: "" },
  { name: "BLACK LABEL", description: "4 GELO DE SABOR + 4 RED BULL", price: 350.0, category: "combos de whisky", isAvailable: true, imageUrl: "" },
  { name: "GOLD LABEL", description: "4 GELO DE SABOR + 4 RED BULL", price: 450.0, category: "combos de whisky", isAvailable: true, imageUrl: "" },
  { name: "BUCHANAN'S", description: "4 GELO DE SABOR + 4 RED BULL", price: 350.0, category: "combos de whisky", isAvailable: true, imageUrl: "" },
  { name: "JACK GENTLEMAN", description: "4 GELO DE SABOR + 4 RED BULL", price: 350.0, category: "combos de whisky", isAvailable: true, imageUrl: "" },
  { name: "JACK MAÇA VERDE", description: "4 GELO DE SABOR + 4 RED BULL", price: 320.0, category: "combos de whisky", isAvailable: true, imageUrl: "" },
  { name: "OLD PAR", description: "4 GELO DE SABOR + 4 RED BULL", price: 300.0, category: "combos de whisky", isAvailable: true, imageUrl: "" },
  { name: "BALLANTINES 12 ANOS", description: "4 GELO DE SABOR + 4 RED BULL", price: 300.0, category: "combos de whisky", isAvailable: true, imageUrl: "" },
  { name: "CHIVAS 12 ANOS", description: "4 GELO DE SABOR + 4 RED BULL", price: 300.0, category: "combos de whisky", isAvailable: true, imageUrl: "" },
  { name: "WHITE HORSE", description: "4 GELO DE SABOR + 4 RED BULL", price: 200.0, category: "combos de whisky", isAvailable: true, imageUrl: "" },
  { name: "RED LABEL", description: "4 GELO DE SABOR + 4 RED BULL", price: 200.0, category: "combos de whisky", isAvailable: true, imageUrl: "" },
  { name: "BALLANTINES 8 ANOS", description: "4 GELO DE SABOR + 4 RED BULL", price: 200.0, category: "combos de whisky", isAvailable: true, imageUrl: "" },

  // DOSES DE WHISKY
  { name: "JACK DANIEL'S", description: "", price: 45.0, category: "doses de whisky", isAvailable: true, imageUrl: "" },
  { name: "BLACK LABEL", description: "", price: 50.0, category: "doses de whisky", isAvailable: true, imageUrl: "" },
  { name: "BUCHANAN'S", description: "", price: 50.0, category: "doses de whisky", isAvailable: true, imageUrl: "" },
  { name: "JACK MAÇA VERDE", description: "", price: 50.0, category: "doses de whisky", isAvailable: true, imageUrl: "" },
  { name: "RED LABEL", description: "", price: 40.0, category: "doses de whisky", isAvailable: true, imageUrl: "" },
  { name: "BALLANTINES 8 ANOS", description: "", price: 40.0, category: "doses de whisky", isAvailable: true, imageUrl: "" },
  { name: "OLD PAR", description: "", price: 45.0, category: "doses de whisky", isAvailable: true, imageUrl: "" },
  { name: "BALLANTINES 12 ANOS", description: "", price: 45.0, category: "doses de whisky", isAvailable: true, imageUrl: "" },
  { name: "CHIVAS 12 ANOS", description: "", price: 45.0, category: "doses de whisky", isAvailable: true, imageUrl: "" },
  { name: "WHITE HORSE", description: "", price: 35.0, category: "doses de whisky", isAvailable: true, imageUrl: "" },

  // COMBOS DE GIN
  { name: "TANQUERAY", description: "4 GELO DE SABOR + 4 RED BULL", price: 280.0, category: "combos de gin", isAvailable: true, imageUrl: "" },
  { name: "TANQUERAY ROYALE", description: "4 GELO DE SABOR + 4 RED BULL", price: 300.0, category: "combos de gin", isAvailable: true, imageUrl: "" },
  { name: "BOMBAY", description: "4 GELO DE SABOR + 4 RED BULL", price: 260.0, category: "combos de gin", isAvailable: true, imageUrl: "" },
  { name: "BEEFEATER", description: "4 GELO DE SABOR + 4 RED BULL", price: 280.0, category: "combos de gin", isAvailable: true, imageUrl: "" },
  { name: "BEEFEATER PINK", description: "4 GELO DE SABOR + 4 RED BULL", price: 300.0, category: "combos de gin", isAvailable: true, imageUrl: "" },
  { name: "ROCKS C/ RED BULL", description: "4 GELO DE SABOR + 4 RED BULL", price: 150.0, category: "combos de gin", isAvailable: true, imageUrl: "" },
  { name: "ROCKS", description: "4 GELO DE SABOR + ENERGÉTICO 2L", price: 120.0, category: "combos de gin", isAvailable: true, imageUrl: "" },

  // DOSES DE GIN
  { name: "TANQUERAY", description: "", price: 40.0, category: "doses de gin", isAvailable: true, imageUrl: "" },
  { name: "TANQUERAY ROYALE", description: "", price: 45.0, category: "doses de gin", isAvailable: true, imageUrl: "" },
  { name: "BOMBAY", description: "", price: 40.0, category: "doses de gin", isAvailable: true, imageUrl: "" },
  { name: "BEEFEATER", description: "", price: 40.0, category: "doses de gin", isAvailable: true, imageUrl: "" },
  { name: "BEEFEATER PINK", description: "", price: 45.0, category: "doses de gin", isAvailable: true, imageUrl: "" },
  { name: "ROCKS C/ RED BULL", description: "", price: 30.0, category: "doses de gin", isAvailable: true, imageUrl: "" },
  { name: "ROCKS", description: "", price: 25.0, category: "doses de gin", isAvailable: true, imageUrl: "" },

  // COMBOS DE VODKA
  { name: "CIROC", description: "4 GELO DE SABOR + 4 RED BULL", price: 350.0, category: "combos de vodka", isAvailable: true, imageUrl: "" },
  { name: "GREY GOOSE", description: "4 GELO DE SABOR + 4 RED BULL", price: 320.0, category: "combos de vodka", isAvailable: true, imageUrl: "" },
  { name: "ABSOLUT", description: "4 GELO DE SABOR + 4 RED BULL", price: 250.0, category: "combos de vodka", isAvailable: true, imageUrl: "" },
  
  // DOSES DE VODKA
  { name: "CIROC", description: "", price: 50.0, category: "doses de vodka", isAvailable: true, imageUrl: "" },
  { name: "GREY GOOSE", description: "", price: 45.0, category: "doses de vodka", isAvailable: true, imageUrl: "" },
  { name: "ABSOLUT", description: "", price: 40.0, category: "doses de vodka", isAvailable: true, imageUrl: "" },

  // CERVEJAS 600ML
  { name: "HEINEKEN", description: "", price: 16.0, category: "cervejas 600ml", isAvailable: true, imageUrl: "" },
  { name: "BECKS", description: "", price: 13.0, category: "cervejas 600ml", isAvailable: true, imageUrl: "" },
  { name: "BUDWEISER", description: "", price: 11.0, category: "cervejas 600ml", isAvailable: true, imageUrl: "" },
  { name: "ORIGINAL", description: "", price: 14.0, category: "cervejas 600ml", isAvailable: true, imageUrl: "" },
  { name: "SPATEN", description: "", price: 12.0, category: "cervejas 600ml", isAvailable: true, imageUrl: "" },
  { name: "STELLA ARTOIS", description: "", price: 12.0, category: "cervejas 600ml", isAvailable: true, imageUrl: "" },
  { name: "SKOL", description: "", price: 10.0, category: "cervejas 600ml", isAvailable: true, imageUrl: "" },
  { name: "IMPÉRIO", description: "", price: 9.0, category: "cervejas 600ml", isAvailable: true, imageUrl: "" },

  // CERVEJAS LONG NECK
  { name: "HEINEKEN", description: "", price: 12.0, category: "cervejas long neck", isAvailable: true, imageUrl: "" },
  { name: "BECKS", description: "", price: 12.0, category: "cervejas long neck", isAvailable: true, imageUrl: "" },
  { name: "BUDWEISER", description: "", price: 11.0, category: "cervejas long neck", isAvailable: true, imageUrl: "" },
  { name: "SPATEN", description: "", price: 12.0, category: "cervejas long neck", isAvailable: true, imageUrl: "" },
  { name: "STELLA ARTOIS", description: "", price: 12.0, category: "cervejas long neck", isAvailable: true, imageUrl: "" },
  { name: "CORONA", description: "", price: 12.0, category: "cervejas long neck", isAvailable: true, imageUrl: "" }
];

async function seed() {
  console.log('Connecting to Supabase...');
  
  // First, completely delete all products
  const { error: delErr } = await supabase.from('products').delete().neq('id', '0');
  if (delErr) {
    console.error('Error deleting products:', delErr);
  } else {
    console.log('Old products cleared.');
  }

  // Insert the new products
  const { error: insErr } = await supabase.from('products').insert(newProducts);
  if (insErr) {
    console.error('Error inserting new products:', insErr);
  } else {
    console.log('New products seeded successfully!');
  }
}

seed();
