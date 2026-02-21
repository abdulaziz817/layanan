'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import PwaOnly from "../../guards/PwaOnly.jsx"








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

Semakin sederhana sebuah desain, semakin besar tuntutan kejelasan.
Tidak ada elemen yang bisa bersembunyi. Semua terlihat jelas.

Desainer harus memilih apa yang penting, apa yang tidak, dan bagaimana
menyampaikan pesan dengan cara paling ringkas tapi tetap kuat.

Di balik desain minimalis biasanya ada proses panjang:
• Riset brand dan nilai bisnisnya  
• Analisis target audiens  
• Eksplorasi puluhan konsep  
• Penyederhanaan visual berulang  
• Uji konsistensi di berbagai media  

Penyederhanaan bukan mengurangi kualitas.
Penyederhanaan adalah menyaring esensi.

Desain simpel juga menuntut presisi tinggi.
Spacing, ukuran font, kontras warna, hingga hierarki visual harus tepat.
Kesalahan kecil langsung terasa.

Brand besar memahami hal ini.
Mereka tidak membayar “gambar sederhana”.
Mereka membayar kejelasan pesan, kekuatan identitas, dan konsistensi jangka panjang.

Karena dalam dunia branding,
yang sederhana justru paling sulit dibuat.
  `,
  date: '12 Jan 2026',
  reference: [
    'https://glints.com/id/lowongan/gaya-desain-grafis-minimalis/'
  ],
},
{
  category: 'Desain Grafis',
  title: 'Logo Mahal vs Logo Murah, Bedanya Di Mana?',
  excerpt:
    'Perbedaan logo mahal dan logo murah bukan cuma di harga, tapi di proses, pemikiran, dan dampak bisnis yang dihasilkan dalam jangka panjang.',
  content: `
Banyak orang masih mengira logo hanyalah gambar.
Padahal logo adalah identitas paling dasar sebuah brand.

Logo adalah hal pertama yang diingat orang.
Ia muncul di produk, website, kemasan, media sosial, bahkan pengalaman pelanggan.

Logo mahal biasanya melalui proses strategis:
• Diskusi mendalam tentang visi brand  
• Analisis kompetitor  
• Eksplorasi filosofi visual  
• Pengujian fleksibilitas  
• Penyusunan brand guideline  

Logo profesional tidak hanya terlihat bagus,
tetapi tetap kuat saat diperkecil, dicetak, atau dipakai bertahun-tahun.

Sebaliknya, logo murah sering fokus pada tampilan cepat.
Yang penting jadi, tanpa memikirkan keberlanjutan.

Masalahnya, logo yang tidak dirancang dengan strategi
sering harus diganti dalam waktu singkat.
Dan itu justru lebih mahal.

Logo mahal bukan soal gengsi.
Logo mahal adalah fondasi komunikasi bisnis.

Brand kuat dimulai dari simbol yang kuat.
  `,
  date: '11 Jan 2026',
  reference: [
    'https://mangcoding.com/id/seni-logo-minimalis-kesederhanaan-yang-menguatkan-identitas-brand/'
  ],
},
{
  category: 'Desain Grafis',
  title: 'Kesalahan Desain yang Bikin Brand Terlihat Murahan',
  excerpt:
    'Kesalahan kecil dalam desain bisa berdampak besar pada citra brand. Tanpa disadari, desain yang salah bisa membuat bisnis terlihat tidak profesional.',
  content: `
Desain adalah bahasa visual brand.
Dan seperti bahasa, kesalahan kecil bisa mengubah makna.

Banyak bisnis sebenarnya punya produk bagus,
tapi desainnya membuat brand terlihat kurang meyakinkan.

Kesalahan desain yang sering terjadi:
• Terlalu banyak font  
• Warna tidak konsisten  
• Layout berantakan  
• Visual tidak relevan  
• Copywriting lemah  

Masalah utamanya bukan estetika,
tetapi persepsi.

Audiens menilai profesionalitas hanya dalam beberapa detik.
Jika desain terasa tidak rapi, kepercayaan ikut turun.

Kesalahan lain adalah meniru tren tanpa strategi.
Desain terlihat modern hari ini, tapi cepat usang.

Desain yang baik bukan mengikuti tren,
melainkan memperkuat karakter brand.

Brand kuat terlihat konsisten.
Dan konsistensi lahir dari keputusan desain yang sadar, bukan kebetulan.

Desain bukan hiasan.
Desain adalah pengalaman pertama pelanggan.
  `,
  date: '10 Jan 2026',
  reference: [
    'https://maxgrup.co.id/desain-grafis-kunci-kesuksesan-visual/'
  ],
},





{
  category: 'Desain Grafis',
  title: 'Kenapa Konsistensi Visual Itu Wajib?',
  excerpt:
    'Konsistensi visual bukan sekadar soal tampilan, tapi soal membangun kepercayaan, pengenalan brand, dan pengalaman yang stabil di benak audiens.',
  content: `
Coba perhatikan brand besar yang kamu kenal.
Tanpa melihat nama, sering kali kamu sudah tahu itu brand apa hanya dari warna atau gaya visualnya.

Itulah kekuatan konsistensi visual.

Konsistensi membuat brand terasa stabil.
Dan stabilitas melahirkan kepercayaan.

Banyak bisnis kecil melakukan kesalahan yang sama:
setiap posting terlihat seperti brand yang berbeda.
Hari ini minimalis, besok ramai, minggu depan ganti warna total.

Akibatnya audiens tidak punya sesuatu untuk diingat.

