/**
 * 服務頁結構化資料（2026-10-25 統一）：Service + BreadcrumbList + FAQPage。
 * FAQ 同頁面畫面用同一份資料（lib/service-faqs.ts），schema 與可見內容一定一致。
 * provider 只引用全站唯一的 Organization 節點（@id），避免同 JsonLd.tsx 衝突。
 */
import type { ServiceFaq } from "@/lib/service-faqs";

const SITE = "https://adwire.com.hk";

export interface ServiceOffer {
  name: string;
  description: string;
  price: string;
  unitText?: string;
}

export default function ServicePageJsonLd({
  path, name, description, serviceType, image, crumb, faqs, offers,
}: {
  path: string;
  name: string;
  description: string;
  serviceType: string;
  image: string;
  crumb: string;
  faqs: ServiceFaq[];
  offers?: ServiceOffer[];
}) {
  const url = `${SITE}${path}`;
  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name,
    description,
    serviceType,
    url,
    image,
    provider: { "@id": `${SITE}/#organization` },
    areaServed: { "@type": "Place", name: "Hong Kong" },
    availableLanguage: ["zh-Hant", "zh-Yue", "en"],
    ...(offers?.length
      ? {
          offers: offers.map((o) => ({
            "@type": "Offer",
            name: o.name,
            description: o.description,
            price: o.price,
            priceCurrency: "HKD",
            ...(o.unitText
              ? { priceSpecification: { "@type": "UnitPriceSpecification", price: o.price, priceCurrency: "HKD", unitText: o.unitText } }
              : {}),
          })),
        }
      : {}),
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "首頁", item: SITE },
      { "@type": "ListItem", position: 2, name: "服務", item: `${SITE}/services/` },
      { "@type": "ListItem", position: 3, name: crumb, item: url },
    ],
  };
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
    </>
  );
}
