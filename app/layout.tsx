import type { Metadata, Viewport } from "next";
import { Lexend } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import WhatsAppWidget from "@/components/WhatsAppWidgetWrapper";
import JsonLd from "@/components/JsonLd"; // <--- 引入 JsonLd

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
    default: "ADWire Agency | 香港首選 AI 驅動 MarTech 代理",
    template: "%s | ADWire Agency",
  },
  description: "Wired for Impact. 專注 KOL 網紅營銷、短視頻製作及成效廣告。結合內容流量與自動化技術，為品牌創造真實價值。",
  keywords: ["MarTech", "KOL Marketing", "Video Production", "SEO", "GEO", "Digital Marketing", "Hong Kong", "AI Marketing"],
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
    title: "ADWire Agency | 香港首選 AI 驅動 MarTech 代理",
    description: "Wired for Impact. 專注 KOL 網紅營銷、短視頻製作及成效廣告。結合內容流量與自動化技術，為品牌創造真實價值。",
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
        alt: "ADWire Agency — 香港首選 AI 驅動 MarTech 代理",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ADWire Agency | 香港首選 AI 驅動 MarTech 代理",
    description: "Wired for Impact. 專注 KOL 網紅營銷、短視頻製作及成效廣告。結合內容流量與自動化技術，為品牌創造真實價值。",
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
      </head>
      <body className={`${lexend.className} antialiased`} suppressHydrationWarning={true}>
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
        {children}
        
        {/* 2. 放在這裡，就會浮在所有頁面之上 */}
        <WhatsAppWidget />
      </body>
    </html>
  );
}
