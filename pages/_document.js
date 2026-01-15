import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="id" className="scroll-smooth">
      <Head>
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4f46e5" />
        <link rel="apple-touch-icon" href="/icon-192.png" />

        {/* ✅ WAJIB: Netlify Identity CSS (biar popup login muncul, terutama di HP) */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/netlify-identity-widget@1.9.2/build/netlify-identity-widget.css"
        />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
