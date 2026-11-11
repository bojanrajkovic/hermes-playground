# Contributing

1. Branch from `main`.
2. Keep each pull request to one change.
3. Run `npm test` before you push.

## Commit messages

Use the imperative mood and say why the change is needed.

```text
Reject transitions out of delivered

A delivered shipment could be moved back to in_transit, which re-sent
the delivery notification.
```

## Review checklist

- [ ] Tests cover the new behavior
- [ ] Docs match the code
- [ ] No unrelated formatting changes
