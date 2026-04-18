const fs = require("fs");
const path = require("path");

const structure = [
  "pages/login.jsx",
  "pages/kelas-nusantara/index.jsx",
  "pages/kelas-nusantara/[slug].jsx",
  "pages/kelas-nusantara/materi/[id].jsx",
  "pages/kelas-nusantara/praktik/[id].jsx",

  "components/ui/LayananKategori.jsx",
  "components/ui/MateriCard.jsx",
  "components/ui/ProgressBar.jsx",
  "components/ui/GoogleLoginButton.jsx",

  "lib/session.js",
  "lib/sheets.js",

  "netlify/functions/auth-google.js",
  "netlify/functions/session-me.js",
  "netlify/functions/kelas-list.js",
  "netlify/functions/kelas-detail.js",
  "netlify/functions/materi-list.js",
  "netlify/functions/materi-detail.js",
  "netlify/functions/progress-save.js",
  "netlify/functions/progress-list.js",
  "netlify/functions/download-log.js",
];

structure.forEach((file) => {
  const dir = path.dirname(file);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(file)) {
    fs.writeFileSync(
      file,
      `// ${file}\nexport default function Page() {\n  return <div>${file}</div>;\n}\n`
    );
    console.log("Created:", file);
  }
});