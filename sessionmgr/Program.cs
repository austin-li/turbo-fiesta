using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json.Nodes;

class Program
{
    public static void Main()
    {
        var windows = WindowInfo.GetMajorWindows();
        foreach (var w in windows)
            Console.WriteLine(w);
        
    }
}