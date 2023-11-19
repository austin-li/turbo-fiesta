use device_query::{DeviceQuery, DeviceState, MouseState};
use std::collections::BTreeSet;
use std::{env::args, thread::sleep, time::Duration};
use tungstenite::connect;
use turbo_fiesta::info::Info;
use url::Url;
use windows_sys::{Win32::Foundation::*, Win32::UI::WindowsAndMessaging::*};

static mut V: Vec<String> = Vec::new();

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
        // get mouse state
        let mouse: MouseState = device_state.get_mouse();
        let coords = mouse.coords;
        if coords != prev {
            count = 0;
        }
        prev = coords;
        // enum windows
        let mut games = BTreeSet::new();
        unsafe {
            EnumWindows(Some(enum_window), 0);
            for title in V.iter() {
                if title == "BloonsTD6" {
                    games.insert("Bloons Tower Defense 6".to_string());
                }
                if title.starts_with("Terraria: ") {
                    games.insert("Terraria".to_string());
                }
                if title == "Risk of Rain Returns" {
                    games.insert("Risk of Rain Returns".to_string());
                }
                if title == "Half-Life" {
                    games.insert("Half-Life".to_string());
                }
                if title == "League of Legends" {
                    games.insert("League of Legends".to_string());
                }
                if title.ends_with("Discord") {
                    games.insert("Discord".to_string());
                }
            }
            V.clear();
        }
        let info = Info {
            comp: name.clone(),
            idle: count >= 10,
            games,
        };
        socket
            .send(serde_json::to_string(&info).unwrap().into())
            .expect("send error");
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
            V.push(text);
        }

        1
    }
}