Konsistensi visual membantu brand:
• Mudah dikenali dalam hitungan detik  
• Terlihat lebih profesional  
• Membangun kepercayaan jangka panjang  
• Memperkuat positioning di pasar  
• Mengurangi kebingungan audiens  

Konsistensi bukan berarti monoton.
Justru konsistensi memberi ruang eksplorasi yang terarah.

Warna brand tetap sama, tapi konten bisa berkembang.
Font tetap sama, tapi layout bisa variatif.
Gaya ilustrasi tetap sama, tapi pesan terus berubah.

Brand besar jarang mengganti identitas inti.
Mereka memperkuatnya.

Karena pengenalan tidak lahir dari perubahan,
tetapi dari pengulangan yang konsisten.

Pada akhirnya, konsistensi visual adalah investasi memori.
Semakin konsisten sebuah brand muncul,
semakin mudah ia diingat.
  `,
  date: '9 Jan 2026',
  reference: [
    'https://www.sribu.com/id/blog/konsistensi-branding/',
    'https://www.niagahoster.co.id/blog/brand-identity/'
  ],
},
{
  category: 'Desain Grafis',
  title: 'Desain Bagus Itu Menjual, Bukan Cuma Indah',
  excerpt:
    'Desain yang efektif tidak berhenti di estetika. Ia mengarahkan perhatian, membangun emosi, dan mendorong audiens mengambil tindakan.',
  content: `
Banyak desain terlihat cantik,
tapi tidak menghasilkan apa pun.

Tidak ada klik.
Tidak ada pembelian.
Tidak ada interaksi.

Masalahnya bukan di keindahan.
Masalahnya di fungsi.

Desain yang baik selalu punya tujuan.
Ia membantu orang memahami sesuatu dengan cepat.

Desain yang menjual biasanya memiliki karakter:
• Hierarki visual jelas  
• Fokus ke pesan utama  
• Navigasi mudah dipahami  
• Emosi yang relevan dengan audiens  
• Call-to-action terlihat jelas  

Desain bukan dekorasi.
Desain adalah alat komunikasi.

Ketika desain hanya fokus terlihat bagus,
ia berhenti sebagai karya visual.
Tetapi ketika desain membantu orang mengambil keputusan,
ia berubah menjadi alat bisnis.

Brand sukses memahami hal ini.
Mereka tidak bertanya “bagus atau tidak”.
Mereka bertanya “berfungsi atau tidak”.

Keindahan tetap penting,
karena keindahan menarik perhatian.
Namun fungsi adalah yang mengubah perhatian menjadi aksi.

Desain yang menjual adalah desain yang mengurangi friksi.
Ia membuat proses memahami, percaya, dan membeli terasa lebih mudah.

Di situlah nilai sebenarnya dari desain.
  `,
  date: '8 Jan 2026',
  reference: [
    'https://glints.com/id/lowongan/desain-grafis-adalah/',
    'https://idseducation.com/articles/peran-desain-grafis-dalam-bisnis/'
  ],
},
{
  category: 'Desain Grafis',
  title: 'Kenapa Brand Besar Jarang Pakai Desain Ramai?',
  excerpt:
    'Kesederhanaan dalam desain sering menjadi tanda kedewasaan brand. Visual yang bersih membuat pesan lebih kuat dan mudah diingat.',
  content: `
Ketika brand masih baru, sering ada dorongan untuk “terlihat menarik”.
Hasilnya desain jadi ramai.

Banyak warna.
Banyak efek.
Banyak elemen.

Tujuannya satu: menarik perhatian.

Namun brand besar melakukan hal sebaliknya.
Mereka mengurangi.

Bukan karena kekurangan ide,
tetapi karena mereka memahami fokus.

Desain ramai membuat audiens bekerja lebih keras.
Otak harus memilah mana yang penting.
Dan ketika terlalu banyak yang bersaing,
pesan utama hilang.

Brand besar memilih kejelasan.

Ciri desain brand matang:
• Ruang kosong digunakan dengan sengaja  
• Elemen visual terbatas tapi kuat  
• Fokus langsung ke pesan utama  
• Navigasi mudah  
• Pengalaman terasa ringan  

Kesederhanaan menunjukkan kepercayaan diri.
Brand tidak perlu berteriak jika identitasnya sudah jelas.

Desain ramai sering lahir dari rasa takut tidak diperhatikan.
Sedangkan desain sederhana lahir dari keyakinan.

Itulah kenapa banyak brand global terlihat “tenang”.
Visual mereka tidak memaksa perhatian,
tetapi tetap menempel di ingatan.

Dalam desain, lebih banyak bukan berarti lebih baik.
Sering kali, lebih sedikit justru lebih kuat.
  `,
  date: '7 Jan 2026',
  reference: [
    'https://idseducation.com/articles/desain-minimalis/',
    'https://www.niagahoster.co.id/blog/desain-minimalis/'
  ],
},


// ======================
// WEB DEVELOPMENT (8 ARTIKEL – DASAR & AWAM)
// ======================
{
  category: 'Web Development',
  title: 'Apa Itu Website dan Kenapa Bisnis Butuh?',
  excerpt:
    'Website bukan sekadar pajangan online. Website adalah identitas digital, pusat informasi, dan fondasi kepercayaan yang membantu calon pelanggan memahami bisnis sebelum membeli.',
  content: `
Website adalah representasi bisnis di dunia digital.
Di era ketika hampir semua keputusan dimulai dari pencarian Google,
website sering menjadi kesan pertama sebuah brand.

Saat seseorang mendengar nama bisnis,
hal pertama yang dilakukan biasanya adalah mencari.
Jika yang ditemukan hanya akun media sosial yang tidak jelas,
kepercayaan pun belum terbentuk.

