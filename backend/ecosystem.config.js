module.exports = {
    apps: [
      {
        name: "handleAddScan",
        script: "handleAddScan.js",
        instances: 1,
        env: {
          NODE_ENV: "production",
          PORT: 5002
        }
      },
      {
        name: "display",
        script: "display.js",
        instances: 1,
        env: {
          NODE_ENV: "production",
          PORT: 5001
        }
      },
      {
        name: "createFlashCards",
        script: "createFlashCards.js",
        instances: 1,
        env: {
          NODE_ENV: "production",
          PORT: 5003
        }
      },
      {
        name: "createMockTests",
        script: "createMockTests.js",
        instances: 1,
        env: {
          NODE_ENV: "production",
          PORT: 5005
        }
      }
    ]
  };
  