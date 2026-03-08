import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ScanForm from "@/components/ScanForm";

const mockScanResult = {
  total_tests: 3,
  failed_tests: 0,
  safety_score: 100,
  results: [],
  gradient_used: false,
  rounds: 1,
};

const mockGradientStatus = {
  available: false,
  generation_model: null,
  analysis_model: null,
};

describe("ScanForm", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    // Mock fetch: first call is gradient/status (on mount), subsequent calls are /scan
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (typeof url === "string" && url.includes("/gradient/status")) {
        return Promise.resolve({
          ok: true,
          json: async () => mockGradientStatus,
        });
      }
      // Default: return scan result (overridden in specific tests)
      return Promise.resolve({
        ok: true,
        json: async () => mockScanResult,
      });
    });
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it("renders form with API Endpoint and Target Description fields", () => {
    render(
      <ScanForm
        onResult={jest.fn()}
        onLoading={jest.fn()}
        onError={jest.fn()}
      />
    );
    expect(screen.getByLabelText(/API Endpoint/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Target Description/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Start Scan/i })).toBeInTheDocument();
  });

  it("shows New scan heading", () => {
    render(
      <ScanForm
        onResult={jest.fn()}
        onLoading={jest.fn()}
        onError={jest.fn()}
      />
    );
    expect(screen.getByText("New scan")).toBeInTheDocument();
  });

  it("shows Gradient status badge after fetching status", async () => {
    render(
      <ScanForm
        onResult={jest.fn()}
        onLoading={jest.fn()}
        onError={jest.fn()}
      />
    );
    await waitFor(() => {
      expect(
        screen.getByText(/Gradient AI: Not configured/i)
      ).toBeInTheDocument();
    });
  });

  it("shows connected badge when Gradient is available", async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (typeof url === "string" && url.includes("/gradient/status")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            available: true,
            generation_model: "openai-gpt-oss-20b",
            analysis_model: "llama3.3-70b-instruct",
          }),
        });
      }
      return Promise.resolve({ ok: true, json: async () => mockScanResult });
    });
    render(
      <ScanForm
        onResult={jest.fn()}
        onLoading={jest.fn()}
        onError={jest.fn()}
      />
    );
    await waitFor(() => {
      expect(
        screen.getByText(/Gradient AI: Connected/i)
      ).toBeInTheDocument();
    });
  });

  it("calls onLoading with true then false when submit starts and completes", async () => {
    const onLoading = jest.fn();
    render(
      <ScanForm
        onResult={jest.fn()}
        onLoading={onLoading}
        onError={jest.fn()}
      />
    );
    await act(async () => {
      await userEvent.type(
        screen.getByLabelText(/API Endpoint/i),
        "https://api.example.com/chat"
      );
    });
    await act(async () => {
      await userEvent.click(screen.getByRole("button", { name: /Start Scan/i }));
    });
    expect(onLoading).toHaveBeenCalledWith(true);
    await waitFor(() => {
      expect(onLoading).toHaveBeenCalledWith(false);
    });
  });

  it("calls onResult with scan data on successful response", async () => {
    const onResult = jest.fn();
    render(
      <ScanForm
        onResult={onResult}
        onLoading={jest.fn()}
        onError={jest.fn()}
      />
    );
    await act(async () => {
      await userEvent.type(
        screen.getByLabelText(/API Endpoint/i),
        "https://api.example.com/chat"
      );
    });
    await act(async () => {
      await userEvent.click(screen.getByRole("button", { name: /Start Scan/i }));
    });
    await waitFor(() => {
      expect(onResult).toHaveBeenCalledWith(mockScanResult);
    });
  });

  it("calls onError when fetch fails", async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (typeof url === "string" && url.includes("/gradient/status")) {
        return Promise.resolve({
          ok: true,
          json: async () => mockGradientStatus,
        });
      }
      return Promise.resolve({ ok: false });
    });
    const onError = jest.fn();
    render(
      <ScanForm
        onResult={jest.fn()}
        onLoading={jest.fn()}
        onError={onError}
      />
    );
    await act(async () => {
      await userEvent.type(
        screen.getByLabelText(/API Endpoint/i),
        "https://api.example.com/chat"
      );
    });
    await act(async () => {
      await userEvent.click(screen.getByRole("button", { name: /Start Scan/i }));
    });
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith("Scan failed. Check API endpoint.");
    });
  });

  it("POSTs to /scan with target_url and target_description", async () => {
    render(
      <ScanForm
        onResult={jest.fn()}
        onLoading={jest.fn()}
        onError={jest.fn()}
      />
    );
    await act(async () => {
      await userEvent.type(
        screen.getByLabelText(/API Endpoint/i),
        "https://api.example.com/chat"
      );
    });
    await act(async () => {
      await userEvent.type(
        screen.getByLabelText(/Target Description/i),
        "Example API"
      );
    });
    await act(async () => {
      await userEvent.click(screen.getByRole("button", { name: /Start Scan/i }));
    });
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/scan"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            target_url: "https://api.example.com/chat",
            target_description: "Example API",
            target_body_format: "message",
          }),
        })
      );
    });
  });
});
