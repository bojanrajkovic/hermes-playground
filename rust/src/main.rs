use parcel_label::validate;

fn main() {
    let label = std::env::args().nth(1).unwrap_or_else(|| {
        eprintln!("usage: parcel-label <12-digit label>");
        std::process::exit(2);
    });
    match validate(&label) {
        Ok(()) => println!("{label}: ok"),
        Err(err) => {
            eprintln!("{label}: {err}");
            std::process::exit(1);
        }
    }
}
