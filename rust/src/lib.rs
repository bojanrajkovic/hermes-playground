//! Tracking number generation and validation.

use std::fmt;

#[derive(Debug, PartialEq, Eq)]
pub enum LabelError {
    WrongLength(usize),
    NonDigit(char),
    BadChecksum { expected: u32, found: u32 },
}

impl fmt::Display for LabelError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            LabelError::WrongLength(len) => write!(f, "expected 12 digits, got {len}"),
            LabelError::NonDigit(c) => write!(f, "unexpected character {c:?}"),
            LabelError::BadChecksum { expected, found } => {
                write!(f, "checksum mismatch: expected {expected}, found {found}")
            }
        }
    }
}

impl std::error::Error for LabelError {}

/// Computes the mod-10 check digit over the first eleven digits.
pub fn check_digit(digits: &[u32]) -> u32 {
    let sum: u32 = digits
        .iter()
        .enumerate()
        .map(|(i, d)| if i % 2 == 0 { d * 3 } else { *d })
        .sum();
    (10 - sum % 10) % 10
}

/// The zone is encoded in the first digit of the label: 1, 2 or 3.
pub fn zone(label: &str) -> Option<u32> {
    label.chars().next()?.to_digit(10).filter(|z| (1..=3).contains(z))
}

pub fn validate(label: &str) -> Result<(), LabelError> {
    if label.len() != 12 {
        return Err(LabelError::WrongLength(label.len()));
    }
    let mut digits = Vec::with_capacity(12);
    for c in label.chars() {
        digits.push(c.to_digit(10).ok_or(LabelError::NonDigit(c))?);
    }
    let expected = check_digit(&digits[..11]);
    let found = digits[11];
    if expected != found {
        return Err(LabelError::BadChecksum { expected, found });
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn accepts_valid_label() {
        assert_eq!(validate("036000291452"), Ok(()));
    }

    #[test]
    fn reads_zone_from_first_digit() {
        assert_eq!(zone("236000291452"), Some(2));
        assert_eq!(zone("036000291452"), None);
    }

    #[test]
    fn rejects_bad_checksum() {
        assert!(matches!(validate("036000291453"), Err(LabelError::BadChecksum { .. })));
    }
}
