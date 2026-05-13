import { randomUUID } from 'crypto'

import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

import { connectDatabase } from './config/database'
import { UserModel } from './modules/auth/infrastructure/schema/user.schema'
import { BraceletStatus } from './modules/bracelet/domain/constants/bracelet-status.constant'
import { BraceletModel } from './modules/bracelet/infrastructure/schema/bracelet.schema'
import { CategoryModel } from './modules/category/infrastructure/schema/category.schema'
import { CheckInModel } from './modules/check-in/infrastructure/schema/check-in.schema'
import { EventStatus } from './modules/event/domain/constants/event-status.constant'
import { EventModel } from './modules/event/infrastructure/schema/event.schema'
import { FaqModel } from './modules/marketing/infrastructure/schema/faq.schema'
import { OrderModel } from './modules/order/infrastructure/schema/order.schema'
import { ParticipantModel } from './modules/participant/infrastructure/schema/participant.schema'
import { ProductModel } from './modules/product/infrastructure/schema/product.schema'
import { SupplyOrderModel } from './modules/supply-order/infrastructure/schema/supply-order.schema'

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
  const end = new Date(year, month + 1, 0)
  const day = 1 + Math.floor(Math.random() * end.getDate())
  return new Date(year, month, day, Math.floor(Math.random() * 18) + 6)
}

