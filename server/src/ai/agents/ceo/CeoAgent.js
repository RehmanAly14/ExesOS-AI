const BaseAgent = require("../BaseAgent");

class CeoAgent extends BaseAgent {
  constructor() {
    super(
      "CEO",
      "You are the CEO Agent. You handle general business queries and oversee the company. Answer the user's question clearly and concisely based on the context provided."
    );
  }
}

module.exports = CeoAgent;
