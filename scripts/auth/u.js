lucide.createIcons();

import {setAuth} from "./guard.js";
import { getDeviceFingerprint } from "./fingerprint.js";

const API_BASE='';

const authForm=document.getElementById('authForm');
const authTitle=document.getElementById('authTitle');
const authSubtitle=document.getElementById('authSubtitle');
const usernameInput=document.getElementById('usernameInput');
const passwordInput=document.getElementById('passwordInput');
const confirmField=document.getElementById('confirmField');
const confirmInput=document.getElementById('confirmInput');
const authError=document.getElementById('authError');
const authSubmitBtn=document.getElementById('authSubmitBtn');
const authBtnText=document.getElementById('authBtnText');
const authFooterText=document.getElementById('authFooterText');
const authToggleLink=document.getElementById('authToggleLink');

let mode='login';

function showError(msg) {
    authError.textContent=msg;
    authError.classList.add('visible');
}

function clearError() {
    authError.textContent='';
    authError.classList.remove('visible');
}

function setLoading(isLoading) {
    authSubmitBtn.disabled=isLoading;
    if (isLoading) {
        authBtnText.textContent=mode==='login'?'Signing in...':'Creating account...';
    } else {
        authBtnText.textContent="Let's go";
    }
}

function setMode(newMode) {
    mode=newMode;
    clearError();
    passwordInput.value='';
    confirmInput.value='';
    if (mode==='login') {
        authTitle.textContent='Welcome back';
        authSubtitle.textContent='Sign in to continue'; 
        confirmField.classList.add('field-collapsed');
        confirmInput.required=false;
        passwordInput.autocomplete='current-password';
        authFooterText.textContent="Don't have an account?";
        authToggleLink.textContent='Sign up';
    } else {
        authTitle.textContent='Create account';
        authSubtitle.textContent='Sign up to get started';
        confirmField.classList.remove('field-collapsed');
        confirmInput.required=true;
        passwordInput.autocomplete='new-password';
        authFooterText.textContent='Already have an account?';
        authToggleLink.textContent='Sign in';
    }
}

authToggleLink.addEventListener('click',()=>{
    setMode(mode==='login'?'signup':'login');
});

authForm.addEventListener('submit',async(e)=>{
    e.preventDefault();
    clearError();
    const username=usernameInput.value.trim();
    const password=passwordInput.value;
    if (!username||!password) {
        showError('Please fill in all fields.');
        return;
    }
    if (mode==='signup') {
        const confirm=confirmInput.value;
        if (username.length<3||username.length>20) {
            showError('Username must be 3-20 characters');
            return;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            showError('Username can only contain letters, numbers and underscores');
            return;
        }
        if (password.length<6) {
            showError('Password must be at least 6 characters');
            return;
        }
        if (password!==confirm) {
            showError('Passwords do not match');
            return;
        }
    }
    const endpoint=mode==='login'?'/api/auth/login':'/api/auth/signup';
    setLoading(true);
    try {
        const fingerprint=await getDeviceFingerprint();
        const res=await fetch(`${API_BASE}${endpoint}`,{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({username,password,fingerprint})
        });
        const data=await res.json();
        if (!res.ok) {
            showError(data.error||'Something went wrong. Please try again.');
            return;
        }
        setAuth(data.token,data.username);
        window.location.href='t.html';
    } catch (err) {
        console.error(`${mode} failed`,err);
        showError('Could not reach the server. Please try again.');
    } finally {
        setLoading(false);
    }
});

setMode('login');