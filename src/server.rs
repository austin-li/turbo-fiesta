use serde::Serialize;
use std::collections::HashMap;
use std::net::TcpListener;
use std::sync::{Arc, Mutex};
use std::thread::{sleep, spawn};
use std::time::Duration;
use tungstenite::accept;
use turbo_fiesta::info::Info;

#[derive(Serialize, Debug)]
struct ServerInfo {
    idle_count: i32,
    use_count: i32,
}
fn main() {
    let server = TcpListener::bind("localhost:3000").unwrap();
    let (stream, _) = server.accept().expect("stream not accepted");
    let mut websocket = accept(stream).expect("websocket not accepted");
    println!("accepted");
    let computers = TcpListener::bind("localhost:3001").unwrap();
    let comps: Arc<Mutex<HashMap<String, ServerInfo>>> = Arc::new(Mutex::new(HashMap::new()));
    let test = Arc::clone(&comps);
    spawn(move || {
        let comps = test;
        loop {
            let msg = serde_json::to_string(&comps).unwrap();
            println!("{msg}");
            websocket.send(msg.into()).expect("send failed");
            sleep(Duration::from_secs(1));
        }
    });
    for stream in computers.incoming() {
        let comps = Arc::clone(&comps);
        spawn(move || {
            println!("thread started");
            let mut websocket = accept(stream.unwrap()).unwrap();
            loop {
                match websocket.read() {
                    Ok(msg) => {
                        let info: Info = serde_json::from_str(&msg.to_string()).unwrap();
                        println!("{info:?}");
                        let mut comps = comps.lock().unwrap();
                        let comp = comps.entry(info.comp).or_insert(ServerInfo {
                            idle_count: 0,
                            use_count: 0,
                        });
                        if info.idle {
                            comp.idle_count += 1;
                            comp.use_count = 0;
                        } else {
                            comp.idle_count = 0;
                            comp.use_count += 1;
                        }
                    }
                    Err(err) => {
                        println!("{err}");
                        break;
                    }
                }
            }
        });
    }
}
