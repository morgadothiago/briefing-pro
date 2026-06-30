import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as bcrypt from 'bcrypt'
import * as dotenv from 'dotenv'
import * as schema from './schema'

dotenv.config()

async function seed() {
  const sql = neon(process.env.DATABASE_URL!)
  const db = drizzle(sql, { schema })

  const existing = await db.select().from(schema.users).limit(1)
  if (existing.length > 0) {
    console.log('Admin já existe, seed ignorado.')
    return
  }

  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? 'Admin@123', 12)
  await db.insert(schema.users).values({
    email: process.env.ADMIN_EMAIL ?? 'admin@briefingpro.test',
    password: hash,
    name: process.env.ADMIN_NAME ?? 'Admin BriefingPro',
  })
  console.log('Admin criado com sucesso.')
}

seed().catch(console.error)
