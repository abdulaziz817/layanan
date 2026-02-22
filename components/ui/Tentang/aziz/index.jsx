// components/ui/Tentang/aziz/index.jsx
import React from "react";

function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/85">
      {children}
    </span>
  );
}

function Card({ children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      {children}
    </div>
  );
}

function Btn({ href, children, variant = "primary" }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition";
  const styles =
    variant === "primary"
      ? "bg-white text-black hover:bg-white/90"
      : "border border-white/15 bg-white/5 text-white hover:bg-white/10";
  return (
    <a href={href} className={`${base} ${styles}`} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

export default function AzizPage({ data }) {
  return (
    <main className="min-h-screen bg-[#0b1020] text-white">
      <div className="mx-auto max-w-5xl px-5 py-12">
        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Profil Resmi
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {data?.name || "Abdul Aziz"}
            </h1>
            <p className="mt-2 text-white/70">
              {data?.roleLine || "Owner / Founder • Layanan Nusantara"}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {(data?.skills || []).map((s) => (
                <Badge key={s}>{s}</Badge>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {data?.waLink ? <Btn href={data.waLink}>WhatsApp</Btn> : null}
            {data?.igLink ? (
              <Btn href={data.igLink} variant="secondary">
                Instagram
              </Btn>
            ) : null}
            {data?.email ? (
              <Btn href={`mailto:${data.email}`} variant="secondary">
                Email
              </Btn>
            ) : null}
          </div>
        </div>

        {/* ✅ Debug error (hapus nanti kalau sudah normal) */}
        {data?.error ? (
          <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            Fetch error: {data.error}
          </div>
        ) : null}

        {/* About */}
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <Card>
            <p className="text-xs font-semibold text-white/60">Dari abdulaziznusantara</p>
            <h2 className="mt-2 text-lg font-semibold">Tentang Saya</h2>
            <p className="mt-3 leading-relaxed text-white/80">{data?.aboutA || "—"}</p>

            {data?.sourceA ? (
              <p className="mt-4 text-xs text-white/50">
                Sumber:{" "}
                <a
                  className="underline decoration-white/20 hover:decoration-white/60"
                  href={data.sourceA}
                  target="_blank"
                  rel="noreferrer"
                >
                  {data.sourceA}
                </a>
              </p>
            ) : null}
          </Card>

          <Card>
            <p className="text-xs font-semibold text-white/60">Dari zizzz</p>
            <h2 className="mt-2 text-lg font-semibold">Value & Fokus</h2>
            <p className="mt-3 leading-relaxed text-white/80">{data?.aboutB || "—"}</p>

            <div className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-sm text-white/80">
                <span className="text-white/50">Kontak:</span>{" "}
                {data?.phone ? (
                  <span className="font-semibold">{data.phone}</span>
                ) : (
                  <span className="text-white/50">—</span>
                )}
              </div>
              <div className="text-sm text-white/80">
                <span className="text-white/50">Email:</span>{" "}
                {data?.email ? (
                  <span className="font-semibold">{data.email}</span>
                ) : (
                  <span className="text-white/50">—</span>
                )}
              </div>
            </div>

            {data?.sourceB ? (
              <p className="mt-4 text-xs text-white/50">
                Sumber:{" "}
                <a
                  className="underline decoration-white/20 hover:decoration-white/60"
                  href={data.sourceB}
                  target="_blank"
                  rel="noreferrer"
                >
                  {data.sourceB}
                </a>
              </p>
            ) : null}
          </Card>
        </div>

        {/* Experience */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold">Pengalaman</h2>

          <div className="mt-5 grid gap-4">
            {(data?.experience || []).length ? (
              data.experience.map((x, idx) => (
                <Card key={`${x.company}-${idx}`}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-base font-semibold">{x.company}</div>
                      <div className="text-sm text-white/70">{x.title}</div>
                    </div>
                    <div className="text-xs text-white/55">{x.date}</div>
                  </div>

                  {x.desc ? (
                    <p className="mt-3 text-sm leading-relaxed text-white/75">{x.desc}</p>
                  ) : null}
                </Card>
              ))
            ) : (
              <Card>
                <p className="text-white/70">Pengalaman belum tersedia.</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}