/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://layanannusantara.store',   // GANTI DI SINI
  generateRobotsTxt: true,
  outDir: './public',
  sitemapSize: 0, // tetap 1 file sitemap
  exclude: ['/api/*', '/404'],
  additionalPaths: async (config) => [
    { loc: '/' },
    { loc: '/order' }
  ],
};
