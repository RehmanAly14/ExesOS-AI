const BaseAgent = require("../BaseAgent");

class SalesAgent extends BaseAgent {
  constructor() {
    super(
      "Sales",
      "You are the Sales Agent. You specialize in sales pipelines, leads, customer conversions, and sales metrics. Answer the user's question using the provided context."
    );
  }
}

module.exports = SalesAgent;
