// Copyright 2022 Cartesi Pte. Ltd.
//
// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.


// Example submission:
// yarn start input send --payload "(-0.1:0.9:4.0)"


use json::{object, JsonValue};
use std::env;

fn from_hex(s: &str) -> String {
    assert!(s.starts_with("0x"));

    s[2..].as_bytes()
        .chunks_exact(2)
        .map(|c| {
            let d0 = if c[0] > b'9' { c[0] + 9 } else { c[0] } & 0x0f;
            let d1 = if c[1] > b'9' { c[1] + 9 } else { c[1] } & 0x0f;
            (d0 * 16 + d1) as char
        }).collect::<String>()
}

fn from_hex_vec(s: &str) -> Vec<u8> {
    assert!(s.starts_with("0x"));

    s[2..].as_bytes()
        .chunks_exact(2)
        .map(|c| {
            let d0 = if c[0] > b'9' { c[0] + 9 } else { c[0] } & 0x0f;
            let d1 = if c[1] > b'9' { c[1] + 9 } else { c[1] } & 0x0f;
            d0 * 16 + d1
        }).collect::<Vec<u8>>()
}

fn to_hex(b: &[u8]) -> String {
    let mut res = String::with_capacity(b.len()*2+2);
    res.push_str("0x");
    for byte in b {
        res.push(b"0123456789abcdef"[(byte>>4) as usize] as char);
        res.push(b"0123456789abcdef"[(byte&0x0f) as usize] as char);
    }
    res
}

#[test]
fn hex() {
    assert_eq!(from_hex("0x48656c6c6f"), "Hello");

    assert_eq!(to_hex(b"Hello"), "0x48656c6c6f");
}

fn escape_time(cx: f64, cy: f64) -> u8 {
    let mut zx = cx;
    let mut zy = cy;
    let mut res = 0;
    loop {
        (zx, zy) = (zx*zx - zy*zy + cx, 2.0*zy*zx + cy );
        if zx*zx + zy*zy > 4.0 || res == 255 {
            return res;
        }
        res += 1;
    }
}

fn gen_nft(params: &str) -> Vec<u8> {
    const SIZE : usize = 1024;
    println!("params={}", params);

    let (px, py, zoom, id) = if params.starts_with("0x28") {
        // Command line: use text.
        // Question: how do we send hex from the command line tool?
        let params = from_hex(params);
        println!("gen_bft: params={}", params);
        let params = params.strip_prefix("(").unwrap();
        let params = params.strip_suffix(")").unwrap();
        let mut it = params.split(":").map(|x| x.parse().unwrap());
    
        let px : f64 = it.next().unwrap();
        let py : f64 = it.next().unwrap();
        let zoom : f64 = it.next().unwrap();
    
        (px, py, zoom, 0)
    } else {
        // In-chain: use binary. 4x256 bit fixed point integers.
        let bytes = from_hex_vec(params);
        let mut it = bytes
            .chunks(32)
            .map(|x| u64::from_be_bytes(x[24..32].try_into().unwrap()));
        let px = it.next().unwrap() as f64 / 1000000.0;
        let py = it.next().unwrap() as f64 / 1000000.0;
        let zoom = it.next().unwrap() as f64 / 1000000.0;
        let id = it.next().unwrap();
        (px, py, zoom, id)
    };

    println!("x,y,zoom,id={},{},{},{}", px, py, zoom, id);

    let zoom : f64 = 1.0 / zoom / (SIZE as f64) / 2.0;

    let mut w = Vec::new();
    {
        let mut encoder = png::Encoder::new(& mut w, SIZE as u32, SIZE as u32); // Width is 2 pixels and height is 1.
        encoder.set_color(png::ColorType::Rgba);
        encoder.set_depth(png::BitDepth::Eight);
    
        let mut data = [0_u8; SIZE*SIZE*4];
    
        for y in 0..SIZE {
            let cy = (y as i32 - (SIZE/2) as i32) as f64 * zoom + py;
            for x in 0..SIZE {
                let cx = (x as i32 - (SIZE/2) as i32) as f64 * zoom + px;
                let t = escape_time(cx, cy);
                data[(y*SIZE+x)*4+0] = t << 4;
                data[(y*SIZE+x)*4+1] = t << 2;
                data[(y*SIZE+x)*4+2] = t;
                data[(y*SIZE+x)*4+3] = 0xff;
            }
        }
        
        let mut writer = encoder.write_header().unwrap();
        writer.write_image_data(&data).unwrap();
    }

    // Write the image
    // TODO: write to IPFS.
    let filename = format!("/tmp/mandelbrot-{}.png", params);
    std::fs::write(&filename, &w).unwrap();
    println!("written {} size={}", filename, w.len());
    filename.into_bytes()
}

