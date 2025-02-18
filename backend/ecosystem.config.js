module.exports = {
    apps: [
      {
        name: "handleAddScan",
        script: "./Scans/handleAddScan.js",
        instances: 1,
        env: {
          NODE_ENV: "production",
          PORT: 5002
        }
      },
      {
        name: "display",
        script: "./Display/display.js",
        instances: 1,
        env: {
          NODE_ENV: "production",
          PORT: 5001
        }
      },
      {
        name: "createFlashCards",
        script: "./FlashCards/createFlashCards.js",
        instances: 1,
        env: {
          NODE_ENV: "production",
          PORT: 5003
        }
      },
      {
        name: "createMockTests",
        script: "./MockTests/createMockTests.js",
        instances: 1,
        env: {
          NODE_ENV: "production",
          PORT: 5005
        }
      },
      {
        name: "handleAccount",
        script: "./Authentication/handleAccount.js",
        instances: 1,
        env: {
          NODE_ENV: "production",
          PORT: 5006
        }
      }
    ]
  };
  