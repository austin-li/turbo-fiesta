using Azure.AI.OpenAI;

class GPTInterface {
    private readonly OpenAIClient client;
    private const string gptPrompt = @" You are an AI assistant that reads process information from a Windows computer and outputs a very short summary of active activities when requested for a 3rd party administer to review.
    This summary should be 2 sentences per notable process, including what the app actually is and what it's about. If a process is high-risk (like a cryptocurrency miner or pornography), include an additional sentence warning and a tag surrounding it <RISK> and </RISK>. 
    If no application is taking up a significant portion of the screen, tag the end of the summary with <DESKTOP/>. Mentions risky content first.";

    private class AppEnv {
        public string OpenAISecret {get; set;}

        public static AppEnv MakeFromLocalEnv() {
            return new AppEnv();
        }
    }

    public GPTInterface() {

        //client = new OpenAIClient(key);
    }
}