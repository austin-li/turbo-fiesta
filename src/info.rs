use serde::{
    Deserialize,
    Serialize,
};
use std::{
    collections::{
        BTreeSet,
        HashMap,
        VecDeque,
    },
    sync::atomic::AtomicUsize,
};

#[derive(Serialize, Deserialize, Debug)]
pub enum ClientInfo {
    RustInfo {
        comp: String,
        idle: bool,
        games: BTreeSet<String>,
    },
    CsInfo {
        comp: String,
        response: String,
    },
    TapCard {
        serial_num: String,
    },
    OffQueue,
}

#[derive(Serialize, Debug)]
pub struct ServerInfo {
    pub idle_count: i32,
    pub use_count: i32,
    pub games: BTreeSet<String>,
    pub response: String,
}

#[derive(Serialize, Debug)]
pub struct QueueEntry {
    pub serial_num: String,
    pub id: usize,
}

#[derive(Serialize, Debug, Default)]
pub struct State {
    pub computers: HashMap<String, ServerInfo>,
    pub queue: VecDeque<QueueEntry>,
}
