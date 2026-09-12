const API_BASE='';

export function getAuthToken() {
    return localStorage.getItem('authToken');
}

export function getAuthUsername() {
    return localStorage.getItem('authUsername');
}

export function clearAuth() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUsername');
}

export function redirect() {
    window.location.href='u.html';
}

export async function requireAuth() {
    const token=getAuthToken();
    if (!token) {
        redirect();
        return null;
    }
    try {
        const res=await fetch(`${API_BASE}/api/auth/me`,{
            headers:{'Authorization':`Bearer ${token}`}
        });
        if (!res.ok) {
            clearAuth();
            redirect();
            return null;
        }
        const data=await res.json();
        return data.username;
    } catch (err) {
        console.error('auth check failed',err);
        redirect();
        return null;
    }
}

export function setAuth(token,username) {
    localStorage.setItem('authToken',token);
    localStorage.setItem('authUsername',username);
}