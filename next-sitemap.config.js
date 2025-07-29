/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://layanannusantara.netlify.app',
  generateRobotsTxt: true,
  outDir: './public',
  sitemapSize: 0, // PAKSA 1 file sitemap saja
  exclude: ['/api/*', '/404'],
  additionalPaths: async (config) => [
    { loc: '/' },
    { loc: '/order' }
  ],
};
