import { Database } from '../config/database';

export interface SeoMetadataRecord {
  seo_id: number;
  post_id?: number;
  page_identifier?: string;
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  twitter_card?: string;
  robots?: string;
  focus_keyword?: string;
  secondary_keywords?: string;
  search_intent?: string;
  image_alt_text?: string;
  direct_answer?: string;
  faq_data?: string;
  howto_data?: string;
  key_takeaways?: string;
  references_data?: string;
  entity_context?: string;
  factual_context?: string;
  location_context?: string;
  created_at: string;
  updated_at: string;
}

const inMemorySeo: Map<string, SeoMetadataRecord> = new Map();

export class SeoModel {
  public static async findByPostId(postId: number): Promise<SeoMetadataRecord | null> {
    const sql = `SELECT * FROM seo_metadata WHERE post_id = :1`;
    const results = await Database.execute<SeoMetadataRecord>(sql, [postId]);
    if (results && results.length > 0) return results[0];

    return inMemorySeo.get(`post:${postId}`) || null;
  }

  public static async findByPageIdentifier(pageIdentifier: string): Promise<SeoMetadataRecord | null> {
    const sql = `SELECT * FROM seo_metadata WHERE page_identifier = :1`;
    const results = await Database.execute<SeoMetadataRecord>(sql, [pageIdentifier]);
    if (results && results.length > 0) return results[0];

    return inMemorySeo.get(`page:${pageIdentifier}`) || null;
  }

