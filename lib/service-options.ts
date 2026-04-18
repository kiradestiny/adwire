/**
 * Service Options — Single Source of Truth
 *
 * 資料來源：public/config/services.json
 * 前端（ContactSection）和後端（send-mail.php）都從此 JSON 讀取，
 * 確保服務選項永遠同步，無需手動維護兩份清單。
 *
 * ⚠️ 新增/修改服務選項時，只需編輯 public/config/services.json，
 *    前端 build 和後端 runtime 都會自動讀取最新值。
 */

import servicesJson from "../public/config/services.json";

export const SERVICE_OPTIONS = servicesJson.services as readonly string[];

/** 服務選項的 TypeScript 字面量聯合型別（用於型別推導） */
export type ServiceOption = (typeof SERVICE_OPTIONS)[number];
