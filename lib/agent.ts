type AgentInput = {
  prompt: string;
};

// Agent-ready stream generator.
// Replace this with OpenRouter + LangGraph streaming when the backend is wired.
export async function* streamAgentResponse({ prompt }: AgentInput) {
  const response =
    "Thanks for the prompt. This is a backend streaming placeholder. Wire OpenRouter + tools here.";
  const tokens = response.split(" ");

  for (const token of tokens) {
    yield token + " ";
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}
