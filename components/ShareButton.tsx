"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export default function ShareButton({ title, url }: { title: string; url?: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = url || window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: shareUrl,
        });
        return;
      } catch (err) {
        console.log("Error sharing:", err);
      }
    }

    // Fallback to copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button 
      onClick={handleShare}
      className="flex items-center gap-2 text-gray-500 hover:text-[#f5a623] transition-colors"
    >
      {copied ? <Check size={20} className="text-green-500" /> : <Share2 size={20} />}
      {copied ? "已複製連結" : "分享文章"}
    </button>
  );
}
