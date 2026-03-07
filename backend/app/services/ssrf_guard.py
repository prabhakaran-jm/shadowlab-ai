"""
SSRF guard: block target URLs that point to private or local hosts.
Prevents the backend from being used to probe internal services.
Set ALLOW_LOCALHOST_TARGET=1 in development to allow the mock-vulnerable-api demo.
"""

import os
import ipaddress
from urllib.parse import urlparse

ALLOW_LOCALHOST_TARGET = os.getenv("ALLOW_LOCALHOST_TARGET", "").strip().lower() in ("1", "true", "yes")


def is_safe_target_url(url: str) -> tuple[bool, str]:
    """
    Return (True, "") if the URL is allowed as a scan target, else (False, reason).
    Blocks localhost, loopback, and private IP ranges.
    """
    try:
        parsed = urlparse(url)
    except Exception as e:
        return False, "Invalid URL"
    if not parsed.scheme or parsed.scheme not in ("http", "https"):
        return False, "Only http and https URLs are allowed"
    host = (parsed.hostname or "").strip().lower()
    if not host:
        return False, "Missing host in URL"

    # Strip brackets from IPv6 literal
    if host.startswith("[") and host.endswith("]"):
        host = host[1:-1]

    # Block localhost by name (unless explicitly allowed for demo)
    if host in ("localhost", "localhost.", "localhost.localdomain"):
        if ALLOW_LOCALHOST_TARGET:
            return True, ""
        return False, "Target URL cannot point to localhost (set ALLOW_LOCALHOST_TARGET=1 for local demo)"

    # Try to parse as IP
    try:
        ip = ipaddress.ip_address(host)
    except ValueError:
        # Not an IP; allow by default (public hostname). Optionally block .local etc.
        if host.endswith(".local") or host.endswith(".internal"):
            return False, "Internal hostnames are not allowed as targets"
        return True, ""

    if ip.is_loopback:
        if ALLOW_LOCALHOST_TARGET:
            return True, ""
        return False, "Target URL cannot point to loopback address (set ALLOW_LOCALHOST_TARGET=1 for local demo)"
    if ip.is_private:
        return False, "Target URL cannot point to private IP range"
    if ip.is_link_local:
        return False, "Target URL cannot point to link-local address"
    return True, ""
