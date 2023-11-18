use std::net::TcpListener;
use tungstenite::accept;

fn main() {
    let server = TcpListener::bind("localhost:3000").unwrap();
    let (stream, _) = server.accept().expect("stream not accepted");
    let mut websocket = accept(stream).expect("websocket not accepted");
    println!("accepted");
    websocket.send("hello".into()).expect("send failed");
}
