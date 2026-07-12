require("dotenv").config();

const { initializeFireworksConfig } = require("../src/config/fireworks");
const { buildCompactExecutiveContext } = require("../src/modules/report/compactExecutiveContext");
const CeoAgent = require("../src/ai/agents/ceo/CeoAgent");

const context = buildCompactExecutiveContext({
  business: { name: "Demo SaaS Co", industry: "Software", businessStage: "Growth", employees: 42, currency: "USD" },
  profile: { revenue: 85000, expenses: 62000, profit: 23000, churn: 0.04, nps: 52 },
  aiContext: {},
  financialMetrics: { revenue: 85000, expenses: 62000 },
  marketingMetrics: { leads: 340, conversionRate: 0.12 },
  customerMetrics: { supportTickets: 28, csat: 4.2 },
  retrievedDocuments: "Q1 revenue grew 18%. Support tickets up 12%. Marketing spend increased 8%.",
  chatHistory: [{ role: "user", content: "How is our business doing?" }],
});

async function main() {
  await initializeFireworksConfig();
  const ceo = new CeoAgent();
  const started = Date.now();

  const report = await ceo.generateExecutiveReport({
    prompt: "Generate executive report on business performance and priorities.",
    executiveContext: context,
  });

  console.log("OK in", Date.now() - started, "ms");
  console.log("title:", report.title);
  console.log("health:", report.businessHealth);
  console.log("completion fields:", Object.keys(report).length);
  console.log("summary words:", report.executiveSummary.split(/\s+/).length);
}

main().catch((error) => {
  console.error("FAIL:", error.message);
  process.exit(1);
});