Website hadir untuk menjawab keraguan itu.

Website adalah “rumah digital”.
Tempat bisnis menjelaskan siapa mereka, apa yang mereka tawarkan,
dan kenapa orang harus percaya.

Dengan website, bisnis terlihat:
• Lebih profesional  
• Lebih serius  
• Lebih kredibel  
• Lebih mudah ditemukan  
• Lebih siap berkembang  

Website berfungsi sebagai pusat informasi.
Di satu tempat, pelanggan bisa menemukan:
• Profil bisnis  
• Produk atau layanan  
• Portofolio  
• Testimoni  
• Kontak  
• Artikel edukasi  

Tanpa website, informasi bisnis tersebar di banyak tempat.
Ini membuat calon pelanggan harus bekerja lebih keras untuk memahami brand.

Dan ketika proses memahami terasa sulit,
banyak orang memilih pergi.

Website mengurangi friksi.
Ia membuat proses mengenal bisnis terasa mudah.

Selain itu, website memberi kontrol penuh.
Berbeda dengan platform pihak ketiga,
website adalah aset digital milik sendiri.

Bisnis bisa menentukan:
• Tampilan  
• Struktur informasi  
• Strategi konten  
• Pengalaman pengguna  
• Integrasi sistem  

Website juga bekerja 24 jam.
Ia menjelaskan bisnis bahkan ketika kamu sedang tidur.

Inilah yang membuat website menjadi alat bisnis,
bukan sekadar media online.

Bisnis yang punya website tidak hanya terlihat modern.
Mereka terlihat siap dipercaya.

Dan dalam dunia digital,
kepercayaan adalah mata uang utama.
  `,
  date: '12 Jan 2026',
  reference: [
    'https://www.niagahoster.co.id/blog/apa-itu-website/',
    'https://qwords.com/blog/pengertian-website/',
    'https://idcloudhost.com/blog/apa-itu-website/'
  ],
},
{
  category: 'Web Development',
  title: 'Kenapa Website Lebih Dipercaya Daripada Media Sosial?',
  excerpt:
    'Media sosial membantu menjangkau orang. Website membangun kepercayaan. Keduanya penting, tapi website adalah fondasi jangka panjang.',
  content: `
Media sosial membuat bisnis terlihat aktif.
Website membuat bisnis terlihat serius.

Keduanya punya peran berbeda.

Media sosial dirancang untuk distribusi konten cepat.
Website dirancang untuk memberikan pemahaman mendalam.

Masalahnya, banyak bisnis hanya mengandalkan media sosial.
Padahal media sosial bukan aset yang sepenuhnya dimiliki.

Akun bisa:
• Terkena pembatasan  
• Hilang  
• Turun jangkauan karena algoritma  
• Tenggelam oleh konten lain  

Ketika bisnis hanya bergantung pada platform,
kontrol ada di tangan platform.

Website berbeda.

Website adalah aset digital milik sendiri.
Tidak ada algoritma yang menentukan apakah orang boleh melihat informasi bisnis kamu atau tidak.

Website memberi stabilitas.

Dari sudut pandang pelanggan,
website juga terasa lebih resmi.
Informasi tersusun rapi, tidak tercecer seperti feed media sosial.

Di website, pelanggan bisa:
• Membaca detail layanan  
• Melihat portofolio lengkap  
• Memahami proses kerja  
• Melihat bukti sosial  
• Menghubungi langsung  

Website mengurangi ketidakpastian.
Dan semakin kecil ketidakpastian,
semakin besar kepercayaan.

Media sosial cocok untuk menarik perhatian.
Website cocok untuk mengubah perhatian menjadi keputusan.

Brand besar jarang memilih salah satu.
Mereka menggunakan keduanya.

Media sosial membawa orang masuk.
Website menjelaskan alasan untuk tinggal.

Dalam strategi digital modern,
website bukan pengganti media sosial.
Website adalah fondasinya.

Karena platform bisa berubah.
Akun bisa hilang.
Tren bisa berganti.

Tetapi aset digital milik sendiri akan selalu bernilai.

Dan itulah alasan website tetap menjadi simbol kepercayaan bisnis.
  `,
  date: '11 Jan 2026',
  reference: [
    'https://www.niagahoster.co.id/blog/manfaat-website-untuk-bisnis/',
    'https://www.dewaweb.com/blog/pentingnya-website-untuk-bisnis/',
    'https://www.rumahweb.com/journal/manfaat-website-bagi-bisnis/'
  ],
},


{
  category: 'Web Development',
  title: 'Website Gratis vs Website Profesional',
  excerpt:
    'Website gratis terlihat menarik di awal, tetapi keterbatasannya sering menghambat branding, kepercayaan, dan pertumbuhan bisnis dalam jangka panjang.',
  content: `
Banyak bisnis memulai dari website gratis.
Alasannya sederhana: hemat biaya.

Di tahap awal, ini terasa masuk akal.
Namun seiring bisnis berkembang, keterbatasan mulai terasa.

Website gratis biasanya memiliki ciri:
• Domain tidak meyakinkan  
• Iklan pihak ketiga muncul  
• Fitur terbatas  
• Sulit dikembangkan  
• Kontrol desain minim  

Masalah utamanya bukan teknis,
tetapi persepsi.

Pelanggan menilai profesionalitas dalam hitungan detik.
Alamat website yang panjang dan penuh subdomain sering menurunkan kepercayaan.

Website profesional berbeda sejak awal.
Ia dirancang untuk menjadi aset bisnis.

