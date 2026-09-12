/*
 * Wisp server checker
 *
 * The server list is XOR-obfuscated and base64 encoded. This is only
 * obfuscation, not encryption: anyone who has the key can recover the URLs.
 * The key is intentionally requested at runtime instead of being stored here.
 *
 * Browser checks can report that a WebSocket failed, but cannot prove why.
 * "Failed" therefore means the browser could not establish the socket; it
 * might be a block, a down server, a TLS error, or a server-side rejection.
 */
(function () {
    "use strict";

    var encodedServers =
        "KB5DDAQMC1FfQw0LGBYFVE8DDE8dBxAFCwpDQlEQEw5HW0wEFhJYSk4BHRwZFFRPDxpLEhYQBQccSkMfSRpMHQQMB0dbTAQMEhJLBAAUCQgRDRMLBQwSCwoPQAAMFQdHTUwGFw1AX0MZABZbTUoWBwAVTwcLBgIaFgkQABcHAAwODEsSBwcATkAYTRVRCwAPAENUURIIERVSQAcNBAoRDAIDFw4IAAIaXQYOD0dNTAYXDUBfQxkAFltNShYHABVSTBEJCxsRDA4VEwEZAAIWSwIBHkpDH0kaTB0EDAdHW0wXVgcIVVMGAxECBxdSDF0GDQ0QBQgBCg8WSw8LB0dNQBATAlFfQxUWElRcSgVRAwteQQ0RFgYEHEAHTwEJDhsXAxMNCxVAHQAVTRsTQUpKQ05HDwEHAENYRw8BAQgADgwbCxdFBxAKDE4EFhJYSkEPHQFBTAsEGgdHHE4eQwASCARAX0MKQBAbGxYRBhZcGRNQGUAQCQ4XAQccHAsVTAsEGlFJQxcXDUxJRxYRFltBXAFSFx8YHQMNBFsdEFsLSwIOChQKFRcODBFPABYRThwXTldcR01ACw4aFkdbQAsOHB4EDQsfBApTAxMNCEFAHQAVFkccQghHDwMIBExJRwVQEwNXCg8bGwYLAwcNTwEJDhsXAxMNCxVAHQAVQElDGwEJQ1hHFh0AX05NAVMYEVwYCB8YDRkIFQpLAgIcEAUEFw4AB0sPBxFOEAFKWE1HTUwdChUHR1tMHQoTDwQNBwkABUIDEwEeRU8MABUaURg8";

    var defaultTimeout = 7000;

    function decodeServers(key) {
        if (typeof key !== "string" || key.length === 0) {
            throw new Error("Enter the checker key.");
        }

        var binary = atob(encodedServers);
        var decoded = new Uint8Array(binary.length);
        for (var i = 0; i < binary.length; i++) {
            decoded[i] = binary.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        }

        var parsed;
        try {
            parsed = JSON.parse(new TextDecoder().decode(decoded));
        } catch (error) {
            throw new Error("That key could not decode the server list.");
        }

        if (!Array.isArray(parsed) || parsed.length === 0) {
            throw new Error("That key decoded an invalid server list.");
        }

        parsed.forEach(function (server) {
            if (!server || typeof server.url !== "string" || !/^wss:\/\//i.test(server.url)) {
                throw new Error("That key decoded an invalid server list.");
            }
        });

        return parsed;
    }

    function checkServer(server, timeoutMs) {
        return new Promise(function (resolve) {
            var startedAt = performance.now();
            var settled = false;
            var socket;
            var timer;

            function finish(result) {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                if (socket && socket.readyState !== WebSocket.CLOSED) {
                    try {
                        socket.close();
                    } catch (error) {
                        // The result is already determined.
                    }
                }
                result.server = server;
                result.durationMs = Math.round(performance.now() - startedAt);
                resolve(result);
            }

            try {
                socket = new WebSocket(server.url);
                timer = setTimeout(function () {
                    finish({
                        status: "timeout",
                        message: "No WebSocket response before the timeout."
                    });
                }, timeoutMs);

                socket.addEventListener("open", function () {
                    finish({
                        status: "reachable",
                        message: "WebSocket connection opened."
                    });
                });

                socket.addEventListener("error", function () {
                    finish({
                        status: "failed",
                        message: "The browser could not establish the WebSocket."
                    });
                });

                socket.addEventListener("close", function () {
                    if (!settled) {
                        finish({
                            status: "failed",
                            message: "The server closed the socket before it opened."
                        });
                    }
                });
            } catch (error) {
                finish({
                    status: "invalid",
                    message: error && error.message ? error.message : "Invalid WebSocket URL."
                });
            }
        });
    }

    function check(key, options) {
        options = options || {};
        var timeoutMs = Number(options.timeoutMs) || defaultTimeout;
        timeoutMs = Math.max(1000, Math.min(timeoutMs, 30000));

        var servers = decodeServers(key);
        return Promise.all(servers.map(function (server) {
            return checkServer(server, timeoutMs);
        }));
    }

    function addStyles() {
        if (document.getElementById("wisp-checker-styles")) return;
        var style = document.createElement("style");
        style.id = "wisp-checker-styles";
        style.textContent =
            "#wisp-checker{position:fixed;z-index:2147483647;right:16px;bottom:16px;width:min(540px,calc(100vw - 32px));max-height:calc(100vh - 32px);overflow:auto;padding:16px;color:#f4f4f5;background:#18181b;border:1px solid #3f3f46;border-radius:12px;box-shadow:0 14px 45px #0009;font:14px/1.4 system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}" +
            "#wisp-checker *{box-sizing:border-box}" +
            "#wisp-checker h2{margin:0 0 4px;font-size:17px}" +
            "#wisp-checker p{margin:0;color:#a1a1aa;font-size:12px}" +
            "#wisp-checker form{display:flex;gap:8px;margin:14px 0 10px}" +
            "#wisp-checker input{min-width:0;flex:1;padding:9px 10px;color:#fafafa;background:#27272a;border:1px solid #52525b;border-radius:7px;outline:none}" +
            "#wisp-checker input:focus{border-color:#60a5fa}" +
            "#wisp-checker button{padding:9px 12px;color:#fff;background:#2563eb;border:0;border-radius:7px;cursor:pointer;font-weight:600}" +
            "#wisp-checker button:disabled{opacity:.6;cursor:wait}" +
            "#wisp-checker .wisp-summary{margin:8px 0 10px;color:#d4d4d8;font-size:12px}" +
            "#wisp-checker .wisp-row{display:grid;grid-template-columns:1fr auto;gap:8px;padding:9px 0;border-top:1px solid #27272a}" +
            "#wisp-checker .wisp-name{font-weight:600;overflow-wrap:anywhere}" +
            "#wisp-checker .wisp-url{margin-top:2px;color:#a1a1aa;font-size:11px;overflow-wrap:anywhere}" +
            "#wisp-checker .wisp-note{margin-top:2px;color:#fbbf24;font-size:11px}" +
            "#wisp-checker .wisp-result{text-align:right;white-space:nowrap;font-size:12px}" +
            "#wisp-checker .wisp-reachable{color:#4ade80}" +
            "#wisp-checker .wisp-failed,#wisp-checker .wisp-invalid{color:#fb7185}" +
            "#wisp-checker .wisp-timeout{color:#fbbf24}";
        document.head.appendChild(style);
    }

    function makeElement(tag, className, text) {
        var element = document.createElement(tag);
        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;
        return element;
    }

    function render(container, results, error) {
        var resultsEl = container.querySelector(".wisp-results");
        resultsEl.textContent = "";

        if (error) {
            resultsEl.appendChild(makeElement("div", "wisp-summary wisp-failed", error.message));
            return;
        }

        var reachable = results.filter(function (result) {
            return result.status === "reachable";
        }).length;
        var summary = reachable + " of " + results.length + " servers opened a WebSocket.";
        resultsEl.appendChild(makeElement("div", "wisp-summary", summary));

        results.forEach(function (result) {
            var row = makeElement("div", "wisp-row");
            var details = makeElement("div");
            details.appendChild(makeElement("div", "wisp-name", result.server.name));
            details.appendChild(makeElement("div", "wisp-url", result.server.url));
            if (result.server.note) {
                details.appendChild(makeElement("div", "wisp-note", result.server.note));
            }

            var label = result.status === "reachable"
                ? "REACHABLE"
                : result.status === "timeout"
                    ? "TIMEOUT"
                    : result.status === "invalid"
                        ? "INVALID"
                        : "FAILED";
            var status = makeElement("div", "wisp-result wisp-" + result.status, label);
            status.title = result.message + " (" + result.durationMs + " ms)";
            row.appendChild(details);
            row.appendChild(status);
            resultsEl.appendChild(row);
        });
    }

    function createPanel() {
        if (document.getElementById("wisp-checker")) return;
        addStyles();

        var panel = makeElement("section");
        panel.id = "wisp-checker";
        panel.setAttribute("aria-label", "Wisp server checker");

        var heading = makeElement("h2", null, "Wisp server checker");
        var description = makeElement(
            "p",
            null,
            "Enter the key to decode the bundled server list, then test each WebSocket."
        );
        var form = document.createElement("form");
        var input = document.createElement("input");
        input.type = "password";
        input.placeholder = "Checker key";
        input.autocomplete = "off";
        input.spellcheck = false;
        var button = makeElement("button", null, "Check");
        button.type = "submit";
        var results = makeElement("div", "wisp-results");
        results.appendChild(makeElement("div", "wisp-summary", "Waiting for a key."));

        form.appendChild(input);
        form.appendChild(button);
        panel.appendChild(heading);
        panel.appendChild(description);
        panel.appendChild(form);
        panel.appendChild(results);
        document.body.appendChild(panel);

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            button.disabled = true;
            button.textContent = "Checking…";
            results.textContent = "";
            results.appendChild(makeElement("div", "wisp-summary", "Opening WebSockets…"));

            check(input.value).then(function (output) {
                render(panel, output);
            }).catch(function (error) {
                render(panel, null, error);
            }).finally(function () {
                button.disabled = false;
                button.textContent = "Check";
            });
        });
    }

    window.WispChecker = {
        decodeServers: decodeServers,
        check: check
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", createPanel);
    } else {
        createPanel();
    }
})();