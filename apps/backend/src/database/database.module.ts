import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

export const DB = Symbol('DB')

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DB,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const sql = neon(config.get<string>('DATABASE_URL')!)
        return drizzle(sql, { schema })
      },
    },
  ],
  exports: [DB],
})
export class DatabaseModule {}