Fokus website profesional:
• Identitas brand kuat  
• Struktur informasi jelas  
• Pengalaman pengguna nyaman  
• Integrasi marketing  
• Skalabilitas jangka panjang  

Website profesional juga memberi fleksibilitas.
Bisnis bisa menambahkan fitur baru tanpa harus memulai ulang.

Yang sering tidak disadari,
website gratis sering menjadi mahal di kemudian hari.
Karena ketika bisnis tumbuh, migrasi hampir tidak terhindarkan.

Website profesional adalah investasi.
Bukan hanya untuk terlihat bagus,
tetapi untuk membangun fondasi digital yang stabil.

Dalam jangka panjang,
yang murah belum tentu hemat.
Yang tepat justru lebih menguntungkan.
  `,
  date: '10 Jan 2026',
  reference: [
    'https://www.niagahoster.co.id/blog/website-gratis-vs-berbayar/',
    'https://idcloudhost.com/blog/website-gratis-atau-berbayar/',
    'https://qwords.com/blog/perbedaan-website-gratis-dan-berbayar/'
  ],
},
{
  category: 'Web Development',
  title: 'Kenapa Website Harus Bisa Dibuka di HP?',
  excerpt:
    'Mayoritas pengguna internet mengakses website lewat smartphone. Website yang tidak responsif berisiko kehilangan perhatian, kepercayaan, dan peluang bisnis.',
  content: `
Cara orang mengakses internet sudah berubah.
Smartphone menjadi perangkat utama.

Artinya, pengalaman pertama pelanggan kemungkinan terjadi di layar kecil,
bukan di laptop.

Website yang hanya bagus di desktop kini menjadi masalah.
Teks terlalu kecil.
Tombol sulit ditekan.
Navigasi membingungkan.

Pengunjung tidak memperbaiki pengalaman yang buruk.
Mereka pergi.

Website yang tidak responsif bisa menyebabkan:
• Bounce rate tinggi  
• Kepercayaan menurun  
• Interaksi berkurang  
• Konversi turun  

Sebaliknya, website responsif menyesuaikan tampilan secara otomatis.
Layout berubah.
Ukuran elemen menyesuaikan.
Navigasi disederhanakan.

Pengalaman terasa natural.

Responsiveness bukan sekadar tren desain,
tetapi kebutuhan dasar.

Search engine juga mempertimbangkan pengalaman mobile.
Website yang tidak ramah HP berpotensi kalah bersaing.

Website modern harus memikirkan:
• Kecepatan mobile  
• Ukuran teks  
• Jarak antar tombol  
• Struktur konten  
• Prioritas informasi  

Desain untuk mobile memaksa bisnis fokus pada hal penting.
Dan fokus selalu meningkatkan kejelasan.

Di era mobile-first,
website yang tidak ramah smartphone sama seperti toko yang sulit dimasuki.

Orang tidak akan berusaha lebih keras hanya untuk memahami bisnis.
  `,
  date: '9 Jan 2026',
  reference: [
    'https://www.niagahoster.co.id/blog/responsive-web-design/',
    'https://qwords.com/blog/apa-itu-website-responsive/',
    'https://www.dewaweb.com/blog/responsive-web-design/'
  ],
},
{
  category: 'Web Development',
  title: 'Kenapa Website Lambat Bikin Orang Kabur?',
  excerpt:
    'Kecepatan website menentukan kesan pertama. Beberapa detik keterlambatan bisa mengurangi kepercayaan dan menghilangkan peluang bisnis.',
  content: `
Internet membuat orang terbiasa dengan kecepatan.
Informasi harus muncul sekarang.

Ketika website lambat,
pengunjung tidak menunggu.
Mereka kembali ke hasil pencarian dan memilih alternatif.

Website lambat bukan sekadar masalah teknis.
Ia adalah masalah pengalaman.

Dampak website lambat:
• Pengunjung pergi sebelum membaca  
• Tingkat konversi turun  
• Brand terlihat tidak profesional  
• Ranking pencarian terpengaruh  

Kecepatan menciptakan kesan pertama.
Website cepat terasa modern dan terpercaya.
Website lambat terasa usang.

Penyebab website lambat sering sederhana:
• Gambar terlalu besar  
• Hosting tidak memadai  
• Terlalu banyak script  
• Tidak ada optimasi cache  
• Struktur halaman berat  

Bisnis sering fokus pada tampilan,
padahal performa sama pentingnya.

Website cepat membuat proses memahami bisnis terasa ringan.
Dan pengalaman ringan meningkatkan kemungkinan orang bertahan.

Kecepatan juga berhubungan dengan emosi.
Menunggu menciptakan frustrasi.
Kecepatan menciptakan kenyamanan.

Website modern harus dirancang dengan performa sebagai prioritas,
bukan tambahan.

Karena dalam dunia digital,
beberapa detik bisa menentukan apakah seseorang menjadi pelanggan atau tidak.
  `,
  date: '8 Jan 2026',
  reference: [
    'https://www.niagahoster.co.id/blog/kecepatan-website/',
    'https://idcloudhost.com/blog/website-lambat/',
    'https://www.dewaweb.com/blog/website-lambat/'
  ],
},
{
  category: 'Web Development',
  title: 'Website Itu Investasi, Bukan Biaya',
  excerpt:
    'Website bukan pengeluaran sekali pakai. Website adalah aset digital yang terus bekerja, membangun kepercayaan, dan mendukung pertumbuhan bisnis dalam jangka panjang.',
  content: `
Banyak bisnis melihat website seperti membeli brosur digital.
Sekali dibuat, selesai.