async fn print_response<T: hyper::body::HttpBody>(
    response: hyper::Response<T>,
) -> Result<(), Box<dyn std::error::Error>>
where
    <T as hyper::body::HttpBody>::Error: 'static,
    <T as hyper::body::HttpBody>::Error: std::error::Error,
{
    let response_status = response.status().as_u16();
    let response_body = hyper::body::to_bytes(response).await?;
    println!(
        "Received notice status {} body {}",
        response_status,
        std::str::from_utf8(&response_body)?
    );
    Ok(())
}

fn process_initial(metadata: &JsonValue) -> Option<String> {
    let epoch_index = metadata["epoch_index"].as_u64()?;
    let input_index = metadata["input_index"].as_u64()?;

    if epoch_index == 0 && input_index == 0 {
        let msg_sender = metadata["msg_sender"].as_str()?;
        println!("Captured rollup address: {}", msg_sender);
        return Some(msg_sender.to_string());
    }

    return None;
}

pub async fn handle_advance(
    client: &hyper::Client<hyper::client::HttpConnector>,
    server_addr: &str,
    request: JsonValue,
) -> Result<&'static str, Box<dyn std::error::Error>> {
    println!("Received advance request data {}", &request);
    let payload = request["data"]["payload"]
        .as_str()
        .ok_or("Missing payload")?;

    println!("Adding notice");
    
    let res = gen_nft(payload);
    
    let notice = object! {"payload" => to_hex(&res)};

    let req = hyper::Request::builder()
        .method(hyper::Method::POST)
        .header(hyper::header::CONTENT_TYPE, "application/json")
        .uri(format!("{}/notice", server_addr))
        .body(hyper::Body::from(notice.dump()))?;
    let response = client.request(req).await?;

    print_response(response).await?;

    Ok("accept")
}

pub async fn handle_inspect(
    client: &hyper::Client<hyper::client::HttpConnector>,
    server_addr: &str,
    request: JsonValue,
) -> Result<&'static str, Box<dyn std::error::Error>> {
    println!("Received inspect request data {}", &request);
    let payload = request["data"]["payload"]
        .as_str()
        .ok_or("Missing payload")?;
    println!("Adding report");
    let report = object! {"payload" => format!("{}", payload)};
    let req = hyper::Request::builder()
        .method(hyper::Method::POST)
        .header(hyper::header::CONTENT_TYPE, "application/json")
        .uri(format!("{}/report", server_addr))
        .body(hyper::Body::from(report.dump()))?;
    let response = client.request(req).await?;
    print_response(response).await?;
    Ok("accept")
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = hyper::Client::new();
    let server_addr = env::var("ROLLUP_HTTP_SERVER_URL")?;

    let mut status = "accept";
    let mut _rollup_address = String::new();
    loop {
        println!("Sending finish");
        let response = object! {"status" => status.clone()};
        let request = hyper::Request::builder()
            .method(hyper::Method::POST)
            .header(hyper::header::CONTENT_TYPE, "application/json")
            .uri(format!("{}/finish", &server_addr))
            .body(hyper::Body::from(response.dump()))?;
        let response = client.request(request).await?;
        println!("Received finish status {}", response.status());

        if response.status() == hyper::StatusCode::ACCEPTED {
            println!("No pending rollup request, trying again");
        } else {
            let body = hyper::body::to_bytes(response).await?;
            let utf = std::str::from_utf8(&body)?;
            let req = json::parse(utf)?;

            if let Some(address) = process_initial(&req["data"]["metadata"]) {
                _rollup_address = address;
                continue;
            }

            let request_type = req["request_type"]
                .as_str()
                .ok_or("request_type is not a string")?;
            status = match request_type {
                "advance_state" => handle_advance(&client, &server_addr[..], req).await?,
                "inspect_state" => handle_inspect(&client, &server_addr[..], req).await?,
                &_ => {
                    eprintln!("Unknown request type");
                    "reject"
                }
            };
        }
    }
}
