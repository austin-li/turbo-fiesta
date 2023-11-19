use serde::{Deserialize, Serialize};
use std::collections::BTreeSet;

#[derive(Serialize, Deserialize, Debug)]
pub struct Info {
    pub comp: String,
    pub idle: bool,
    pub games: BTreeSet<String>,
}
