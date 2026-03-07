"""
SSRF guard: block target URLs that point to private or local hosts.
Prevents the backend from being used to probe internal services.
Resolves hostnames to IPs and blocks if any resolved IP is private/loopback (DNS rebinding).
Set ALLOW_LOCALHOST_TARGET=1 in development to allow the mock-vulnerable-api demo.
"""

import os
import socket
import ipaddress
from urllib.parse import urlparse

ALLOW_LOCALHOST_TARGET = os.getenv("ALLOW_LOCALHOST_TARGET", "").strip().lower() in ("1", "true", "yes")
DNS_RESOLVE_TIMEOUT = 3  # seconds


def _resolve_host_to_ips(host: str) -> list[str]:
    """Resolve hostname to list of IP strings. Returns [] on failure or timeout."""
    try:
        old_timeout = socket.getdefaulttimeout()
        socket.setdefaulttimeout(DNS_RESOLVE_TIMEOUT)
        try:
            # getaddrinfo returns (family, type, proto, canonname, sockaddr)
            results = socket.getaddrinfo(host, None, socket.AF_UNSPEC, socket.SOCK_STREAM)
            ips = []
            for _fam, _typ, _proto, _canon, sockaddr in results:
                addr = sockaddr[0] if isinstance(sockaddr, (list, tuple)) else sockaddr
                if addr and addr not in ips:
                    ips.append(addr)
            return ips
        finally:
            socket.setdefaulttimeout(old_timeout)
    except (socket.gaierror, socket.timeout, OSError):
        return []


def _is_bad_ip(ip_str: str) -> bool:
    """True if the IP is loopback, private, or link-local (and not allowed for demo)."""
    try:
        ip = ipaddress.ip_address(ip_str)
    except ValueError:
        return True
    if ip.is_loopback:
        return not ALLOW_LOCALHOST_TARGET
    if ip.is_private or ip.is_link_local:
        return True
    return False


def is_safe_target_url(url: str) -> tuple[bool, str]:
    """
    Return (True, "") if the URL is allowed as a scan target, else (False, reason).
    Blocks localhost, loopback, private IP ranges, and hostnames that resolve to them (DNS rebinding).
    """
    try:
        parsed = urlparse(url)
    except Exception:
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

    # Try to parse as IP first
    try:
        ip = ipaddress.ip_address(host)
    except ValueError:
        # Hostname: resolve and check all resolved IPs (DNS rebinding protection)
        if host.endswith(".local") or host.endswith(".internal"):
            return False, "Internal hostnames are not allowed as targets"
        resolved = _resolve_host_to_ips(host)
        if not resolved:
            return False, "Could not resolve hostname or resolution timed out"
        for ip_str in resolved:
            if _is_bad_ip(ip_str):
                return False, "Target hostname resolves to a private or loopback address (DNS rebinding not allowed)"
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