Padahal website jauh lebih dari itu.

Website adalah aset.
Ia bekerja setiap hari bahkan ketika bisnis sedang tidak aktif berjualan.

Website menjelaskan bisnis tanpa harus mengulang penjelasan yang sama.
Ia menjawab pertanyaan pelanggan sebelum mereka bertanya.
Ia membangun kepercayaan sebelum percakapan terjadi.

Website bekerja 24 jam:
• Menampilkan layanan  
• Menunjukkan portofolio  
• Mengedukasi calon pelanggan  
• Mengumpulkan leads  
• Mengarahkan keputusan pembelian  

Yang membuat website bernilai adalah akumulasi manfaatnya.

Artikel yang ditulis hari ini bisa mendatangkan pengunjung bertahun-tahun.
Halaman layanan bisa meyakinkan ratusan calon pelanggan.
Testimoni bisa mempercepat keputusan.

Inilah karakter investasi:
manfaatnya berulang.

Website juga berkembang seiring bisnis berkembang.
Fitur baru bisa ditambahkan.
Konten bisa diperluas.
Strategi marketing bisa diintegrasikan.

Berbeda dengan biaya yang habis setelah dibayar,
website terus memberi nilai.

Kesalahan umum adalah menilai website hanya dari harga pembuatan.
Padahal nilai sebenarnya muncul setelah digunakan.

Website membantu:
• Mengurangi waktu menjelaskan  
• Meningkatkan kredibilitas  
• Memperluas jangkauan  
• Menghasilkan peluang baru  
• Mendukung SEO jangka panjang  

Bisnis modern tidak hanya menjual produk,
mereka membangun ekosistem digital.
Website berada di pusat ekosistem itu.

Media sosial berubah.
Platform datang dan pergi.
Tetapi aset digital milik sendiri tetap bertahan.

Website adalah tempat semua strategi bertemu.

Ketika dipandang sebagai investasi,
fokus berubah.
Bukan lagi “berapa murah dibuat”,
tetapi “berapa besar dampaknya”.

Dan dampak website sering jauh melampaui biaya pembuatannya.
  `,
  date: '7 Jan 2026',
  reference: [
    'https://www.dewaweb.com/blog/manfaat-website-untuk-bisnis/',
    'https://www.niagahoster.co.id/blog/keuntungan-memiliki-website/',
    'https://www.rumahweb.com/journal/manfaat-website-bagi-bisnis/'
  ],
},
{
  category: 'Web Development',
  title: 'Apa yang Dicari Orang Saat Buka Website?',
  excerpt:
    'Pengunjung website tidak mencari desain rumit. Mereka mencari kejelasan, kepercayaan, dan jawaban cepat atas kebutuhan mereka.',
  content: `
Ketika seseorang membuka website,
mereka datang dengan tujuan.

Jarang ada orang yang sekadar “melihat-lihat”.
Sebagian besar ingin memahami sesuatu dengan cepat.

Masalahnya, banyak website dirancang dari sudut pandang pemilik,
bukan pengunjung.

Akibatnya informasi penting tersembunyi.

Pengunjung biasanya mencari hal sederhana:
• Apa yang kamu tawarkan  
• Apakah kamu bisa dipercaya  
• Berapa kisaran harga  
• Bagaimana cara menghubungi  
• Bukti hasil kerja  

Jika jawaban tidak ditemukan dalam beberapa detik,
mereka pergi.

Perilaku ini bukan karena pengunjung tidak sabar,
tetapi karena pilihan terlalu banyak.

Website yang efektif memprioritaskan kejelasan.

Ciri website yang memahami pengunjung:
• Judul menjelaskan nilai utama  
• Navigasi sederhana  
• Informasi penting mudah ditemukan  
• Visual mendukung pesan  
• Call-to-action jelas  

Desain bagus membantu menarik perhatian.
Namun struktur informasi menentukan apakah orang bertahan.

Pengunjung tidak ingin membaca semua.
Mereka memindai.

Karena itu website modern menggunakan:
• Hierarki visual  
• Section pendek  
• Headline jelas  
• Bullet points  
• Bukti sosial  

Website juga harus menjawab pertanyaan yang belum ditanyakan.
Ini yang membedakan website biasa dan website strategis.

Website yang baik mengurangi ketidakpastian.
Dan ketika ketidakpastian turun,
kepercayaan naik.

Pada akhirnya,
pengunjung tidak mencari website yang rumit.
Mereka mencari website yang membantu mereka mengambil keputusan lebih cepat.

Kejelasan adalah pengalaman terbaik yang bisa diberikan website.
  `,
  date: '6 Jan 2026',
  reference: [
    'https://www.niagahoster.co.id/blog/user-experience-website/',
    'https://qwords.com/blog/user-experience-adalah/',
    'https://www.dewaweb.com/blog/user-experience-adalah/'
  ],
},


{
  category: 'Web Development',
  title: 'Website Bisa Bantu Jualan Tanpa Maksa',
  excerpt:
    'Website yang dirancang dengan strategi mampu membimbing pengunjung memahami nilai sebuah produk hingga akhirnya membeli tanpa merasa dipaksa.',
  content: `
Banyak orang membayangkan jualan sebagai aktivitas yang agresif.
Tawaran keras.
Diskon besar.
Tekanan untuk segera membeli.

Namun di dunia digital, pendekatan berbeda justru lebih efektif.

Website yang baik tidak memaksa.
Ia membimbing.

Ketika seseorang membuka website,
mereka berada dalam tahap memahami.
Mereka belum siap membeli,
mereka sedang mencari alasan untuk percaya.

