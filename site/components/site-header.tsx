import Link from "next/link";

const links = [
  ["Story", "/"],
  ["Deck", "/deck/01"],
  ["Specs", "/specs"],
  ["Whitepaper", "/whitepaper"],
  ["Research", "/research"],
  ["Participate", "/participate"]
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="wordmark" href="/">
        <span className="wordmark-mark" aria-hidden="true">CC</span>
        <span>Card Commons</span>
      </Link>
      <nav aria-label="Primary navigation">
        {links.map(([label, href]) => (
          <Link href={href} key={href}>{label}</Link>
        ))}
      </nav>
      <a
        className="button button-small"
        href="https://github.com/CSandbatch/card-commons"
      >
        GitHub
      </a>
    </header>
  );
}

