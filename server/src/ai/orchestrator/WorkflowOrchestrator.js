const CeoAgent = require("../agents/ceo/CeoAgent");

class WorkflowOrchestrator {
  constructor() {
    this.ceoAgent = new CeoAgent();
  }

  /**
   * Fast-path executive report: ONE LLM request (no specialist agents).
   * @param {Object} params
   * @param {string} params.prompt
   * @param {Object|string} params.executiveContext
   */
  async executeExecutiveWorkflow({ prompt, executiveContext }) {
    const startedAt = Date.now();
    console.log("[WorkflowOrchestrator] Fast-path executive report (single LLM call)");

    const executiveReport = await this.ceoAgent.generateExecutiveReport({
      prompt,
      executiveContext,
    });

    console.log(
      `[WorkflowOrchestrator] Executive report complete in ${Date.now() - startedAt}ms`
    );
    return executiveReport;
  }
}

module.exports = {
  WorkflowOrchestrator,
};
