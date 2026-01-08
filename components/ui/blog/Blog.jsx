'use client'
import { motion } from "framer-motion"
import { useState } from 'react'

/* =========================
   DATA
========================= */

const categories = [
  {
    key: 'All',
    title: 'Semua',
    icon: '📚',
  },
  {
    key: 'Desain Grafis',
    title: 'Desain Grafis',
    icon: '🎨',
  },
  {
    key: 'Web Development',
    title: 'Web Development',
    icon: '💻',
  },
  {
    key: 'AI Teknologi',
    title: 'AI Teknologi',
    icon: '🤖',
  },
  {
    key: 'Bisnis Management',
    title: 'Bisnis Management',
    icon: '📊',
  },
]

const articles = [
  // ======================
  // DESAIN GRAFIS (6 ARTIKEL)
  // ======================
{
  category: 'Desain Grafis',
  title: 'Kenapa Desain Simpel Lebih Mahal?',
  excerpt:
    'Banyak orang mengira desain simpel itu murah dan mudah. Padahal di balik visual yang terlihat sederhana, ada riset, strategi, dan keputusan desain yang matang demi membangun brand yang kuat dan dipercaya.',
  content: `
Desain simpel sering dianggap mudah dan cepat dibuat. Banyak yang berpikir,
"Ah cuma teks sama warna doang." Padahal justru di situlah letak tantangannya.

Desain simpel menuntut desainer untuk berpikir jauh lebih dalam dibanding desain ramai.
Setiap elemen yang muncul harus punya alasan kuat, dan setiap elemen yang dihilangkan
harus diputuskan dengan penuh pertimbangan.

Dalam proses desain simpel, biasanya ada beberapa tahapan penting:
• Riset mendalam tentang brand dan industrinya
• Analisis target audiens dan perilaku mereka
• Eksplorasi konsep visual yang relevan
• Penyederhanaan tanpa menghilangkan makna
• Pengujian konsistensi di berbagai media

Desain simpel bukan soal “sedikit”, tapi soal “tepat”.
Salah memilih warna, font, atau jarak bisa langsung merusak keseluruhan pesan.

Itulah kenapa brand besar berani membayar mahal untuk desain yang terlihat sederhana.
Karena mereka tidak membeli keramaian visual,
mereka membeli kejelasan, kepercayaan, dan kekuatan identitas jangka panjang.
  `,
  date: '12 Jan 2026',
  reference: [
    'https://www.interaction-design.org/literature/article/minimalism-in-design',
  ],
},
{
  category: 'Desain Grafis',
  title: 'Logo Mahal vs Logo Murah, Bedanya Di Mana?',
  excerpt:
    'Perbedaan logo mahal dan logo murah bukan cuma di harga, tapi di proses, pemikiran, dan dampak bisnis yang dihasilkan dalam jangka panjang.',
  content: `
Banyak orang masih mengira logo hanyalah gambar.
Padahal logo adalah wajah utama sebuah brand.

Logo mahal tidak dibuat dalam satu malam.
Ada proses panjang yang melibatkan riset, diskusi, dan pengambilan keputusan strategis.

Biasanya proses logo profesional meliputi:
• Riset mendalam tentang brand, visi, dan misi
• Analisis kompetitor dan positioning pasar
• Penggalian filosofi dan nilai brand
• Eksplorasi konsep dan simbol visual
• Penyesuaian untuk berbagai ukuran dan media

Logo mahal dirancang agar tetap relevan dipakai bertahun-tahun,
baik di media digital, cetak, kemasan, maupun promosi.

Sebaliknya, logo murah sering berhenti di tahap visual saja.
Yang penting “jadi”, tanpa memikirkan konsistensi, makna, dan dampaknya ke brand.

Intinya, logo murah hanya sekadar gambar.
Logo mahal adalah investasi identitas bisnis.
  `,
  date: '11 Jan 2026',
  reference: [
    'https://www.entrepreneur.com/growing-a-business/why-a-good-logo-matters/240868'
  ],
},
{
  category: 'Desain Grafis',
  title: 'Kesalahan Desain yang Bikin Brand Terlihat Murahan',
  excerpt:
    'Kesalahan kecil dalam desain bisa berdampak besar pada citra brand. Tanpa disadari, desain yang salah bisa membuat bisnis terlihat tidak profesional.',
  content: `
Desain punya peran besar dalam membentuk persepsi.
Sayangnya, banyak brand tidak sadar bahwa desain mereka justru menurunkan nilai bisnis.

Beberapa kesalahan desain yang paling sering terjadi antara lain:
• Menggunakan terlalu banyak jenis font
• Warna brand berubah-ubah tanpa aturan
• Layout tidak rapi dan sulit dibaca
• Elemen visual saling bertabrakan
• Copywriting lemah dan tidak meyakinkan

Kesalahan-kesalahan ini membuat brand terlihat tidak konsisten
dan terkesan asal-asalan di mata audiens.

Padahal, desain yang baik seharusnya memudahkan orang memahami pesan,
bukan malah membuat bingung.

Desain bukan soal selera pribadi.
Desain adalah alat komunikasi yang harus tepat sasaran.
Jika komunikasinya gagal, maka brand pun ikut gagal.
  `,
  date: '10 Jan 2026',
  reference: [
    
    'https://www.blog.turaingrp.com/5-graphic-design-mistakes-to-avoid'
  ],
},
{
  category: 'Desain Grafis',
  title: 'Kenapa Konsistensi Visual Itu Wajib?',
  excerpt:
    'Konsistensi visual bukan sekadar soal tampilan, tapi soal membangun kepercayaan dan pengenalan brand di benak audiens.',
  content: `
Coba perhatikan brand-brand besar.
Mereka jarang sekali mengubah gaya visual secara drastis.

Itu bukan tanpa alasan.
Konsistensi visual membantu brand:
• Mudah dikenali di mana pun muncul
• Terlihat lebih profesional dan terpercaya
• Menanamkan identitas kuat di ingatan audiens

Mulai dari warna, font, layout, hingga gaya ilustrasi,
semuanya dijaga agar tetap selaras.

Brand yang sering ganti gaya visual justru membuat audiens bingung.
Hari ini tampil A, besok tampil B, akhirnya tidak punya ciri khas.

Brand besar tidak sibuk mengganti identitas.
Mereka fokus menguatkan satu identitas yang sudah dibangun.
  `,
  date: '9 Jan 2026',
  reference: [
    'https://www.lucidpress.com/blog/brand-consistency',
  ],
},
{
  category: 'Desain Grafis',
  title: 'Desain Bagus Itu Menjual, Bukan Cuma Indah',
  excerpt:
    'Desain yang baik tidak berhenti di estetika. Desain yang efektif mampu mengarahkan audiens untuk mengambil tindakan.',
  content: `
Banyak desain terlihat cantik,
tapi tidak menghasilkan apa-apa.

Padahal tujuan utama desain adalah mendorong aksi,
bukan sekadar memanjakan mata.

Desain yang efektif biasanya mampu:
• Mengarahkan fokus ke pesan utama
• Mempermudah audiens memahami informasi
• Mengurangi kebingungan dalam mengambil keputusan
• Mendorong klik, pembelian, atau interaksi

Jika sebuah desain hanya indah tapi tidak menghasilkan respon,
berarti fungsinya belum tercapai.

Desain yang baik selalu punya tujuan.
Estetika hanyalah alat, bukan tujuan akhir.
  `,
  date: '8 Jan 2026',
  reference: [
    // 'https://www.nngroup.com/articles/design-for-conversion/',
    'https://uxdesign.cc/design-that-sells-ux-conversion-3bfaef'


  ],
},

                                                                          //BARU SAMPE SINI 

{
  category: 'Desain Grafis',
  title: 'Kenapa Brand Besar Jarang Pakai Desain Ramai?',
  excerpt:
    'Desain yang sederhana justru menunjukkan kepercayaan diri sebuah brand dalam menyampaikan pesan tanpa berlebihan.',
  content: `
Brand besar jarang memakai desain yang terlalu ramai.
Bukan karena mereka kekurangan ide,
tapi karena mereka tahu apa yang benar-benar penting.

Fokus utama mereka biasanya adalah:
• Pesan yang jelas dan mudah dipahami
• Visual yang bersih dan terarah
• Pengalaman pengguna yang nyaman

Desain yang terlalu ramai sering kali hanya menutupi pesan utama.
Audiens jadi lelah melihatnya dan tidak menangkap inti informasi.

Kesederhanaan dalam desain menunjukkan kedewasaan brand.
Mereka tidak perlu teriak,
karena identitasnya sudah cukup kuat untuk berbicara sendiri.
  `,
  date: '7 Jan 2026',
  reference: [
    'https://www.forbes.com/sites/forbesagencycouncil/2020/09/01/why-less-is-more-in-design/',
    'https://medium.com/design-strategy/minimal-branding'
  ],
},

// ======================
// WEB DEVELOPMENT (8 ARTIKEL – DASAR & AWAM)
// ======================
{
  category: 'Web Development',
  title: 'Apa Itu Website dan Kenapa Bisnis Butuh?',
  excerpt:
    'Website bukan sekadar pajangan online. Website adalah identitas digital yang membangun kepercayaan, menjelaskan bisnis, dan membantu calon pelanggan mengambil keputusan.',
  content: `
Website adalah representasi bisnis di dunia digital.
Saat orang mencari nama brand atau layanan di internet,
hal pertama yang ingin mereka temukan adalah website resmi.

Dengan memiliki website, sebuah bisnis akan terlihat:
• Lebih profesional dan serius
• Mudah ditemukan lewat Google
• Lebih dipercaya oleh calon pelanggan
• Punya kendali penuh atas informasi bisnis

Website berfungsi sebagai pusat informasi.
Mulai dari profil bisnis, produk atau jasa, kontak, hingga testimoni pelanggan.

Di era digital, orang cenderung ragu pada bisnis yang tidak punya website.
Jika bisnis kamu tidak hadir secara online,
maka kompetitor yang akan mengambil kesempatan tersebut.
  `,
  date: '12 Jan 2026',
  reference: [
    'https://www.forbes.com/small-business/why-your-business-needs-a-website/',
    'https://www.shopify.com/blog/why-you-need-a-website'
  ],
},
{
  category: 'Web Development',
  title: 'Kenapa Website Lebih Dipercaya Daripada Media Sosial?',
  excerpt:
    'Media sosial penting, tapi website tetap menjadi fondasi utama kepercayaan bisnis karena sifatnya yang resmi dan milik sendiri.',
  content: `
Media sosial memang cepat dan mudah digunakan.
Namun, media sosial bukanlah aset yang sepenuhnya kita miliki.

Akun media sosial bisa:
• Terkena banned
• Hilang karena pelanggaran
• Berubah algoritma sewaktu-waktu

Berbeda dengan website.
Website adalah aset digital milik sendiri yang sepenuhnya bisa dikontrol.

Di website, bisnis terlihat lebih serius dan profesional.
Calon pelanggan merasa lebih aman karena informasi tersaji dengan jelas dan rapi.

Media sosial cocok untuk promosi.
Website cocok untuk membangun kepercayaan jangka panjang.
  `,
  date: '11 Jan 2026',
  reference: [
    'https://www.businessnewsdaily.com/15060-business-website-importance.html',
    'https://www.bluehost.com/blog/why-business-needs-website/'
  ],
},
{
  category: 'Web Development',
  title: 'Website Gratis vs Website Profesional',
  excerpt:
    'Website gratis memang menggiurkan di awal, tapi sering kali menimbulkan keterbatasan yang justru menghambat perkembangan bisnis.',
  content: `
Website gratis sering dipilih karena alasan hemat biaya.
Namun, ada banyak keterbatasan yang sering tidak disadari.

Website gratis biasanya:
• Terlihat kurang profesional
• Menampilkan iklan pihak ketiga
• Domain tidak meyakinkan
• Fitur sangat terbatas

Sementara website profesional dirancang khusus untuk bisnis.
Fokus utamanya adalah:
• Membangun kepercayaan
• Memperkuat branding
• Mendukung pertumbuhan bisnis
• Fleksibel dikembangkan jangka panjang

Gratis mungkin murah di awal,
tapi website profesional jauh lebih menguntungkan dalam jangka panjang.
  `,
  date: '10 Jan 2026',
  reference: [
    'https://www.websitebuilderexpert.com/building-websites/free-vs-paid/',
    'https://www.hostinger.com/tutorials/free-vs-paid-website'
  ],
},
{
  category: 'Web Development',
  title: 'Kenapa Website Harus Bisa Dibuka di HP?',
  excerpt:
    'Sebagian besar pengguna internet mengakses website lewat smartphone. Jika website tidak ramah HP, bisnis bisa kehilangan banyak peluang.',
  content: `
Saat ini mayoritas orang mengakses internet lewat smartphone.
Artinya, website harus nyaman dibuka di layar kecil.

Jika website tidak ramah HP:
• Pengunjung akan langsung keluar
• Navigasi terasa menyulitkan
• Bisnis terlihat tidak profesional

Website yang responsif akan:
• Menyesuaikan tampilan di semua perangkat
• Memberi pengalaman pengguna yang nyaman
• Membuat pengunjung betah lebih lama

Website bukan cuma soal tampilan di laptop,
tapi soal kenyamanan pengguna di semua perangkat.
  `,
  date: '9 Jan 2026',
  reference: [
    'https://www.thinkwithgoogle.com/consumer-insights/mobile-site-design/',
    'https://www.statista.com/topics/779/mobile-internet/'
  ],
},
{
  category: 'Web Development',
  title: 'Kenapa Website Lambat Bikin Orang Kabur?',
  excerpt:
    'Kecepatan website sangat menentukan kesan pertama. Website yang lambat sering membuat pengunjung pergi sebelum melihat isi.',
  content: `
Pengunjung internet tidak suka menunggu.
Beberapa detik loading saja sudah cukup membuat mereka menutup halaman.

Website lambat bisa menyebabkan:
• Pengunjung langsung pergi
• Tingkat kepercayaan menurun
• Potensi penjualan hilang

Sebaliknya, website yang cepat:
• Memberi pengalaman pengguna lebih baik
• Terlihat lebih profesional
• Membuat pengunjung betah

Kecepatan website bukan fitur tambahan,
tapi kebutuhan utama.
  `,
  date: '8 Jan 2026',
  reference: [
    'https://web.dev/performance/',
    'https://www.thinkwithgoogle.com/marketing-strategies/app-and-mobile/page-load-time-statistics/'
  ],
},
{
  category: 'Web Development',
  title: 'Website Itu Investasi, Bukan Biaya',
  excerpt:
    'Website bukan pengeluaran sekali pakai. Website adalah aset digital yang terus bekerja dan memberi manfaat jangka panjang.',
  content: `
Banyak bisnis menganggap website sebagai biaya.
Padahal sebenarnya website adalah investasi.

Website bekerja 24 jam tanpa henti:
• Menjelaskan bisnis
• Menjawab pertanyaan pelanggan
• Menampilkan produk atau jasa
• Mengarahkan calon pembeli

Website tidak capek,
tidak minta gaji,
dan bisa terus dikembangkan sesuai kebutuhan bisnis.

Sekali dibuat dengan baik,
manfaat website bisa dirasakan bertahun-tahun.
  `,
  date: '7 Jan 2026',
  reference: [
    'https://www.entrepreneur.com/growing-a-business/why-a-website-is-an-investment/427699',
    'https://www.forbes.com/sites/forbesbusinesscouncil/2022/06/06/why-a-website-is-an-investment/'
  ],
},
{
  category: 'Web Development',
  title: 'Apa yang Dicari Orang Saat Buka Website?',
  excerpt:
    'Pengunjung website sebenarnya sederhana. Mereka ingin informasi yang cepat, jelas, dan mudah ditemukan.',
  content: `
Saat seseorang membuka website,
mereka biasanya tidak ingin membaca terlalu lama.

Hal yang paling sering dicari pengunjung antara lain:
• Produk atau jasa yang ditawarkan
• Cara menghubungi bisnis
• Harga atau gambaran biaya
• Bukti kepercayaan seperti testimoni

Jika informasi tersebut sulit ditemukan,
pengunjung akan langsung keluar dan mencari website lain.

Website yang baik selalu mengutamakan kejelasan,
bukan kerumitan.
  `,
  date: '6 Jan 2026',
  reference: [
    'https://www.nngroup.com/articles/website-usability/',
    'https://uxdesign.cc/what-users-want-from-a-website'
  ],
},
{
  category: 'Web Development',
  title: 'Website Bisa Bantu Jualan Tanpa Maksa',
  excerpt:
    'Website yang dirancang dengan baik mampu mengarahkan pengunjung secara halus hingga akhirnya mengambil keputusan.',
  content: `
Website yang efektif tidak memaksa pengunjung untuk membeli.
Sebaliknya, website yang baik akan membimbing secara perlahan.

Website yang menjual dengan baik biasanya:
• Memberi informasi yang jelas dan jujur
• Menjawab keraguan calon pelanggan
• Menampilkan manfaat produk atau jasa
• Mengajak bertindak secara halus

Pendekatan seperti ini membuat calon pelanggan merasa nyaman
dan lebih percaya pada bisnis.

Jualan yang tidak memaksa,
justru lebih menghasilkan.
  `,
  date: '5 Jan 2026',
  reference: [
    'https://www.hubspot.com/marketing-statistics',
    'https://blog.hubspot.com/marketing/website-conversion'
  ],
},


 // ======================
// AI TEKNOLOGI (12 ARTIKEL – AWAM & TRENDING)
// ======================
{
  category: 'AI Teknologi',
  title: 'AI Gantikan Desainer?',
  excerpt:
    'Banyak yang takut AI akan menggantikan desainer. Padahal AI bukan musuh, melainkan alat bantu yang mempercepat proses kerja jika digunakan dengan benar.',
  content: `
Isu tentang AI menggantikan desainer sering muncul.
Banyak yang khawatir profesi kreatif akan hilang karena teknologi.

Faktanya, AI tidak menggantikan ide.
AI hanya mempercepat proses teknis yang sebelumnya memakan waktu lama.

Dalam dunia desain, AI bisa membantu:
• Generate ide awal
• Mempercepat eksplorasi visual
• Mengotomatisasi pekerjaan repetitif

Namun, AI tidak punya rasa, empati, dan konteks budaya.
Keputusan akhir tetap ada di tangan manusia.

Yang benar-benar berisiko bukan desainer itu sendiri,
melainkan mereka yang menolak belajar dan beradaptasi dengan teknologi baru.
  `,
  date: '12 Jan 2026',
  reference: [
    'https://www.adobe.com/sensei/generative-ai.html',
    'https://www.mckinsey.com/featured-insights/artificial-intelligence'
  ],
},
{
  category: 'AI Teknologi',
  title: 'Kenapa AI Lagi Ramai Banget?',
  excerpt:
    'AI sekarang bukan lagi teknologi eksklusif orang IT. Siapa pun bisa memakainya untuk membantu pekerjaan sehari-hari.',
  content: `
AI menjadi ramai dibicarakan karena teknologinya semakin mudah diakses.
Dulu AI identik dengan coding rumit dan perusahaan besar.
Sekarang, AI bisa dipakai lewat aplikasi sederhana.

Alasan AI cepat populer antara lain:
• Mudah digunakan oleh siapa saja
• Menghemat waktu kerja
• Bisa diterapkan di banyak bidang
• Hasilnya langsung terasa

Mulai dari pelajar, UMKM, kreator konten,
hingga pebisnis, semuanya bisa memanfaatkan AI.

Teknologi yang dulunya rumit,
kini benar-benar turun ke tangan semua orang.
  `,
  date: '11 Jan 2026',
  reference: [
    'https://www.weforum.org/agenda/2023/06/artificial-intelligence-everyday-life/',
    'https://www.ibm.com/topics/artificial-intelligence'
  ],
},
{
  category: 'AI Teknologi',
  title: 'AI Itu Cuma Alat, Bukan Otak',
  excerpt:
    'Walaupun terlihat pintar, AI tetap tidak bisa berpikir seperti manusia. AI hanya bekerja berdasarkan data dan perintah.',
  content: `
AI sering dianggap seperti memiliki otak sendiri.
Padahal kenyataannya, AI tidak benar-benar berpikir.

AI tidak punya:
• Empati
• Intuisi
• Nilai moral
• Pengalaman hidup

AI hanya mengolah data berdasarkan pola yang ada.
Ia bisa membantu analisis,
tapi tidak bisa mengambil keputusan etis.

AI kuat di data dan kecepatan.
Manusia tetap unggul dalam konteks, empati, dan keputusan akhir.
  `,
  date: '10 Jan 2026',
  reference: [
    'https://hbr.org/2022/07/what-ai-can-and-cant-do',
    'https://www.britannica.com/technology/artificial-intelligence'
  ],
},
{
  category: 'AI Teknologi',
  title: 'Pekerjaan Apa yang Terbantu oleh AI?',
  excerpt:
    'AI tidak mengambil pekerjaan, tapi membantu banyak profesi agar bekerja lebih efisien dan produktif.',
  content: `
Banyak orang takut kehilangan pekerjaan karena AI.
Padahal dalam praktiknya, AI lebih sering membantu daripada menggantikan.

Beberapa bidang yang sangat terbantu oleh AI:
• Desain grafis dan multimedia
• Penulisan dan content creation
• Analisis data dan laporan
• Customer service dan chatbot
• Marketing dan riset pasar

Dengan AI, pekerjaan menjadi lebih cepat dan terstruktur.
Orang yang adaptif justru bisa mengerjakan lebih banyak hal dengan kualitas lebih baik.

AI bukan pengganti manusia,
tapi alat peningkat produktivitas.
  `,
  date: '9 Jan 2026',
  reference: [
    'https://www.mckinsey.com/capabilities/quantumblack/our-insights',
    'https://www.weforum.org/reports/future-of-jobs-report-2023'
  ],
},
{
  category: 'AI Teknologi',
  title: 'AI Bisa Bikin Orang Malas?',
  excerpt:
    'AI bisa meningkatkan produktivitas, tapi juga berpotensi membuat malas jika digunakan tanpa pemikiran kritis.',
  content: `
Seperti teknologi lain, AI bersifat netral.
Dampaknya tergantung pada cara penggunaan.

Jika digunakan dengan benar, AI bisa:
• Menghemat waktu
• Membantu fokus ke ide besar
• Mengurangi pekerjaan repetitif

Namun jika digunakan tanpa berpikir,
AI bisa membuat orang terlalu bergantung dan malas berpikir.

AI seharusnya menjadi asisten,
bukan pengganti proses berpikir manusia.
  `,
  date: '8 Jan 2026',
  reference: [
    'https://www.psychologytoday.com/us/blog/human-ai',
    'https://www.nature.com/articles/d41586-023-00001-7'
  ],
},
{
  category: 'AI Teknologi',
  title: 'AI Cocok Buat UMKM?',
  excerpt:
    'Justru UMKM adalah pihak yang paling diuntungkan oleh AI karena bisa bekerja lebih efisien dengan modal kecil.',
  content: `
UMKM sering terkendala modal dan tenaga kerja.
Di sinilah AI bisa menjadi solusi.

AI bisa membantu UMKM dalam hal:
• Membuat konten promosi
• Membalas chat pelanggan otomatis
• Riset pasar dan tren
• Membuat deskripsi produk

Dengan biaya yang relatif kecil,
UMKM bisa mendapatkan dampak yang besar.

AI membuka kesempatan bagi bisnis kecil
untuk bersaing secara lebih profesional.
  `,
  date: '7 Jan 2026',
  reference: [
    'https://www.forbes.com/small-business/ai-for-small-business/',
    'https://www.shopify.com/blog/ai-for-small-business'
  ],
},
{
  category: 'AI Teknologi',
  title: 'AI dan Etika: Perlu Takut?',
  excerpt:
    'AI sangat kuat, tapi tetap membutuhkan pengawasan manusia agar digunakan secara bertanggung jawab.',
  content: `
AI memang membawa banyak manfaat,
namun juga memiliki risiko.

AI bisa:
• Menghasilkan bias
• Menyebarkan informasi keliru
• Digunakan untuk tujuan tidak etis

Karena itu, etika dalam penggunaan AI sangat penting.
Manusia tetap memegang kendali penuh atas keputusan akhir.

AI hanyalah alat.
Tanggung jawab moral tetap berada di tangan manusia.
  `,
  date: '6 Jan 2026',
  reference: [
    'https://www.unesco.org/en/artificial-intelligence/ethics',
    'https://www.oecd.org/digital/ai/principles/'
  ],
},
{
  category: 'AI Teknologi',
  title: 'Kenapa AI Tidak Bisa Gantikan Kreativitas?',
  excerpt:
    'AI mampu meniru pola lama, tapi kreativitas sejati lahir dari pengalaman, emosi, dan intuisi manusia.',
  content: `
AI belajar dari data masa lalu.
Ia mengolah apa yang sudah ada.

Manusia berbeda.
Manusia mampu menciptakan sesuatu yang benar-benar baru.

Kreativitas membutuhkan:
• Rasa
• Emosi
• Konteks budaya
• Pengalaman hidup

AI bisa membantu proses kreatif,
tapi sumber kreativitas tetap berasal dari manusia.
  `,
  date: '5 Jan 2026',
  reference: [
    'https://www.fastcompany.com/ai-creativity',
    'https://www.forbes.com/sites/forbestechcouncil/2023/ai-and-creativity/'
  ],
},
{
  category: 'AI Teknologi',
  title: 'AI di Kehidupan Sehari-hari',
  excerpt:
    'Tanpa disadari, AI sudah menjadi bagian dari kehidupan kita sehari-hari.',
  content: `
Banyak orang mengira AI adalah teknologi masa depan.
Padahal AI sudah kita gunakan setiap hari.

Contoh AI di kehidupan sehari-hari:
• Kamera smartphone
• Rekomendasi video dan musik
• Navigasi maps
• Chatbot layanan pelanggan

AI sudah sangat dekat dengan kehidupan kita.
Bukan teknologi yang jauh,
melainkan alat yang sudah menyatu dengan aktivitas harian.
  `,
  date: '4 Jan 2026',
  reference: [
    'https://www.sciencedirect.com/topics/artificial-intelligence',
    'https://www.ibm.com/blogs/watson/ai-in-daily-life/'
  ],
},
{
  category: 'AI Teknologi',
  title: 'Belajar AI Harus Jago Coding?',
  excerpt:
    'Belajar AI saat ini tidak selalu harus jago coding. Yang lebih penting adalah cara berpikir dan pemahaman konsep.',
  content: `
Dulu belajar AI identik dengan coding rumit.
Sekarang kondisinya sudah berbeda.

Banyak tools AI yang bisa digunakan tanpa coding.
Yang penting adalah:
• Mengetahui tujuan penggunaan
• Memahami batasan AI
• Bisa memberikan instruksi yang tepat

Kemampuan berpikir kritis dan problem solving
jauh lebih penting daripada sekadar skill teknis.
  `,
  date: '3 Jan 2026',
  reference: [
    'https://www.coursera.org/articles/what-is-ai',
    'https://www.edx.org/learn/artificial-intelligence'
  ],
},
{
  category: 'AI Teknologi',
  title: 'AI Bikin Kerja Lebih Produktif',
  excerpt:
    'AI membantu manusia bekerja lebih cepat dan efisien, sehingga fokus bisa dialihkan ke hal-hal strategis.',
  content: `
AI sangat efektif untuk meningkatkan produktivitas.
Bukan untuk menambah beban kerja,
tapi untuk meringankannya.

AI bisa membantu:
• Otomatisasi tugas rutin
• Membuat draft atau ide awal
• Meringkas data dan laporan

Dengan begitu, manusia bisa fokus pada analisis,
strategi, dan pengambilan keputusan.

Kerja jadi lebih cepat,
bukan lebih berat.
  `,
  date: '2 Jan 2026',
  reference: [
    'https://openai.com/research',
    'https://hbr.org/2023/04/how-ai-will-change-work'
  ],
},
{
  category: 'AI Teknologi',
  title: 'Masa Depan AI: Harus Takut atau Siap?',
  excerpt:
    'AI akan terus berkembang. Pilihannya bukan takut atau tidak, tapi siap atau tertinggal.',
  content: `
Perkembangan AI tidak bisa dihentikan.
Teknologi akan terus maju, cepat atau lambat.

Pilihan yang kita miliki hanya dua:
• Menolak dan tertinggal
• Belajar dan beradaptasi

Mereka yang mau belajar akan unggul.
Mereka yang menutup diri akan kesulitan.

Masa depan bukan milik yang paling pintar,
tapi milik mereka yang paling siap.
  `,
  date: '1 Jan 2026',
  reference: [
    'https://www.weforum.org/agenda/2024/ai-future/',
    'https://www.mckinsey.com/featured-insights/future-of-work'
  ],
},

// ======================
// BISNIS MANAGEMENT
// ======================
{
  category: 'Bisnis Management',
  title: 'Brand Kecil Bisa Kelihatan Mahal',
  excerpt:
    'Banyak orang mengira brand mahal harus punya modal besar. Padahal UMKM pun bisa terlihat profesional dan bernilai tinggi dengan strategi yang tepat.',
  content: `
Brand yang terlihat mahal tidak selalu lahir dari budget besar.
Yang paling menentukan adalah persepsi yang dibangun di mata pelanggan.

Brand kecil bisa terlihat mahal jika:
• Punya identitas yang jelas
• Konsisten dalam komunikasi
• Tidak asal-asalan dalam tampilan
• Tahu posisi di pasar

Sering kali bisnis kecil kalah bukan karena produk,
tapi karena cara mereka menampilkan diri.

Strategi branding yang tepat mampu mengangkat nilai bisnis,
bahkan sebelum pelanggan mencoba produknya.

Ingat, orang membeli persepsi sebelum membeli produk.
  `,
  date: '6 Jan 2026',
  reference: [
    'https://www.shopify.com/blog/branding',
    'https://www.forbes.com/small-business/branding/'
  ],
},
{
  category: 'Bisnis Management',
  title: 'Kenapa Branding Itu Investasi?',
  excerpt:
    'Branding bukan sekadar tampilan, tapi aset jangka panjang yang membuat bisnis lebih kuat dan tahan terhadap persaingan.',
  content: `
Banyak pelaku bisnis menganggap branding sebagai biaya.
Padahal branding adalah investasi jangka panjang.

Brand yang kuat biasanya memiliki:
• Tingkat kepercayaan tinggi
• Harga yang lebih fleksibel
• Loyalitas pelanggan yang kuat
• Daya tahan saat pasar berubah

Branding membantu bisnis tidak hanya dikenal,
tapi juga diingat dan dipilih.

Bisnis dengan brand kuat tidak mudah terguncang
meski muncul banyak kompetitor baru.

Branding bukan pengeluaran,
melainkan aset yang terus memberi nilai.
  `,
  date: '5 Jan 2026',
  reference: [
    'https://hbr.org/2017/01/the-value-of-branding',
    'https://www.investopedia.com/terms/b/brand-equity.asp'
  ],
},
{
  category: 'Bisnis Management',
  title: 'Bisnis Ramai Belum Tentu Untung',
  excerpt:
    'Omzet besar sering disalahartikan sebagai kesuksesan, padahal tanpa pengelolaan yang baik, bisnis tetap bisa merugi.',
  content: `
Banyak bisnis terlihat ramai dan sibuk setiap hari.
Namun sayangnya, tidak semua menghasilkan keuntungan.

Omzet besar tidak selalu berarti untung.
Masalah sering muncul karena:
• Biaya operasional tidak terkontrol
• Salah hitung harga jual
• Pengelolaan keuangan yang berantakan

Bisnis yang sehat bukan yang paling ramai,
tapi yang pengelolaannya rapi dan terukur.

Keuntungan datang dari manajemen yang baik,
bukan sekadar keramaian.
  `,
  date: '4 Jan 2026',
  reference: [
    'https://www.investopedia.com/terms/p/profit.asp',
    'https://www.entrepreneur.com/business-news/why-revenue-doesnt-mean-profit/430522'
  ],
},
{
  category: 'Bisnis Management',
  title: 'Kenapa Banyak Bisnis Tutup di Tahun Pertama?',
  excerpt:
    'Banyak bisnis gagal bukan karena ide buruk, melainkan karena kurangnya perencanaan dan pengelolaan.',
  content: `
Tahun pertama adalah fase paling krusial dalam bisnis.
Banyak bisnis tutup bukan karena produknya jelek,
melainkan karena manajemennya lemah.

Beberapa penyebab utama bisnis gagal:
• Salah menghitung modal dan biaya
• Tidak memahami target pasar
• Strategi pemasaran tidak jelas
• Pengelolaan keuangan yang buruk

Ide yang bagus tidak akan bertahan
tanpa pengelolaan yang matang.

Bisnis bukan hanya soal jualan,
tapi juga soal mengatur dan mengambil keputusan.
  `,
  date: '3 Jan 2026',
  reference: [
    'https://www.investopedia.com/articles/personal-finance/040915/why-small-businesses-fail.asp',
    'https://www.cbinsights.com/research/startup-failure-reasons/'
  ],
},
{
  category: 'Bisnis Management',
  title: 'Harga Murah Bukan Solusi Jangka Panjang',
  excerpt:
    'Menurunkan harga mungkin menarik pelanggan di awal, tapi sering kali justru melelahkan dan merusak bisnis dalam jangka panjang.',
  content: `
Banyak bisnis terjebak dalam perang harga.
Mereka berlomba-lomba menjadi yang paling murah.

Di awal, strategi ini memang terlihat efektif.
Namun dalam jangka panjang, dampaknya melelahkan.

Harga murah sering menyebabkan:
• Margin keuntungan menipis
• Tekanan operasional tinggi
• Bisnis sulit berkembang

Pelanggan tidak selalu mencari yang paling murah.
Mereka mencari nilai dan manfaat.

Bisnis yang bertahan adalah bisnis
yang mampu menawarkan nilai,
bukan sekadar harga rendah.
  `,
  date: '2 Jan 2026',
  reference: [
    'https://www.forbes.com/sites/forbesbusinesscouncil/2021/08/30/why-competing-on-price-is-a-losing-strategy/',
    'https://hbr.org/2015/01/the-strategy-that-will-fix-health-care'
  ],
},
{
  category: 'Bisnis Management',
  title: 'Kenapa Pelanggan Setia Lebih Penting?',
  excerpt:
    'Mendapatkan pelanggan baru itu mahal. Menjaga pelanggan lama justru lebih hemat dan menguntungkan.',
  content: `
Banyak bisnis terlalu fokus mencari pelanggan baru,
sampai lupa menjaga pelanggan lama.

Padahal pelanggan setia memiliki peran besar:
• Melakukan pembelian berulang
• Memberi rekomendasi gratis
• Lebih percaya pada brand

Menjaga pelanggan lama jauh lebih murah
dibandingkan mencari pelanggan baru.

Bisnis yang bertahan lama
biasanya dibangun dari loyalitas,
bukan sekadar transaksi sesaat.
  `,
  date: '1 Jan 2026',
  reference: [
    'https://www.forbes.com/sites/forbesbusinesscouncil/2020/01/07/customer-loyalty/',
    'https://www.investopedia.com/terms/c/customer_retention.asp'
  ],
},


]


