const BaseAgent = require("../BaseAgent");

class SalesAgent extends BaseAgent {
  constructor() {
    super({
      role: "Sales",
      roleTitle: "Sales Executive",
      domainFocus:
        "You deliver sales intelligence on pipelines, leads, conversions, and revenue performance using the provided context.",
    });
  }
}

module.exports = SalesAgent;
