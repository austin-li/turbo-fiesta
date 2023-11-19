using System.Runtime.InteropServices;
using System.Text;

class Program
{
    public static void Main()
    {
        var windows = WindowInfo.GetMajorWindows();
        foreach (var w in windows)
            Console.WriteLine(w);
    }
}