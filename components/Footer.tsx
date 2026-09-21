import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Youtube, Linkedin, Bot } from "lucide-react"; // 引入 Social Icons
import { WHATSAPP_DISPLAY, getWhatsAppUrl } from "@/lib/site-config";

/**
 * Footer
 *
 * 2026-09-21 修改（詳見 deliverables/22_service-page-audit.md）：
 *   1. 🔴 修 Bug：LinkedIn 連結原為 /company/106715005/admin/dashboard/（管理後台），
 *      客人點擊會撞登入牆。改為公開公司頁 /company/106715005/。
 *      llms.txt 一向用的是正確版本，兩者現已一致。
 *   2. 服務列表由「10 項平鋪」改為「四大業務線分組」，Software／AI／SEO 排在
 *      Digital Marketing 之前（原本 KOL／短視頻行先），與新定位一致。
 *   3. 更新過時標籤：
 *      · /services/automation/ 「營銷自動化」→「企業流程自動化及 RPA」
 *        （該頁早已擴展至一般營運流程，不止營銷）
 *      · /services/ai/ 「AI 解決方案」→「AI 應用及系統整合」（與頁面 title 一致）
 *      · /services/web/ 「網頁設計及優化」→「網頁設計及電商開發」
 *   4. 新增「查看全部服務」→ /services/。原本 Footer 完全沒有連去服務總覽。
 *   5. AI Info (llms.txt) 按鈕改為低調文字連結。原因：Google 官方明言不使用
 *      llms.txt，建立它對 Google Search「無害亦無益」（見本站 Article 18）。
 *      用綠色按鈕突出推廣，會與我們自己發表的內容自相矛盾。
 *
 * 未改動：地址（負責人 2026-09-21 確認正確，與 /contact 一致）、電話／WhatsApp、
 *         電郵、社交圖示、版權年份邏輯、整體視覺風格。
 */

