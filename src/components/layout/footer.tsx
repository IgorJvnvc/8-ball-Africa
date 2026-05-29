import Link from 'next/link'

const footerLinks = {
  shop: [
    { href: '/products?category=pool-tables', label: 'Pool Tables' },
    { href: '/products?category=cues', label: 'Cues' },
    { href: '/products?category=balls', label: 'Balls' },
    { href: '/products?category=chalk', label: 'Chalk' },
    { href: '/products?category=accessories', label: 'Accessories' },
  ],
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
    { href: '/shipping', label: 'Shipping & Returns' },
    { href: '/faq', label: 'FAQ' },
  ],
  legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-background border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary flex h-9 w-9 items-center justify-center rounded-full">
                <span className="text-sm font-bold text-white">8</span>
              </div>
              <span className="text-text text-lg font-bold">
                8-ball <span className="text-primary-light">Africa</span>
              </span>
            </div>
            <p className="text-text-muted text-sm">
              Premium pool equipment for players across Africa. From beginner to professional, we
              have everything you need to elevate your game.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-text mb-4 text-sm font-semibold tracking-wider uppercase">Shop</h3>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-muted hover:text-text text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-text mb-4 text-sm font-semibold tracking-wider uppercase">
              Company
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-muted hover:text-text text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-text mb-4 text-sm font-semibold tracking-wider uppercase">
              Stay Updated
            </h3>
            <p className="text-text-muted mb-4 text-sm">
              Get the latest deals and product drops straight to your inbox.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="bg-surface text-text placeholder:text-text-dark focus:border-primary focus:ring-primary flex-1 rounded-lg border border-white/10 px-3 py-2 text-sm focus:ring-1 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary-light rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-text-dark text-xs">
            &copy; {new Date().getFullYear()} 8-ball Africa. All rights reserved.
          </p>
          <div className="flex gap-4">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-text-dark hover:text-text-muted text-xs transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
