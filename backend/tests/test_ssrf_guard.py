"""Tests for SSRF guard (target URL validation)."""
import pytest
from unittest.mock import patch

from app.services.ssrf_guard import is_safe_target_url


@patch("app.services.ssrf_guard._resolve_host_to_ips", return_value=["93.184.216.34"])
def test_allows_public_https(_resolve):
    """Public HTTPS URLs are allowed when hostname resolves to public IP."""
    ok, reason = is_safe_target_url("https://api.example.com/chat")
    assert ok is True
    assert reason == ""


@patch("app.services.ssrf_guard._resolve_host_to_ips", return_value=["93.184.216.34"])
def test_allows_public_http(_resolve):
    """Public HTTP URLs are allowed when hostname resolves to public IP."""
    ok, reason = is_safe_target_url("http://example.org/v1/complete")
    assert ok is True


def test_blocks_localhost_by_default():
    """Localhost is blocked when ALLOW_LOCALHOST_TARGET is not set."""
    ok, reason = is_safe_target_url("http://localhost:8000/mock")
    assert ok is False
    assert "localhost" in reason.lower()


def test_blocks_127_0_0_1_by_default():
    """Loopback IP is blocked when ALLOW_LOCALHOST_TARGET is not set."""
    ok, reason = is_safe_target_url("http://127.0.0.1:8000/")
    assert ok is False
    assert "loopback" in reason.lower()


@patch("app.services.ssrf_guard.ALLOW_LOCALHOST_TARGET", True)
def test_allows_localhost_when_env_set():
    """When ALLOW_LOCALHOST_TARGET=1, localhost is allowed (for local demo)."""
    ok, reason = is_safe_target_url("http://localhost:8000/mock-vulnerable-api")
    assert ok is True
    assert reason == ""


@patch("app.services.ssrf_guard.ALLOW_LOCALHOST_TARGET", True)
def test_allows_127_0_0_1_when_env_set():
    """When ALLOW_LOCALHOST_TARGET=1, 127.0.0.1 is allowed."""
    ok, reason = is_safe_target_url("http://127.0.0.1:8000/mock")
    assert ok is True


def test_blocks_private_ip_10():
    """Private range 10.x is always blocked."""
    ok, reason = is_safe_target_url("http://10.0.0.1/scan")
    assert ok is False
    assert "private" in reason.lower()


def test_blocks_private_ip_192_168():
    """Private range 192.168.x is always blocked."""
    ok, reason = is_safe_target_url("http://192.168.1.1/api")
    assert ok is False
    assert "private" in reason.lower()


def test_blocks_private_ip_172():
    """Private range 172.16-31.x is always blocked."""
    ok, reason = is_safe_target_url("http://172.16.0.1/")
    assert ok is False


def test_blocks_internal_hostname_local():
    """ .local hostnames are blocked."""
    ok, reason = is_safe_target_url("http://myservice.local/")
    assert ok is False
    assert "internal" in reason.lower()


def test_blocks_internal_hostname_internal():
    """ .internal hostnames are blocked."""
    ok, reason = is_safe_target_url("https://api.internal/")
    assert ok is False


@patch("app.services.ssrf_guard._resolve_host_to_ips", return_value=["192.168.1.1"])
def test_blocks_hostname_resolving_to_private_ip(_resolve):
    """Hostname that resolves to private IP is blocked (DNS rebinding)."""
    ok, reason = is_safe_target_url("https://evil.example.com/")
    assert ok is False
    assert "private" in reason.lower() or "rebinding" in reason.lower()


@patch("app.services.ssrf_guard._resolve_host_to_ips", return_value=[])
def test_blocks_hostname_when_resolution_fails(_resolve):
    """Hostname that fails to resolve or times out is blocked."""
    ok, reason = is_safe_target_url("https://nonexistent.invalid.example/")
    assert ok is False
    assert "resolve" in reason.lower() or "timeout" in reason.lower()


def test_rejects_non_http_schemes():
    """Only http and https are allowed."""
    ok, reason = is_safe_target_url("ftp://files.example.com/")
    assert ok is False
    assert "http" in reason.lower()


def test_rejects_missing_host():
    """URL without host is rejected."""
    ok, reason = is_safe_target_url("http:///path")
    assert ok is False
