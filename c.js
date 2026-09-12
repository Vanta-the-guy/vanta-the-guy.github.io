/*
 * Silent Wisp selector.
 *
 * This file intentionally has no UI and produces no console output. It tests
 * the bundled endpoints, chooses the fastest socket that opens, and gives the
 * selected URL to index.html. The key is client-side obfuscation only; it
 * cannot be made secret from someone who can inspect the page.
 */
(function () {
    "use strict";

    var checkerKey = "seabean";
    var timeoutMs = 7000;
    var fallbackWisp = "wss://wisp.mercurywork.shop/";
    var encodedServers =
        "KB5DDAQMC1FfQw0LGBYFVE8DDE8dBxAFCwpDQlEQEw5HW0wEFhJYSk4BHRwZFFRPDxpLEhYQBQccSkMfSRpMHQQMB0dbTAQMEhJLBAAUCQgRDRMLBQwSCwoPQAAMFQdHTUwGFw1AX0MZABZbTUoWBwAVTwcLBgIaFgkQABcHAAwODEsSBwcATkAYTRVRCwAPAENUURIIERVSQAcNBAoRDAIDFw4IAAIaXQYOD0dNTAYXDUBfQxkAFltNShYHABVSTBEJCxsRDA4VEwEZAAIWSwIBHkpDH0kaTB0EDAdHW0wXVgcIVVMGAxECBxdSDF0GDQ0QBQgBCg8WSw8LB0dNQBATAlFfQxUWElRcSgVRAwteQQ0RFgYEHEAHTwEJDhsXAxMNCxVAHQAVTRsTQUpKQ05HDwEHAENYRw8BAQgADgwbCxdFBxAKDE4EFhJYSkEPHQFBTAsEGgdHHE4eQwASCARAX0MKQBAbGxYRBhZcGRNQGUAQCQ4XAQccHAsVTAsEGlFJQxcXDUxJRxYRFltBXAFSFx8YHQMNBFsdEFsLSwIOChQKFRcODBFPABYRThwXTldcR01ACw4aFkdbQAsOHB4EDQsfBApTAxMNCEFAHQAVFkccQghHDwMIBExJRwVQEwNXCg8bGwYLAwcNTwEJDhsXAxMNCxVAHQAVQElDGwEJQ1hHFh0AX05NAVMYEVwYCB8YDRkIFQpLAgIcEAUEFw4AB0sPBxFOEAFKWE1HTUwdChUHR1tMHQoTDwQNBwkABUIDEwEeRU8MABUaURg8";

    function decodeServers() {
        var binary = atob(encodedServers);
        var bytes = new Uint8Array(binary.length);

        for (var i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i) ^ checkerKey.charCodeAt(i % checkerKey.length);
        }

        return JSON.parse(new TextDecoder().decode(bytes));
    }

    function checkServer(server) {
        return new Promise(function (resolve) {
            var socket;
            var timer;
            var startedAt = performance.now();
            var finished = false;

            function finish(reachable) {
                if (finished) return;
                finished = true;
                clearTimeout(timer);

                if (socket && socket.readyState !== WebSocket.CLOSED) {
                    try {
                        socket.close();
                    } catch (error) {
                        // Ignore a close race after the result is known.
                    }
                }

                resolve({
                    url: server.url,
                    reachable: reachable,
                    durationMs: performance.now() - startedAt
                });
            }

            try {
                socket = new WebSocket(server.url);
                timer = setTimeout(function () {
                    finish(false);
                }, timeoutMs);

                socket.addEventListener("open", function () {
                    finish(true);
                });
                socket.addEventListener("error", function () {
                    finish(false);
                });
                socket.addEventListener("close", function () {
                    if (!finished) finish(false);
                });
            } catch (error) {
                finish(false);
            }
        });
    }

    function chooseWisp() {
        var servers = decodeServers();
        return Promise.all(servers.map(checkServer)).then(function (results) {
            var reachable = results.filter(function (result) {
                return result.reachable;
            });

            reachable.sort(function (a, b) {
                return a.durationMs - b.durationMs;
            });

            var selected = reachable.length ? reachable[0].url : fallbackWisp;
            window.__selectedWispServer = selected;
            return selected;
        }, function () {
            window.__selectedWispServer = fallbackWisp;
            return fallbackWisp;
        });
    }

    // index.html awaits this before creating the Scramjet transport.
    window.__wispServerReady = Promise.resolve()
        .then(chooseWisp)
        .catch(function () {
            window.__selectedWispServer = fallbackWisp;
            return fallbackWisp;
        });
})();