/**
 * Site Configuration — Single Source of Truth
 *
 * 集中管理網站全域常數（WhatsApp 號碼、聯絡資訊等），
 * 避免在多個檔案中硬編碼，降低維護成本。
 *
 * ⚠️ 修改聯絡資訊時，只需編輯此檔案。
 *    注意：blogData.ts 中的靜態 HTML 字串無法使用 JS 變數，
 *    需手動同步更新。
 */

// ─── WhatsApp ────────────────────────────────────────────────────────────────
/** WhatsApp 號碼（純數字，用於 wa.me 連結） */
export const WHATSAPP_NUMBER = "85295861027";

/** WhatsApp 號碼（顯示格式） */
export const WHATSAPP_DISPLAY = "+852 9586 1027";

/** WhatsApp 號碼（E.164 格式，用於 Schema tel: 連結） */
export const WHATSAPP_E164 = "+852-9586-1027";

/**
 * 產生 WhatsApp 連結
 * @param message 預填訊息（可選）
 * @returns 完整的 wa.me URL
 */
export function getWhatsAppUrl(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

// ─── Email ───────────────────────────────────────────────────────────────────
export const CONTACT_EMAIL = "info@adwire.com.hk";

// ─── Site ────────────────────────────────────────────────────────────────────
export const SITE_URL = "https://adwire.com.hk";
export const SITE_NAME = "ADWire Agency";
