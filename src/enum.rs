// https://github.com/microsoft/windows-rs/blob/0.52.0/crates/samples/windows-sys/enum_windows/src/main.rs

use windows_sys::Win32::{
    Foundation::*,
    UI::WindowsAndMessaging::*,
};

static mut V: Vec<String> = Vec::new();
fn main() {
    unsafe {
        EnumWindows(Some(enum_window), 0);
        println!("{V:?}");
    }
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
