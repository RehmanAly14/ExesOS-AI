const BaseAgent = require("../BaseAgent");

class CustomerSupportAgent extends BaseAgent {
  constructor() {
    super({
      role: "Customer Support",
      roleTitle: "Customer Support Executive",
      domainFocus:
        "You deliver customer experience intelligence on satisfaction, retention, service quality, and support patterns using the provided context.",
    });
  }
}

module.exports = CustomerSupportAgent;