  public static async upsertPostSeo(postId: number, data: Partial<SeoMetadataRecord>): Promise<SeoMetadataRecord> {
    const existing = await this.findByPostId(postId);

    if (existing) {
      const sql = `
        UPDATE seo_metadata
        SET meta_title = :1, meta_description = :2, canonical_url = :3, og_title = :4,
            og_description = :5, og_image = :6, twitter_title = :7, twitter_description = :8,
            twitter_image = :9, twitter_card = :10, robots = :11, focus_keyword = :12,
            secondary_keywords = :13, search_intent = :14, image_alt_text = :15,
            direct_answer = :16, faq_data = :17, howto_data = :18, key_takeaways = :19,
            references_data = :20, entity_context = :21, factual_context = :22,
            location_context = :23, updated_at = CURRENT_TIMESTAMP
        WHERE post_id = :24
      `;
      await Database.execute(sql, [
        data.meta_title ?? existing.meta_title ?? null,
        data.meta_description ?? existing.meta_description ?? null,
        data.canonical_url ?? existing.canonical_url ?? null,
        data.og_title ?? existing.og_title ?? null,
        data.og_description ?? existing.og_description ?? null,
        data.og_image ?? existing.og_image ?? null,
        data.twitter_title ?? existing.twitter_title ?? null,
        data.twitter_description ?? existing.twitter_description ?? null,
        data.twitter_image ?? existing.twitter_image ?? null,
        data.twitter_card ?? existing.twitter_card ?? 'summary_large_image',
        data.robots ?? existing.robots ?? 'index, follow',
        data.focus_keyword ?? existing.focus_keyword ?? null,
        data.secondary_keywords ?? existing.secondary_keywords ?? null,
        data.search_intent ?? existing.search_intent ?? 'informational',
        data.image_alt_text ?? existing.image_alt_text ?? null,
        data.direct_answer ?? existing.direct_answer ?? null,
        data.faq_data ?? existing.faq_data ?? null,
        data.howto_data ?? existing.howto_data ?? null,
        data.key_takeaways ?? existing.key_takeaways ?? null,
        data.references_data ?? existing.references_data ?? null,
        data.entity_context ?? existing.entity_context ?? null,
        data.factual_context ?? existing.factual_context ?? null,
        data.location_context ?? existing.location_context ?? null,
        postId,
      ]);

      const updatedRecord: SeoMetadataRecord = {
        ...existing,
        ...data,
        updated_at: new Date().toISOString(),
      };
      inMemorySeo.set(`post:${postId}`, updatedRecord);
      return updatedRecord;
    } else {
      const sql = `
        INSERT INTO seo_metadata (
          post_id, meta_title, meta_description, canonical_url, og_title, og_description,
          og_image, twitter_title, twitter_description, twitter_image, twitter_card,
          robots, focus_keyword, secondary_keywords, search_intent, image_alt_text,
          direct_answer, faq_data, howto_data, key_takeaways, references_data,
          entity_context, factual_context, location_context
        )
        VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9, :10, :11, :12, :13, :14, :15, :16, :17, :18, :19, :20, :21, :22, :23, :24)
      `;
      await Database.execute(sql, [
        postId,
        data.meta_title || null,
        data.meta_description || null,
        data.canonical_url || null,
        data.og_title || null,
        data.og_description || null,
        data.og_image || null,
        data.twitter_title || null,
        data.twitter_description || null,
        data.twitter_image || null,
        data.twitter_card || 'summary_large_image',
        data.robots || 'index, follow',
        data.focus_keyword || null,
        data.secondary_keywords || null,
        data.search_intent || 'informational',
        data.image_alt_text || null,
        data.direct_answer || null,
        data.faq_data || null,
        data.howto_data || null,
        data.key_takeaways || null,
        data.references_data || null,
        data.entity_context || null,
        data.factual_context || null,
        data.location_context || null,
      ]);

      const newRecord: SeoMetadataRecord = {
        seo_id: Date.now(),
        post_id: postId,
        ...data,
        robots: data.robots || 'index, follow',
        twitter_card: data.twitter_card || 'summary_large_image',
        search_intent: data.search_intent || 'informational',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      inMemorySeo.set(`post:${postId}`, newRecord);
      return newRecord;
    }
  }

  public static async upsertMetadata(
    postId: number,
    data: {
      metaTitle?: string;
      metaDescription?: string;
      canonicalUrl?: string;
      ogTitle?: string;
      ogDescription?: string;
      ogImage?: string;
      twitterTitle?: string;
      twitterDescription?: string;
      twitterImage?: string;
      twitterCard?: string;
      robots?: string;
      focusKeyword?: string;
      secondaryKeywords?: string;
      searchIntent?: string;
      imageAltText?: string;
      directAnswer?: string;
      keyTakeaways?: string;
      faqData?: string;
      howtoData?: string;
      referencesData?: string;
      entityContext?: string;
      factualContext?: string;
      locationContext?: string;
      meta_title?: string;
      meta_description?: string;
      canonical_url?: string;
      og_title?: string;
      og_description?: string;
      og_image?: string;
      twitter_title?: string;
      twitter_description?: string;
      twitter_image?: string;
      twitter_card?: string;
      focus_keyword?: string;
      secondary_keywords?: string;
      search_intent?: string;
      image_alt_text?: string;
      direct_answer?: string;
      key_takeaways?: string;
      faq_data?: string;
      howto_data?: string;
      references_data?: string;
      entity_context?: string;
      factual_context?: string;
      location_context?: string;
    }
  ): Promise<SeoMetadataRecord> {
    return this.upsertPostSeo(postId, {
      meta_title: data.metaTitle ?? data.meta_title,
      meta_description: data.metaDescription ?? data.meta_description,
      canonical_url: data.canonicalUrl ?? data.canonical_url,
      og_title: data.ogTitle ?? data.og_title,
      og_description: data.ogDescription ?? data.og_description,
      og_image: data.ogImage ?? data.og_image,
      twitter_title: data.twitterTitle ?? data.twitter_title,
      twitter_description: data.twitterDescription ?? data.twitter_description,
      twitter_image: data.twitterImage ?? data.twitter_image,
      twitter_card: data.twitterCard ?? data.twitter_card,
      robots: data.robots,
      focus_keyword: data.focusKeyword ?? data.focus_keyword,
      secondary_keywords: data.secondaryKeywords ?? data.secondary_keywords,
      search_intent: data.searchIntent ?? data.search_intent,
      image_alt_text: data.imageAltText ?? data.image_alt_text,
      direct_answer: data.directAnswer ?? data.direct_answer,
      key_takeaways: data.keyTakeaways ?? data.key_takeaways,
      faq_data: data.faqData ?? data.faq_data,
      howto_data: data.howtoData ?? data.howto_data,
      references_data: data.referencesData ?? data.references_data,
      entity_context: data.entityContext ?? data.entity_context,
      factual_context: data.factualContext ?? data.factual_context,
      location_context: data.locationContext ?? data.location_context,
    });
  }
}

