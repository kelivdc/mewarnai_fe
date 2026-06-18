// src/lib/templates.ts
// Static catalog of built-in black-and-white coloring page templates.
// Images are served from /templates/ in the public folder.

export type TemplateCategory =
  | 'animals'
  | 'nature'
  | 'vehicles'
  | 'food'
  | 'fantasy'
  | 'space'
  | 'buildings'
  | 'sports'

export interface Template {
  id: string
  name: string
  category: TemplateCategory
  /** Path relative to public root, e.g. /templates/cat.svg */
  src: string
  /** Short description shown on hover */
  description: string
  /** Difficulty level for kids */
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
}

export const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  animals:   '🐾 Animals',
  nature:    '🌿 Nature',
  vehicles:  '🚗 Vehicles',
  food:      '🍎 Food',
  fantasy:   '🦄 Fantasy',
  space:     '🚀 Space',
  buildings: '🏠 Buildings',
  sports:    '⚽ Sports',
}

export const DIFFICULTY_LABELS = {
  easy:   { label: 'Easy',   color: 'bg-green-100 text-green-700'   },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  hard:   { label: 'Hard',   color: 'bg-red-100 text-red-700'       },
}

export const TEMPLATES: Template[] = [
  // ── Animals ──────────────────────────────────────────────────────────────
  {
    id: 'cat',
    name: 'Cute Cat',
    category: 'animals',
    src: '/templates/cat.svg',
    description: 'A friendly sitting cat with big eyes',
    difficulty: 'easy',
    tags: ['cat', 'kucing', 'pet', 'hewan'],
  },
  {
    id: 'dog',
    name: 'Happy Dog',
    category: 'animals',
    src: '/templates/dog.svg',
    description: 'A playful puppy wagging its tail',
    difficulty: 'easy',
    tags: ['dog', 'anjing', 'puppy', 'hewan'],
  },
  {
    id: 'butterfly',
    name: 'Butterfly',
    category: 'animals',
    src: '/templates/butterfly.svg',
    description: 'A beautiful butterfly with patterned wings',
    difficulty: 'medium',
    tags: ['butterfly', 'kupu-kupu', 'insect', 'serangga'],
  },
  {
    id: 'fish',
    name: 'Tropical Fish',
    category: 'animals',
    src: '/templates/fish.svg',
    description: 'A colorful tropical fish underwater',
    difficulty: 'easy',
    tags: ['fish', 'ikan', 'laut', 'sea'],
  },
  {
    id: 'elephant',
    name: 'Elephant',
    category: 'animals',
    src: '/templates/elephant.svg',
    description: 'A big friendly elephant',
    difficulty: 'medium',
    tags: ['elephant', 'gajah', 'safari'],
  },
  {
    id: 'rabbit',
    name: 'Bunny Rabbit',
    category: 'animals',
    src: '/templates/rabbit.svg',
    description: 'A fluffy bunny hopping around',
    difficulty: 'easy',
    tags: ['rabbit', 'kelinci', 'bunny', 'cute'],
  },
  {
    id: 'lion',
    name: 'Lion',
    category: 'animals',
    src: '/templates/lion.svg',
    description: 'A majestic lion with a full mane',
    difficulty: 'hard',
    tags: ['lion', 'singa', 'safari', 'jungle'],
  },
  {
    id: 'bird',
    name: 'Little Bird',
    category: 'animals',
    src: '/templates/bird.svg',
    description: 'A cute little bird perched on a branch',
    difficulty: 'easy',
    tags: ['bird', 'burung', 'fly', 'terbang'],
  },

  // ── Nature ────────────────────────────────────────────────────────────────
  {
    id: 'flower',
    name: 'Sunflower',
    category: 'nature',
    src: '/templates/flower.svg',
    description: 'A cheerful sunflower in full bloom',
    difficulty: 'easy',
    tags: ['flower', 'bunga', 'sunflower', 'matahari'],
  },
  {
    id: 'tree',
    name: 'Big Tree',
    category: 'nature',
    src: '/templates/tree.svg',
    description: 'A tall tree with a round canopy',
    difficulty: 'easy',
    tags: ['tree', 'pohon', 'nature', 'alam'],
  },
  {
    id: 'mushroom',
    name: 'Magic Mushroom',
    category: 'nature',
    src: '/templates/mushroom.svg',
    description: 'A spotted mushroom with a fairy door',
    difficulty: 'medium',
    tags: ['mushroom', 'jamur', 'magic', 'forest'],
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    category: 'nature',
    src: '/templates/rainbow.svg',
    description: 'A bright rainbow with clouds and sun',
    difficulty: 'easy',
    tags: ['rainbow', 'pelangi', 'cloud', 'awan', 'sun'],
  },

  // ── Vehicles ──────────────────────────────────────────────────────────────
  {
    id: 'car',
    name: 'Race Car',
    category: 'vehicles',
    src: '/templates/car.svg',
    description: 'A speedy race car ready for the track',
    difficulty: 'easy',
    tags: ['car', 'mobil', 'race', 'balap'],
  },
  {
    id: 'rocket',
    name: 'Rocket Ship',
    category: 'vehicles',
    src: '/templates/rocket.svg',
    description: 'A rocket blasting off into space',
    difficulty: 'medium',
    tags: ['rocket', 'roket', 'space', 'angkasa'],
  },
  {
    id: 'train',
    name: 'Steam Train',
    category: 'vehicles',
    src: '/templates/train.svg',
    description: 'A classic steam locomotive with smoke',
    difficulty: 'medium',
    tags: ['train', 'kereta', 'steam', 'uap'],
  },
  {
    id: 'airplane',
    name: 'Airplane',
    category: 'vehicles',
    src: '/templates/airplane.svg',
    description: 'A passenger airplane soaring through the sky',
    difficulty: 'easy',
    tags: ['airplane', 'pesawat', 'fly', 'terbang'],
  },

  // ── Food ──────────────────────────────────────────────────────────────────
  {
    id: 'cupcake',
    name: 'Cupcake',
    category: 'food',
    src: '/templates/cupcake.svg',
    description: 'A yummy cupcake with frosting and a cherry',
    difficulty: 'easy',
    tags: ['cupcake', 'cake', 'kue', 'sweet', 'manis'],
  },
  {
    id: 'pizza',
    name: 'Pizza Slice',
    category: 'food',
    src: '/templates/pizza.svg',
    description: 'A cheesy slice of pizza with toppings',
    difficulty: 'medium',
    tags: ['pizza', 'food', 'makanan', 'cheese'],
  },
  {
    id: 'ice-cream',
    name: 'Ice Cream',
    category: 'food',
    src: '/templates/ice-cream.svg',
    description: 'A double scoop ice cream cone',
    difficulty: 'easy',
    tags: ['ice cream', 'es krim', 'sweet', 'manis'],
  },

  // ── Fantasy ───────────────────────────────────────────────────────────────
  {
    id: 'unicorn',
    name: 'Unicorn',
    category: 'fantasy',
    src: '/templates/unicorn.svg',
    description: 'A magical unicorn with a flowing mane',
    difficulty: 'hard',
    tags: ['unicorn', 'magic', 'horse', 'kuda', 'fantasy'],
  },
  {
    id: 'dragon',
    name: 'Baby Dragon',
    category: 'fantasy',
    src: '/templates/dragon.svg',
    description: 'A cute baby dragon breathing tiny flames',
    difficulty: 'hard',
    tags: ['dragon', 'naga', 'fantasy', 'fire'],
  },
  {
    id: 'castle',
    name: 'Magic Castle',
    category: 'fantasy',
    src: '/templates/castle.svg',
    description: 'A fairytale castle with towers and flags',
    difficulty: 'hard',
    tags: ['castle', 'istana', 'fairy', 'peri', 'kingdom'],
  },

  // ── Space ─────────────────────────────────────────────────────────────────
  {
    id: 'planet',
    name: 'Planet Saturn',
    category: 'space',
    src: '/templates/planet.svg',
    description: 'Planet Saturn with its famous rings',
    difficulty: 'medium',
    tags: ['planet', 'saturn', 'space', 'angkasa', 'star'],
  },
  {
    id: 'astronaut',
    name: 'Astronaut',
    category: 'space',
    src: '/templates/astronaut.svg',
    description: 'A brave astronaut floating in space',
    difficulty: 'medium',
    tags: ['astronaut', 'astronot', 'space', 'angkasa'],
  },

  // ── Buildings ─────────────────────────────────────────────────────────────
  {
    id: 'house',
    name: 'Cozy House',
    category: 'buildings',
    src: '/templates/house.svg',
    description: 'A cozy house with a garden and chimney',
    difficulty: 'easy',
    tags: ['house', 'rumah', 'home', 'building'],
  },
  {
    id: 'lighthouse',
    name: 'Lighthouse',
    category: 'buildings',
    src: '/templates/lighthouse.svg',
    description: 'A tall lighthouse by the sea',
    difficulty: 'medium',
    tags: ['lighthouse', 'menara', 'sea', 'laut'],
  },

  // ── Sports ────────────────────────────────────────────────────────────────
  {
    id: 'soccer',
    name: 'Soccer Ball',
    category: 'sports',
    src: '/templates/soccer.svg',
    description: 'A classic black and white soccer ball',
    difficulty: 'easy',
    tags: ['soccer', 'football', 'sepak bola', 'ball', 'bola'],
  },
  {
    id: 'bicycle',
    name: 'Bicycle',
    category: 'sports',
    src: '/templates/bicycle.svg',
    description: 'A fun bicycle ready to ride',
    difficulty: 'medium',
    tags: ['bicycle', 'sepeda', 'bike', 'ride'],
  },
]
