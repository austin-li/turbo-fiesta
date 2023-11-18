// https://github.com/snapview/tungstenite-rs/blob/master/examples/client.rs
use tungstenite::connect;
use url::Url;

fn main() {
    println!("Starting WebSocket client");
    let (mut socket, response) =
        connect(Url::parse("ws://localhost:3000").unwrap()).expect("Can't connect");

    println!("Connected to the server");
    println!("Response HTTP code: {}", response.status());
    println!("Response contains the following headers:");
    for (ref header, _value) in response.headers() {
        println!("* {}", header);
    }
    let msg = socket.read().expect("Error reading message");
    println!("Received: {}", msg);
    // socket.close(None);
}
