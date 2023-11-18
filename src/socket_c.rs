use std::net::UdpSocket;

fn main() -> std::io::Result<()> {
    {
        let socket = UdpSocket::bind("127.0.0.1:34255")?;
        println!("{:?}", socket);
        let buf = [1; 10];
        socket.connect("127.0.0.1:34254").expect("not connected");
        socket.send(&buf).expect("not sent");
    } // the socket is closed here
    Ok(())
}
