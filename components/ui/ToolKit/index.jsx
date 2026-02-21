import SectionWrapper from "../../SectionWrapper";
import { motion } from "framer-motion";
import Image from "next/image";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
      ease: "easeInOut",
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 26, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.75, ease: "easeOut" },
  },
  hover: {
    y: -6,
    scale: 1.01,
    boxShadow:
      "0 14px 30px rgba(15, 23, 42, 0.10), 0 6px 14px rgba(15, 23, 42, 0.06)",
    transition: { type: "spring", stiffness: 180, damping: 18 },
  },
};

const titleVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.15, duration: 0.55, ease: "easeOut" },
  },
};

const descVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.22, duration: 0.55, ease: "easeOut" },
  },
};

const ToolKit = () => {
  const features = [
    {
      icon: "https://raw.githubusercontent.com/devicons/devicon/v2.16.0/icons/vscode/vscode-original.svg",
      title: "VS Code",
      desc: "Editor ringan dan fleksibel untuk pengembangan aplikasi.",
      colored: true,
    },
    {
      icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTY2kn50F7cgPiqEXqf3txrf8vQMqz9mIJKhg&s",
      title: "Adobe Lightroom",
      desc: "Edit dan kelola foto dengan hasil profesional.",
      colored: true,
    },
    {
      icon: "https://raw.githubusercontent.com/devicons/devicon/v2.16.0/icons/photoshop/photoshop-original.svg",
      title: "Adobe Photoshop",
      desc: "Desain dan edit gambar secara detail dan kreatif.",
      colored: true,
    },
    {
      icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Adobe_Illustrator_CC_icon.svg/1200px-Adobe_Illustrator_CC_icon.svg.png",
      title: "Adobe Illustrator",
      desc: "Desain vektor untuk logo, ikon, dan ilustrasi.",
      colored: true,
    },
    {
      icon: "https://raw.githubusercontent.com/devicons/devicon/v2.16.0/icons/figma/figma-original.svg",
      title: "Figma",
      desc: "Desain UI/UX kolaboratif berbasis web.",
      colored: true,
    },
    {
      icon: "https://styles.redditmedia.com/t5_32cum/styles/communityIcon_bdo80xrebxrd1.png",
      title: "CorelDRAW",
      desc: "Desain grafis vektor untuk kebutuhan cetak.",
      colored: true,
    },
    {
      icon: "https://raw.githubusercontent.com/devicons/devicon/v2.16.0/icons/premierepro/premierepro-original.svg",
      title: "Adobe Premiere Pro",
      desc: "Edit video profesional dan konten visual.",
      colored: true,
    },
    {
      icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Adobe_Express_Logo.svg/1200px-Adobe_Express_Logo.svg.png",
      title: "Adobe Express",
      desc: "Desain konten cepat untuk media sosial.",
      colored: true,
    },
    {
      icon: "https://raw.githubusercontent.com/devicons/devicon/v2.16.0/icons/canva/canva-original.svg",
      title: "Canva",
      desc: "Platform desain online yang mudah digunakan.",
      colored: true,
    },
    {
      icon: "https://raw.githubusercontent.com/devicons/devicon/v2.16.0/icons/github/github-original.svg",
      title: "GitHub",
      desc: "Repositori kode dan kolaborasi tim pengembang.",
      colored: true,
    },
    {
      icon: "https://raw.githubusercontent.com/devicons/devicon/v2.16.0/icons/aftereffects/aftereffects-original.svg",
      title: "Adobe After Effects",
      desc: "Motion graphic dan visual effect profesional.",
      colored: true,
    },
    {
      icon: "https://upload.wikimedia.org/wikipedia/commons/0/0c/Capcut-icon.png",
      title: "CapCut",
      desc: "Edit video cepat dan modern untuk konten sosial media.",
      colored: true,
    },
    {
      icon: "https://www.vectorlogo.zone/logos/google_analytics/google_analytics-icon.svg",
      title: "Google Analytics",
      desc: "Analisis data pengunjung website secara real-time.",
      colored: true,
    },
    {
      icon: "https://global.discourse-cdn.com/sketchup/original/3X/6/8/6867be723cd855181b4a0ea3015fff6401c9cddb.png",
      title: "SketchUp",
      desc: "Desain dan visualisasi 3D untuk arsitektur dan interior.",
      colored: true,
    },
    {
      icon: "https://upload.wikimedia.org/wikipedia/commons/4/4d/DaVinci_Resolve_Studio.png",
      title: "DaVinci Resolve",
      desc: "Editing video dan color grading profesional.",
      colored: true,
    },
  ];

  return (
    <SectionWrapper>
      <div
        id="toolkit"
        className="max-w-screen-xl mx-auto px-6 text-slate-700 md:px-10"
      >
        <div className="max-w-3xl mx-auto px-6 pt-20 pb-14">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
              Software Unggulan Kami
            </h2>
            <p className="text-lg text-slate-600 mt-4 max-w-xl mx-auto">
              Kami menggunakan software terbaik untuk mendukung layanan
              profesional yang konsisten dan berkualitas.
            </p>
          </div>
        </div>

        <motion.ul
          className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {features.map((item, idx) => (
           <motion.li
  key={idx}
  className={[
    "group relative flex gap-6 items-start",
    "rounded-3xl p-8 cursor-pointer select-none",
    // base
    "bg-white",
    "border border-slate-200",
    "shadow-[0_8px_20px_rgba(15,23,42,0.06)]",
    "transition-all duration-500 will-change-transform",
    // hover state (subtle, pro)
    "hover:border-slate-300",
    "hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)]",
    "hover:ring-1 hover:ring-slate-900/5",
  ].join(" ")}
  variants={itemVariants}
  whileHover={{ y: -6 }}
  transition={{ type: "spring", stiffness: 180, damping: 18 }}
>
  {/* Accent line (tipis, professional) */}
  <span
    className={[
      "pointer-events-none absolute left-0 top-6 bottom-6 w-px",
      "bg-slate-900/10",
      "opacity-0 group-hover:opacity-100",
      "transition-opacity duration-500",
    ].join(" ")}
  />

  {/* Shine sweep (halus, ga norak) */}
  <span
    className={[
      "pointer-events-none absolute inset-0 rounded-3xl overflow-hidden",
      "opacity-0 group-hover:opacity-100 transition-opacity duration-500",
    ].join(" ")}
  >
    <span
      className={[
        "absolute -left-1/3 top-0 h-full w-1/2",
        // bukan gradient warna-warni; cuma highlight putih transparan
        "bg-white/40 blur-xl",
        "rotate-12",
        "translate-x-[-20%] group-hover:translate-x-[180%]",
        "transition-transform duration-1000 ease-out",
      ].join(" ")}
    />
  </span>

  {/* Icon badge (solid + ring + lift kecil) */}
  <div
    className={[
      "relative z-10 flex-none w-20 h-20 rounded-2xl",
      "bg-slate-50",
      "border border-slate-200",
      "flex items-center justify-center",
      "shadow-[0_8px_18px_rgba(15,23,42,0.06)]",
      "transition-all duration-500",
      "group-hover:border-slate-300",
      "group-hover:shadow-[0_16px_28px_rgba(15,23,42,0.10)]",
      "group-hover:-translate-y-0.5",
    ].join(" ")}
  >
   <Image
  src={item.icon}
  alt={item.title}
  width={48}
  height={48}
  className="w-12 h-12 object-contain"
  loading="lazy"
  unoptimized
/>
    {/* ring glow tipis */}
    <span
      className={[
        "pointer-events-none absolute inset-0 rounded-2xl",
        "opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        "ring-1 ring-slate-900/5",
      ].join(" ")}
    />
  </div>

  <div className="relative z-10 flex flex-col justify-center">
    <motion.h4
      className="text-xl font-semibold text-slate-900 mb-2 tracking-tight"
      variants={titleVariants}
    >
      {item.title}
    </motion.h4>

    <motion.p
      className="text-slate-600 leading-relaxed max-w-[320px] text-sm"
      variants={descVariants}
    >
      {item.desc}
    </motion.p>

    {/* micro detail: divider kecil muncul pas hover (opsional tapi cakep) */}
    <span className="mt-4 h-px w-0 bg-slate-200 group-hover:w-16 transition-all duration-500" />
  </div>
</motion.li>

          ))}
        </motion.ul>
      </div>
    </SectionWrapper>
  );
};

export default ToolKit;
