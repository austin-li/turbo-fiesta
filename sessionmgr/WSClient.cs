using System.Buffers;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

class WSClient
{

    public readonly ClientWebSocket sock;
    public readonly Uri uri;
    public WSClient(string uri)
    {
        sock = new ClientWebSocket();
        this.uri = new Uri(uri);
    }

    public async Task Connect()
    {
        await sock.ConnectAsync(uri, default);
    }

    public class TransferrableState
    {
        public string comp { get; set; }
        public string response { get; set; }
    }

        public class StateWrapper
    {
        public TransferrableState CsInfo { get; set; }
    }

    public string MakeJson(string comp, string summary)
    {
        var state = new TransferrableState
        {
            comp = comp,
            response = summary
        };

        return JsonSerializer.Serialize<StateWrapper>(new StateWrapper {CsInfo = state});
    }

    public ReadOnlyMemory<byte> MakeTransitBuffer(string json)
    {
        var writer = new ArrayBufferWriter<byte>();
        Encoding.UTF8.GetBytes(json, writer);
        return writer.WrittenMemory;
    }
    public async Task Send(ReadOnlyMemory<byte> data)
    {
        await sock.SendAsync(data, WebSocketMessageType.Text, WebSocketMessageFlags.None, default);
    }

    public async Task SendSummary(string comp, string summary)
    {
        var json = MakeJson(comp, summary);
        var buffer = MakeTransitBuffer(json);
        Console.WriteLine("Sending data\n" + json);
        await Send(buffer);
    }


}