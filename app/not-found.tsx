import Link from "next/link";
import { Search, Home, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* 404 Graphic/Text */}
          <div className="space-y-4">
            <h1 className="text-9xl font-bold text-[#0f4c81] opacity-10" aria-hidden="true">404</h1>
            <div className="-mt-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#0f4c81] mb-4">
                找不到頁面
              </h2>
              <p className="text-gray-600 text-lg max-w-md mx-auto">
                抱歉，我們找不到您要找的頁面。它可能已被移除、更名或暫時無法使用。
              </p>
            </div>
          </div>

          {/* Search Bar — 純 HTML form，無需 client-side JS */}
          <div className="max-w-md mx-auto w-full">
            <form
              action="https://www.google.com/search"
              method="get"
              target="_blank"
              className="relative"
            >
              <input
                type="hidden"
                name="as_sitesearch"
                defaultValue="adwire.com.hk"
              />
              <input
                type="text"
                name="q"
                placeholder="搜尋網站內容..."
                className="w-full px-5 py-3 pr-12 rounded-xl border border-gray-200 focus:border-[#0f4c81] focus:ring-2 focus:ring-[#0f4c81]/20 outline-none transition-all"
              />
              <button 
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-[#0f4c81] transition-colors"
                aria-label="搜尋"
              >
                <Search size={20} />
              </button>
            </form>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href="/"
              className="flex items-center gap-2 px-6 py-3 bg-[#0f4c81] text-white rounded-full font-medium hover:bg-[#0a355c] transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <Home size={18} />
              返回首頁
            </Link>
            <Link
              href="/contact"
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-600 border border-gray-200 rounded-full font-medium hover:bg-gray-50 hover:text-[#0f4c81] hover:border-[#0f4c81] transition-all"
            >
              <ArrowLeft size={18} />
              聯絡我們
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
