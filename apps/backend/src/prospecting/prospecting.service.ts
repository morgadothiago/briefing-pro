import { Injectable, Inject } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NeonHttpDatabase } from 'drizzle-orm/neon-http'
import { eq, and } from 'drizzle-orm'
import { DB } from '../database/database.module'
import * as schema from '../database/schema'
import { prospectingKeywords } from '../database/schema'

export interface SearchResult {
  id: string
  keyword: string
  title: string
  url: string
  snippet: string
  platform: string
  score: number
  summary: string
  projectType: string
  urgency: 'alta' | 'media' | 'baixa'
  whatsappMessage: string
}

const PLATFORM_MAP: Record<string, string> = {
  'facebook.com': 'Facebook',
  'instagram.com': 'Instagram',
  'reddit.com': 'Reddit',
  'twitter.com': 'Twitter',
  'x.com': 'X (Twitter)',
  'linkedin.com': 'LinkedIn',
  'olx.com.br': 'OLX',
  'mercadolivre.com': 'Mercado Livre',
}

const HIGH_INTENT_WORDS = [
  'preciso', 'quero', 'busco', 'procuro', 'alguém', 'urgente',
  'orçamento', 'contratar', 'desenvolver', 'criar', 'fazer',
  'quanto custa', 'valor', 'preço', 'indicação', 'recomendar',
]

const PROJECT_KEYWORDS: Record<string, string[]> = {
  'site': ['site', 'website', 'página', 'landing page', 'web'],
  'app': ['app', 'aplicativo', 'mobile', 'ios', 'android', 'celular'],
  'sistema': ['sistema', 'software', 'erp', 'crm', 'plataforma', 'saas'],
  'ecommerce': ['loja', 'e-commerce', 'ecommerce', 'vender online', 'loja virtual'],
}

@Injectable()
export class ProspectingService {
  constructor(
    private config: ConfigService,
    @Inject(DB) private db: NeonHttpDatabase<typeof schema>,
  ) {}

  async getKeywords(userId: string) {
    return this.db
      .select()
      .from(prospectingKeywords)
      .where(and(eq(prospectingKeywords.userId, userId), eq(prospectingKeywords.active, true)))
      .orderBy(prospectingKeywords.createdAt)
  }

  async addKeyword(userId: string, keyword: string) {
    const [created] = await this.db
      .insert(prospectingKeywords)
      .values({ userId, keyword: keyword.trim() })
      .returning()
    return created
  }

  async removeKeyword(userId: string, id: string) {
    await this.db
      .delete(prospectingKeywords)
      .where(and(eq(prospectingKeywords.id, id), eq(prospectingKeywords.userId, userId)))
    return { deleted: true }
  }

  async search(userId: string): Promise<SearchResult[]> {
    const keywords = await this.getKeywords(userId)
    if (!keywords.length) return []

    const apiKey = this.config.get<string>('GOOGLE_SEARCH_API_KEY')
    const cx = this.config.get<string>('GOOGLE_SEARCH_ENGINE_ID')

    if (!apiKey || !cx) throw new Error('Google Search API não configurada')

    const allResults: SearchResult[] = []
    const seenUrls = new Set<string>()

    for (const kw of keywords) {
      try {
        const url = new URL('https://www.googleapis.com/customsearch/v1')
        url.searchParams.set('key', apiKey)
        url.searchParams.set('cx', cx)
        url.searchParams.set('q', kw.keyword)
        url.searchParams.set('num', '10')

        const res = await fetch(url.toString())
        const data = await res.json() as { items?: Array<{ title: string; link: string; snippet: string }>; error?: { message: string } }

        if (data.error) {
          console.error(`[Prospecting] Google API error for "${kw.keyword}":`, data.error.message)
          continue
        }

        for (const item of data.items ?? []) {
          if (seenUrls.has(item.link)) continue
          seenUrls.add(item.link)

          const platform = this.detectPlatform(item.link)
          const score = this.scoreResult(item.title, item.snippet, kw.keyword)
          const projectType = this.detectProjectType(item.title + ' ' + item.snippet)
          const urgency = score >= 8 ? 'alta' : score >= 5 ? 'media' : 'baixa'
          const summary = this.buildSummary(item.snippet, kw.keyword)
          const whatsappMessage = this.buildWhatsAppMessage(item.snippet, projectType, kw.keyword)

          allResults.push({
            id: crypto.randomUUID(),
            keyword: kw.keyword,
            title: item.title,
            url: item.link,
            snippet: item.snippet,
            platform,
            score,
            summary,
            projectType,
            urgency,
            whatsappMessage,
          })
        }
      } catch {
        // skip keyword on error
      }
    }

    return allResults.sort((a, b) => b.score - a.score)
  }

  private detectPlatform(url: string): string {
    for (const [domain, name] of Object.entries(PLATFORM_MAP)) {
      if (url.includes(domain)) return name
    }
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return 'Web'
    }
  }

  private scoreResult(title: string, snippet: string, keyword: string): number {
    const text = (title + ' ' + snippet).toLowerCase()
    let score = 3

    // Keyword match
    if (text.includes(keyword.toLowerCase())) score += 2

    // High intent words
    const intentMatches = HIGH_INTENT_WORDS.filter(w => text.includes(w)).length
    score += Math.min(intentMatches, 3)

    // Question marks suggest seeking help
    if (text.includes('?')) score += 1

    // Recency signals
    if (text.includes('hoje') || text.includes('urgente') || text.includes('agora')) score += 1

    return Math.min(score, 10)
  }

  private detectProjectType(text: string): string {
    const lower = text.toLowerCase()
    for (const [type, words] of Object.entries(PROJECT_KEYWORDS)) {
      if (words.some(w => lower.includes(w))) return type
    }
    return 'outro'
  }

  private buildSummary(snippet: string, keyword: string): string {
    const clean = snippet.replace(/\s+/g, ' ').trim()
    if (clean.length <= 120) return clean
    return clean.substring(0, 120) + '...'
  }

  private buildWhatsAppMessage(snippet: string, projectType: string, keyword: string): string {
    const projectLabel: Record<string, string> = {
      site: 'site/landing page',
      app: 'aplicativo mobile',
      sistema: 'sistema/plataforma',
      ecommerce: 'loja virtual',
      outro: 'projeto digital',
    }
    const label = projectLabel[projectType] ?? 'projeto'

    return `Oi! Vi que você está buscando ajuda com ${label}. Somos uma agência especializada em desenvolvimento e adoraríamos entender melhor o que você precisa.

Poderia me contar um pouco mais sobre o projeto? Qual é o seu maior desafio hoje?`
  }
}
