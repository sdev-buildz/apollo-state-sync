# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this mono-repo or its packages, please report it responsibly by emailing stevexdev@zohomail.in instead of using the public issue tracker.

Please include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested remediation (if any)

We take all security reports seriously and will work with you to verify, fix, and release a patch as quickly as possible.

### Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Security Considerations

- WebSocket connections should always be established over WSS (secure WebSocket) in production
- Keep dependencies up to date to receive security patches
