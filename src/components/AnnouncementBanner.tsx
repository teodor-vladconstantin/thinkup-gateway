import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { X, ArrowRight } from "lucide-react";
import { fetchPublishedCampaigns } from "@/lib/recruitment";

const DISMISS_KEY = "banner-dismissed-ambassador";

export default function AnnouncementBanner({
  onVisibilityChange,
}: {
  onVisibilityChange: (visible: boolean) => void;
}) {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });

  const { data: campaigns } = useQuery({
    queryKey: ["published-campaigns"],
    queryFn: fetchPublishedCampaigns,
  });

  const ambassadorCampaign = campaigns?.find((c) => c.type === "ambassador");
  const visible = !dismissed && !!ambassadorCampaign;

  useEffect(() => {
    onVisibilityChange(visible);
  }, [visible, onVisibilityChange]);

  if (!visible) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore storage errors (private mode, etc.)
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-11 w-full bg-purple-600 text-white text-sm font-medium flex items-center justify-center gap-3 px-4">
      <Link
        to={`/aplica/${ambassadorCampaign!.slug}`}
        className="flex items-center gap-2 hover:underline underline-offset-2"
      >
        <span>🎉 Recrutările pentru Elevi Ambasadori sunt deschise!</span>
        <span className="inline-flex items-center gap-1 font-semibold">
          Aplică acum <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </Link>
      <button
        onClick={dismiss}
        aria-label="Închide anunțul"
        className="absolute right-3 p-1 rounded-full hover:bg-white/20 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
