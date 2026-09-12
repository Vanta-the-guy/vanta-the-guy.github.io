/*
 * Console-only Wisp server checker.
 *
 * The checker runs automatically when this file is loaded and writes only to
 * DevTools. It intentionally does not add anything to the visible page.
 *
 * The endpoint list is XOR-obfuscated and base64 encoded. This is casual
 * obfuscation, not encryption. The key is in this client-side file because
 * the checker must run without a form or other visible UI.
 */
(function () {
    "use strict";

    var checkerKey = "seabean";
    var encodedServers =
        "KB5DDAQMC1FfQw0LGBYFVE8DDE8dBxAFCwpDQlEQEw5HW0wEFhJYSk4BHRwZFFRPDxpLEhYQBQccSkMfSRpMHQQMB0dbTAQMEhJLBAAUCQgRDRMLBQwSCwoPQAAMFQdHTUwGFw1AX0MZABZbTUoWBwAVTwcLBgIaFgkQABcHAAwODEsSBwcATkAYTRVRCwAPAENUURIIERVSQAcNBAoRDAIDFw4IAAIaXQYOD0dNTAYXDUBfQxkAFltNShYHABVSTBEJCxsRDA4VEwEZAAIWSwIBHkpDH0kaTB0EDAdHW0wXVgcIVVMGAxECBxdSDF0GDQ0QBQgBCg8WSw8LB0dNQBATAlFfQxUWElRcSgVRAwteQQ0RFgYEHEAHTwEJDhsXAxMNCxVAHQAVTRsTQUpKQ05HDwEHAENYRw8BAQgADgwbCxdFBxAKDE4EFhJYSkEPHQFBTAsEGgdHHE4eQwASCARAX0MKQBAbGxYRBhZcGRNQGUAQCQ4XAQccHAsVTAsEGlFJQxcXDUxJRxYRFltBXAFSFx8YHQMNBFsdEFsLSwIOChQKFRcODBFPABYRThwXTldcR01ACw4aFkdbQAsOHB4EDQsfBApTAxMNCEFAHQAVFkccQghHDwMIBExJRwVQEwNXCg8bGwYLAwcNTwEJDhsXAxMNCxVAHQAVQElDGwEJQ1hHFh0AX05NAVMYEVwYCB8YDRkIFQpLAgIcEAUEFw4AB0sPBxFOEAFKWE1HTUwdChUHR1tMHQoTDwQNBwkABUIDEwEeRU8MABUaURg8";

    var timeoutMs = 7000;

    function decodeServers(key) {
        var binary = atob(encodedServers);
        var bytes = new Uint8Array(binary.length);

        for (var i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        }

        var servers;
        try {
            servers = JSON.parse(new TextDecoder().decode(bytes));
        } catch (error) {
            throw new Error("Could not decode the Wisp server list.");
        }

        if (!Array.isArray(servers) || !servers.length) {
            throw new Error("Decoded Wisp server list is invalid.");
        }
        return servers;
    }

    function checkServer(server) {
        return new Promise(function (resolve) {
            var startedAt = performance.now();
            var socket;
            var timer;
            var finished = false;

            function finish(status, message) {
                if (finished) return;
                finished = true;
                clearTimeout(timer);

                if (socket && socket.readyState !== WebSocket.CLOSED) {
                    try {
                        socket.close();
                    } catch (error) {
                        // Ignore a close race after the result is recorded.
                    }
                }

                resolve({
                    server: server.name,
                    url: server.url,
                    status: status,
                    message: message,
                    durationMs: Math.round(performance.now() - startedAt)
                });
            }

            try {
                socket = new WebSocket(server.url);
                timer = setTimeout(function () {
                    finish("TIMEOUT", "No WebSocket response before the timeout.");
                }, timeoutMs);

                socket.addEventListener("open", function () {
                    finish("REACHABLE", "WebSocket connection opened.");
                });
                socket.addEventListener("error", function () {
                    finish("FAILED", "The browser could not establish the WebSocket.");
                });
                socket.addEventListener("close", function () {
                    if (!finished) {
                        finish("FAILED", "The server closed the socket before it opened.");
                    }
                });
            } catch (error) {
                finish("INVALID", error.message || "Invalid WebSocket URL.");
            }
        });
    }

    function check() {
        var servers = decodeServers(checkerKey);
        return Promise.all(servers.map(checkServer)).then(function (results) {
            console.groupCollapsed("Wisp server check");
            console.info("A failed check can mean blocking, downtime, TLS failure, or server rejection.");
            console.table(results);
            console.groupEnd();
            return results;
        });
    }

    window.WispChecker = {
        check: check,
        decodeServers: function () {
            return decodeServers(checkerKey);
        }
    };

    check().catch(function (error) {
        console.error("Wisp server check failed:", error);
    });
})();