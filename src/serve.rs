use futures_util::{
    SinkExt,
    StreamExt,
    TryFutureExt,
};
use std::{
    collections::HashMap,
    sync::{
        atomic::{
            AtomicUsize,
            Ordering,
        },
        Arc,
        Mutex,
    },
    time::Duration,
};
use tokio::{
    sync::{
        mpsc,
        RwLock,
    },
    time::sleep,
};
use tokio_stream::wrappers::UnboundedReceiverStream;
use turbo_fiesta::info::{
    ClientInfo,
    ClientInfo::*,
    QueueEntry,
    ServerInfo,
    State,
};
use warp::{
    ws::{
        Message,
        WebSocket,
    },
    Filter,
};

#[tokio::main]
async fn main() {
    println!("http://localhost:3030/");
    println!("http://localhost:3030/nfc-reader/");
    let comps: Arc<Mutex<State>> = Arc::new(Mutex::new(State::default()));
    let rx = warp::path("rx").and(warp::ws()).map(|ws: warp::ws::Ws| {
        let comps = Arc::clone(&comps);
        ws.on_upgrade(move |ws: WebSocket| async {
            let comps = Arc::clone(&comps);
            let (mut user_ws_tx, mut user_ws_rx) = ws.split();
            let (tx, rx) = mpsc::unbounded_channel();
            let mut rx = UnboundedReceiverStream::new(rx);
            tokio::task::spawn(async move {
                let comps = Arc::clone(&comps);
                loop {
                    let msg = serde_json::to_string(&comps).unwrap();
                    // println!("{msg}");
                    if let Err(err) = user_ws_tx.send(Message::text(msg)) {
                        eprintln!("3000 disconnected: {err}");
                        break;
                    };
                    sleep(Duration::from_secs(1));
                }
            });
        })
    });
    warp::serve(
        warp::fs::dir("./frontend/dist/")
            .or(warp::path("nfc-reader").and(warp::fs::dir("./nfc-reader/")))
            .or(rx),
    )
    .run(([0, 0, 0, 0], 3030))
    .await;
}
