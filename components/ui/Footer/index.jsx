const socialInfo = [
  {
    name: "Portfolio",
    href: "https://zizzzdul.netlify.app/",
    icon: (
      // Logo bola dunia simple dengan warna abu-abu
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="10" stroke="#888888" strokeWidth="2" />
        <path
          d="M2 12h20M12 2a20 20 0 010 20M7 4a16 16 0 010 16M17 4a16 16 0 010 16"
          stroke="#888888"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 2c2 4 2 8 0 12s-2 8 0 12"
          stroke="#888888"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    color: "#888888", // abu-abu
    hoverColor: "#555555", // abu-abu lebih gelap saat hover
  },
  {
    name: "Instagram",
    href: "https://instagram.com/zizzzdul_",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="#888888"
        strokeWidth={2}
        viewBox="0 0 24 24"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          width="20"
          height="20"
          x="2"
          y="2"
          rx="5"
          ry="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"
        />
        <line
          x1="17.5"
          y1="6.5"
          x2="17.51"
          y2="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    color: "#888888",
    hoverColor: "#555555",
  },
  {
    name: "WhatsApp",
    href: "https://wa.me/6287860592111",
    icon: (
      <svg
        className="w-6 h-6"
        fill="#888888"
        viewBox="0 0 24 24"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M20.52 3.48A11.907 11.907 0 0012 0C5.373 0 0 5.373 0 12a11.928 11.928 0 001.61 6.01L0 24l6.138-1.59a11.95 11.95 0 005.862 1.462c6.627 0 12-5.373 12-12 0-3.195-1.246-6.195-3.48-8.43zM12 21.75a9.712 9.712 0 01-4.993-1.445l-.358-.22-3.64.944.972-3.547-.233-.364a9.715 9.715 0 01-1.513-5.401c0-5.41 4.403-9.812 9.813-9.812 2.62 0 5.083 1.02 6.93 2.868a9.745 9.745 0 012.868 6.93c0 5.41-4.403 9.813-9.813 9.813zm5.398-7.324c-.297-.148-1.758-.868-2.031-.967-.273-.1-.472-.148-.672.149-.198.297-.767.967-.94 1.165-.173.198-.347.223-.644.074-.297-.148-1.255-.462-2.39-1.477-.883-.788-1.48-1.761-1.654-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.148-.173.198-.297.297-.495.099-.198.05-.372-.025-.52-.075-.148-.672-1.611-.92-2.206-.242-.579-.487-.5-.672-.51l-.573-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.148.198 2.095 3.2 5.077 4.487.709.306 1.262.488 1.694.624.712.227 1.36.195 1.872.118.57-.085 1.758-.717 2.006-1.41.247-.69.247-1.282.173-1.41-.074-.13-.272-.198-.57-.347z" />
      </svg>
    ),
    color: "#888888",
    hoverColor: "#555555",
  },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white mt-20">
      <div className="custom-screen pt-16 px-5 sm:px-10 lg:px-20">
        <div className="mt-10 py-10 border-t border-gray-300 flex flex-col sm:flex-row items-center justify-between gap-4">
          <a
            href="https://wa.me/6287860592111"
            className="text-gray-700 text-lg font-semibold hover:text-green-500 transition duration-300"
          >
            Layanan Nusantara
          </a>
          <p className="text-gray-600 text-center sm:text-left">
            © {currentYear} Layanan Nusantara. Seluruh hak cipta dilindungi.
          </p>
          <div className="flex items-center gap-x-6">
            {socialInfo.map(({ href, icon, name, color, hoverColor }, idx) => (
              <a
                key={idx}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={name}
                className="transition-transform duration-500 ease-in-out"
                style={{ color }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = hoverColor;
                  e.currentTarget.style.transform = "scale(1.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = color;
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <span className="inline-block transition-transform duration-500 ease-in-out">
                  {icon}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
