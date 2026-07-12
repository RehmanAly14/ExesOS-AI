const BaseAgent = require("../BaseAgent");

class OperationsAgent extends BaseAgent {
  constructor() {
    super(
      "Operations",
      "You are the Operations Agent. You specialize in inventory, logistics, workflows, and operational processes. Answer the user's question using the provided context."
    );
  }
}

module.exports = OperationsAgent;
