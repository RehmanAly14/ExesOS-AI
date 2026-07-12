const CeoAgent = require("./ceo/CeoAgent");
const FinanceAgent = require("./finance/FinanceAgent");
const MarketingAgent = require("./marketing/MarketingAgent");
const SalesAgent = require("./sales/SalesAgent");
const OperationsAgent = require("./operations/OperationsAgent");

class AgentRouter {
  constructor() {
    this.agents = {
      ceo: new CeoAgent(),
      finance: new FinanceAgent(),
      marketing: new MarketingAgent(),
      sales: new SalesAgent(),
      operations: new OperationsAgent()
    };
  }

  route(query) {
    const q = query.toLowerCase();
    
    const financeKeywords = ["revenue", "profit", "expense", "budget", "invoice", "finance", "financial"];
    const marketingKeywords = ["campaign", "branding", "advertisement", "customer acquisition", "marketing", "brand"];
    const salesKeywords = ["sales", "leads", "pipeline", "conversion", "sell", "customer"];
    const operationsKeywords = ["inventory", "logistics", "workflow", "process", "operations", "supply chain"];

    if (financeKeywords.some(kw => q.includes(kw))) return this.agents.finance;
    if (marketingKeywords.some(kw => q.includes(kw))) return this.agents.marketing;
    if (salesKeywords.some(kw => q.includes(kw))) return this.agents.sales;
    if (operationsKeywords.some(kw => q.includes(kw))) return this.agents.operations;

    return this.agents.ceo;
  }
}

module.exports = new AgentRouter();
