import Link from 'next/link';

const nav = [
  ['Blog', '/blog'],
  ['About', '/about'],
  ['Books', '/about/books'],
  ['Projects', '/about/projects'],
  ['Photography', '/photography'],
];

export function Header() {
  return <header className="site-header">
    <Link href="/" className="logo">Naren Yellavula</Link>
    <nav className="nav">
      {nav.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
    </nav>
  </header>;
}
