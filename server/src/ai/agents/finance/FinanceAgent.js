const BaseAgent = require("../BaseAgent");

class FinanceAgent extends BaseAgent {
  constructor() {
    super(
      "Finance",
      "You are the Finance Agent. You specialize in analyzing budgets, revenues, profits, expenses, and financial data. Answer the user's question using the provided context."
    );
  }
}

module.exports = FinanceAgent;
