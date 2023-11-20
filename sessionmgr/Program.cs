using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json.Nodes;

class Program
{
    public static void Main()
    {
        var windows = WindowInfo.GetMajorWindows();
        var gpt = new GPTInterface(AppEnv.Default.OpenAISecret);
        var summaryObject = gpt.summarize(windows);
        var summary = summaryObject.GetAwaiter().GetResult();
        
        var ws = new WSClient(AppEnv.Default.HostServer);
        ws.Connect().Wait();
        ws.SendSummary("A1", summary).Wait();
    }
}