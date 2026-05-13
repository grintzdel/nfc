import dotenv from 'dotenv'

import { connectDatabase } from './config/database'
import { createApp } from './create-app'

dotenv.config()

const PORT = process.env.PORT || 3001

async function bootstrap(): Promise<void> {
  await connectDatabase(process.env.MONGODB_URI!)
  const app = createApp()
  app.listen(PORT, () => {
    console.log(`PULSE API running on port ${PORT}`)
  })
}

bootstrap().catch(console.error)
