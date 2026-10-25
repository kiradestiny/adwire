// 預設品牌列表（fallback，當後台數據不可用時使用）
const DEFAULT_BRANDS = [
  "AURA TRESS 髮研", "FineNutri 斐萃", "HON'S Chinese Medicine Centre",
  "彤肌研 Jasper Beauty", "康倫中醫診所", "Time Universe",
  "YOROKOBI 天之悅", "HEYAMI", "NovaLend 智本信貸",
  "Morning Global", "Wellness Service", "寵之花園",
  "雲峰信貸", "千輝財務", "東京財務",
  "HERFACE", "ToLove", "PEKO Beauty",
  "MEDSKIN PLUS+ 美學中心", "My Cash Credit", "AllAboutBeaut",
  "Rakuten", "The Ritz-Carlton", "Kirin Ichiban",
  "7-Eleven", "Mister Donut", "Matsuya",
  "MIKI HOUSE", "Kerry Hotel", "Hotel ICON",
  "義務工作發展局（AVS）", "HKWS", "Organicmom",
  "隨傳隨借", "Nuva", "SurrFACE",
  "WISDOM", "Global32", "Envirosafe",
  "Skinpro", "Meta Beauty Lab", "Wonder Lens",
  "Barebooby", "永記渠務工程", "N Creative",
  "effect.", "Eco Pro", "H$ Credit",
  "Quantum Matrix", "KM. Fiber", "千葉願",
  "Sometimes lab",
];

interface LogoWallProps {
  brands?: string[];
}

/**
 * LogoWall — 直接合作客戶
 *
 * 2026-10-25 改版：
 *   ① 負責人確認全部為「直接客戶」（非經中間人），標題由「獲多個行業領先品牌信賴」改為事實陳述。
 *   ② 取消 3 行無限走馬燈：原本每個品牌喺 DOM 重複 4 次（首頁 HTML 變重），
 *      而且 gray-300 淺灰字喺白底幾乎睇唔到，似「塞名」多過證據。
 *      改為靜態網格：先列知名品牌，其餘收埋喺「查看全部」（<details>，無 JS）。
 *   ③ 後台新增品牌照舊附加喺清單尾（見 lib/data-resolver getBrands）。
 */
const FEATURED = [
  "Rakuten", "7-Eleven", "The Ritz-Carlton", "Kerry Hotel", "Hotel ICON",
  "Kirin Ichiban", "MIKI HOUSE", "Mister Donut", "Matsuya", "義務工作發展局（AVS）",
];

export default function LogoWall({ brands = DEFAULT_BRANDS }: LogoWallProps) {
  const featured = FEATURED.filter((b) => brands.some((x) => x.toLowerCase() === b.toLowerCase()));
  const rest = brands.filter((b) => !featured.some((f) => f.toLowerCase() === b.toLowerCase()));

  return (
    <section aria-labelledby="clients-heading" className="border-y border-slate-100 bg-white py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p id="clients-heading" className="text-center text-sm text-slate-500">
          {brands.length} 個直接合作客戶，包括
        </p>
        <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
          {featured.map((b) => (
            <li key={b} className="text-lg font-semibold tracking-tight text-slate-700 md:text-xl">
              {b}
            </li>
          ))}
        </ul>
        {rest.length > 0 && (
          <details className="group mt-8 text-center">
            <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-sm font-medium text-[#0f4c81] hover:underline underline-offset-4 [&::-webkit-details-marker]:hidden">
              <span className="group-open:hidden">查看其餘 {rest.length} 個品牌</span>
              <span className="hidden group-open:inline">收起</span>
            </summary>
            <ul className="mx-auto mt-5 flex max-w-5xl flex-wrap justify-center gap-x-6 gap-y-2.5">
              {rest.map((b) => (
                <li key={b} className="text-[15px] text-slate-500">{b}</li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </section>
  );
}
