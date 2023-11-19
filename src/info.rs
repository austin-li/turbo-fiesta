use serde::{Deserialize, Serialize};
use std::collections::BTreeSet;

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
}
