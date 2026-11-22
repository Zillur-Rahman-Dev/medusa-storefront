import { Pool } from "pg"
import { ReviewItem } from "@modules/reviews/types"

let pool: Pool | null = null

function getPool(): Pool | null {
  const connectionString =
    process.env.CUSTOMER_REVIEWS_DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.NEON_DATABASE_URL ||
    process.env.POSTGRES_URL

  if (!connectionString) {
    return null
  }

  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    })
  }

  return pool
}

// Auto-initialize Neon DB table if not present
export async function ensureReviewsTable(clientPool: Pool) {
  try {
    await clientPool.query(`
      CREATE TABLE IF NOT EXISTS customer_reviews (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        product_title VARCHAR(255),
        comment TEXT NOT NULL,
        avatar_url TEXT,
        admin_reply_author VARCHAR(255),
        admin_reply_avatar TEXT,
        admin_reply_comment TEXT,
        is_approved BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)
  } catch (err) {
    console.warn("Neon DB table initialization check:", err)
  }
}

// Send Instant Telegram Notification
export async function sendTelegramNotification(review: {
  name: string
  rating: number
  productTitle?: string
  comment: string
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    return
  }

  try {
    const stars = "⭐".repeat(Math.max(1, Math.min(5, review.rating)))
    const message = `🍯 <b>Pure Honey BD • নতুন কাস্টমার রিভিউ!</b>\n\n` +
      `👤 <b>ক্রেতা:</b> ${escapeHtml(review.name)}\n` +
      `⭐ <b>রেটিং:</b> ${stars} (${review.rating}/5)\n` +
      `📦 <b>পণ্য:</b> ${escapeHtml(review.productTitle || "খাঁটি প্রাকৃতিক মধু")}\n` +
      `💬 <b>মতামত:</b>\n"<i>${escapeHtml(review.comment)}</i>"\n\n` +
      `🕒 <i>${new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}</i>`

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    })
  } catch (e) {
    console.error("Failed to dispatch Telegram notification:", e)
  }
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

// Fetch approved reviews from Neon DB
export async function getDbReviews(): Promise<ReviewItem[] | null> {
  const p = getPool()
  if (!p) return null

  try {
    await ensureReviewsTable(p)
    const result = await p.query(
      `SELECT * FROM customer_reviews WHERE is_approved = true ORDER BY created_at DESC LIMIT 50`
    )

    if (!result.rows || result.rows.length === 0) {
      return null
    }

    return result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      rating: row.rating,
      productTitle: row.product_title,
      comment: row.comment,
      avatarUrl: row.avatar_url || undefined,
      adminReply: row.admin_reply_comment
        ? {
            author: row.admin_reply_author || "Pure Honey BD",
            avatarUrl: row.admin_reply_avatar || undefined,
            comment: row.admin_reply_comment,
          }
        : undefined,
    }))
  } catch (err) {
    console.error("Error reading reviews from Neon DB:", err)
    return null
  }
}

// Insert new review into Neon DB
export async function insertDbReview(review: Omit<ReviewItem, "id">): Promise<ReviewItem> {
  const id = `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
  const p = getPool()

  if (p) {
    try {
      await ensureReviewsTable(p)
      await p.query(
        `INSERT INTO customer_reviews 
         (id, name, rating, product_title, comment, avatar_url, admin_reply_author, admin_reply_avatar, admin_reply_comment, is_approved) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          id,
          review.name,
          review.rating,
          review.productTitle || null,
          review.comment,
          review.avatarUrl || null,
          review.adminReply?.author || null,
          review.adminReply?.avatarUrl || null,
          review.adminReply?.comment || null,
          true, // Default auto-approved on frontend submission, or set to false if pending
        ]
      )
    } catch (err) {
      console.error("Error writing review to Neon DB:", err)
    }
  }

  // Send Telegram notice in the background (non-blocking)
  sendTelegramNotification(review).catch(() => {})

  return {
    ...review,
    id,
  }
}
