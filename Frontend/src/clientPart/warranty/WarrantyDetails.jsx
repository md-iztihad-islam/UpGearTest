import ProductLoadingState from "@/components/loader/ProductLoader";
import getWarrentyByIdApi from "@/services/dashboard/warrenty/getWarrantyByIdApi";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  Shield, Clock, CheckCircle, AlertCircle, ChevronLeft,
  Wrench, Info, X, Calendar, PenLine,
} from "lucide-react";

// Renders the HTML description safely, overriding styles per tag
function WarrantyContent({ html }) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const isExclusionSection = (node) => {
    let prev = node.previousElementSibling;
    while (prev) {
      if (prev.tagName === "H3") return true;
      if (prev.tagName === "H2") return false;
      prev = prev.previousElementSibling;
    }
    return false;
  };

  const renderNode = (node, idx) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || null;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return null;

    const children = Array.from(node.childNodes).map((child, i) =>
      renderNode(child, i)
    );

    switch (node.tagName.toLowerCase()) {
      case "h2":
        return (
          <h2 key={idx} className="text-xl font-bold text-white mb-4 -mt-1">
            {children}
          </h2>
        );
      case "h3":
        return (
          <h3 key={idx} className="text-sm font-semibold text-blue-400 uppercase tracking-wider mt-6 mb-3">
            {children}
          </h3>
        );
      case "p":
        return node.textContent?.trim() ? (
          <p key={idx} className="text-sm text-gray-400 leading-relaxed mb-2">
            {children}
          </p>
        ) : null;
      case "ul": {
        const isExclusion = isExclusionSection(node);
        return (
          <ul key={idx} className="flex flex-col gap-2 mb-4">
            {Array.from(node.children).map((li, i) => {
              const liContent = Array.from(li.childNodes).map((c, ci) =>
                renderNode(c, ci)
              );
              return (
                <li
                  key={i}
                  className={`flex items-start gap-3 rounded-xl px-4 py-3 border text-sm text-gray-300 leading-relaxed
                    transition-colors duration-200
                    ${isExclusion
                      ? "bg-red-500/5 border-red-500/15 hover:border-red-500/30 hover:bg-red-500/8"
                      : "bg-white/[0.025] border-white/[0.07] hover:border-blue-500/25 hover:bg-blue-500/5"
                    }`}
                >
                  {isExclusion ? (
                    <X className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-400" />
                  )}
                  <span>{liContent}</span>
                </li>
              );
            })}
          </ul>
        );
      }
      case "b":
      case "strong":
        return <strong key={idx} className="font-semibold text-white">{children}</strong>;
      default:
        return <span key={idx}>{children}</span>;
    }
  };

  return (
    <div>
      {Array.from(doc.body.childNodes).map((node, i) => renderNode(node, i))}
    </div>
  );
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "2-digit",
  });
}

function WarrantyDetails() {
  const { warrentyId } = useParams();
  const navigate = useNavigate();

  const { data: warrentyData, isLoading } = useQuery({
    queryKey: ["warrenty", warrentyId],
    queryFn: () => getWarrentyByIdApi(warrentyId),
  });

  const w = warrentyData?.data;

  if (isLoading) return <ProductLoadingState />;

  if (!w) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Warranty plan not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* Back */}
        <button
          onClick={() => navigate("/warranty")}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-400 transition-colors mb-6 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Warranty Plans
        </button>

        {/* Hero Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600/8 to-purple-600/6 border border-white/[0.08] rounded-2xl p-6 sm:p-8 mb-5">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-xs font-mono text-gray-500 bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 rounded-full">
                PLAN #001
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-4">
              {w.title}
            </h1>
            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-semibold px-4 py-2 rounded-full">
                <Clock className="w-4 h-4" />
                {w.warrentyPeriod}
              </div>
              <div className="inline-flex items-center gap-2 bg-green-500/8 border border-green-500/20 text-green-400 text-sm font-medium px-4 py-2 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Active
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { icon: <CheckCircle className="w-4 h-4 text-green-400" />, bg: "bg-green-500/10", label: "Replacement", value: "First 3 Days" },
            { icon: <Wrench className="w-4 h-4 text-blue-400" />, bg: "bg-blue-500/10", label: "Repair Service", value: "Full 1 Year" },
            { icon: <Shield className="w-4 h-4 text-purple-400" />, bg: "bg-purple-500/10", label: "Coverage", value: "Full Protection" },
          ].map((s, i) => (
            <div key={i} className="bg-white/[0.025] border border-white/[0.07] hover:border-blue-500/25 transition-colors rounded-xl p-3 sm:p-4 flex items-center gap-3">
              <div className={`w-8 h-8 sm:w-9 sm:h-9 ${s.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                {s.icon}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">{s.label}</div>
                <div className="text-xs sm:text-sm font-semibold text-white truncate">{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6 sm:p-8 mb-4">
          <div className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-5 pb-4 border-b border-white/[0.06]">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Warranty Terms & Conditions
          </div>
          {w.description && <WarrantyContent html={w.description} />}

          {/* Timestamps */}
          <div className="flex flex-wrap gap-5 mt-6 pt-5 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 text-xs text-gray-600 font-mono">
              <Calendar className="w-3 h-3" />
              Created: {formatDate(w.createdAt)}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600 font-mono">
              <PenLine className="w-3 h-3" />
              Updated: {formatDate(w.updatedAt)}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-blue-500/[0.04] border border-blue-500/15 rounded-xl p-5 flex gap-3 items-start">
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-400 leading-relaxed">
            <strong className="text-white font-medium">Need assistance?</strong> For claims or questions about this warranty plan, contact our support team.
            All warranties are subject to the official documentation and may vary by product category.
          </p>
        </div>

      </div>
    </div>
  );
}

export default WarrantyDetails;