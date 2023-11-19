use serde::Serialize;
use std::collections::BTreeSet;
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
    games: BTreeSet<String>,
}
fn main() {
    println!("Starting server");
    let comps: Arc<Mutex<HashMap<String, ServerInfo>>> = Arc::new(Mutex::new(HashMap::new()));
    let test = Arc::clone(&comps);
    spawn(move || {
        let server = TcpListener::bind("0.0.0.0:3000").unwrap();
        for stream in server.incoming() {
            let comps = Arc::clone(&test);
            spawn(move || {
                println!("accepted");
                let mut websocket = accept(stream.unwrap()).unwrap();
                loop {
                    let msg = serde_json::to_string(&comps).unwrap();
                    println!("{msg}");
                    if let Err(_) = websocket.send(msg.into()) {
                        break;
                    };
                    sleep(Duration::from_secs(1));
                }
            });
        }
    });

    let computers = TcpListener::bind("0.0.0.0:3001").unwrap();
    for stream in computers.incoming() {
        let comps = Arc::clone(&comps);
        spawn(move || {
            println!("thread started");
            let mut websocket = accept(stream.unwrap()).unwrap();
            loop {
                match websocket.read() {
                    Ok(msg) => {
                        let info: Info = serde_json::from_str(&msg.to_string()).unwrap();
                        let mut comps = comps.lock().unwrap();
                        let comp = comps.entry(info.comp).or_insert(ServerInfo {
                            idle_count: 0,
                            use_count: 0,
                            games: BTreeSet::new(),
                        });
                        if info.idle {
                            comp.idle_count += 1;
                            comp.use_count = 0;
                        } else {
                            comp.idle_count = 0;
                            comp.use_count += 1;
                        }
                        comp.games = info.games;
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
