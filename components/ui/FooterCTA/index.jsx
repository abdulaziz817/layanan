import SectionWrapper from "../../SectionWrapper"
import NavLink from "../NavLink"

const FooterCTA = () => {
    // Nomor WA harus dalam format internasional tanpa tanda +
    const waNumber = "6287860592111"
    const waMessage = encodeURIComponent(
        "Halo, saya sangat tertarik dengan jasa layanan Nusantara 😊. Saya ingin tahu lebih banyak tentang layanan yang tersedia, apakah saya boleh bertanya beberapa hal?"
    )
    const waLink = `https://wa.me/${waNumber}?text=${waMessage}`

    return (
        <SectionWrapper>
            <div className="custom-screen">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-gray-800 text-3xl font-semibold sm:text-4xl">
                        Mulai gunakan Layanan Nusantara sekarang juga
                    </h2>
                    <p className="mt-3 text-gray-600">
                        Menghubungkan solusi terbaik, mempercepat inovasi, dan memberikan layanan tanpa batas untuk kemajuan Anda.
                    </p>
                    <NavLink
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 inline-block px-6 py-3 font-medium text-sm text-white bg-gray-800 rounded-md hover:bg-gray-700 active:bg-gray-900 transition-colors duration-300"
                    >
                        Chat Sekarang
                    </NavLink>
                </div>
            </div>
        </SectionWrapper>
    )
}

export default FooterCTA
