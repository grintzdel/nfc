import { randomUUID } from 'crypto'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { connectDatabase } from './config/database'
import { UserModel } from './modules/auth/infrastructure/schema/user.schema'
import { ProductModel } from './modules/product/infrastructure/schema/product.schema'
import { EventModel } from './modules/event/infrastructure/schema/event.schema'
import { BraceletModel } from './modules/bracelet/infrastructure/schema/bracelet.schema'
import { ParticipantModel } from './modules/participant/infrastructure/schema/participant.schema'
import { CheckInModel } from './modules/check-in/infrastructure/schema/check-in.schema'
import { SupplyOrderModel } from './modules/supply-order/infrastructure/schema/supply-order.schema'
import { OrderModel } from './modules/order/infrastructure/schema/order.schema'
import { EventStatus } from './modules/event/domain/constants/event-status.constant'
import { BraceletStatus } from './modules/bracelet/domain/constants/bracelet-status.constant'

dotenv.config()

const DAY = 86_400_000
const HOUR = 3_600_000

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * DAY)
}

function daysFromNow(n: number): Date {
  return new Date(Date.now() + n * DAY)
}

function randomDateInMonth(monthOffset: number): Date {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + monthOffset
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0)
  const day = 1 + Math.floor(Math.random() * end.getDate())
  return new Date(year, month, day, Math.floor(Math.random() * 18) + 6)
}

