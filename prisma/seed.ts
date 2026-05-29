import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Clean existing data
  await prisma.review.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.address.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  await prisma.user.create({
    data: {
      email: 'admin@8ballafrica.com',
      name: 'Admin',
      passwordHash: adminPassword,
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
  })

  const secondaryAdminPassword = await bcrypt.hash('admin', 12)
  await prisma.user.create({
    data: {
      email: 'admin@gmail.com',
      name: 'Admin',
      passwordHash: secondaryAdminPassword,
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
  })

  // Create test customer
  const customerPassword = await bcrypt.hash('customer123', 12)
  const customer = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      name: 'John Doe',
      passwordHash: customerPassword,
      role: Role.CUSTOMER,
      emailVerified: new Date(),
    },
  })

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Pool Tables',
        slug: 'pool-tables',
        description: 'Professional and recreational pool tables for every skill level',
        image: '/images/categories/pool-tables.jpg',
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Cues',
        slug: 'cues',
        description: 'High-performance cues from top brands worldwide',
        image: '/images/categories/cues.jpg',
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Balls',
        slug: 'balls',
        description: 'Tournament-grade ball sets and practice balls',
        image: '/images/categories/balls.jpg',
        sortOrder: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Chalk',
        slug: 'chalk',
        description: 'Premium chalk for maximum grip and consistency',
        image: '/images/categories/chalk.jpg',
        sortOrder: 4,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Gloves',
        slug: 'gloves',
        description: 'Billiard gloves for a smooth, consistent stroke',
        image: '/images/categories/gloves.jpg',
        sortOrder: 5,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Racks, bridges, tip tools, cases, and more',
        image: '/images/categories/accessories.jpg',
        sortOrder: 6,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Cloth & Rails',
        slug: 'cloth-rails',
        description: 'Replacement cloth, cushions, and rail components',
        image: '/images/categories/cloth-rails.jpg',
        sortOrder: 7,
      },
    }),
  ])

  const [tables, cues, balls, chalk, gloves, accessories, cloth] = categories

  // Create products
  const products = [
    // Pool Tables
    {
      name: 'Diamond Pro-Am 9ft Table',
      slug: 'diamond-pro-am-9ft',
      description:
        'The Diamond Pro-Am is the table of choice for professional tournaments worldwide. Features precision-milled slate and patented ball return system.',
      brand: 'Diamond',
      price: 8500,
      comparePrice: 9200,
      stock: 3,
      featured: true,
      categoryId: tables.id,
      images: ['/images/products/diamond-proam-1.jpg', '/images/products/diamond-proam-2.jpg'],
    },
    {
      name: 'Brunswick Gold Crown VI',
      slug: 'brunswick-gold-crown-vi',
      description:
        'The iconic Gold Crown series continues with the VI. Professional-grade 1-inch Italian slate with precision-machined rails.',
      brand: 'Brunswick',
      price: 7200,
      comparePrice: 7800,
      stock: 5,
      featured: true,
      categoryId: tables.id,
      images: ['/images/products/brunswick-gc6-1.jpg'],
    },
    {
      name: 'Rasson Victory II 8ft',
      slug: 'rasson-victory-ii-8ft',
      description:
        'World Pool Association approved table with premium Italian slate and professional cushions.',
      brand: 'Rasson',
      price: 5900,
      stock: 7,
      categoryId: tables.id,
      images: ['/images/products/rasson-victory-1.jpg'],
    },
    {
      name: 'Olhausen Americana II 8ft',
      slug: 'olhausen-americana-ii-8ft',
      description:
        'Classic American-style table with solid hardwood construction and lifetime warranty.',
      brand: 'Olhausen',
      price: 4200,
      stock: 4,
      categoryId: tables.id,
      images: ['/images/products/olhausen-americana-1.jpg'],
    },
    // Cues
    {
      name: 'Predator Revo 12.4mm Shaft',
      slug: 'predator-revo-12-4mm',
      description:
        'Revolutionary carbon fiber shaft with low deflection technology. The most advanced shaft in the game.',
      brand: 'Predator',
      price: 520,
      stock: 15,
      featured: true,
      categoryId: cues.id,
      images: [
        '/images/products/predator-revo-1-v2.jpg',
        '/images/products/predator-revo-2-v2.jpg',
      ],
    },
    {
      name: 'Mezz EC7-WM Cue',
      slug: 'mezz-ec7-wm',
      description:
        'Japanese craftsmanship with Wavy joint and United grain technology for maximum power transfer.',
      brand: 'Mezz',
      price: 680,
      stock: 8,
      categoryId: cues.id,
      images: ['/images/products/mezz-ec7-1-v2.jpg'],
    },
    {
      name: 'Cuetec Cynergy SVB Gen One',
      slug: 'cuetec-cynergy-svb',
      description:
        'Shane Van Boening signature carbon fiber cue. Polycarbonate ferrule with carbon fiber composite shaft.',
      brand: 'Cuetec',
      price: 450,
      comparePrice: 499,
      stock: 12,
      featured: true,
      categoryId: cues.id,
      images: ['/images/products/cuetec-svb-1-v2.jpg'],
    },
    {
      name: 'McDermott G-Series G229',
      slug: 'mcdermott-g229',
      description:
        'Birdseye maple with intricate inlay work. Includes G-Core shaft with lifetime warranty.',
      brand: 'McDermott',
      price: 380,
      stock: 10,
      categoryId: cues.id,
      images: ['/images/products/mcdermott-g229-1.jpg'],
    },
    {
      name: 'Lucasi Hybrid LHC97 Break Cue',
      slug: 'lucasi-lhc97-break',
      description:
        'Purpose-built break cue with phenolic tip and stiff shaft for maximum power on the break.',
      brand: 'Lucasi',
      price: 290,
      stock: 6,
      categoryId: cues.id,
      images: ['/images/products/lucasi-lhc97-1-v2.jpg'],
    },
    {
      name: 'OB Cues Pro+ Shaft',
      slug: 'ob-pro-plus-shaft',
      description:
        'Multi-piece maple construction with advanced low-deflection technology. 11.75mm tip diameter.',
      brand: 'OB Cues',
      price: 320,
      stock: 9,
      categoryId: cues.id,
      images: ['/images/products/ob-proplus-1-v2.jpg'],
    },
    // Balls
    {
      name: 'Aramith Tournament Pro Cup Set',
      slug: 'aramith-tournament-pro-cup',
      description:
        'The official ball set used in professional tournaments. Duramith resin construction with measles cue ball.',
      brand: 'Aramith',
      price: 350,
      comparePrice: 399,
      stock: 20,
      featured: true,
      categoryId: balls.id,
      images: ['/images/products/aramith-pro-cup-1.jpg'],
    },
    {
      name: 'Aramith Super Pro 1G Set',
      slug: 'aramith-super-pro-1g',
      description:
        'Premium phenolic resin ball set with brilliant colors and consistent roll characteristics.',
      brand: 'Aramith',
      price: 280,
      stock: 15,
      categoryId: balls.id,
      images: ['/images/products/aramith-superpro-1.jpg'],
    },
    {
      name: 'Cyclop Hyperion TV Set',
      slug: 'cyclop-hyperion-tv',
      description:
        'High-visibility TV ball set with UV-reactive colors. Used in international broadcast events.',
      brand: 'Cyclop',
      price: 310,
      stock: 8,
      categoryId: balls.id,
      images: ['/images/products/cyclop-hyperion-1.jpg'],
    },
    // Chalk
    {
      name: 'Kamui 0.98 Chalk (1 piece)',
      slug: 'kamui-098-chalk',
      description:
        'Ultra-premium Japanese chalk with micro-particle technology. One application lasts multiple shots.',
      brand: 'Kamui',
      price: 28,
      stock: 50,
      featured: true,
      categoryId: chalk.id,
      images: ['/images/products/kamui-098-1.jpg'],
    },
    {
      name: 'Predator 1080 Pure Chalk (5 pack)',
      slug: 'predator-1080-chalk-5pk',
      description:
        'Engineered for maximum spin transfer with minimal residue. Tournament-approved formulation.',
      brand: 'Predator',
      price: 45,
      stock: 40,
      categoryId: chalk.id,
      images: ['/images/products/predator-1080-chalk-1.jpg'],
    },
    {
      name: 'Taom Pyro Chalk',
      slug: 'taom-pyro-chalk',
      description:
        'Finnish-made chalk with unique round shape. Excellent grip with very low dust production.',
      brand: 'Taom',
      price: 32,
      stock: 35,
      categoryId: chalk.id,
      images: ['/images/products/taom-pyro-1.jpg'],
    },
    {
      name: 'Magic Chalk (3 pack)',
      slug: 'magic-chalk-3pk',
      description:
        'Silicone-based chalk alternative that provides consistent grip without mess or dust.',
      brand: 'Magic Chalk',
      price: 18,
      stock: 60,
      categoryId: chalk.id,
      images: ['/images/products/magic-chalk-1.jpg'],
    },
    // Gloves
    {
      name: 'Predator Second Skin Glove',
      slug: 'predator-second-skin-glove',
      description:
        'Ultra-thin compression fit glove with silky smooth bridge surface. Available in S/M/L/XL.',
      brand: 'Predator',
      price: 35,
      stock: 30,
      categoryId: gloves.id,
      images: ['/images/products/predator-glove-1.jpg'],
    },
    {
      name: 'Kamui QuickDry Glove',
      slug: 'kamui-quickdry-glove',
      description:
        'Moisture-wicking technology keeps your hand dry during long sessions. Premium Lycra construction.',
      brand: 'Kamui',
      price: 30,
      stock: 25,
      categoryId: gloves.id,
      images: ['/images/products/kamui-glove-1.jpg'],
    },
    {
      name: 'Molinari Billiard Glove',
      slug: 'molinari-billiard-glove',
      description:
        'Italian-designed three-finger glove with premium spandex. Used by professional players worldwide.',
      brand: 'Molinari',
      price: 25,
      stock: 40,
      categoryId: gloves.id,
      images: ['/images/products/molinari-glove-1.jpg'],
    },
    // Accessories
    {
      name: 'Predator Urbain 2x4 Hard Case',
      slug: 'predator-urbain-2x4-case',
      description:
        'Premium hard case with soft interior lining. Holds 2 butts and 4 shafts with accessory pocket.',
      brand: 'Predator',
      price: 280,
      stock: 8,
      categoryId: accessories.id,
      images: ['/images/products/predator-case-1.jpg'],
    },
    {
      name: 'Aramith Tournament Wooden Rack',
      slug: 'aramith-tournament-rack',
      description:
        'Precision-crafted hardwood triangle rack for tight, consistent racks every time.',
      brand: 'Aramith',
      price: 45,
      stock: 20,
      categoryId: accessories.id,
      images: ['/images/products/aramith-rack-1.jpg'],
    },
    {
      name: 'Magic Rack Pro 8-Ball & 9-Ball Template',
      slug: 'magic-rack-pro-template',
      description:
        'Thin sheet rack template that ensures a perfectly tight rack. Used in professional events.',
      brand: 'Magic Rack',
      price: 8,
      stock: 100,
      categoryId: accessories.id,
      images: ['/images/products/magic-rack-1.jpg'],
    },
    {
      name: 'Willard Tip Tool Pro',
      slug: 'willard-tip-tool-pro',
      description:
        'Multi-function tip tool for shaping, scuffing, and burnishing. CNC-machined stainless steel.',
      brand: 'Willard',
      price: 42,
      stock: 15,
      categoryId: accessories.id,
      images: ['/images/products/willard-tip-tool-1.jpg'],
    },
    {
      name: 'Spider Bridge Head',
      slug: 'spider-bridge-head',
      description:
        'Extended reach bridge head with multiple groove heights. Brass construction with chrome finish.',
      brand: 'Generic',
      price: 22,
      stock: 18,
      categoryId: accessories.id,
      images: ['/images/products/spider-bridge-1.jpg'],
    },
    // Pool Tables (7 new)
    {
      name: 'Star Xingpai XW117-9S Pro',
      slug: 'star-xingpai-xw117-9s-pro',
      description:
        'Official table for world snooker events with precision steel block cushions and premium slate.',
      brand: 'Star',
      price: 6800,
      stock: 2,
      categoryId: tables.id,
      images: ['/images/products/star-xingpai-xw117-1.jpg'],
    },
    {
      name: 'Dynamic III 9ft Brown',
      slug: 'dynamic-iii-9ft-brown',
      description:
        'European-made professional table with Italian slate and a modern minimalist cabinet design.',
      brand: 'Dynamic',
      price: 4800,
      comparePrice: 5200,
      stock: 4,
      categoryId: tables.id,
      images: ['/images/products/dynamic-iii-9ft-1.jpg'],
    },
    {
      name: 'Buffalo Pro II 8ft',
      slug: 'buffalo-pro-ii-8ft',
      description:
        'Tournament-ready 8ft table with reinforced frame and responsive competition cushions.',
      brand: 'Buffalo',
      price: 3600,
      stock: 6,
      categoryId: tables.id,
      images: ['/images/products/buffalo-pro-ii-1.jpg'],
    },
    {
      name: 'Riley Aristocrat 7ft',
      slug: 'riley-aristocrat-7ft',
      description:
        'Classic English style table built for home and club use with durable wool blend cloth.',
      brand: 'Riley',
      price: 3200,
      stock: 3,
      categoryId: tables.id,
      images: ['/images/products/riley-aristocrat-1.jpg'],
    },
    {
      name: 'Connelly Ventana 8ft',
      slug: 'connelly-ventana-8ft',
      description:
        'Handcrafted hardwood table with premium finish and genuine leather drop pockets.',
      brand: 'Connelly',
      price: 5400,
      stock: 2,
      featured: true,
      categoryId: tables.id,
      images: ['/images/products/connelly-ventana-1.jpg'],
    },
    {
      name: 'SAM Atlantic Champion 7ft',
      slug: 'sam-atlantic-champion-7ft',
      description:
        'Commercial-grade table made for pubs and clubs with a heavy-duty steel reinforced frame.',
      brand: 'SAM Leisure',
      price: 2900,
      stock: 8,
      categoryId: tables.id,
      images: ['/images/products/sam-atlantic-champion-1.jpg'],
    },
    {
      name: 'Gabriels Imperator V Carom',
      slug: 'gabriels-imperator-v-carom',
      description:
        'World-class heated carom table with Artemis cushions and precision-machined rails.',
      brand: 'Gabriels',
      price: 12000,
      stock: 1,
      categoryId: tables.id,
      images: ['/images/products/gabriels-imperator-v-1.jpg'],
    },
    // Cues (10 new)
    {
      name: 'Pechauer JP07-N Cue',
      slug: 'pechauer-jp07-n-cue',
      description:
        'Handcrafted maple cue with smooth hit characteristics and excellent long-term balance.',
      brand: 'Pechauer',
      price: 560,
      stock: 6,
      categoryId: cues.id,
      images: ['/images/products/pechauer-jp07-1-v2.jpg'],
    },
    {
      name: 'Jacoby Black Carbon Break Cue',
      slug: 'jacoby-black-carbon-break-cue',
      description:
        'Full carbon fiber break cue engineered for maximum transfer of energy at impact.',
      brand: 'Jacoby',
      price: 720,
      stock: 4,
      categoryId: cues.id,
      images: ['/images/products/jacoby-carbon-break-1-v2.jpg'],
    },
    {
      name: 'Meucci Carbon Pro Shaft',
      slug: 'meucci-carbon-pro-shaft',
      description:
        'Low-deflection carbon shaft with a consistent feel and improved shot-to-shot accuracy.',
      brand: 'Meucci',
      price: 430,
      stock: 10,
      categoryId: cues.id,
      images: ['/images/products/meucci-carbon-pro-1.jpg'],
    },
    {
      name: 'Viking Valhalla VA221 Sneaky Pete',
      slug: 'viking-valhalla-va221-sneaky-pete',
      description:
        'Sneaky Pete style cue with quick-release joint and strong value for league players.',
      brand: 'Viking',
      price: 180,
      stock: 15,
      categoryId: cues.id,
      images: ['/images/products/viking-va221-1-v2.jpg'],
    },
    {
      name: 'Schon STL-7 Custom Cue',
      slug: 'schon-stl-7-custom-cue',
      description:
        'Premium custom cue with intricate inlays and a crisp hit preferred by advanced players.',
      brand: 'Schon',
      price: 1200,
      stock: 2,
      featured: true,
      categoryId: cues.id,
      images: ['/images/products/schon-stl7-1-v2.jpg'],
    },
    {
      name: 'Players HXT-P1 Jump Cue',
      slug: 'players-hxt-p1-jump-cue',
      description:
        'Dedicated jump cue with short butt design for easier elevation and controlled landings.',
      brand: 'Players',
      price: 150,
      stock: 12,
      categoryId: cues.id,
      images: ['/images/products/players-hxt-p1-1-v2.jpg'],
    },
    {
      name: 'Katana KATX-1 Performance Shaft',
      slug: 'katana-katx-1-performance-shaft',
      description:
        'Precision laminated shaft delivering low deflection and a clean, stable cue-ball response.',
      brand: 'Katana',
      price: 390,
      stock: 7,
      categoryId: cues.id,
      images: ['/images/products/katana-katx1-1.jpg'],
    },
    {
      name: 'Poison Arsenic 3 Playing Cue',
      slug: 'poison-arsenic-3-playing-cue',
      description:
        'Bold modern styling with performance taper shaft built for speed and controlled spin.',
      brand: 'Poison',
      price: 340,
      comparePrice: 399,
      stock: 9,
      categoryId: cues.id,
      images: ['/images/products/poison-arsenic-3-1.jpg'],
    },
    {
      name: 'Joss JOS201 Cue',
      slug: 'joss-jos201-cue',
      description:
        'Traditional American cue build with excellent feedback and proven tournament performance.',
      brand: 'Joss',
      price: 850,
      stock: 3,
      categoryId: cues.id,
      images: ['/images/products/joss-jos201-1.jpg'],
    },
    {
      name: 'Tiger X2-1 Shaft',
      slug: 'tiger-x2-1-shaft',
      description:
        'Laminated maple shaft with reduced squirt profile and smooth finish for a clean bridge.',
      brand: 'Tiger',
      price: 270,
      stock: 11,
      categoryId: cues.id,
      images: ['/images/products/tiger-x2-1-1-v2.jpg'],
    },
    // Balls (5 new)
    {
      name: 'Aramith Continental Ball Set',
      slug: 'aramith-continental-ball-set',
      description:
        'Premium phenolic resin set with durable finish and true roll characteristics over time.',
      brand: 'Aramith',
      price: 220,
      stock: 18,
      categoryId: balls.id,
      images: ['/images/products/aramith-continental-1.jpg'],
    },
    {
      name: 'Cyclop Ladon Tournament Set',
      slug: 'cyclop-ladon-tournament-set',
      description:
        'Tournament-grade ball set with high-contrast colors designed for competitive visibility.',
      brand: 'Cyclop',
      price: 290,
      stock: 10,
      categoryId: balls.id,
      images: ['/images/products/cyclop-ladon-1.jpg'],
    },
    {
      name: 'Aramith Pure White Cue Ball',
      slug: 'aramith-pure-white-cue-ball',
      description:
        'Balanced cue ball made from high-density resin for reliable rebound and spin transfer.',
      brand: 'Aramith',
      price: 35,
      stock: 50,
      categoryId: balls.id,
      images: ['/images/products/aramith-pure-white-cue-ball-1.jpg'],
    },
    {
      name: 'Dynaspheres Platinum Ball Set',
      slug: 'dynaspheres-platinum-ball-set',
      description:
        'High-performance set known for bright colors, durability, and consistent table response.',
      brand: 'Dynaspheres',
      price: 260,
      comparePrice: 299,
      stock: 12,
      categoryId: balls.id,
      images: ['/images/products/dynaspheres-platinum-1.jpg'],
    },
    {
      name: 'Aramith Training Cue Ball with Dots',
      slug: 'aramith-training-cue-ball-with-dots',
      description:
        'Training cue ball with spin markers to help visualize english and improve cue action.',
      brand: 'Aramith',
      price: 42,
      stock: 30,
      categoryId: balls.id,
      images: ['/images/products/aramith-training-cue-ball-1.jpg'],
    },
    // Chalk (5 new)
    {
      name: 'Taom V10 Chalk',
      slug: 'taom-v10-chalk',
      description:
        'Premium low-residue chalk with excellent grip and very clean contact on the cue tip.',
      brand: 'Taom',
      price: 38,
      stock: 45,
      categoryId: chalk.id,
      images: ['/images/products/taom-v10-1.jpg'],
    },
    {
      name: 'Kamui 1.21 Chalk (1 piece)',
      slug: 'kamui-1-21-chalk',
      description:
        'Softer Kamui formula offering strong bite and confidence on spin-heavy positional shots.',
      brand: 'Kamui',
      price: 25,
      stock: 55,
      categoryId: chalk.id,
      images: ['/images/products/kamui-121-1.jpg'],
    },
    {
      name: 'Mezz Smart Chalk Set',
      slug: 'mezz-smart-chalk-set',
      description:
        'Convenient chalk and holder bundle designed for players who want quick rack-to-rack access.',
      brand: 'Mezz',
      price: 42,
      stock: 20,
      categoryId: chalk.id,
      images: ['/images/products/mezz-smart-chalk-1.jpg'],
    },
    {
      name: 'Triangle Pro Chalk (12 pack)',
      slug: 'triangle-pro-chalk-12-pack',
      description:
        'Classic reliable chalk in a value 12-pack for clubs, halls, and frequent league players.',
      brand: 'Triangle',
      price: 12,
      stock: 100,
      categoryId: chalk.id,
      images: ['/images/products/triangle-pro-12-pack-1.jpg'],
    },
    {
      name: 'OB Performance Chalk (2 pack)',
      slug: 'ob-performance-chalk-2-pack',
      description:
        'High-friction chalk blend tuned for modern shafts and repeatable contact on power shots.',
      brand: 'OB Cues',
      price: 20,
      stock: 40,
      categoryId: chalk.id,
      images: ['/images/products/ob-performance-chalk-1.jpg'],
    },
    // Gloves (5 new)
    {
      name: 'McDermott Billiard Glove',
      slug: 'mcdermott-billiard-glove',
      description: 'Breathable three-finger glove with secure fit and low-friction bridge surface.',
      brand: 'McDermott',
      price: 18,
      stock: 35,
      categoryId: gloves.id,
      images: ['/images/products/mcdermott-glove-1.jpg'],
    },
    {
      name: 'Poison Camo Pool Glove',
      slug: 'poison-camo-pool-glove',
      description:
        'Distinctive camo style glove with smooth Lycra fabric and stable wrist closure.',
      brand: 'Poison',
      price: 22,
      stock: 28,
      categoryId: gloves.id,
      images: ['/images/products/poison-camo-glove-1.jpg'],
    },
    {
      name: 'Cuetec Axis Nano Glove',
      slug: 'cuetec-axis-nano-glove',
      description:
        'Ultra-light glove with moisture management and a consistent feel in humid conditions.',
      brand: 'Cuetec',
      price: 28,
      stock: 20,
      categoryId: gloves.id,
      images: ['/images/products/cuetec-axis-nano-glove-1.jpg'],
    },
    {
      name: 'IBS Pro Mesh Glove',
      slug: 'ibs-pro-mesh-glove',
      description:
        'Lightweight mesh-backed glove that helps keep bridge hand cool during long sessions.',
      brand: 'IBS',
      price: 15,
      stock: 50,
      categoryId: gloves.id,
      images: ['/images/products/ibs-pro-mesh-glove-1.jpg'],
    },
    {
      name: 'Tiger X Billiard Glove',
      slug: 'tiger-x-billiard-glove',
      description:
        'Performance glove with close fit and reinforced wear zones for daily training use.',
      brand: 'Tiger',
      price: 20,
      stock: 30,
      categoryId: gloves.id,
      images: ['/images/products/tiger-x-glove-1.jpg'],
    },
    // Accessories (10 new)
    {
      name: 'Mezz GMC Magnetic Chalk Holder',
      slug: 'mezz-gmc-magnetic-chalk-holder',
      description:
        'Machined aluminum holder with strong magnetic base for quick and clean chalk access.',
      brand: 'Mezz',
      price: 55,
      stock: 20,
      categoryId: accessories.id,
      images: ['/images/products/mezz-gmc-holder-1.jpg'],
    },
    {
      name: 'Predator Sport 3x5 Soft Case',
      slug: 'predator-sport-3x5-soft-case',
      description:
        'Padded soft case for 3 butts and 5 shafts with practical storage pockets and strap.',
      brand: 'Predator',
      price: 180,
      stock: 12,
      categoryId: accessories.id,
      images: ['/images/products/predator-sport-3x5-case-1.jpg'],
    },
    {
      name: 'OB Cues 1x1 Hard Case',
      slug: 'ob-cues-1x1-hard-case',
      description: 'Compact hard-shell case with secure closure for one butt and one shaft setup.',
      brand: 'OB Cues',
      price: 95,
      stock: 15,
      categoryId: accessories.id,
      images: ['/images/products/ob-cues-1x1-case-1.jpg'],
    },
    {
      name: 'QClaw 3-Cue Portable Holder',
      slug: 'qclaw-3-cue-portable-holder',
      description:
        'Portable table-edge cue holder that keeps up to three cues off the floor safely.',
      brand: 'QClaw',
      price: 35,
      stock: 25,
      categoryId: accessories.id,
      images: ['/images/products/qclaw-3-cue-holder-1.jpg'],
    },
    {
      name: 'Kamui Gator Grip Tip Clamp',
      slug: 'kamui-gator-grip-tip-clamp',
      description:
        'Precision clamp tool for tip installation with even pressure and quick setup time.',
      brand: 'Kamui',
      price: 28,
      stock: 18,
      categoryId: accessories.id,
      images: ['/images/products/kamui-gator-grip-clamp-1.jpg'],
    },
    {
      name: 'Sardo Tight Rack',
      slug: 'sardo-tight-rack',
      description:
        'Mechanical racking system designed to produce consistently frozen racks on demand.',
      brand: 'Sardo',
      price: 320,
      comparePrice: 359,
      stock: 5,
      categoryId: accessories.id,
      images: ['/images/products/sardo-tight-rack-1.jpg'],
    },
    {
      name: 'Tiger Onyx Tip (Medium, 14mm)',
      slug: 'tiger-onyx-tip-medium-14mm',
      description:
        'Layered pigskin tip with balanced hardness for control, power, and long service life.',
      brand: 'Tiger',
      price: 22,
      stock: 60,
      categoryId: accessories.id,
      images: ['/images/products/tiger-onyx-tip-1.jpg'],
    },
    {
      name: 'Aramith Ball Cleaner and Restorer',
      slug: 'aramith-ball-cleaner-and-restorer',
      description:
        'Official cleaning formula that helps maintain gloss, speed, and color of billiard balls.',
      brand: 'Aramith',
      price: 18,
      stock: 40,
      categoryId: accessories.id,
      images: ['/images/products/aramith-cleaner-restorer-1.jpg'],
    },
    {
      name: 'Under Table Ball Return Tray',
      slug: 'under-table-ball-return-tray',
      description:
        'Universal under-table return tray compatible with most 7ft to 9ft commercial tables.',
      brand: 'Generic',
      price: 65,
      stock: 10,
      categoryId: accessories.id,
      images: ['/images/products/under-table-ball-return-tray-1.jpg'],
    },
    {
      name: 'Predator Vault Plate Wall Mount (4 cues)',
      slug: 'predator-vault-plate-wall-mount-4-cues',
      description:
        'Wall rack for four cues with clean modern profile and felt-lined contact points.',
      brand: 'Predator',
      price: 120,
      stock: 8,
      categoryId: accessories.id,
      images: ['/images/products/predator-vault-wall-mount-1.jpg'],
    },
    // Cloth & Rails (8 new)
    {
      name: 'Iwan Simonis 300 Rapide Cloth (12ft)',
      slug: 'iwan-simonis-300-rapide-cloth-12ft',
      description:
        'Fast worsted snooker cloth with excellent nap control and long tournament life.',
      brand: 'Simonis',
      price: 480,
      stock: 6,
      categoryId: cloth.id,
      images: ['/images/products/simonis-300-rapide-1.jpg'],
    },
    {
      name: 'Strachan 6811 Tournament Cloth (12ft)',
      slug: 'strachan-6811-tournament-cloth-12ft',
      description:
        'Professional snooker cloth trusted in top events for speed consistency and durability.',
      brand: 'Strachan',
      price: 460,
      stock: 7,
      categoryId: cloth.id,
      images: ['/images/products/strachan-6811-1.jpg'],
    },
    {
      name: 'Hainsworth Match Cloth (9ft)',
      slug: 'hainsworth-match-cloth-9ft',
      description:
        'Reliable wool blend cloth suitable for league tables and high-volume practice rooms.',
      brand: 'Hainsworth',
      price: 260,
      stock: 14,
      categoryId: cloth.id,
      images: ['/images/products/hainsworth-match-1.jpg'],
    },
    {
      name: 'Artemis Intercontinental K55 Cushions (Set of 6)',
      slug: 'artemis-intercontinental-k55-cushions-set-6',
      description:
        'Premium cushion rubber set delivering lively and predictable rebound over extended use.',
      brand: 'Artemis',
      price: 220,
      stock: 11,
      categoryId: cloth.id,
      images: ['/images/products/artemis-k55-cushions-1.jpg'],
    },
    {
      name: 'Championship Invitational Teflon Cloth (9ft)',
      slug: 'championship-invitational-teflon-cloth-9ft',
      description:
        'Durable Teflon-treated cloth designed for lower maintenance in busy pool halls.',
      brand: 'Championship',
      price: 210,
      stock: 16,
      categoryId: cloth.id,
      images: ['/images/products/championship-invitational-1.jpg'],
    },
    {
      name: 'Andys 988 Pro Cloth (8ft)',
      slug: 'andys-988-pro-cloth-8ft',
      description:
        'Affordable fast-play cloth with good control, ideal for club tables and home installs.',
      brand: 'Andys',
      price: 140,
      stock: 22,
      categoryId: cloth.id,
      images: ['/images/products/andys-988-pro-1.jpg'],
    },
    {
      name: 'Rail Rubber Adhesive Kit',
      slug: 'rail-rubber-adhesive-kit',
      description:
        'Professional adhesive kit for cushion replacement and rail refurbishment projects.',
      brand: 'Generic',
      price: 35,
      stock: 40,
      categoryId: cloth.id,
      images: ['/images/products/rail-rubber-adhesive-kit-1.jpg'],
    },
    {
      name: 'Simonis X-1 Cloth Cleaner',
      slug: 'simonis-x-1-cloth-cleaner',
      description:
        'Non-electric cloth cleaner that removes chalk dust and helps preserve table speed.',
      brand: 'Simonis',
      price: 95,
      stock: 18,
      categoryId: cloth.id,
      images: ['/images/products/simonis-x1-cleaner-1.jpg'],
    },
    // Cloth & Rails
    {
      name: 'Simonis 860 Cloth (9ft)',
      slug: 'simonis-860-cloth-9ft',
      description:
        'The world standard in billiard cloth. Worsted wool blend for fast, consistent play. Tournament blue.',
      brand: 'Simonis',
      price: 380,
      stock: 10,
      featured: true,
      categoryId: cloth.id,
      images: ['/images/products/simonis-860-1.jpg'],
    },
    {
      name: 'Simonis 760 Cloth (8ft)',
      slug: 'simonis-760-cloth-8ft',
      description:
        'Slightly napped cloth for a balance of speed and control. Ideal for recreational and league play.',
      brand: 'Simonis',
      price: 290,
      stock: 12,
      categoryId: cloth.id,
      images: ['/images/products/simonis-760-1.jpg'],
    },
    {
      name: 'Championship Saturn II Cloth (8ft)',
      slug: 'championship-saturn-ii-8ft',
      description:
        'Teflon-coated nylon/wool blend for excellent durability. Great value for home tables.',
      brand: 'Championship',
      price: 150,
      stock: 20,
      categoryId: cloth.id,
      images: ['/images/products/championship-saturn-1.jpg'],
    },
    {
      name: 'K-66 Profile Rubber Cushions (Set of 6)',
      slug: 'k66-rubber-cushions-set',
      description:
        'Standard K-66 profile replacement cushion rubber. Natural gum rubber for consistent rebound.',
      brand: 'Generic',
      price: 95,
      stock: 14,
      categoryId: cloth.id,
      images: ['/images/products/k66-cushions-1.jpg'],
    },
  ]

  for (const product of products) {
    const { images, ...productData } = product
    const created = await prisma.product.create({ data: productData })
    await prisma.productImage.createMany({
      data: images.map((url, index) => ({
        url,
        alt: `${productData.name} image ${index + 1}`,
        sortOrder: index,
        productId: created.id,
      })),
    })
  }

  // Create some reviews
  const allProducts = await prisma.product.findMany({ take: 10 })
  const reviewComments = [
    'Excellent quality, exactly as described. Fast shipping too!',
    'Great value for money. Would definitely buy again.',
    'Top-notch craftsmanship. You can feel the quality difference immediately.',
    'Been using this for 6 months now and it still performs like new.',
    'Good product but shipping took a bit longer than expected.',
  ]

  for (let i = 0; i < Math.min(5, allProducts.length); i++) {
    await prisma.review.create({
      data: {
        userId: customer.id,
        productId: allProducts[i].id,
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
        comment: reviewComments[i],
      },
    })
  }

  // Create an address for the customer
  await prisma.address.create({
    data: {
      userId: customer.id,
      fullName: 'John Doe',
      street: '123 Pool Hall Avenue',
      city: 'Cape Town',
      state: 'Western Cape',
      postalCode: '8001',
      country: 'South Africa',
      phone: '+27 21 123 4567',
      isDefault: true,
    },
  })

  console.log('✓ Database seeded successfully')
  console.log(`  - Admin: admin@8ballafrica.com / admin123`)
  console.log(`  - Admin: admin@gmail.com / admin`)
  console.log(`  - Customer: customer@example.com / customer123`)
  console.log(`  - ${products.length} products created`)
  console.log(`  - ${categories.length} categories created`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
