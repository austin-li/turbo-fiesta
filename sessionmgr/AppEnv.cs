using System.Reflection;
using System.Text.Json;

class AppEnv
{
    public string OpenAISecret { get; set; }
    public string HostServer { get; set; }

    public static AppEnv MakeFromLocalEnv()
    {
        string path = System.IO.Path.GetDirectoryName(Assembly.GetEntryAssembly().Location);
        var env = JsonSerializer.Deserialize<AppEnv>(File.ReadAllText(path + "\\.env.json"));
        return env;
    }

    private static AppEnv? local = null;

    public static AppEnv Default
    {
        get
        {
            if (local is null)
                local = MakeFromLocalEnv();
            return local;
        }
    }
}