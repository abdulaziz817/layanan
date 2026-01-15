import { useEffect } from "react";
import Layout from "../components/Layout";
import "../styles/globals.css";

import netlifyIdentity from "netlify-identity-widget";

export default function App({ Component, pageProps }) {
  useEffect(() => {
    netlifyIdentity.init();

    // Optional: kalau login berhasil, auto close popup
    netlifyIdentity.on("login", () => netlifyIdentity.close());
  }, []);

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