Website berperan sebagai pemandu perjalanan itu.

Website yang menjual secara halus biasanya melakukan beberapa hal penting:
• Menjelaskan masalah yang dihadapi audiens  
• Menunjukkan solusi secara jelas  
• Menampilkan manfaat, bukan hanya fitur  
• Memberi bukti sosial  
• Mengurangi keraguan  
• Menyediakan langkah berikutnya yang mudah  

Pendekatan ini disebut persuasi berbasis kejelasan.

Alih-alih mengatakan “beli sekarang”,
website membantu pengunjung sampai pada kesimpulan sendiri.

Dan keputusan yang terasa milik sendiri selalu lebih kuat.

Website juga bekerja dengan ritme pengunjung.
Sebagian orang langsung tertarik.
Sebagian butuh membaca.
Sebagian ingin melihat portofolio.
Sebagian perlu testimoni.

Website memberi ruang untuk semua tipe pengunjung.

Inilah keunggulan website dibanding percakapan langsung:
tidak ada tekanan waktu.

Desain, struktur konten, dan copywriting memainkan peran besar.
Judul menarik perhatian.
Isi membangun pemahaman.
Bukti membangun kepercayaan.
Call-to-action memberi arah.

Website yang memaksa sering terasa seperti iklan.
Website yang membimbing terasa seperti pengalaman.

Perbedaan kecil ini berdampak besar pada konversi.

Bisnis modern tidak hanya menjual produk,
mereka membangun keyakinan.

Website memungkinkan keyakinan itu tumbuh secara bertahap.

Ketika pengunjung merasa dipahami,
mereka bertahan lebih lama.
Ketika mereka bertahan,
peluang meningkat.
Ketika keraguan berkurang,
keputusan menjadi lebih mudah.

Jualan tanpa maksa bukan berarti pasif.
Itu berarti strategis.

Website menjadi sales yang sabar,
konsisten,
dan selalu siap membantu.

Dan dalam banyak kasus,
pendekatan halus justru menghasilkan hubungan pelanggan yang lebih kuat.
  `,
  date: '5 Jan 2026',
  reference: [
    'https://www.niagahoster.co.id/blog/landing-page-adalah/',
    'https://www.dewaweb.com/blog/conversion-rate-optimization/',
    'https://qwords.com/blog/landing-page-adalah/'
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
    'https://www.dicoding.com/blog/kecerdasan-buatan-adalah/',
    'https://bce.telkomuniversity.ac.id/apa-itu-kecerdasan-buatan-ai/',
    'https://www.ibm.com/id-id/think/topics/artificial-intelligence'
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
    'https://cloud.google.com/learn/what-is-artificial-intelligence?hl=id',
    'https://www.ibm.com/id-id/think/topics/artificial-intelligence',
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
   'https://www.dicoding.com/blog/kecerdasan-buatan-adalah/',
    'https://www.britannica.com/technology/artificial-intelligence',
    'https://cloud.google.com/learn/what-is-artificial-intelligence?hl=id'
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
     'https://www.ibm.com/id-id/think/topics/artificial-intelligence',
    'https://openai.com/research/',
    'https://cloud.google.com/learn/what-is-artificial-intelligence?hl=id'
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
    'https://www.dicoding.com/blog/kecerdasan-buatan-adalah/',
    'https://www.ibm.com/id-id/think/topics/artificial-intelligence',
    'https://cloud.google.com/learn/what-is-artificial-intelligence?hl=id'
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
        'https://berita.upi.edu/umkm-dan-ai/',
    'https://sk.unikom.ac.id/pelaksanaan-pkm-dosen-sistem-komputer-pemanfaatan-teknologi-ai-untuk-peningkatan-kualitas-umkm/'

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
    'https://ugm.ac.id/id/berita/23566-fakultas-filsafat-ugm-dan-unesco-susun-prinsip-etis-penggunaan-ai-di-indonesia/'
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
    'https://www.britannica.com/technology/artificial-intelligence',
    'https://www.ibm.com/id-id/think/topics/artificial-intelligence'
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
   'https://binus.ac.id/bandung/2023/11/13-kecerdasan-buatan-yang-kita-gunakan-sehari-hari/',
    'https://primakara.ac.id/blog/info-teknologi/contoh-teknologi-AI'
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
     'https://www.dicoding.com/blog/kecerdasan-buatan-adalah/',
    'https://cloud.google.com/learn/what-is-artificial-intelligence?hl=id'
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
     'https://openai.com/research/',
    'https://www.ibm.com/id-id/think/topics/artificial-intelligence',
    'https://cloud.google.com/learn/what-is-artificial-intelligence?hl=id'
  
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
    'https://openai.com/research/',
    'https://www.ibm.com/id-id/think/topics/artificial-intelligence',
    'https://www.unesco.org/en/artificial-intelligence/ethics'
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
{
  category: 'Bisnis Management',
  title: 'Manajemen Lebih Penting dari Ide Bisnis',
  excerpt:
    'Ide bisnis yang bagus tidak akan bertahan lama tanpa manajemen yang rapi dan terarah.',
  content: `
Banyak orang menghabiskan waktu berbulan-bulan
untuk mencari ide bisnis yang dianggap sempurna.
Padahal, dalam praktiknya, ide biasa dengan
manajemen yang baik justru lebih sering bertahan.

Manajemen berperan penting dalam:
• Mengatur keuangan agar tidak bocor
• Mengelola waktu dan tenaga
• Membagi peran dalam tim
• Mengambil keputusan berbasis data

