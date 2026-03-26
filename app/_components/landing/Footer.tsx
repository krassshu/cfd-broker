import Link from "next/link";
import { Globe, Phone, Clock, Mail } from "lucide-react";
import { SOCIAL_LINKS, FOOTER_PRODUCTS, FOOTER_PAGES } from "./data/landing-data";

export default function Footer() {
    return (
        <footer className="relative border-t border-section-border py-16 px-6 bg-card-surface">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight mb-4">
                            <Globe className="w-5 h-5 text-primary" />
                            <div>
                                <span className="text-foreground">Crypto</span>
                                <span className="text-primary">Broker</span>
                            </div>
                        </Link>
                        <p className="text-xs text-muted leading-relaxed max-w-xs mb-6">
                            Next-generation crypto CFD trading platform with real-time market data,
                            advanced risk management, and up to 50x leverage.
                        </p>
                        <div className="flex items-center gap-3">
                            {SOCIAL_LINKS.map((social) => (
                                <a
                                    key={social.label}
                                    href="#"
                                    className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary/20 hover:border-primary/30 transition-all"
                                    aria-label={social.label}
                                >
                                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d={social.path} />
                                    </svg>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Products */}
                    <div>
                        <h4 className="text-sm font-bold text-foreground mb-5">Our Products</h4>
                        <ul className="space-y-3 text-sm text-muted">
                            {FOOTER_PRODUCTS.map((item) => (
                                <li key={item.label}>
                                    <a href={item.href} className="hover:text-primary transition-colors">{item.label}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Pages */}
                    <div>
                        <h4 className="text-sm font-bold text-foreground mb-5">Pages</h4>
                        <ul className="space-y-3 text-sm text-muted">
                            {FOOTER_PAGES.map((item) => (
                                <li key={item.label}>
                                    {item.internal ? (
                                        <Link href={item.href} className="hover:text-primary transition-colors">{item.label}</Link>
                                    ) : (
                                        <a href={item.href} className="hover:text-primary transition-colors">{item.label}</a>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-sm font-bold text-foreground mb-5">Contact</h4>
                        <ul className="space-y-3.5 text-sm text-muted">
                            <li className="flex items-center gap-2.5">
                                <Phone className="w-4 h-4 text-primary shrink-0" />
                                <span>(205) 555-01000</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <Clock className="w-4 h-4 text-primary shrink-0" />
                                <span>Mon - Fri: 9am - 11pm</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <Mail className="w-4 h-4 text-primary shrink-0" />
                                <span>info@cryptobroker.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-section-border pt-6">
                    <p className="text-[10px] text-muted/60 leading-relaxed max-w-3xl">
                        <strong>Risk Disclaimer:</strong> Trading cryptocurrency CFDs involves substantial risk of loss
                        and is not suitable for all investors. Leveraged products can result in losses exceeding your
                        initial deposit. Past performance is not indicative of future results. This platform is for
                        educational and demonstration purposes.
                    </p>
                    <p className="text-[10px] text-muted/40 mt-3">
                        &copy; {new Date().getFullYear()} CryptoBroker. Market data powered by Binance.
                    </p>
                </div>
            </div>
        </footer>
    );
}