/** 四大業務線分組（URL 全部保留，與 lib/site-content.ts 的 SERVICE_LINES 對應） */
const SERVICE_GROUPS: { group: string; links: { name: string; href: string }[] }[] = [
  {
    group: "Software Development",
    links: [
      { name: "系統及 App 開發", href: "/services/system" },
      { name: "網頁設計及電商", href: "/services/web" },
    ],
  },
  {
    group: "AI & Automation",
    links: [
      { name: "AI 解決方案", href: "/services/ai" },
      { name: "企業流程自動化", href: "/services/automation" },
    ],
  },
  {
    group: "SEO & GEO",
    links: [{ name: "SEO 與 GEO 優化", href: "/services/seo" }],
  },
  {
    group: "Cross-border Marketing",
    links: [
      { name: "中國市場推廣", href: "/services/china-market" },
      { name: "香港市場在地化推廣", href: "/services/hong-kong-market" },
    ],
  },
  {
    group: "Digital Marketing",
    links: [
      { name: "成效廣告投放", href: "/services/ads" },
      { name: "社交媒體管理", href: "/services/social" },
      { name: "短視頻製作", href: "/services/video" },
      { name: "KOL 網紅營銷", href: "/services/kol" },
      { name: "商業攝影", href: "/services/production" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#0f4c81] text-white py-16 border-t border-white/10 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

        {/* 1. 公司簡介 */}
        <div className="space-y-6">
          <Link href="/" prefetch={false} className="inline-block">
            <Image 
              src="/logo.png" 
              alt="ADWire" 
              width={180} 
              height={60} 
              className="h-10 w-auto object-contain brightness-0 invert" 
            />
          </Link>
          <p className="text-gray-300 leading-relaxed">
            Wired for Impact.<br/>
            香港企業軟件、AI 應用、自動化與數碼增長方案。由需求分析到交付及持續改善，處理實際營運問題。
          </p>
          {/* Social Icons */}
          <div className="flex gap-4">
            <SocialIcon href="https://www.facebook.com/profile.php?id=61575126092859" icon={<Facebook size={20} />} label="Facebook" />
            <SocialIcon href="https://www.instagram.com/adwire_official/" icon={<Instagram size={20} />} label="Instagram" />
            {/* 修 Bug：原本指向 /admin/dashboard/，客人點擊會撞登入牆 */}
            <SocialIcon href="https://www.linkedin.com/company/106715005/" icon={<Linkedin size={20} />} label="LinkedIn" />
          </div>
        </div>

        {/* 2. 服務範疇（按四大業務線分組） */}
        <div>
          <h4 className="font-bold text-lg mb-6 text-[#f5a623]">服務範疇</h4>
          <div className="space-y-5">
            {SERVICE_GROUPS.map((g) => (
              <div key={g.group}>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#f5a623]/70 mb-2">
                  {g.group}
                </div>
                <ul className="space-y-2 text-gray-300">
                  {g.links.map((l) => (
                    <li key={l.href + l.name}>
                      <FooterLink href={l.href}>{l.name}</FooterLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <Link
            href="/services"
            prefetch={false}
            className="inline-flex items-center gap-1 mt-5 text-[#f5a623] hover:text-white transition-colors font-semibold"
          >
            查看全部服務 →
          </Link>
        </div>

        {/* 3. 公司資訊 */}
        <div>
          <h4 className="font-bold text-lg mb-6 text-[#f5a623]">公司資訊</h4>
          <ul className="space-y-3 text-gray-300">
            <li><FooterLink href="/about">關於我們</FooterLink></li>
            <li><FooterLink href="/portfolio">成功案例</FooterLink></li>
            <li><FooterLink href="/blog">增長洞察 Blog</FooterLink></li>
            <li><FooterLink href="/contact">聯絡我們</FooterLink></li>
            <li>
              {/* AI Info：改為低調文字連結（見檔頭註解第 5 點） */}
              <a
                href="/llms.txt"
                className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-300 transition-colors text-xs mt-2"
              >
                <Bot size={12} /> AI 讀取用資料 (llms.txt)
              </a>
            </li>
          </ul>
        </div>

        {/* 4. 聯絡資料 */}
        <div>
          <h4 className="font-bold text-lg mb-6 text-[#f5a623]">聯絡我們</h4>
          <ul className="space-y-3 text-gray-300">
            <li>葵芳新都會廣場 2 座 45 樓 4510 室</li>
            <li><a href="mailto:info@adwire.com.hk" className="hover:text-white transition-colors">info@adwire.com.hk</a></li>
            <li>
              <a href={getWhatsAppUrl()} className="hover:text-[#25D366] transition-colors font-semibold">
                {WHATSAPP_DISPLAY} (WhatsApp)
              </a>
            </li>
            <li className="pt-4">
              <a 
                href={getWhatsAppUrl()}
                aria-label="立即 WhatsApp"
                className="inline-block bg-[#25D366] text-white px-6 py-2 rounded-full font-bold hover:bg-[#20bd5a] transition-colors shadow-lg"
              >
                立即 WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>
      
      {/* 底部版權 & 條款 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-gray-400 text-xs gap-4">
        <div>© {new Date().getFullYear()} ADWire Agency Limited. All rights reserved.</div>
        <div className="flex gap-6">
          <Link href="/privacy" prefetch={false} className="hover:text-white transition-colors">私隱政策</Link>
          <Link href="/terms" prefetch={false} className="hover:text-white transition-colors">服務條款</Link>
          <Link href="/disclaimer" prefetch={false} className="hover:text-white transition-colors">免責聲明</Link>
        </div>
      </div>
    </footer>
  );
}

// 小組件
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} prefetch={false} className="hover:text-[#f5a623] transition-colors block">
      {children}
    </Link>
  );
}

function SocialIcon({ href, icon, label }: { href: string; icon: React.ReactNode; label?: string }) {
  return (
    <a href={href} aria-label={label} className="bg-white/10 p-2 rounded-full hover:bg-[#f5a623] hover:text-white transition-all">
      {icon}
    </a>
  );
}