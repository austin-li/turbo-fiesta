use serde::Serialize;
use std::{
    collections::{
        BTreeSet,
        HashMap,
        VecDeque,
    },
    net::TcpListener,
    sync::{
        atomic::{
            AtomicUsize,
            Ordering,
        },
        Arc,
        Mutex,
    },
    thread::{
        sleep,
        spawn,
    },
    time::Duration,
};
use tungstenite::accept;
use turbo_fiesta::info::{
    ClientInfo,
    ClientInfo::*,
};

#[derive(Serialize, Debug)]
struct ServerInfo {
    idle_count: i32,
    use_count: i32,
    games: BTreeSet<String>,
    response: String,
}

static NEXT_ID: AtomicUsize = AtomicUsize::new(1);

#[derive(Serialize, Debug)]
struct QueueEntry {
    serial_num: String,
    id: usize,
}

#[derive(Serialize, Debug, Default)]
struct State {
    computers: HashMap<String, ServerInfo>,
    queue: VecDeque<QueueEntry>,
}

fn main() {
    println!("Starting server");
    let comps: Arc<Mutex<State>> = Arc::new(Mutex::new(State::default()));
    let test = Arc::clone(&comps);
    spawn(move || {
        let server = TcpListener::bind("0.0.0.0:3000").unwrap();
        for stream in server.incoming() {
            let comps = Arc::clone(&test);
            spawn(move || {
                println!("Someone connected on 3000");
                let mut websocket = accept(stream.unwrap()).unwrap();
                loop {
                    let msg = serde_json::to_string(&comps).unwrap();
                    // println!("{msg}");
                    if let Err(err) = websocket.send(msg.into()) {
                        eprintln!("3000 disconnected: {err}");
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
            println!("Someone connected on 3001");
            let mut websocket = accept(stream.unwrap()).unwrap();
            loop {
                match websocket.read() {
                    Ok(msg) => {
                        let info = match serde_json::from_str::<ClientInfo>(&msg.to_string()) {
                            Ok(info) => info,
                            Err(err) => {
                                eprintln!("tragic parsing error: {err:?}");
                                continue;
                            }
                        };
                        let mut comps = comps.lock().unwrap();
                        match info {
                            RustInfo { .. } => {}
                            _ => println!("{info:?}"),
                        };
                        match info {
                            RustInfo { comp, idle, games } => {
                                let comp = comps.computers.entry(comp).or_insert(ServerInfo {
                                    idle_count: 0,
                                    use_count: 0,
                                    games: BTreeSet::new(),
                                    response: "".to_string(),
                                });
                                if idle {
                                    comp.idle_count += 1;
                                    comp.use_count = 0;
                                } else {
                                    comp.idle_count = 0;
                                    comp.use_count += 1;
                                }
                                comp.games = games;
                            }
                            CsInfo { comp, response } => {
                                let comp = comps.computers.entry(comp).or_insert(ServerInfo {
                                    idle_count: 0,
                                    use_count: 0,
                                    games: BTreeSet::new(),
                                    response: "".to_string(),
                                });
                                comp.response = response;
                            }
                            TapCard { serial_num } => comps.queue.push_front(QueueEntry {
                                serial_num,
                                id: NEXT_ID.fetch_add(1, Ordering::Relaxed),
                            }),
                            OffQueue => {
                                let _ = comps.queue.pop_back();
                            }
                        }
                    }
                    Err(err) => {
                        eprintln!("3001 disconnected: {err}");
                        break;
                    }
                }
            }
        });
    }
}
