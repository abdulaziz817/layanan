import SectionWrapper from "../../SectionWrapper";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.4,
      ease: "easeInOut",
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 1, ease: "easeOut" }, // diperpanjang dan lembut
  },
  hover: {
    scale: 1.03, // dikurangi agar tidak terlalu agresif
    boxShadow:
      "0 10px 18px rgba(99, 102, 241, 0.15), 0 6px 12px rgba(139, 92, 246, 0.12)",
    background:
      "linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(139,92,246,0.12) 100%)",
    borderColor: "rgba(139, 92, 246, 0.4)",
    transition: {
      type: "spring",
      stiffness: 120, // dikurangi agar lebih lembut
      damping: 18,
    },
  },
};

const titleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.3, duration: 0.75, ease: "easeOut" }, // lebih panjang
  },
  hover: {
    y: -1,
    transition: { duration: 0.3 },
  },
};

const descVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.5, duration: 0.75, ease: "easeOut" }, // lebih smooth
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
];

  return (
    <SectionWrapper>
<div
  id="toolkit"
  className="max-w-screen-xl mx-auto px-6 text-gray-700 md:px-10"
>
<div className="max-w-3xl mx-auto px-6 pt-20 pb-14">
  <div className="text-center mb-14">
    <h2 className="text-4xl font-bold text-gray-800">
      Software Unggulan Kami
    </h2>
    <p className="text-lg text-gray-600 mt-4 max-w-xl mx-auto">
     Kami menggunakan software terbaik untuk mendukung layanan profesional yang konsisten dan berkualitas.
    </p>
  </div>
</div>


        <motion.ul
          className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {features.map((item, idx) => (
            <motion.li
              key={idx}
              className="flex gap-6 items-start bg-white rounded-3xl p-8 cursor-pointer select-none border border-gray-200 shadow-lg hover:shadow-2xl transition-shadow duration-700 transform-gpu"
              variants={itemVariants}
              whileHover="hover"
              initial="hidden"
              animate="visible"
            >
              <div className="flex-none w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 flex items-center justify-center shadow-md">
                <img
                  src={item.icon}
                  alt={item.title}
                  className="w-14 h-14 object-contain"
                  loading="lazy"
                />
              </div>

              <div className="flex flex-col justify-center">
                <motion.h4
                  className="text-2xl font-semibold text-gray-900 mb-2"
                  variants={titleVariants}
                >
                  {item.title}
                </motion.h4>
                <motion.p
                  className="text-gray-600 leading-relaxed max-w-[320px] text-sm"
                  variants={descVariants}
                >
                  {item.desc}
                </motion.p>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </SectionWrapper>
  );
};

export default ToolKit;
