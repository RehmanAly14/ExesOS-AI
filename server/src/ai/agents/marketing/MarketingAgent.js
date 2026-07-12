const BaseAgent = require("../BaseAgent");

class MarketingAgent extends BaseAgent {
  constructor() {
    super({
      role: "Marketing",
      roleTitle: "Marketing Executive",
      domainFocus:
        "You deliver marketing intelligence on campaigns, branding, customer acquisition, and growth using the provided context.",
    });
  }
}

module.exports = MarketingAgent;
