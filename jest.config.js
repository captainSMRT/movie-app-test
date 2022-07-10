module.exports = {
    setupFilesAfterEnv: ['./jest.setup.js', "jest-expect-message"],
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageProvider: "v8",
    coverageReporters: ["json", "text"],
    verbose: true,
    "testResultsProcessor": "jest-junit"
}