Tanpa manajemen, bisnis berjalan tanpa arah.
Pemilik usaha sibuk setiap hari, tapi tidak tahu
apakah bisnisnya benar-benar berkembang.

Manajemen membuat bisnis:
• Lebih terkontrol
• Lebih terukur
• Lebih siap menghadapi risiko

Ide bisa ditiru,
tapi manajemen yang rapi adalah keunggulan jangka panjang.
  `,
  date: '31 Des 2025',
  reference: [
    'https://www.jurnal.id/id/blog/manajemen-bisnis-adalah/',
    'https://www.ukmindonesia.id/baca-artikel/62'
  ],
},
{
  category: 'Bisnis Management',
  title: 'Bisnis Tanpa Target Akan Jalan di Tempat',
  excerpt:
    'Target bukan tekanan, melainkan alat agar bisnis terus berkembang.',
  content: `
Target sering dianggap sebagai beban.
Padahal target adalah kompas dalam bisnis.

Tanpa target, bisnis hanya sibuk:
• Melayani pesanan
• Mengejar omzet
• Mengulang rutinitas

Namun tidak pernah tahu:
apakah bisnis ini maju atau stagnan.

Target membantu bisnis untuk:
• Menentukan arah pertumbuhan
• Mengukur keberhasilan
• Menentukan strategi berikutnya

Target tidak harus besar.
Yang penting realistis dan konsisten dievaluasi.

Bisnis yang punya target jelas
lebih cepat berkembang dibanding bisnis
yang berjalan tanpa perencanaan.
  `,
  date: '30 Des 2025',
  reference: [
    'https://www.kompas.com/skola/read/2021/08/05/target-bisnis',
    'https://www.ukmindonesia.id/baca-artikel/306'
  ],
},
{
  category: 'Bisnis Management',
  title: 'Cash Flow Sehat Lebih Penting dari Omzet',
  excerpt:
    'Banyak bisnis terlihat sukses, tapi runtuh karena arus kas yang buruk.',
  content: `
Cash flow adalah aliran darah bisnis.
Tanpa arus kas yang sehat, bisnis bisa berhenti mendadak.

Banyak bisnis bangkrut bukan karena sepi pelanggan,
tetapi karena:
• Pembayaran pelanggan macet
• Biaya operasional terlalu besar
• Tidak ada pencatatan keuangan

Omzet besar tidak menjamin bisnis aman.
Jika pengeluaran lebih cepat dari pemasukan,
masalah hanya menunggu waktu.

Bisnis yang sehat adalah bisnis yang:
• Memahami arus kas masuk dan keluar
• Menyediakan dana cadangan
• Disiplin dalam pencatatan keuangan

Cash flow yang baik
memberi napas panjang bagi bisnis untuk bertahan.
  `,
  date: '29 Des 2025',
  reference: [
    'https://www.jurnal.id/id/blog/cash-flow-adalah/',
    'https://www.niagahoster.co.id/blog/cash-flow/'
  ],
},
{
  category: 'Bisnis Management',
  title: 'Bisnis Kecil Tetap Perlu SOP',
  excerpt:
    'SOP bukan hanya milik perusahaan besar, tapi fondasi agar bisnis kecil lebih rapi.',
  content: `
Banyak pelaku UMKM menganggap SOP itu ribet.
Padahal SOP justru mempermudah pekerjaan.

SOP membantu bisnis:
• Menjaga kualitas layanan
• Mengurangi kesalahan kerja
• Memudahkan pembagian tugas
• Menghemat waktu dan tenaga

Tanpa SOP, semua bergantung pada ingatan.
Jika pemilik tidak hadir, bisnis sering ikut berhenti.

SOP tidak harus rumit.
Cukup tuliskan alur kerja sederhana
yang bisa dipahami semua orang.

Bisnis kecil yang rapi dari awal
akan lebih siap tumbuh menjadi besar.
  `,
  date: '28 Des 2025',
  reference: [
    'https://www.jurnal.id/id/blog/sop-adalah/',
    'https://www.ukmindonesia.id/baca-artikel/117'
  ],
},
{
  category: 'Bisnis Management',
  title: 'Kenapa Banyak UMKM Sulit Naik Kelas?',
  excerpt:
    'Masalah utama UMKM sering kali bukan di produk, tapi di sistem pengelolaan.',
  content: `
Banyak UMKM bertahan bertahun-tahun,
namun sulit berkembang lebih besar.

Masalah yang sering terjadi:
• Keuangan tercampur pribadi
• Tidak ada pencatatan rapi
• Tidak berani menaikkan harga
• Takut merekrut tim

UMKM yang ingin naik kelas
harus mulai berpikir sebagai pengelola,
bukan hanya sebagai pekerja.

Perubahan kecil seperti:
• Mencatat keuangan
• Membuat SOP
• Mengatur waktu kerja

bisa memberi dampak besar dalam jangka panjang.
  `,
  date: '27 Des 2025',
  reference: [
    'https://www.ukmindonesia.id/baca-artikel/175',
    'https://www.kemenkopukm.go.id/'
  ],
},
{
  category: 'Bisnis Management',
  title: 'Kerja Keras Saja Tidak Cukup dalam Bisnis',
  excerpt:
    'Kerja keras tanpa strategi justru bisa membuat bisnis cepat lelah.',
  content: `
Banyak pelaku usaha bangga bekerja dari pagi sampai malam.
Namun hasilnya tidak selalu sebanding.

Masalahnya bukan kurang kerja keras,
melainkan kurang strategi.

Bisnis butuh:
• Perencanaan
• Evaluasi rutin
• Pengambilan keputusan yang tepat

