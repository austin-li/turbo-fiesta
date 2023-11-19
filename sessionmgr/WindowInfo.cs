using System.Diagnostics;
using System.Reflection.Metadata.Ecma335;
using System.Runtime.InteropServices;
using System.Text;

class WindowInfo
{
    private delegate bool CallBackPtr(IntPtr hwnd, int lParam);

    [DllImport("user32.dll")]
    private static extern int EnumWindows(CallBackPtr callPtr, int lPar);

    [DllImport("user32.dll")]
    private static extern int EnumChildWindows(IntPtr hWnd, CallBackPtr lpEnumFunc, int lparam);


    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    private static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);

    [DllImport("user32.dll")]
    private static extern bool IsWindowVisible(IntPtr hWnd);

    [DllImport("user32.dll")]
    private static extern bool IsIconic(IntPtr hWnd);

    private static List<IntPtr> EnumWindows()
    {
        var result = new List<IntPtr>();

        EnumWindows(new CallBackPtr((hwnd, lParam) =>
        {
            result.Add(hwnd);
            return true;
        }), 0);

        return result;
    }

    private static List<IntPtr> EnumChildWindows(IntPtr parent)
    {
        var result = new List<IntPtr>();

        EnumChildWindows(parent, new CallBackPtr((hwnd, lParam) =>
        {
            result.Add(hwnd);
            return true;
        }), 0);

        return result;
    }

    private static string? GetWindowText(IntPtr window)
    {
        var title = new StringBuilder(256);
        if (Win.GetWindowText(window, title, title.Capacity) != 0)
            return title.ToString();
        return null;
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct Rect
    {
        public int left;
        public int top;
        public int right;
        public int bottom;
    }


    [DllImport("user32.dll")]
    private static extern bool GetClientRect(IntPtr hWnd, ref Rect lpRect);

    [DllImport("user32.dll")]
    private static extern IntPtr GetDesktopWindow();

        [DllImport("user32.dll")]
    private static extern IntPtr GetForegroundWindow();




    public enum Presence { Foreground, Present, Minimized, Hidden };
    private static Presence GetWindowPresence(IntPtr window)
    {
        if (IsIconic(window)) return Presence.Minimized;
        if (window == GetForegroundWindow()) return Presence.Foreground;
        if (IsWindowVisible(window)) return Presence.Present;
        return Presence.Hidden;
    }

    public enum DisplaySignificance { Full, Most, Half, Small, Fractional };

        private static double GetWindowRatio(IntPtr window)
    {
        var display = new Rect();
        var app = new Rect();
        GetClientRect(GetDesktopWindow(), ref display);
        GetClientRect(window, ref app);

        double disp_area = (display.right-display.left) * (display.bottom - display.top);
        double app_area = (display.right-display.left) * (display.bottom - display.top);

        return app_area/disp_area;
    }
    private static DisplaySignificance SignificanceAsEnum(double ratio) => ratio switch {
            (>= 0.8) and (< 1) => DisplaySignificance.Full,
            (>= 0.65) and (< 0.8) => DisplaySignificance.Most,
            (>= 0.35) and (< 0.65) => DisplaySignificance.Half,
            (>= 0.15) and (< 0.35) => DisplaySignificance.Small,
            < 0.15 => DisplaySignificance.Fractional,
            _  => DisplaySignificance.Fractional
        };


    public readonly DisplaySignificance displaySignificance;
    public readonly Presence displayPresence;
    public readonly string title;
    public readonly IntPtr handle;
    public readonly double displayRatio;

    private WindowInfo(string title, Presence presence, DisplaySignificance significance, IntPtr handle, double ratio)
    {
        this.title = title;
        this.displayPresence = presence;
        this.displaySignificance = significance;
        this.handle = handle;
        this.displayRatio = ratio;
    }


    // Return Present or hidden windows.

    private static WindowInfo? AssembleInfo(IntPtr wnd)
    {
        string? title = GetWindowText(wnd);
        if(title == null) return null;
        var presence = GetWindowPresence(wnd);
        var ratio = GetWindowRatio(wnd);
        var significance = SignificanceAsEnum(ratio);

        return new WindowInfo(title, presence, significance, wnd, ratio);
    }
    public static List<WindowInfo> GetWindows()
    {
        var allWindows = new List<IntPtr>();
        var parents = EnumWindows();
        foreach(IntPtr w in parents) {
            allWindows.Add(w);
            allWindows.Concat(EnumChildWindows(w));
        }

        var allInfos = new List<WindowInfo>();

        foreach(IntPtr w in allWindows) {
            allInfos.Add(AssembleInfo(w));
        }

        return allInfos;
    }

    public static List<WindowInfo> GetWindowInfos()
    {
        var allWindows = new List<IntPtr>();
        var parents = EnumWindows();
        foreach(IntPtr w in parents) {
            allWindows.Add(w);
            //allWindows.Concat(EnumChildWindows(w));
        }

        var allInfos = new List<WindowInfo>();

        foreach(IntPtr w in allWindows) {
            allInfos.Add(AssembleInfo(w));
        }

        return allInfos;
    }

     public static List<WindowInfo> GetMajorWindows()
    {

        var windows = GetWindowInfos().Where(w => w.displayPresence != Presence.Hidden).OrderBy(w => 1.0 - w.displayRatio).DistinctBy(w => w.title).ToList();


        return (List<WindowInfo>)windows;
    }

}