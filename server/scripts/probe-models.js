require("dotenv").config();
const axios = require("axios");

const key = process.env.FIREWORKS_API_KEY;
const models = [
  "accounts/fireworks/models/kimi-k2p6",
  "accounts/fireworks/models/qwen3p7-plus",
  "accounts/fireworks/models/gpt-oss-120b",
  "accounts/fireworks/models/glm-5p2",
  "accounts/fireworks/models/deepseek-v4-pro",
  "accounts/fireworks/models/glm-5p1",
];

const systemPrompt = `Return ONLY a JSON object starting with {. Schema keys: title, executiveSummary, businessHealth, confidence, financialAnalysis, marketingAnalysis, businessAnalysis, customerSupportAnalysis, topRisks, priorityActions, actionPlan30Day, expectedImpact.`;

async function main() {
  for (const model of models) {
    const started = Date.now();
    try {
      const response = await axios.post(
        "https://api.fireworks.ai/inference/v1/chat/completions",
        {
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: "Generate executive report JSON for a SaaS startup." },
          ],
          temperature: 0,
          max_tokens: 1200,
          response_format: { type: "json_object" },
        },
        {
          headers: { Authorization: `Bearer ${key}` },
          timeout: 30000,
        }
      );

      const content = response.data.choices[0].message.content.trim();
      const usage = response.data.usage || {};
      console.log(
        `OK ${model} ${Date.now() - started}ms json=${content.startsWith("{")} ` +
          `prompt=${usage.prompt_tokens} completion=${usage.completion_tokens}`
      );
    } catch (error) {
      const msg = error.response?.data?.error?.message || error.message;
      console.log(`FAIL ${model} - ${msg}`);
    }
  }
}

main();
