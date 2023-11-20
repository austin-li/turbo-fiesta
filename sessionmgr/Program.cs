using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json.Nodes;
using System.Timers;

class Program
{

    static GPTInterface Gpt = new GPTInterface(AppEnv.Default.OpenAISecret);
    static WSClient Client = new WSClient(AppEnv.Default.HostServer);
    static string MachineName;

    private static void OnTimer()
    {
        var windows = WindowInfo.GetMajorWindows();
        var summaryObject = Gpt.summarize(windows);
        var summary = summaryObject.GetAwaiter().GetResult();
        Client.SendSummary(MachineName, summary).Wait();
    }

    static void Run()
    {
        Client.Connect().Wait();

        Console.WriteLine("Uploading every " + AppEnv.Default.Interval / 1000f + "s.");

        while (true)
        {
            OnTimer();
            Thread.Sleep(AppEnv.Default.Interval);
        }
    }

    public static void Main(string[] args)
    {
        Console.WriteLine("Turbo-Fiesta(R) Session Manager for Microsoft(R) Windows");
        Console.WriteLine("Copyright (C) Davit Margarian");
        if (args.Length != 1)
        {
            Console.WriteLine("Bad Machine Name. Try <sessionmanager.exe <Machine>'");
            return;
        }

        MachineName = args[0];

        while (true)
        {
            try
            {
                Run();
            }
            catch (Exception e)
            {
                Console.WriteLine("There was an error: ", e.Message + ", Retrying in 5s");
                Thread.Sleep(5000);
            }
        }
    }
}