/* =========================
   COMPONENT
========================= */

export default function BlogUI() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [selectedArticle, setSelectedArticle] = useState(null)

  const filteredArticles = articles.filter((post) => {
    const matchCategory =
      activeCategory === 'All' || post.category === activeCategory
    const matchSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase())

    return matchCategory && matchSearch
  })

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ================= HERO ================= */}
      <section className="px-6 pt-20 pb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-semibold mb-4">
          Blog & Insight
        </h1>
        <p className="max-w-2xl mx-auto text-gray-600 text-lg">
          Catatan pemikiran, pengalaman, dan insight seputar desain, teknologi,
          AI, dan bisnis digital.
        </p>
      </section>

      {/* ================= CATEGORY ================= */}
      <section className="px-6 pb-10">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-3 justify-center">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2 rounded-full text-sm border transition
                ${
                  activeCategory === cat.key
                    ? 'bg-black text-white'
                    : 'bg-white hover:bg-gray-100'
                }`}
            >
              {cat.icon} {cat.title}
            </button>
          ))}
        </div>
      </section>

      {/* ================= SEARCH + ARTICLE ================= */}
<section className="px-6 pb-28">
  <div className="max-w-6xl mx-auto">
    {/* Header */}
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Artikel Terbaru
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Insight seputar desain, web, AI, dan bisnis
        </p>
      </div>

      {/* Search */}
      <div className="relative w-full md:w-72">
        <input
          type="text"
          placeholder="Cari artikel..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border px-5 py-3 pr-12 text-sm
          focus:ring-2 focus:ring-black focus:border-black
          transition"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
          🔍
        </span>
      </div>
    </div>

    {/* Empty State */}
{filteredArticles.length === 0 && (
  <div className="flex flex-col items-center justify-center py-28 text-center">
    <motion.div
      className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100"
      animate={{ y: [0, -10, 0] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <span className="text-3xl">🔍</span>
    </motion.div>

    <h2 className="text-2xl font-bold text-gray-800">
      Artikel Tidak Ditemukan
    </h2>

    <p className="mt-3 max-w-md text-base text-gray-500">
      Hasil pencarian tidak menampilkan artikel apa pun.
    </p>

    <p className="mt-1 text-sm text-gray-400">
      Coba ganti keyword atau eksplor topik lainnya.
    </p>
  </div>
)}

    {/* Articles */}
    <div className="grid gap-8 sm:grid-cols-2">
      {filteredArticles.map((post, i) => (
        <article
          key={i}
          className="group bg-white p-7 rounded-3xl border
          hover:shadow-xl hover:-translate-y-1
          transition-all duration-300"
        >
          {/* Category */}
          <span className="inline-block mb-4 text-xs font-medium
          px-4 py-1 rounded-full
          bg-black/5 text-black">
            {post.category}
          </span>

          {/* Title */}
          <h3 className="text-xl font-semibold mb-3
          group-hover:underline underline-offset-4">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            {post.excerpt}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">{post.date}</span>
            <button
              onClick={() => setSelectedArticle(post)}
              className="font-medium text-black
              flex items-center gap-1
              group-hover:gap-2 transition-all"
            >
              Baca
              <span className="transition">→</span>
            </button>
          </div>
        </article>
      ))}
    </div>
  </div>
</section>

      {/* ================= MODAL ================= */}
      {selectedArticle && (
        <div
          onClick={() => setSelectedArticle(null)}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white max-w-2xl w-full rounded-3xl p-8 relative
            max-h-[85vh] overflow-y-auto shadow-2xl"
          >
            {/* Close */}
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black text-lg"
            >
              ✕
            </button>

            {/* Category */}
            <span
              className="inline-block mb-4 text-xs font-medium
              px-3 py-1 rounded-full bg-black/5 text-black"
            >
              {selectedArticle.category}
            </span>

            {/* Title */}
            <h2 className="text-2xl font-semibold mb-2 leading-snug">
              {selectedArticle.title}
            </h2>

            {/* Date */}
            <p className="text-sm text-gray-400 mb-6">
              {selectedArticle.date}
            </p>

            {/* Content */}
            <div className="text-gray-700 leading-relaxed whitespace-pre-line mb-10">
              {selectedArticle.content}
            </div>

            {/* Reference */}
            {selectedArticle.reference &&
              selectedArticle.reference.length > 0 && (
                <div className="border-t pt-6">
                  <h4 className="text-sm font-semibold mb-3 text-gray-800">
                    Referensi
                  </h4>

                  <ul className="space-y-2">
                    {selectedArticle.reference.map((ref, idx) => (
                      <li key={idx}>
                        <a
                          href={ref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gray-600 hover:text-black
                          flex items-center gap-2 transition"
                        >
                          <span className="text-gray-400">↗</span>
                          <span className="truncate">
                            {new URL(ref).hostname.replace('www.', '')}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </div>
      )}
    </main>
  )
}
