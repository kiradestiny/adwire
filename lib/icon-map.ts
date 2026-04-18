/**
 * Icon Map — Lucide Icon 名稱字串 → React Component 映射
 * 
 * 此模組可同時被 Server Component 和 Client Component 安全導入。
 * API 後台存儲 icon 名稱字串，前端透過此映射表轉換為 Lucide React Component。
 */

import {
  TrendingUp, Users, Clock, ShoppingBag, Globe,
  MessageCircle, Camera, Code, Search,
  Brain, Flame, BarChart3, Flag,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const ICON_MAP: Record<string, LucideIcon> = {
  TrendingUp,
  Users,
  Clock,
  ShoppingBag,
  Globe,
  MessageCircle,
  Camera,
  Code,
  Search,
  Brain,
  Flame,
  BarChart3,
  Flag,
};

/** 預設 Icon（當 iconName 無法映射時使用） */
export const DEFAULT_ICON: LucideIcon = Users;