Kerja keras penting,
tapi tanpa arah yang jelas
justru membuat pemilik cepat burnout.

Bisnis yang sehat adalah
bisnis yang bekerja cerdas,
bukan hanya bekerja lama.
  `,
  date: '26 Des 2025',
  reference: [
    'https://www.kompasiana.com/bisnis-strategi',
    'https://www.ukmindonesia.id/'
  ],
},
{
  category: 'Bisnis Management',
  title: 'Pisahkan Uang Pribadi dan Uang Bisnis',
  excerpt:
    'Kesalahan klasik UMKM yang berdampak besar pada keberlangsungan usaha.',
  content: `
Mencampur uang pribadi dan bisnis
adalah kesalahan yang sering dianggap sepele.

Akibatnya:
• Tidak tahu untung atau rugi
• Sulit mengembangkan usaha
• Keuangan tidak terkontrol

Memisahkan keuangan membantu:
• Mengukur performa bisnis
• Mengambil keputusan lebih tepat
• Menjaga kesehatan keuangan

Langkah sederhana ini
adalah pondasi penting
agar bisnis bisa tumbuh berkelanjutan.
  `,
  date: '25 Des 2025',
  reference: [
    'https://www.jurnal.id/id/blog/pisahkan-keuangan-pribadi-dan-bisnis/',
    'https://www.ukmindonesia.id/baca-artikel/97'
  ],
},
{
  category: 'Bisnis Management',
  title: 'Evaluasi Rutin Membuat Bisnis Lebih Tahan',
  excerpt:
    'Bisnis yang bertahan lama adalah bisnis yang mau belajar dari kesalahan.',
  content: `
Evaluasi sering dianggap tidak penting
karena tidak menghasilkan uang langsung.

Padahal evaluasi membantu bisnis untuk:
• Menemukan kesalahan lebih cepat
• Memperbaiki strategi
• Menghindari pengulangan masalah

Bisnis yang jarang evaluasi
biasanya mengulang kesalahan yang sama.

Evaluasi sederhana setiap bulan
sudah cukup untuk menjaga bisnis
tetap berada di jalur yang benar.
  `,
  date: '24 Des 2025',
  reference: [
    'https://www.jurnal.id/id/blog/evaluasi-bisnis/',
    'https://www.ukmindonesia.id/'
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
<section className="px-6 pt-28 pb-16 text-center">
  <div className="text-center mb-14">
    <h1 className="text-4xl font-bold text-gray-800">
      Blog & Tips
    </h1>
    <p className="text-lg text-gray-600 mt-4 max-w-xl mx-auto">
    Informasi dan pengalaman seru seputar desain grafis, web development, teknologi AI, dan manajemen bisnis.
    </p>
  </div>
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
      </div>

      {/* Search */}
      <div className="relative w-full md:w-72">
        <input
          type="text"
          placeholder="Cari artikel..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              e.target.blur() // ⬅️ ENTER = TUTUP KEYBOARD HP
            }
          }}
          className="w-full rounded-2xl border px-5 py-3 pr-12 text-sm
          focus:ring-2 focus:ring-black focus:border-black
          transition"
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
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
            <span className="text-indigo-600">{post.date}</span>

            <button
              onClick={() => setSelectedArticle(post)}
              className="font-medium text-black flex items-center gap-1
              group-hover:gap-2 transition-all duration-200"
            >
              Baca
              <motion.span
                className="ml-1"
                whileHover={{ x: 5 }}
                transition={{ type: "tween", duration: 0.2 }}
              >
                →
              </motion.span>
            </button>
          </div>
        </article>
      ))}
    </div>
  </div>
</section>

   {/* ================= MODAL ================= */}
<AnimatePresence mode="wait">
  {selectedArticle && (
    <motion.div
      key="backdrop"
      onClick={() => setSelectedArticle(null)}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      style={{
        willChange: "opacity",
        transform: "translateZ(0)",
      }}
    >
      <motion.div
        key="modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-white max-w-2xl w-full rounded-3xl p-8 relative shadow-2xl"
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.985 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        style={{
          willChange: "transform, opacity",
          transform: "translateZ(0)",
        }}
      >
        {/* ✅ Scroll area dipisah biar animasi panel ga berat (anti jank HP) */}
        <div
          className="max-h-[85vh] overflow-y-auto overscroll-contain pr-1"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {/* Close */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation()
              setSelectedArticle(null)
            }}
            className="absolute top-4 right-4 rounded-full p-2 text-gray-400 hover:text-black"
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.08 }}
            aria-label="Close"
          >
            ✕
          </motion.button>

          {/* Category */}
          <span className="inline-block mb-4 text-xs font-medium px-3 py-1 rounded-full bg-black/5 text-black">
            {selectedArticle.category}
          </span>

          {/* Title */}
          <h2 className="text-2xl font-semibold mb-2 leading-snug">
            {selectedArticle.title}
          </h2>

          {/* Date */}
          <p className="text-sm text-gray-400 mb-6">{selectedArticle.date}</p>

          {/* Content */}
          <div className="text-gray-700 leading-relaxed whitespace-pre-line mb-10">
            {selectedArticle.content}
          </div>

          {/* Reference */}
          {selectedArticle.reference && selectedArticle.reference.length > 0 && (
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
                      className="text-sm text-gray-600 hover:text-black flex items-center gap-2 transition"
                    >
                      <span className="text-gray-400">↗</span>
                      <span className="truncate">
                        {new URL(ref).hostname.replace("www.", "")}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

    </main>
  )
}
