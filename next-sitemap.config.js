/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.thebuzz-quiz.de',
  generateRobotsTxt: true,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/api/*'],
  robotsTxtOptions: {
    policies: [{ userAgent: '*', allow: '/' }],
  },
};
