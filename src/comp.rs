use device_query::{DeviceQuery, DeviceState, MouseState};
use std::{env::args, thread::sleep, time::Duration};
use tungstenite::connect;
use turbo_fiesta::info::Info;
use url::Url;

fn main() {
    let name = args().nth(1).expect("no cmd line arg");
    println!("Starting WebSocket client");
    let mut socket;
    loop {
        match connect(Url::parse("ws://localhost:3001").unwrap()) {
            Ok((s, _)) => {
                socket = s;
                break;
            }
            Err(_) => sleep(Duration::from_secs(1)),
        }
    }

    println!("Connected to the server");
    let mut count = 0;
    let device_state = DeviceState::new();
    let mut prev = (0, 0);
    loop {
        let mouse: MouseState = device_state.get_mouse();
        let coords = mouse.coords;
        if coords != prev {
            count = 0;
        }
        prev = coords;
        let info = Info {
            comp: name.clone(),
            idle: count >= 10,
        };
        socket
            .send(serde_json::to_string(&info).unwrap().into())
            .expect("send error");
        count += 1;
        sleep(Duration::from_secs(1));
    }
    // socket.close(None).expect("socket close error");
}
