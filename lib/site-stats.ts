/**
 * 官網對外數字：唯一來源（single source of truth）
 *
 * 規則：只可放「可驗證」數字。每個數字都要寫明出處，
 * 冇出處就唔可以出現喺官網、schema、llms.txt 或廣告文案。
 *
 * 2026-10-24 清理記錄：原本散落 11 個檔案嘅
 * 500+ 服務客戶 / 328% 平均 ROI / 98% 客戶滿意度 /
 * 1000+ KOL 資源 / 4.9 分評價 全部冇憑據，已下架。
 */

export const SITE_STATS = {
  /** 出處：官網首頁客戶走馬燈，全部為真實合作品牌（共 52 個 logo） */
  brandClients: 52,

  /** 出處：/portfolio/ 公開案例頁，逐個可點入查看 */
  publicCases: 16,

  /** 出處：導航「服務範疇」選單實際服務項目數 */
  serviceLines: 12,

  /** 出處：/services/ads/ 頁面行業列表（行業廣度，非成效數字） */
  industries: 30,
} as const;

export const STAT_LABEL = {
  brandClients: `${SITE_STATS.brandClients}+`,
  publicCases: `${SITE_STATS.publicCases}`,
  serviceLines: `${SITE_STATS.serviceLines}`,
  industries: `${SITE_STATS.industries}+`,
} as const;

/** 對外統一句式，避免各頁寫法不一致 */
export const PROOF_SENTENCE = `已服務 ${SITE_STATS.brandClients} 個香港品牌，累積 ${SITE_STATS.publicCases} 個可公開查閱的案例。`;
