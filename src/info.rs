use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Info {
    pub comp: String,
    pub idle: bool,
}
