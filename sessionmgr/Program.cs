using System.Runtime.InteropServices;
using System.Text;


static class Win
{

    private delegate bool CallBackPtr(IntPtr hwnd, int lParam);


    [DllImport("user32.dll")]
    private static extern int EnumWindows(CallBackPtr callPtr, int lPar);

    
  [DllImport("USER32.DLL")]
  public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);


    public static List<IntPtr> EnumWindows()
    {
        var result = new List<IntPtr>();

        EnumWindows(new CallBackPtr((hwnd, lParam) =>
        {
            result.Add(hwnd);
            return true;
        }), 0);

        return result;
    }

}

class Program
{
    public static void Main()
    {
        foreach(var p in Win.EnumWindows()) 
        {
           var windows = WindowInfo.GetMajorWindows();
           foreach(var w in windows)
            Console.WriteLine(w.title);


        }
    }
}