async function seed(): Promise<void> {
  await connectDatabase(process.env.MONGODB_URI!)

  await UserModel.deleteMany({})
  await ProductModel.deleteMany({})
  await EventModel.deleteMany({})
  await BraceletModel.deleteMany({})
  await ParticipantModel.deleteMany({})
  await CheckInModel.deleteMany({})
  await SupplyOrderModel.deleteMany({})
  await OrderModel.deleteMany({})

  const hashedPassword = await bcrypt.hash('password123', 10)
  const adminPassword = await bcrypt.hash('admin2026', 10)

  await UserModel.create([
    { email: 'admin@gmail.com', password: adminPassword, firstName: 'admin', lastName: 'admin', role: 'admin' },
    { email: 'user@pulse.io', password: hashedPassword, firstName: 'Jean', lastName: 'Dupont', role: 'customer' },
  ])

  await ProductModel.create([
    {
      name: 'PULSE Classic',
      slug: 'pulse-classic',
      description: 'Bracelet NFC Event Pass - Design classique, compatible tous events.',
      price: 29.99,
      images: ['/images/pulse-classic.webp'],
      category: 'bracelet',
      variants: [
        { name: 'Noir', color: '#000000', priceModifier: 0 },
        { name: 'Blanc', color: '#FFFFFF', priceModifier: 0 },
        { name: 'Bleu Nuit', color: '#1a1a4e', priceModifier: 5 },
      ],
      stock: 150,
      featured: true,
    },
    {
      name: 'PULSE Pro',
      slug: 'pulse-pro',
      description: 'Bracelet NFC premium - Materiaux resistants, NFC longue portee, gravure personnalisee.',
      price: 49.99,
      images: ['/images/pulse-pro.webp'],
      category: 'bracelet',
      variants: [
        { name: 'Titane', color: '#808080', priceModifier: 0 },
        { name: 'Or Rose', color: '#b76e79', priceModifier: 10 },
      ],
      stock: 75,
      featured: true,
    },
    {
      name: 'Event Pass Standard',
      slug: 'event-pass-standard',
      description: 'Pass evenement - Acces general, check-in NFC, networking active.',
      price: 15.99,
      images: ['/images/pass-standard.webp'],
      category: 'pass',
      variants: [],
      stock: 500,
      featured: false,
    },
    {
      name: 'Event Pass VIP',
      slug: 'event-pass-vip',
      description: 'Pass VIP - Acces toutes zones, backstage, networking prioritaire.',
      price: 39.99,
      images: ['/images/pass-vip.webp'],
      category: 'pass',
      variants: [],
      stock: 100,
      featured: true,
    },
    {
      name: 'Bundle Festival',
      slug: 'bundle-festival',
      description: 'Pack complet : bracelet PULSE Classic + Pass VIP + housse de transport.',
      price: 59.99,
      images: ['/images/bundle-festival.webp'],
      category: 'bundle',
      variants: [
        { name: 'Noir', color: '#000000', priceModifier: 0 },
        { name: 'Blanc', color: '#FFFFFF', priceModifier: 0 },
      ],
      stock: 50,
      featured: true,
    },
  ])

  // ─── Users ────────────────────────────────────────
  const admin = await UserModel.findOne({ email: 'admin@gmail.com' })
  if (!admin) throw new Error('Admin user not found after seed')

  const participantUsers = await UserModel.create(
    Array.from({ length: 30 }, (_, i) => ({
      email: `participant${i + 1}@pulse.io`,
      password: hashedPassword,
      firstName: `Participant`,
      lastName: `${i + 1}`,
      role: 'customer',
    })),
  )

  // ─── Events (8 total: mix of statuses + dates) ───
  const events = await EventModel.create([
    // UPCOMING — next event (the one shown in dashboard "Prochain evenement")
    {
      name: 'Festival Electro Lyon',
      slug: 'festival-electro-lyon',
      description: 'Le plus grand festival electro de la region',
      venueName: 'Halle Tony Garnier',
      venueAddress: '20 place des Docteurs Merieux, Lyon',
      city: 'Lyon',
      startsAt: daysFromNow(6),
      endsAt: new Date(daysFromNow(6).getTime() + 8 * HOUR),
      capacity: 1500,
      staffCount: 45,
      status: EventStatus.UPCOMING,
      ownerId: String(admin._id),
      createdAt: randomDateInMonth(0),
    },
    // UPCOMING — second upcoming
    {
      name: 'Salon IA & NFC Paris',
      slug: 'salon-ia-nfc-paris',
      description: 'Salon professionnel IA et objets connectes',
      venueName: 'Paris Expo Porte de Versailles',
      venueAddress: '1 place de la Porte de Versailles, Paris',
      city: 'Paris',
      startsAt: daysFromNow(20),
      endsAt: daysFromNow(22),
      capacity: 3000,
      staffCount: 80,
      status: EventStatus.UPCOMING,
      ownerId: String(admin._id),
      createdAt: randomDateInMonth(0),
    },
    // IN_PROGRESS — live event
    {
      name: 'Tech Conf Paris',
      slug: 'tech-conf-paris',
      description: 'Conference tech annuelle',
      venueName: 'Carrousel du Louvre',
      venueAddress: '99 rue de Rivoli, Paris',
      city: 'Paris',
      startsAt: daysAgo(1),
      endsAt: daysFromNow(1),
      capacity: 800,
      staffCount: 25,
      status: EventStatus.IN_PROGRESS,
      ownerId: String(admin._id),
      createdAt: randomDateInMonth(0),
    },
    // IN_PROGRESS — second live
    {
      name: 'Hackathon Blockchain Bordeaux',
      slug: 'hackathon-blockchain-bordeaux',
      description: 'Hackathon 48h blockchain et Web3',
      venueName: 'Darwin Ecosysteme',
      venueAddress: '87 quai des Queyries, Bordeaux',
      city: 'Bordeaux',
      startsAt: daysAgo(0),
      endsAt: daysFromNow(2),
      capacity: 200,
      staffCount: 12,
      status: EventStatus.IN_PROGRESS,
      ownerId: String(admin._id),
      createdAt: randomDateInMonth(0),
    },
    // COMPLETED — last month events (for "vs mois dernier" comparison)
    {
      name: 'Marathon Nantes',
      slug: 'marathon-nantes',
      description: 'Marathon de Nantes',
      venueName: 'Centre-ville',
      venueAddress: 'Place du Commerce, Nantes',
      city: 'Nantes',
      startsAt: daysAgo(35),
      endsAt: new Date(daysAgo(35).getTime() + 8 * HOUR),
      capacity: 3000,
      staffCount: 60,
      status: EventStatus.COMPLETED,
      ownerId: String(admin._id),
      createdAt: randomDateInMonth(-1),
    },
    {
      name: 'Festival Jazz Toulouse',
      slug: 'festival-jazz-toulouse',
      description: 'Jazz Festival - 3 jours',
      venueName: 'Zenith',
      venueAddress: '1 rue du Zenith, Toulouse',
      city: 'Toulouse',
      startsAt: daysAgo(40),
      endsAt: daysAgo(38),
      capacity: 5000,
      staffCount: 120,
      status: EventStatus.COMPLETED,
      ownerId: String(admin._id),
      createdAt: randomDateInMonth(-1),
    },
    // COMPLETED — older
    {
      name: 'Startup Weekend Marseille',
      slug: 'startup-weekend-marseille',
      description: 'Weekend entrepreneuriat Marseille',
      venueName: 'Le Pharo',
      venueAddress: '58 boulevard Charles Livon, Marseille',
      city: 'Marseille',
      startsAt: daysAgo(60),
      endsAt: daysAgo(58),
      capacity: 400,
      staffCount: 15,
      status: EventStatus.COMPLETED,
      ownerId: String(admin._id),
      createdAt: randomDateInMonth(-2),
    },
    // CANCELLED
    {
      name: 'Meetup Dev Lille (annule)',
      slug: 'meetup-dev-lille',
      description: 'Meetup dev annule cause meteo',
      venueName: 'Euratechnologies',
      venueAddress: '165 avenue de Bretagne, Lille',
      city: 'Lille',
      startsAt: daysAgo(20),
      endsAt: daysAgo(20),
      capacity: 150,
      staffCount: 5,
      status: EventStatus.CANCELLED,
      ownerId: String(admin._id),
      createdAt: randomDateInMonth(-1),
    },
  ])

  const [festivalLyon, salonParis, techConf, hackathon] = events

  // ─── Bracelets ────────────────────────────────────
  // We need bracelets created in current AND last month for comparison stats
  // Also activations spread across all 12 months of the year for the bar chart

  const now = Date.now()
  const currentYear = new Date().getFullYear()

  // Activations spread over 12 months (for the bar chart)
  const activationsPerMonth = [80, 110, 95, 140, 180, 240, 200, 220, 170, 190, 150, 210]
  const activatedBracelets: Array<Record<string, unknown>> = []
  for (let m = 0; m < 12; m++) {
    const count = activationsPerMonth[m]!
    for (let i = 0; i < count; i++) {
      const day = 1 + Math.floor(Math.random() * 28)
      activatedBracelets.push({
        nfcId: randomUUID(),
        status: BraceletStatus.ACTIVE,
        userId: String(admin._id),
        eventId: String(techConf!._id),
        productId: null,
        orderId: null,
        activatedAt: new Date(currentYear, m, day, Math.floor(Math.random() * 18) + 6),
        deletedAt: null,
      })
    }
  }

  // Stock bracelets (current inventory = 240 out of 2000 capacity → low threshold)
  const stockBracelets = Array.from({ length: 240 }, () => ({
    nfcId: randomUUID(),
    status: BraceletStatus.STOCK,
    userId: null,
    eventId: null,
    productId: null,
    orderId: null,
    activatedAt: null,
    deletedAt: null,
  }))

  // Pre-activated for upcoming festival (1300 bracelets)
  const preActivatedFestival = Array.from({ length: 1300 }, () => ({
    nfcId: randomUUID(),
    status: BraceletStatus.PRE_ACTIVATED,
    userId: String(admin._id),
    eventId: String(festivalLyon!._id),
    productId: null,
    orderId: null,
    activatedAt: null,
    deletedAt: null,
  }))

  // Bracelets created this month (for "vs mois dernier" bracelet count)
  const thisMonthBracelets = Array.from({ length: 180 }, () => ({
    nfcId: randomUUID(),
    status: BraceletStatus.STOCK,
    userId: null,
    eventId: null,
    productId: null,
    orderId: null,
    activatedAt: null,
    deletedAt: null,
    createdAt: randomDateInMonth(0),
  }))

  // Bracelets created last month
  const lastMonthBracelets = Array.from({ length: 120 }, () => ({
    nfcId: randomUUID(),
    status: BraceletStatus.DISABLED,
    userId: null,
    eventId: null,
    productId: null,
    orderId: null,
    activatedAt: null,
    deletedAt: null,
    createdAt: randomDateInMonth(-1),
  }))

  const allBracelets = await BraceletModel.create([
    ...activatedBracelets,
    ...stockBracelets,
    ...preActivatedFestival,
    ...thisMonthBracelets,
    ...lastMonthBracelets,
  ])

  // ─── Participants ─────────────────────────────────
  // Current month: 25 participants, last month: 18 (for +38.89% growth)
  const thisMonthParticipants = Array.from({ length: 25 }, (_, i) => {
    const date = randomDateInMonth(0)
    return {
      userId: String(participantUsers[i % participantUsers.length]!._id),
      eventId: String(techConf!._id),
      braceletId: String(allBracelets[i]!._id),
      profile: {
        displayName: `Participant ${i + 1}`,
        role: i < 3 ? 'Speaker' : 'Attendee',
        linkedinUrl: null,
        bio: null,
      },
      registeredAt: date,
      checkedInAt: null,
      deletedAt: null,
      createdAt: date,
    }
  })

  const lastMonthParticipants = Array.from({ length: 18 }, (_, i) => {
    const date = randomDateInMonth(-1)
    return {
      userId: String(participantUsers[(i + 10) % participantUsers.length]!._id),
      eventId: String(events[4]!._id), // Marathon Nantes (completed)
      braceletId: String(allBracelets[200 + i]!._id),
      profile: {
        displayName: `Participant LM ${i + 1}`,
        role: 'Attendee',
        linkedinUrl: null,
        bio: null,
      },
      registeredAt: date,
      checkedInAt: null,
      deletedAt: null,
      createdAt: date,
    }
  })

  await ParticipantModel.create([...thisMonthParticipants, ...lastMonthParticipants])

  // ─── Check-ins (400 total — more variety) ─────────
  const interactionTypes = [
    'check_in', 'check_in', 'check_in', 'check_in',
    'networking', 'networking',
    'vote',
    'cashless',
  ]

  const checkInsData = Array.from({ length: 400 }, () => ({
    braceletId: String(allBracelets[Math.floor(Math.random() * Math.min(allBracelets.length, 500))]!._id),
    eventId: String([techConf, hackathon, events[4], events[5]][Math.floor(Math.random() * 4)]!._id),
    interactionType: interactionTypes[Math.floor(Math.random() * interactionTypes.length)],
    zoneName: null,
    targetBraceletId: null,
    amount: null,
    metadata: {},
  }))
  await CheckInModel.create(checkInsData)

  // ─── Orders (revenue comparison) ──────────────────
  // This month: ~24500€ revenue, last month: ~26600€ (= -8%)
  const thisMonthOrders = Array.from({ length: 40 }, (_, i) => {
    const amount = 400 + Math.floor(Math.random() * 400)
    return {
      userId: String(participantUsers[i % participantUsers.length]!._id),
      items: [
        { productId: 'prod1', productName: 'PULSE Classic', quantity: Math.ceil(amount / 30), unitPrice: 29.99 },
      ],
      totalAmount: amount,
      status: ['confirmed', 'shipped', 'delivered'][Math.floor(Math.random() * 3)],
      shippingAddress: `${i + 1} rue de la Paix, Paris`,
      createdAt: randomDateInMonth(0),
    }
  })

  const lastMonthOrders = Array.from({ length: 35 }, (_, i) => {
    const amount = 500 + Math.floor(Math.random() * 500)
    return {
      userId: String(participantUsers[i % participantUsers.length]!._id),
      items: [
        { productId: 'prod2', productName: 'PULSE Pro', quantity: Math.ceil(amount / 50), unitPrice: 49.99 },
      ],
      totalAmount: amount,
      status: ['confirmed', 'shipped', 'delivered'][Math.floor(Math.random() * 3)],
      shippingAddress: `${i + 1} avenue des Champs Elysees, Paris`,
      createdAt: randomDateInMonth(-1),
    }
  })

  await OrderModel.create([...thisMonthOrders, ...lastMonthOrders])

  // ─── Supply orders ────────────────────────────────
  await SupplyOrderModel.create([
    {
      units: 1500,
      orderedAt: daysAgo(5),
      estimatedDeliveryDate: daysFromNow(9),
      status: 'pending',
      receivedAt: null,
    },
    {
      units: 500,
      orderedAt: daysAgo(45),
      estimatedDeliveryDate: daysAgo(30),
      status: 'received',
      receivedAt: daysAgo(29),
    },
  ])

  const totalBracelets = allBracelets.length
  console.log('Seed complete!')
  console.log(`  Users: 2 + 30 participants`)
  console.log(`  Products: 5`)
  console.log(`  Events: ${events.length} (2 upcoming, 2 in_progress, 3 completed, 1 cancelled)`)
  console.log(`  Bracelets: ${totalBracelets} (240 stock, 1300 pre-activated, ${activatedBracelets.length} activated, 300 this/last month)`)
  console.log(`  Participants: 43 (25 this month, 18 last month)`)
  console.log(`  Check-ins: 400`)
  console.log(`  Orders: 75 (40 this month, 35 last month)`)
  console.log(`  Supply orders: 2 (1 pending, 1 received)`)

  await mongoose.disconnect()
}

seed().catch(console.error)
