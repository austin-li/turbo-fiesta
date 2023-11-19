use device_query::{DeviceQuery, DeviceState, MouseState};
use std::{env::args, net::TcpStream, thread::sleep, time::Duration};
use tungstenite::{connect, stream::MaybeTlsStream, WebSocket};
use turbo_fiesta::info::Info;
use url::Url;
use windows_sys::{Win32::Foundation::*, Win32::UI::WindowsAndMessaging::*};

static mut V: Vec<String> = Vec::new();

fn wait_for_connection() -> WebSocket<MaybeTlsStream<TcpStream>> {
    loop {
        match connect(Url::parse("ws://localhost:3001").unwrap()) {
            Ok((s, _)) => {
                println!("Connected to the server");
                return s;
            }
            Err(_) => sleep(Duration::from_secs(1)),
        }
    }
}

fn main() {
    let name = args().nth(1).expect("no cmd line arg");
    println!("Starting WebSocket client");
    let mut socket = wait_for_connection();

    let mut count = 0;
    let device_state = DeviceState::new();
    let mut prev = (0, 0);
    loop {
        // get mouse state
        let mouse: MouseState = device_state.get_mouse();
        let coords = mouse.coords;
        if coords != prev {
            count = 0;
        }
        prev = coords;
        // enum windows
        let mut game = "Unknown";
        unsafe {
            EnumWindows(Some(enum_window), 0);
            for title in V.iter() {
                if title.ends_with("Discord") {
                    game = "Discord";
                }
            }
            V.clear();
        }
        let info = Info {
            comp: name.clone(),
            idle: count >= 10,
            game: game.to_string(),
        };
        while let Err(_) = socket.send(serde_json::to_string(&info).unwrap().into()) {
            socket = wait_for_connection();
        }
        println!("Sending: {info:?}");
        count += 1;
        sleep(Duration::from_secs(1));
    }
    // socket.close(None).expect("socket close error");
}

extern "system" fn enum_window(window: HWND, _: LPARAM) -> BOOL {
    unsafe {
        let mut text: [u16; 512] = [0; 512];
        let len = GetWindowTextW(window, text.as_mut_ptr(), text.len() as i32);
        let text = String::from_utf16_lossy(&text[..len as usize]);

        if !text.is_empty() {
            V.push(text.clone());
            //println!("{text}");
        }

        1
    }
}
