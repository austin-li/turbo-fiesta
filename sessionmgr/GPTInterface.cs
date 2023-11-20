using Azure.AI.OpenAI;

class GPTInterface
{
    private readonly OpenAIClient client;
    private const string sysPrompt = @" You are an AI assistant that reads process information from a user's computer and outputs a very short summary of activities.
    This summary should be 2 sentences per notable process, including a sentence describing why the user is using the app . Prioritize games. Mention how much screen estate an app is using. If a process contains prohibited content (like a cryptocurrency miner or pornography), include an additional sentence warning and tag it <PROHIBITED>.
    Games, game stores, and code editors are accepted content and should not be marked.";



    public GPTInterface(string secret)
    {
        client = new OpenAIClient(secret);
    }

    public string generatePrompt(List<WindowInfo> infos)
    {
        string prompt = "Summarize the following apps:\n";
        foreach (var info in infos.Take(8))
        {
            prompt += info.ToString() + "\n";
        }

        return prompt;
    }

    public async Task<string> invoke(string userPrompt)
    {
        var opts = new ChatCompletionsOptions
        {
            DeploymentName = "gpt-3.5-turbo-1106",
            Temperature = 0.9f,
            MaxTokens = 500
        };

        opts.Messages.Add(new ChatMessage(ChatRole.System, sysPrompt));
        opts.Messages.Add(new ChatMessage(ChatRole.User, userPrompt));

        var response = await client.GetChatCompletionsAsync(opts);
        var msg = response.Value.Choices.First().Message.Content;

        return msg;
    }

    public async Task<string> summarize(List<WindowInfo> infos)
    {
        var summary = await invoke(generatePrompt(infos));
        return summary;
    }
}