const BaseAgent = require("../BaseAgent");

class MarketingAgent extends BaseAgent {
  constructor() {
    super(
      "Marketing",
      "You are the Marketing Agent. You specialize in campaigns, branding, customer acquisition, and marketing strategies. Answer the user's question using the provided context."
    );
  }
}

module.exports = MarketingAgent;
