import type { Metadata, Viewport } from "next";
import { Lexend } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import WhatsAppWidget from "@/components/WhatsAppWidgetWrapper";
import JsonLd from "@/components/JsonLd"; // <--- 引入 JsonLd
import ConsentBanner from "@/components/ConsentBanner";

const lexend = Lexend({
  subsets: ["latin"],
  // Fix 3: 減少 font weight 數量 (5→3)，節省 ~40KB 字體下載
  // 300 (Light) → 由 400 (Regular) 取代
  // 500 (Medium) → 由 600 (SemiBold) 取代
  weight: ["400", "600", "700"],
  display: "swap",          // 防止 FOIT，加快 LCP 渲染
  variable: "--font-lexend",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://adwire.com.hk"),
  title: {
    default: "ADWire Agency｜軟件開發・AI 應用・SEO 增長方案",
    template: "%s | ADWire Agency",
  },
  description: "ADWire 提供企業網站及系統開發、AI 應用與工作流程自動化，以及 SEO／GEO 搜尋優化。由需求分析、開發部署到持續改善，協助香港企業處理實際營運與增長問題。",
  keywords: ["軟件開發", "系統開發", "App 開發", "AI 應用", "工作流程自動化", "SEO", "GEO", "數碼營銷", "Hong Kong"],
  authors: [{ name: "ADWire Agency" }],
  creator: "ADWire Agency",
  publisher: "ADWire Agency",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  verification: {
    google: "2kR6J_D1cosVu9LL4tic3jHxwy4Gq53F35bTOjO3wcg",
  },
  openGraph: {
    title: "ADWire Agency｜軟件開發・AI 應用・SEO 增長方案",
    description: "ADWire 提供企業網站及系統開發、AI 應用與工作流程自動化，以及 SEO／GEO 搜尋優化。由需求分析、開發部署到持續改善，協助香港企業處理實際營運與增長問題。",
    url: "https://adwire.com.hk",
    siteName: "ADWire Agency",
    locale: "zh_HK",
    type: "website",
    images: [
      {
        url: "https://adwire.com.hk/adwire_ogimage.png",
        secureUrl: "https://adwire.com.hk/adwire_ogimage.png",
        width: 1200,
        height: 634,
        alt: "ADWire Agency — 軟件開發、AI 應用與 SEO 增長方案",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ADWire Agency｜軟件開發・AI 應用・SEO 增長方案",
    description: "ADWire 提供企業網站及系統開發、AI 應用與工作流程自動化，以及 SEO／GEO 搜尋優化。",
    images: ["https://adwire.com.hk/adwire_ogimage.png"],
  },
  other: {
    "geo.region": "HK",
    "geo.placename": "Kwai Fong",
    "geo.position": "22.3578;114.1275",
    "ICBM": "22.3578, 114.1275",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-HK">
      <head>
        {/* next/font/google 在 build time 已自動下載並 self-host 字體至 /_next/static/media/
            運行時不需要連接 fonts.googleapis.com / fonts.gstatic.com
            保留這些 preconnect 反而會觸發不必要的 DNS lookup + TCP 連接，
            導致 PageSpeed "轉譯對齊要求" 警告，故移除 */}

        {/* ── Google Consent Mode v2 ──────────────────────────────────────────
            必須在載入任何追蹤腳本「之前」執行，因此放在 <head> 直接內聯。

            區域策略（配合實際客戶分佈）：
              1) 歐盟／英國／瑞士（EEA／GB／CH）→ 一律預設「拒絕」，
                 符合 Google Consent Mode v2 的硬性要求。
              2) 其他地區（香港、大灣區、新加坡、台灣等）→ 全部預設「允許」。
                 香港 PDPO 不要求 cookie opt-in；訪客仍可透過同意橫幅拒絕。
              3) 訪客透過 Cookie 通知表態後，由 ConsentBanner 呼叫
                 gtag('consent','update',...) 覆寫；已表態者會在此還原。

            ⚠️ 修改此段時，次序不可調換：region 專屬設定必須在一般設定之前。 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 只執行一次。此 <script> 同時存在於靜態 HTML 及 React 序列化資料中，
              // 加上防重複旗標可確保即使被執行兩次，亦不會重複發送 page_view。
              if (!window.__adwireAnalyticsInit) {
              window.__adwireAnalyticsInit = true;

              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = window.gtag || gtag;
              gtag('js', new Date());

              // 1) 歐盟／英國／瑞士：全部預設拒絕
              gtag('consent', 'default', {
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                analytics_storage: 'denied',
                region: ['EEA', 'GB', 'CH'],
                wait_for_update: 500
              });

              // 2) 其他地區（含香港）：預設全部允許
              //    香港 PDPO 不要求 cookie opt-in；新加坡／台灣等亦只需告知。
              //    訪客仍可透過同意橫幅（ConsentBanner.tsx）選擇拒絕，
              //    選擇會以 gtag('consent','update') 覆蓋此預設值。
              //    ⚠️ 2026-09-21 修正：原本此處 ads 類誤設 denied，與
              //       ConsentBanner 文件所述「其他地區預設 granted」不符，
              //       導致香港訪客（主要市場）轉換只能靠建模推算。
              gtag('consent', 'default', {
                ad_storage: 'granted',
                ad_user_data: 'granted',
                ad_personalization: 'granted',
                analytics_storage: 'granted',
                wait_for_update: 500
              });

              // 3) 還原訪客先前的選擇
              try {
                var savedConsent = localStorage.getItem('adwire_consent_v1');
                if (savedConsent === 'granted' || savedConsent === 'denied') {
                  gtag('consent', 'update', {
                    ad_storage: savedConsent,
                    ad_user_data: savedConsent,
                    ad_personalization: savedConsent,
                    analytics_storage: savedConsent
                  });
                }
              } catch (e) {}

              gtag('config', 'G-G93P7WNBSY', { send_page_view: true });

              // Google Ads 轉換追蹤（AW-16621944778 = 智本信貸帳戶，本 campaign 所用）
              // 必須在此 config，否則 thank-you 頁無法 fire 轉換。
              // ⚠️ 此 config 只影響 Ads，不會產生 GA4 page_view，故不會重複計算。
              gtag('config', 'AW-16621944778');
              }
            `,
          }}
        />
      </head>
      <body className={`${lexend.className} antialiased`} suppressHydrationWarning={true}>
        {/* Skip-to-content：鍵盤導航必備，Tab 鍵第一個聚焦元素 */}
        <a href="#main-content" className="skip-to-content">
          跳至主要內容
        </a>

        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WLF36PTR"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        
        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-WLF36PTR');
          `}
        </Script>
        {/* End Google Tag Manager */}

        {/* ── Google Analytics 4 (gtag.js) ────────────────────────────────────
            Measurement ID: G-G93P7WNBSY

            ⚠️ 重要：GA4 只能由一個途徑載入，否則 page_view 會被計算兩次。
              目前寫法：直接在網站載入 gtag.js。
              如果你之後在 GTM 容器（GTM-WLF36PTR）內亦加入同一個
              Measurement ID 的 GA4 設定標籤，必須先移除其中一邊。
              驗證方法：GA4 → 報表 → 即時，同一時間只應出現一次瀏覽。

            ⚠️ 私隱：GA4 會收集瀏覽行為資料，須在私隱政策中說明用途及
              資料保留期。如加入 Consent Mode 或同意橫幅，此處需一併調整。  */}
        <Script
          id="ga4-gtag-js"
          src="https://www.googletagmanager.com/gtag/js?id=G-G93P7WNBSY"
          strategy="afterInteractive"
        />
        {/* 註：gtag('config') 與 Consent Mode 預設值已在 <head> 執行，
            此處只載入外部 gtag.js；不要再加第二個 GA4 config，否則會重複發送 page_view。 */}
        {/* End Google Analytics 4 */}

        {/* ── Google Ads 轉換追蹤用嘅 gtag.js（AW-16621944778）─────────────
            由 Google Ads 轉換動作提供嘅官方 snippet 載入。
            只負責 Ads 轉換，不含 GA4 config，故不會造成 page_view 重複。 */}
        <Script
          id="aw-gtag-js"
          src="https://www.googletagmanager.com/gtag/js?id=AW-16621944778"
          strategy="afterInteractive"
        />
        {/* End Google Ads gtag.js */}

        {/* Microsoft Clarity */}
        <Script id="microsoft-clarity" strategy="lazyOnload">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i+"?ref=bwt";
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "ulgozaske6");
          `}
        </Script>
        {/* End Microsoft Clarity */}

        <JsonLd />
        <main id="main-content">
          {children}
        </main>
        
        {/* 2. 放在這裡，就會浮在所有頁面之上 */}
        <WhatsAppWidget />

        {/* Cookie / Consent Mode 通知（所有頁面） */}
        <ConsentBanner />
      </body>
    </html>
  );
}
