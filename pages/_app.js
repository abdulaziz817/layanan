import { useEffect } from "react";
import Layout from "../components/Layout";
import "../styles/globals.css";

import netlifyIdentity from "netlify-identity-widget";

export default function App({ Component, pageProps }) {
  useEffect(() => {
    netlifyIdentity.init();

    const handleLogin = () => {
      netlifyIdentity.close();
      window.location.reload(); // refresh halaman supaya admin langsung kebaca
    };

    netlifyIdentity.on("login", handleLogin);

    return () => {
      netlifyIdentity.off("login", handleLogin);
    };
  }, []);

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
