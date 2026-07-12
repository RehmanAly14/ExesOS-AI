const BaseAgent = require("../BaseAgent");

class OperationsAgent extends BaseAgent {
  constructor() {
    super({
      role: "Operations",
      roleTitle: "Operations Executive",
      domainFocus:
        "You deliver operations intelligence on inventory, logistics, workflows, and process performance using the provided context.",
    });
  }
}

module.exports = OperationsAgent;
