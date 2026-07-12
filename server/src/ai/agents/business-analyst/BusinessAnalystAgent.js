const BaseAgent = require("../BaseAgent");

class BusinessAnalystAgent extends BaseAgent {
  constructor() {
    super({
      role: "Business Analyst",
      roleTitle: "Business Analyst Executive",
      domainFocus:
        "You deliver business intelligence on operations, strategy, KPIs, process efficiency, and growth opportunities using the provided context.",
    });
  }
}

module.exports = BusinessAnalystAgent;
