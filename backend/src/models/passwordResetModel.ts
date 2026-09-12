import { Database } from '../config/database';

export interface PasswordResetRecord {
  token_id: number;
  user_id: number;
  token_hash: string;
  expires_at: string;
  used_at?: string;
  created_at: string;
}

const inMemoryResetTokens: Map<string, PasswordResetRecord> = new Map();

export class PasswordResetModel {
  public static async createResetToken(userId: number, tokenHash: string, expiresAt: Date): Promise<void> {
    await Database.execute(`UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE user_id = :1 AND used_at IS NULL`, [userId]);

    const sql = `
      INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
      VALUES (:1, :2, :3)
    `;
    await Database.execute(sql, [userId, tokenHash, expiresAt]);

    const record: PasswordResetRecord = {
      token_id: Date.now(),
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
    };

    inMemoryResetTokens.set(tokenHash, record);
  }

  public static async findValidToken(tokenHash: string): Promise<PasswordResetRecord | null> {
    const sql = `
      SELECT * FROM password_reset_tokens
      WHERE token_hash = :1
        AND used_at IS NULL
        AND expires_at > CURRENT_TIMESTAMP
    `;
    const results = await Database.execute<PasswordResetRecord>(sql, [tokenHash]);
    if (results && results.length > 0) return results[0];

    const record = inMemoryResetTokens.get(tokenHash);
    if (record && !record.used_at && new Date(record.expires_at) > new Date()) {
      return record;
    }

    return null;
  }

  public static async markAsUsed(tokenId: number): Promise<void> {
    const sql = `UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE token_id = :1`;
    await Database.execute(sql, [tokenId]);

    for (const record of inMemoryResetTokens.values()) {
      if (record.token_id === tokenId) {
        record.used_at = new Date().toISOString();
      }
    }
  }
}

