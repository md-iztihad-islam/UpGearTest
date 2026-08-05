import Footer from "@/components/footer/Footer";
import Navbar from "@/components/navbar/Navbar";
import { Outlet } from "react-router-dom";
import { Facebook, Instagram, MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "8801961685403";
const WHATSAPP_MESSAGE = encodeURIComponent("Hello! I'm interested in your products at UpGear. Can you help me?");

const MESSENGER_USERNAME = "upgear.official";
const MESSENGER_MESSAGE = encodeURIComponent("Hello! I'm interested in your products at UpGear. Can you help me?");

const SOCIALS = [
    {
        icon: () => (
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.955 1.404 5.588 3.6 7.33V22l3.28-1.8c.875.242 1.8.372 2.757.372 5.523 0 9.778-4.145 9.778-9.243S17.523 2 12 2zm.97 12.445-2.492-2.656-4.865 2.656 5.352-5.68 2.553 2.656 4.804-2.656-5.352 5.68z"/>
            </svg>
        ),
        href: `https://m.me/${MESSENGER_USERNAME}?text=${MESSENGER_MESSAGE}`,
        label: "Messenger",
        color: "hover:text-purple-500",
    },
    {
        icon: () => (
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
        ),
        href: `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`,
        label: "WhatsApp",
        color: "hover:text-green-500",
    },
    {
        icon: Facebook,
        href: "https://www.facebook.com/upgear.official",
        label: "Facebook",
        color: "hover:text-blue-500",
    },
    {
        icon: Instagram,
        href: "https://www.instagram.com/upgear.official/",
        label: "Instagram",
        color: "hover:text-pink-500",
    },
];

function FloatingSocials() {
    return (
        <div className="fixed bottom-6 right-4 z-50 flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 sm:bottom-6 sm:right-6">
            {SOCIALS.map(({ icon: Icon, href, label, color }) => (
                <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className={`flex items-center justify-center w-9 h-9 rounded-full bg-gray-900/80 backdrop-blur-sm border border-gray-700/60 text-gray-400 shadow-lg shadow-black/40 transition-all duration-300 hover:scale-110 hover:border-gray-500 hover:shadow-xl ${color}`}
                >
                    <Icon className="w-4 h-4" />
                </a>
            ))}
        </div>
    );
}

function MainLayout() {
    return (
        <>
            <Navbar />
            <Outlet />
            <Footer />
            <FloatingSocials />
        </>
    );
}

export default MainLayout;