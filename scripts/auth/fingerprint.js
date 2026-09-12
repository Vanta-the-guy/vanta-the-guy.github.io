async function sha256Hex(str) {
    const enc=new TextEncoder().encode(str);
    const digest=await crypto.subtle.digest('SHA-256',enc);
    return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

function getCanvasSignal() {
    try {
        const canvas=document.createElement('canvas');
        canvas.width=220;
        canvas.height=30;
        const ctx=canvas.getContext('2d');
        ctx.textBaseline='top';
        ctx.font='14px Arial';
        ctx.fillStyle='#f60';
        ctx.fillRect(0,0,220,30);
        ctx.fillStyle='#069';
        ctx.fillText('fingerprint-canvas-check',2,2);
        ctx.fillStyle='rgba(102,204,0,0.7)';
        ctx.fillText('fingerprint-canvas-check',4,4);
        return canvas.toDataURL();
    } catch (err) {
        return 'canvas-unavailable';
    }
}

function getWebglSignal() {
    try {
        const canvas=document.createElement('canvas');
        const gl=canvas.getContext('webgl')||canvas.getContext('experimental-webgl');
        if (!gl) return 'no-webgl';
        const debugInfo=gl.getExtension('WEBGL_debug_renderer_info');
        const vendor=debugInfo?gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL):gl.getParameter(gl.VENDOR);
        const renderer=debugInfo?gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER);
        return `${vendor}::${renderer}`;
    } catch (err) {
        return 'webgl-unavailable';
    }
}

function getSignals() {
    return [
        navigator.userAgent||'',
        navigator.language||'',
        String(navigator.hardwareConcurrency||''),
        String(screen.width)+'x'+String(screen.height)+'x'+String(screen.colorDepth),
        String(Intl.DateTimeFormat().resolvedOptions().timeZone||''),
        getCanvasSignal(),
        getWebglSignal(),
        String(navigator.maxTouchPoints||0)
    ].join('|');
}

export async function getDeviceFingerprint() {
    const signals=getSignals();
    return sha256Hex(signals);
}