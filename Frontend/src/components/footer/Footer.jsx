import {
    Mail,
    Phone,
    MapPin,
    Shield,
    Truck,
    Headphones,
    CreditCard,
    Facebook,
    Twitter,
    Instagram,
    Youtube,
    ChevronRight,
} from "lucide-react";
import logo from '../../assets/upgearlogo.png';
import { useNavigate } from "react-router-dom";

function Footer() {
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();

    const socialLinks = [
        { Icon: Facebook, label: "Facebook", href: "https://www.facebook.com/upgear.official" },
        { Icon: Twitter, label: "Twitter", href: "#" },
        { Icon: Instagram, label: "Instagram", href: "https://www.instagram.com/upgear.official/" },
        { Icon: Youtube, label: "YouTube", href: "#" },
    ];

    const helpLinks = [
        { name: "Contact Us", href: "#" },
        { name: "FAQs", href: "#" },
        { name: "Shipping Info", href: "#" },
        { name: "Returns", href: "#" },
        { name: "Warranty", href: "/warranty" },
    ];

    const services = [
        { icon: CreditCard, title: "Secure Payment", desc: "100% Protected", color: "from-green-500 to-emerald-500" },
        { icon: Headphones, title: "24/7 Support", desc: "Expert Help", color: "from-purple-500 to-pink-500" },
        { icon: Shield, title: "Warranty", desc: "1 Year Coverage", color: "from-orange-500 to-red-500" },
    ];

    const legalLinks = [
        { name: "Privacy Policy", href: "#" },
        { name: "Terms of Service", href: "#" },
        { name: "Cookie Policy", href: "#" },
    ];

    return (
        <footer className="bg-gradient-to-b from-gray-900 to-black text-white">
            {/* Top Gradient Border */}
            <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

            {/* Services Highlight Banner */}
            <div className="border-b border-gray-800/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
                        {services.map((service, index) => (
                            <div
                                key={index}
                                className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur-sm rounded-xl p-5 sm:p-6 border border-gray-700/50 hover:border-gray-600 transition-all duration-300 hover:shadow-xl hover:shadow-gray-900/50"
                            >
                                {/* Gradient overlay on hover */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                                
                                <div className="relative flex items-start gap-4">
                                    <div className={`p-3 bg-gradient-to-br ${service.color} rounded-lg shadow-lg`}>
                                        <service.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                                            {service.title}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-gray-400">
                                            {service.desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
                    
                    {/* Brand Section */}
                    <div className="lg:col-span-4">
                        <div className="mb-6">
                            {logo && (
                                <img 
                                    src={logo} 
                                    alt="UpGear" 
                                    className="h-16 w-16 sm:h-20 sm:w-20 object-contain mb-4" 
                                />
                            )}
                        </div>
                    
                        <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-6 max-w-sm">
                            Your trusted destination for premium tech and electronics. 
                            Elevating your digital lifestyle with cutting-edge products and exceptional service.
                        </p>

                        {/* Social Media */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-300 mb-4">Follow Us</h4>
                            <div className="flex gap-3">
                            {socialLinks.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"   
                                    className="group relative p-2.5 rounded-lg bg-gray-800 hover:bg-gradient-to-br hover:from-blue-500 hover:to-purple-500 transition-all duration-300"
                                    aria-label={social.label}
                                >
                                    <social.Icon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-white transition-colors" />
                                </a>
                            ))}
                            </div>
                        </div>
                    </div>

                    {/* Help & Support */}
                    <div className="lg:col-span-3">
                        <h4 className="text-base sm:text-lg font-bold mb-6 text-white">Help & Support</h4>
                        <ul className="space-y-3">
                            {helpLinks.map((link, index) => (
                                <li key={index}>
                                    <div
                                        onClick={() => navigate(link.href)}
                                        className="group flex items-center text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
                                    >
                                        <ChevronRight className="h-4 w-4 mr-2 text-gray-600 group-hover:text-blue-400 transition-colors" />
                                        <span>{link.name}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Information */}
                    <div className="lg:col-span-5">
                        <h4 className="text-base sm:text-lg font-bold mb-6 text-white">Get in Touch</h4>
                        <div className="space-y-5">
                            
                            {/* Address */}
                            <div className="group flex items-start gap-4 p-4 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-all duration-300">
                            <div className="p-2 rounded-lg bg-gray-700/50 group-hover:bg-blue-500/20 transition-colors">
                                <MapPin className="h-5 w-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 mb-1">Address</p>
                                <p className="text-gray-300 text-sm sm:text-base">
                                    Mirpur-14, Dhaka-1216
                                </p>
                            </div>
                            </div>

                            {/* Phone */}
                            <div className="group flex items-start gap-4 p-4 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-all duration-300">
                            <div className="p-2 rounded-lg bg-gray-700/50 group-hover:bg-green-500/20 transition-colors">
                                <Phone className="h-5 w-5 text-gray-400 group-hover:text-green-400 transition-colors" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 mb-1">Phone</p>
                                <a
                                href="+880 1581 799651"
                                className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base"
                                >
                                +880 1581 799651
                                </a>
                            </div>
                            </div>

                            {/* Email */}
                            <div className="group flex items-start gap-4 p-4 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-all duration-300">
                            <div className="p-2 rounded-lg bg-gray-700/50 group-hover:bg-purple-500/20 transition-colors">
                                <Mail className="h-5 w-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 mb-1">Email</p>
                                <a
                                href="mailto:hello@upgear.com"
                                className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base"
                                >
                                upgear007@gmail.com
                                </a>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800/50 bg-black/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                    
                        {/* Copyright */}
                        <div className="text-center lg:text-left order-2 lg:order-1">
                            <p className="text-gray-500 text-sm">
                                &copy; {currentYear} <span className="font-semibold text-gray-400">UpGear</span>. All rights reserved.
                            </p>
                        </div>

                        {/* Legal Links */}
                        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm order-3 lg:order-2">
                            {legalLinks.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.href}
                                    className="text-gray-500 hover:text-white transition-colors"
                                >
                                    {link.name}
                                </a>
                            ))}
                        </div>

                    
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;