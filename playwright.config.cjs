const path = require('node:path');

module.exports = {
  testDir: './tests',
  testMatch: 'milestone4*.e2e.spec.cjs',
  use: {
    browserName: 'chromium',
    headless: true,
    launchOptions: {
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    },
  },
  reporter: 'line',
  outputDir: path.join(__dirname, 'test-results'),
};
