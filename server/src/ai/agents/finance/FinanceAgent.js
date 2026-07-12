const BaseAgent = require("../BaseAgent");

class FinanceAgent extends BaseAgent {
  constructor() {
    super({
      role: "Finance",
      roleTitle: "Finance Executive",
      domainFocus:
        "You deliver financial intelligence on budgets, revenue, profit, expenses, and cash flow using the provided context.",
    });
  }
}

module.exports = FinanceAgent;