async function seed(): Promise<void> {
  await connectDatabase(process.env.MONGODB_URI!)

  await UserModel.deleteMany({})
  await CategoryModel.deleteMany({})
  await ProductModel.deleteMany({})
  await EventModel.deleteMany({})
  await BraceletModel.deleteMany({})
  await ParticipantModel.deleteMany({})
  await CheckInModel.deleteMany({})
  await SupplyOrderModel.deleteMany({})
  await OrderModel.deleteMany({})

  await CategoryModel.create([
    { name: 'Bracelet', slug: 'bracelet', description: 'Bracelets NFC réutilisables pour vos événements.' },
    { name: 'Pass', slug: 'pass', description: 'Pass événement avec check-in NFC et accès personnalisé.' },
    { name: 'Bundle', slug: 'bundle', description: 'Packs combinant bracelets, pass et accessoires.' },
  ])

  const hashedPassword = await bcrypt.hash('password123', 10)
  const adminPassword = await bcrypt.hash('admin2026', 10)

  await UserModel.create([
    { email: 'admin@gmail.com', password: adminPassword, firstName: 'admin', lastName: 'admin', role: 'admin' },
    { email: 'user@pulse.io', password: hashedPassword, firstName: 'Jean', lastName: 'Dupont', role: 'customer' },
    { email: 'marie@pulse.demo', password: hashedPassword, firstName: 'Marie', lastName: 'Dubois', role: 'customer' },
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

  const admin = await UserModel.findOne({ email: 'admin@gmail.com' })
  if (!admin) throw new Error('Admin user not found after seed')

  const participantUsers = await UserModel.create(
    Array.from({ length: 30 }, (_, i) => ({
      email: `participant${i + 1}@pulse.io`,
      password: hashedPassword,
      firstName: `Participant`,
      lastName: `${i + 1}`,
      role: 'customer',
    }))
  )

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

  const [festivalLyon, , techConf, hackathon] = events

  const marieUser = await UserModel.findOne({ email: 'marie@pulse.demo' })
  if (!marieUser) throw new Error('Marie demo user not found after seed')

  const [demoEvent] = await EventModel.create([
    {
      name: 'Pulse Demo 2026',
      slug: 'pulse-demo-2026',
      description: 'Demo event for the NFC public flow',
      venueName: 'Station F',
      venueAddress: '5 Parvis Alan Turing, Paris',
      city: 'Paris',
      startsAt: daysFromNow(30),
      endsAt: daysFromNow(31),
      capacity: 500,
      staffCount: 10,
      status: EventStatus.UPCOMING,
      ownerId: String(admin._id),
      createdAt: new Date(),
    },
  ])

  const [demoBracelet] = await BraceletModel.create([
    {
      nfcId: 'demo-nfc-001',
      status: BraceletStatus.ACTIVE,
      userId: String(marieUser._id),
      eventId: String(demoEvent!._id),
      productId: null,
      orderId: null,
      activatedAt: new Date(),
      deletedAt: null,
    },
  ])

  // Demo bracelets for the admin event-detail page:
  // - 1 active+attached (Marie's demo-nfc-001, created above)
  // - 8 PRE_ACTIVATED ready for the attach-bracelet dialog
  // - 1 DISABLED for the bracelets-tab status filtering demo
  const demoExtraBracelets = await BraceletModel.create([
    ...Array.from({ length: 8 }, (_, i) => ({
      nfcId: `demo-nfc-pre-${String(i + 1).padStart(3, '0')}`,
      status: BraceletStatus.PRE_ACTIVATED,
      userId: String(admin._id),
      eventId: String(demoEvent!._id),
      productId: null,
      orderId: null,
      activatedAt: null,
      deletedAt: null,
    })),
    {
      nfcId: 'demo-nfc-disabled-001',
      status: BraceletStatus.DISABLED,
      userId: String(admin._id),
      eventId: String(demoEvent!._id),
      productId: null,
      orderId: null,
      activatedAt: new Date(),
      deletedAt: null,
    },
  ])

  // Marie + 25 generated participants on the demo event (exercise pagination at limit=20)
  const demoParticipantDocs = [
    {
      userId: String(marieUser._id),
      eventId: String(demoEvent!._id),
      braceletId: String(demoBracelet!._id),
      profile: {
        displayName: 'Marie Dubois',
        role: 'Product Designer @ Pulse',
        bio: "Product Designer passionnée par les interfaces et l'innovation. J'aime connecter les gens via des expériences mémorables.",
        links: [
          { type: 'linkedin', url: 'https://linkedin.com/in/marie-dubois', label: null },
          { type: 'github', url: 'https://github.com/mariedubois', label: null },
          { type: 'custom', url: 'https://calendly.com/marie-dubois', label: 'Calendly' },
        ],
      },
      registeredAt: new Date(),
      checkedInAt: null,
      deletedAt: null,
      createdAt: new Date(),
    },
    ...Array.from({ length: 25 }, (_, i) => {
      const date = new Date(Date.now() - i * 3 * HOUR)
      return {
        userId: String(participantUsers[i % participantUsers.length]!._id),
        eventId: String(demoEvent!._id),
        braceletId: null,
        profile: {
          displayName: `Demo Participant ${i + 1}`,
          role: i < 3 ? 'Speaker' : 'Attendee',
          bio: null,
          links: [],
        },
        registeredAt: date,
        checkedInAt: null,
        deletedAt: null,
        createdAt: date,
      }
    }),
  ]
  await ParticipantModel.create(demoParticipantDocs)

  // Register the admin user as a participant on a few events so:
  //   - GET /participants/me returns something when logged in as admin
  //   - /me/events page is non-empty, including a future event with an active bracelet (QR demo flow)
  //   - History tab shows past + upcoming participations
  const marathonNantes = events[4]!
  const adminBracelets = await BraceletModel.create([
    {
      nfcId: 'demo-nfc-admin-001',
      status: BraceletStatus.ACTIVE,
      userId: String(admin._id),
      eventId: String(demoEvent!._id),
      productId: null,
      orderId: null,
      activatedAt: new Date(),
      deletedAt: null,
    },
    {
      nfcId: 'demo-nfc-admin-002',
      status: BraceletStatus.PRE_ACTIVATED,
      userId: String(admin._id),
      eventId: String(festivalLyon!._id),
      productId: null,
      orderId: null,
      activatedAt: null,
      deletedAt: null,
    },
    {
      nfcId: 'demo-nfc-admin-003',
      status: BraceletStatus.ACTIVE,
      userId: String(admin._id),
      eventId: String(marathonNantes._id),
      productId: null,
      orderId: null,
      activatedAt: daysAgo(36),
      deletedAt: null,
    },
  ])

  await ParticipantModel.create([
    {
      userId: String(admin._id),
      eventId: String(demoEvent!._id),
      braceletId: String(adminBracelets[0]!._id),
      profile: {
        displayName: 'Admin Pulse',
        role: 'Organisateur',
        bio: "Je teste l'expérience de l'autre côté du bracelet.",
        links: [{ type: 'linkedin', url: 'https://linkedin.com/in/pulse-admin', label: null }],
      },
      registeredAt: daysAgo(2),
      checkedInAt: null,
      deletedAt: null,
      createdAt: daysAgo(2),
    },
    {
      userId: String(admin._id),
      eventId: String(festivalLyon!._id),
      braceletId: String(adminBracelets[1]!._id),
      profile: {
        displayName: 'Admin Pulse',
        role: 'VIP organisateur',
        bio: null,
        links: [],
      },
      registeredAt: daysAgo(10),
      checkedInAt: null,
      deletedAt: null,
      createdAt: daysAgo(10),
    },
    {
      userId: String(admin._id),
      eventId: String(marathonNantes._id),
      braceletId: String(adminBracelets[2]!._id),
      profile: {
        displayName: 'Admin Pulse',
        role: 'Coureur',
        bio: 'Mon premier marathon !',
        links: [],
      },
      registeredAt: daysAgo(40),
      checkedInAt: daysAgo(35),
      deletedAt: null,
      createdAt: daysAgo(40),
    },
  ])

  // 6 check-ins on the demo event using Marie's bracelet + a few pre-activated ones (so unique > 1)
  await CheckInModel.create([
    {
      braceletId: String(demoBracelet!._id),
      eventId: String(demoEvent!._id),
      interactionType: 'check_in',
      zoneName: 'Entrée principale',
      targetBraceletId: null,
      amount: null,
      metadata: {},
    },
    {
      braceletId: String(demoBracelet!._id),
      eventId: String(demoEvent!._id),
      interactionType: 'networking',
      zoneName: null,
      targetBraceletId: null,
      amount: null,
      metadata: {},
    },
    {
      braceletId: String(demoExtraBracelets[0]!._id),
      eventId: String(demoEvent!._id),
      interactionType: 'check_in',
      zoneName: 'Entrée VIP',
      targetBraceletId: null,
      amount: null,
      metadata: {},
    },
    {
      braceletId: String(demoExtraBracelets[1]!._id),
      eventId: String(demoEvent!._id),
      interactionType: 'check_in',
      zoneName: 'Entrée principale',
      targetBraceletId: null,
      amount: null,
      metadata: {},
    },
    {
      braceletId: String(demoExtraBracelets[2]!._id),
      eventId: String(demoEvent!._id),
      interactionType: 'cashless',
      zoneName: 'Bar 1',
      targetBraceletId: null,
      amount: 12.5,
      metadata: {},
    },
    {
      braceletId: String(demoExtraBracelets[0]!._id),
      eventId: String(demoEvent!._id),
      interactionType: 'vote',
      zoneName: null,
      targetBraceletId: null,
      amount: null,
      metadata: {},
    },
  ])

  // Extra draft event so the "Publier" state-machine button is reachable from the admin demo
  await EventModel.create({
    name: 'Pulse Draft Demo',
    slug: 'pulse-draft-demo',
    description: 'Draft event used to demo the Publier state transition',
    venueName: 'Station F',
    venueAddress: '5 Parvis Alan Turing, Paris',
    city: 'Paris',
    startsAt: daysFromNow(45),
    endsAt: daysFromNow(46),
    capacity: 200,
    staffCount: 5,
    status: EventStatus.DRAFT,
    ownerId: String(admin._id),
    createdAt: new Date(),
  })

  // We need bracelets created in current AND last month for comparison stats
  // Also activations spread across all 12 months of the year for the bar chart

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
        links: [],
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
        links: [],
        bio: null,
      },
      registeredAt: date,
      checkedInAt: null,
      deletedAt: null,
      createdAt: date,
    }
  })

  await ParticipantModel.create([...thisMonthParticipants, ...lastMonthParticipants])

  const interactionTypes = [
    'check_in',
    'check_in',
    'check_in',
    'check_in',
    'networking',
    'networking',
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

  // This month: ~24500€ revenue, last month: ~26600€ (= -8%)
  const thisMonthOrders = Array.from({ length: 40 }, (_, i) => {
    const amount = 400 + Math.floor(Math.random() * 400)
    return {
      userId: String(participantUsers[i % participantUsers.length]!._id),
      items: [{ productId: 'prod1', productName: 'PULSE Classic', quantity: Math.ceil(amount / 30), unitPrice: 29.99 }],
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
      items: [{ productId: 'prod2', productName: 'PULSE Pro', quantity: Math.ceil(amount / 50), unitPrice: 49.99 }],
      totalAmount: amount,
      status: ['confirmed', 'shipped', 'delivered'][Math.floor(Math.random() * 3)],
      shippingAddress: `${i + 1} avenue des Champs Elysees, Paris`,
      createdAt: randomDateInMonth(-1),
    }
  })

  await OrderModel.create([...thisMonthOrders, ...lastMonthOrders])

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

  await FaqModel.deleteMany({})
  await FaqModel.insertMany([
    {
      order: 1,
      question: 'Combien coute un bracelet PULSE ?',
      answer:
        'Les packs demarrent a partir de 2,50€ par bracelet pour les commandes de +500 unites. Contactez-nous pour un devis personnalise adapte a la taille de votre evenement.',
    },
    {
      order: 2,
      question: 'Quel est le delai de livraison ?',
      answer:
        'Les bracelets sont livres sous 5 jours ouvrables en France metropolitaine. Pour les commandes urgentes, nous proposons une option express 48h.',
    },
    {
      order: 3,
      question: 'Les bracelets sont-ils reutilisables ?',
      answer:
        "Oui ! Les bracelets PULSE sont concus pour etre reprogrammes et reutilises sur plusieurs evenements, reduisant les couts et l'impact environnemental.",
    },
    {
      order: 4,
      question: 'Faut-il une app pour les participants ?',
      answer:
        "Non ! C'est tout l'interet de PULSE. Le bracelet NFC fonctionne sans application, sans batterie et sans connexion internet du cote participant.",
    },
    {
      order: 5,
      question: 'Comment configurer les bracelets ?',
      answer:
        'Tout se fait depuis le dashboard PULSE. Creez votre evenement, definissez les interactions et assignez les bracelets en quelques clics. Aucune competence technique requise.',
    },
    {
      order: 6,
      question: 'Proposez-vous un accompagnement ?',
      answer:
        'Absolument. Notre equipe vous accompagne de A a Z : configuration, formation de vos equipes sur place, et support technique le jour J.',
    },
  ])

  const totalBracelets = allBracelets.length
  console.log('Seed complete!')
  console.log(`  Users: 2 + 30 participants`)
  console.log(`  Products: 5`)
  console.log(`  Events: ${events.length} (2 upcoming, 2 in_progress, 3 completed, 1 cancelled)`)
  console.log(
    `  Bracelets: ${totalBracelets} (240 stock, 1300 pre-activated, ${activatedBracelets.length} activated, 300 this/last month)`
  )
  console.log(`  Participants: 43 (25 this month, 18 last month)`)
  console.log(`  Check-ins: 400`)
  console.log(`  Orders: 75 (40 this month, 35 last month)`)
  console.log(`  Supply orders: 2 (1 pending, 1 received)`)
  console.log(`  FAQ entries: 6`)

  await mongoose.disconnect()
}

seed().catch(console.error)
