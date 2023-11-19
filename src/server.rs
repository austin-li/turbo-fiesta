use std::net::TcpListener;
use std::thread::spawn;
use tungstenite::accept;

fn main() {
    let server = TcpListener::bind("localhost:3000").unwrap();
    let (stream, _) = server.accept().expect("stream not accepted");
    let mut websocket = accept(stream).expect("websocket not accepted");
    println!("accepted");
    websocket.send("hello".into()).expect("send failed");
    let computers = TcpListener::bind("localhost:3001").unwrap();
    for stream in computers.incoming() {
        spawn(move || {
            println!("thread started");
            let mut websocket = accept(stream.unwrap()).unwrap();
            loop {
                match websocket.read() {
                    Ok(msg) => println!("{msg}"),
                    Err(err) => {
                        println!("{err}");
                        break;
                    }
                }
            }
        });
    }
}
