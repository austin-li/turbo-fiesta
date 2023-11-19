use device_query::{DeviceQuery, DeviceState, MouseState};
use std::{env::args, thread::sleep, time::Duration};
use tungstenite::connect;
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
    for i in 0..10 {
        socket.send("dsfsdfa".into()).expect("send error");
        socket.send(i.to_string().into()).expect("send error");
    }
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
        socket
            .send(format!("{name}, {count}").into())
            .expect("send error");
        count += 1;
        sleep(Duration::from_secs(1));
    }
    // socket.close(None).expect("socket close error");
}
