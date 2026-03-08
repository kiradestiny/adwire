import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Youtube, Linkedin, Bot } from "lucide-react"; // 引入 Social Icons

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
            香港首選 AI 驅動 MarTech 代理。結合內容流量與自動化技術，為品牌創造真實價值。
          </p>
          {/* Social Icons */}
          <div className="flex gap-4">
            <SocialIcon href="https://www.facebook.com/profile.php?id=61575126092859" icon={<Facebook size={20} />} label="Facebook" />
            <SocialIcon href="https://www.instagram.com/adwire_official/" icon={<Instagram size={20} />} label="Instagram" />
            <SocialIcon href="https://www.linkedin.com/company/106715005/admin/dashboard/" icon={<Linkedin size={20} />} label="LinkedIn" />
          </div>
        </div>

        {/* 2. 服務範疇 (寫齊啲) */}
        <div>
          <h4 className="font-bold text-lg mb-6 text-[#f5a623]">服務範疇</h4>
          <ul className="space-y-3 text-gray-300">
            <li><FooterLink href="/services/kol">KOL 網紅營銷</FooterLink></li>
            <li><FooterLink href="/services/video">短視頻製作 (Reels/TikTok)</FooterLink></li>
            <li><FooterLink href="/services/production">商業攝影與錄影</FooterLink></li>
            <li><FooterLink href="/services/social">社交媒體管理</FooterLink></li>
            <li><FooterLink href="/services/ads">成效廣告投放</FooterLink></li>
            <li><FooterLink href="/services/seo">SEO 與 GEO優化</FooterLink></li>
            <li><FooterLink href="/services/web">網頁設計及優化</FooterLink></li>
            <li><FooterLink href="/services/system">系統/APP開發</FooterLink></li>
            <li><FooterLink href="/services/automation">營銷自動化</FooterLink></li>
            <li><FooterLink href="/services/ai">AI 解決方案</FooterLink></li>
          </ul>
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
               {/* AI Info Link */}
              <a href="/llms.txt" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors border border-white/20 px-3 py-1 rounded-full text-xs mt-2">
                <Bot size={14} /> AI Info (llms.txt)
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
              <a href="https://wa.me/85295861027" className="hover:text-[#25D366] transition-colors font-semibold">
                +852 9586 1027 (WhatsApp)
              </a>
            </li>
            <li className="pt-4">
              <a 
                href="https://wa.me/85295861027" 
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
