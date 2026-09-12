import { requireAuth,getAuthToken,clearAuth,redirect,setAuth } from "../auth/guard.js";
lucide.createIcons();

const contentArea=document.getElementById('contentArea');
const messageInput=document.getElementById('messageInput');
const sendBtn=document.getElementById('sendBtn');
const activeChannelName=document.getElementById('activeChannelName');
const sidebarScroll=document.getElementById('sidebarScroll');
const membersScroll=document.getElementById('membersScroll');
const sidebarHeader=document.getElementById('sidebarHeader');
const viewDropdown=document.getElementById('viewDropdown');
const sidebarViewLabel=document.getElementById('sidebarViewLabel');
const dmBadge=document.getElementById('dmBadge');
const userBar=document.getElementById('userBar');
const userBarAvatar=document.getElementById('userBarAvatar');
const userBarName=document.getElementById('userBarName');
const modalOverlay=document.getElementById('modalOverlay');
const modalCard=document.getElementById('modalCard');
const modPanel=document.getElementById('modPanel');
const typingIndicator=document.getElementById('typingIndicator');
const messageRows=new Map();
const messagesById=new Map();

let ws=null;
let currentChannel='general';
let myUser=null;
let lastMsgUsername=null;
let lastMsgTimestamp=null;
let currentMembers=[];
let EMOJI_LIST=['👍','❤️','😂','😮','😢','🔥','🎉','👀','🙏','💯'];
let openPicker=null;
let currentView='chat';
let currentDmUser=null;
let dmMessageRows=new Map();
let friendsData={accepted:[],incoming:[],outgoing:[]};
let myProfile=null;
let roleColours=new Map();
let roleNames=new Map();
let avatarUrls=new Map();
let cachedChannels=[];
let canModerate=false;
let myRole='member';
let typingTimeout=null;
let isCurrentlyTyping=false;
let dmTypingTimeout=null;
let channelMeta=new Map();

const GROUP_WINDOW_MS=2*60*1000

function getAvatarUrl(username) {
    const custom=avatarUrls.get(username);
    if (custom) return custom;
    return `https://api.dicebear.com/10.x/thumbs/svg?seed=${encodeURIComponent(username)}`;
}

function isLightColour(hex) {
    const c=hex.replace('#','');
    if (c.length!==6) return false;
    const r=parseInt(c.substring(0,2),16);
    const g=parseInt(c.substring(2,4),16);
    const b=parseInt(c.substring(4,6),16);
    const luminance=(0.299*r+0.587*g+0.114*b)/255;
    return luminance>0.7;
}

async function loadMembers() {
    const token=getAuthToken();
    const res=await fetch('/api/chat/members',{
        headers:{'Authorization':`Bearer ${token}`}
    });
    if (!res.ok) return [];
    const data=await res.json();
    data.members.forEach(m=>roleColours.set(m.username,m.roleColor||'#f0f0f0'));
    data.members.forEach(m=>{if (m.avatarUrl) avatarUrls.set(m.username,m.avatarUrl);});
    data.members.forEach(m=>roleNames.set(m.username,m.roleName||''));
    return data.members;
}

function buildReactions(message) {
    const reactions=message.reactions||{};
    const entries=Object.entries(reactions);
    if (!entries.length) return '';
    return `
    <div class="msg-reactions">${entries.map(([emoji,users])=>`
    <button class="reaction-pill${users.includes(myUser)?' mine':''}" data-emoji="${emoji}">
        <span class="reaction-emoji">${emoji}</span><span class="reaction-count">${users.length}</span>
    </button>`).join('')}</div>`;
}

function attachReactionListeners(row,messageId) {
    const reactionsEl=row.querySelector('.msg-reactions');
    if (!reactionsEl) return;
    reactionsEl.querySelectorAll('.reaction-pill').forEach(pill=>{
        pill.addEventListener('click',()=>{
            sendReaction(messageId,pill.dataset.emoji);
        });
    });
}

function closeEmojiPicker() {
    if (openPicker) {
        openPicker.remove();
        openPicker=null;
        document.removeEventListener('click',handleOClick);
    }
}

function handleOClick(e) {
    if (openPicker&&!openPicker.contains(e.target)) closeEmojiPicker();
}

function openEmojiPicker(anchorBtn,messageId) {
    closeEmojiPicker();
    const picker=document.createElement('div');
    picker.className='emoji-picker';
    picker.innerHTML=EMOJI_LIST.map(e=>`<button class="emoji-option" data-emoji="${e}">${e}</button>`).join('');
    document.body.appendChild(picker);
    const rect=anchorBtn.getBoundingClientRect();
    picker.style.top=`${rect.bottom+6+window.scrollY}px`;
    picker.style.left=`${Math.min(rect.left+window.scrollX,window.innerWidth-picker.offsetWidth-16)}px`;
    picker.querySelectorAll('.emoji-option').forEach(btn=>{
        btn.addEventListener('click',()=>{
            sendReaction(messageId,btn.dataset.emoji);
            closeEmojiPicker();
        });
    });
    openPicker=picker;
    setTimeout(()=>document.addEventListener('click',handleOClick),0);
}

function updMsg(message) {
    if (!messageRows.has(message.id)) return;
    messagesById.set(message.id,message);
    const row=messageRows.get(message.id);
    const textEl=row.querySelector('.msg-text');
    const editedTag=message.editedAt?' <span class="msg-edited">(edited)</span>':'';
    textEl.innerHTML=`${escapeHtml(message.text)}${editedTag}`;
    let reactionsEl=row.querySelector('.msg-reactions');
    if (reactionsEl) reactionsEl.remove();
    const newReactionsHtml=buildReactions(message);
    if (newReactionsHtml) {
        row.querySelector('.msg-body').insertAdjacentHTML('beforeend',newReactionsHtml);
        attachReactionListeners(row,message.id);
    }
}

function removeMsg(messageId) {
    const row=messageRows.get(messageId);
    if (row) row.remove();
    messageRows.delete(messageId);
    messagesById.delete(messageId);
}

function sendReaction(messageId,emoji) {
    if (!ws||ws.readyState!==WebSocket.OPEN) return;
    ws.send(JSON.stringify({type:'reaction',messageId,emoji}));
}

function sendEdit(messageId,text) {
    if (!ws||ws.readyState!==WebSocket.OPEN) return;
    ws.send(JSON.stringify({type:'edit',messageId,text}));
}

function sendDelete(messageId) {
    if (!ws||ws.readyState!==WebSocket.OPEN) return;
    ws.send(JSON.stringify({type:'delete',messageId}));
}

function getLastMsg() {
    const lastRow=contentArea.lastElementChild;
    if (!lastRow) return null;
    const id=lastRow.dataset.messageId;
    return messagesById.get(id)||null;
}

function enterEditMode(messageId) {
    const row=messageRows.get(messageId);
    const message=messagesById.get(messageId);
    if (!row||!message) return;
    const textEl=row.querySelector('.msg-text');
    const original=message.text;
    textEl.innerHTML=`<input class="msg-edit-input" type="text" value="${escapeHtml(original)}">`;
    const input=textEl.querySelector('.msg-edit-input');
    input.focus();
    input.setSelectionRange(input.value.length,input.value.length);
    function revert() {
        if (settled) return;
        settled=true;
        if (textEl.contains(input)) {
            textEl.innerHTML=escapeHtml(original);
        }
    }
    input.addEventListener('keydown',(e)=>{
        if (e.key==='Enter') {
            const newText=input.value.trim();
            if (newText&&newText!==original) {
                sendEdit(messageId,newText);
            } else {
                revert();
            }
        } else if (e.key==='Escape') {
            revert();
        }
    });
    input.addEventListener('blur',()=>{
        setTimeout(revert,0);
    });
}

function renderMemberItem(member) {
    return `
    <div class="member-item ${member.online?'':'offline'}" data-username="${escapeHtml(member.username)}">
        <div class="member-avatar">
            <img class="member-avatar-img" src="${getAvatarUrl(member.username)}" alt="">
            <div class="member-status-dot ${member.online?'':'offline'}"></div>
        </div>
        <span class="member-name">${escapeHtml(member.username)}${roleTagHtml(member.username)}</span>
    </div>`;
}

function buildMembers(members) {
    const online=members.filter(m=>m.online).sort((a,b)=>a.username.localeCompare(b.username));
    const offline=members.filter(m=>!m.online).sort((a,b)=>a.username.localeCompare(b.username));
    let html=''
    if (online.length) {
        html+=`
        <div class="members-group">
            <div class="members-group-label">Online - ${online.length}</div>
            ${online.map(renderMemberItem).join('')}
        </div>`;
    }
    if (offline.length) {
        html+=`
        <div class="members-group">
            <div class="members-group-label">Offline - ${offline.length}</div>
            ${offline.map(renderMemberItem).join('')}
        </div>`;
    }
    membersScroll.innerHTML=html;
    membersScroll.querySelectorAll('.member-item').forEach(el=>{
        el.style.cursor='pointer';
        el.addEventListener('click',()=>openProfile(el.dataset.username));
    });
}

function applyPresence(onUsers) {
    currentMembers=currentMembers.map(m=>({...m,online:onUsers.includes(m.username)}));
    buildMembers(currentMembers);
}

function renderMessage(message) {
    const isMine=message.username===myUser;
    const now=new Date(message.createdAt).getTime();
    const lastMsg=getLastMsg();
    const withinWindow=lastMsgTimestamp!==null&&(now-lastMsgTimestamp)<GROUP_WINDOW_MS;
    const isGrouped=lastMsg&&lastMsg.username===message.username&&withinWindow;
    lastMsgUsername=message.username;
    lastMsgTimestamp=now;
    const row=document.createElement('div');
    row.className=isGrouped?'msg-row grouped':'msg-row';
    row.dataset.messageId=message.id;
    const editedTag=message.editedAt?' <span class="msg-edited">(edited)</span>':'';
    const reactionsHtml=buildReactions(message);
    if (isGrouped) {
        row.innerHTML=`
        <div class="msg-avatar-spacer"></div>
        <div class="msg-body">
            <div class="msg-text">${escapeHtml(message.text)}${editedTag}</div>
            ${reactionsHtml}
        </div>
        ${buildActions(message,isMine)}`;
    } else {
        row.innerHTML=`
        <div class="msg-avatar" data-username="${escapeHtml(message.username)}">
            <img class="msg-avatar-img" src="${getAvatarUrl(message.username)}" alt="">
        </div>
        <div class="msg-body">
            <div class="msg-author">${escapeHtml(message.username)}${isMine?' (you)':''}${roleTagHtml(message.username)}<span class="msg-time">${formatTime(message.createdAt)}</span></div>
            <div class="msg-text">${escapeHtml(message.text)}${editedTag}</div>
            ${reactionsHtml}
        </div>
        ${buildActions(message,isMine)}`;
    }
    row.querySelector('.msg-actions').addEventListener('click',(e)=>{
        const btn=e.target.closest('.msg-action-btn');
        if (!btn) return;
        handleMsgAction(btn.dataset.action,message,btn);
    });
    const avatarEl=row.querySelector('.msg-avatar');
    if (avatarEl) avatarEl.addEventListener('click',()=>openProfile(message.username));
    attachReactionListeners(row,message.id);
    messageRows.set(message.id,row);
    messagesById.set(message.id,message);
    contentArea.appendChild(row);
    contentArea.scrollTop=contentArea.scrollHeight;
    lucide.createIcons();
}

function handleMsgAction(action,message,btn) {
    if (action==='react') {
        openEmojiPicker(btn,message.id);
    } else if (action==='edit') {
        enterEditMode(message.id);
    } else if (action==='delete') {
        sendDelete(message.id);
    }
}

function buildActions(message,isMine) {
    return `
    <div class="msg-actions">
        <button class="msg-action-btn" data-action="react" title="React"><i data-lucide="smile"></i></button>
        ${isMine?`<button class="msg-action-btn" data-action="edit" title="Edit"><i data-lucide="pencil"></i></button>`:''}
        ${isMine?`<button class="msg-action-btn danger" data-action="delete" title="Delete"><i data-lucide="trash-2"></i></button>`:''}
    </div>`;
}

function escapeHtml(str) {
    const div=document.createElement('div');
    div.textContent=str;
    return div.innerHTML;
}

function formatTime(iso) {
    const d=new Date(iso);
    return d.toLocaleDateString([],{hour:'numeric',minute:'2-digit'});
}
 
async function loadHistory(channel) {
    contentArea.innerHTML='';
    lastMsgUsername=null;
    lastMsgTimestamp=null;
    messageRows.clear();
    messagesById.clear();
    const token=getAuthToken();
    const res=await fetch(`/api/chat/messages/${channel}`,{
        headers:{'Authorization':`Bearer ${token}`}
    });
    if (!res.ok) return;
    const data=await res.json();
    data.messages.forEach(renderMessage);
}

function connectWs() {
    const token=getAuthToken();
    const protocol=location.protocol==='https:'?'wss:':'ws:';
    ws=new WebSocket(`${protocol}//${location.host}/api/chat/ws?token=${encodeURIComponent(token)}`);
    ws.addEventListener('open',()=>{
        ws.send(JSON.stringify({type:'join',channel:currentChannel}));
    });
    ws.addEventListener('message',(event)=>{
        const data=JSON.parse(event.data);
        if (data.type==='message'&&data.channel===currentChannel) {
            renderMessage(data.message);
        } else if (data.type==='message_edited'&&data.channel===currentChannel) {
            updMsg(data.message);
        } else if (data.type==='message_deleted'&&data.channel===currentChannel) {
            removeMsg(data.messageId);
        } else if (data.type==='message_reaction'&&data.channel===currentChannel) {
            updMsg(data.message);
        } else if (data.type==='presence') {
            applyPresence(data.online);
        } else if (data.type==='dm') {
            if (currentView==='dms'&&currentDmUser&&(data.message.from===currentDmUser||data.message.to===currentDmUser)) {
                renderDmMessage(data.message);
            }
        } else if (data.type==='typing'&&data.channel===currentChannel&&currentView==='chat') {
            renderTypingIndicator(data.usernames.filter(u=>u!==myUser));
        } else if (data.type==='dm_typing'&&currentView==='dms'&&currentDmUser===data.from) {
            renderTypingIndicator(data.isTyping?[data.from]:[]);
        } else if (data.type==='banned') {
            alert(`You have been banned: ${data.reason}`);
            clearAuth();
            redirect();
        } else if (data.type==='muted') {
            typingIndicator.textContent=`You are muted: ${data.reason}`;
        } else if (data.type==='warned') {
            alert(`You received a warning from ${data.moderator}: ${data.reason}`);
        } else if (data.type==='role_changed') {
            location.reload();
        } else if (data.type==='friend_request'||data.type==='friend_accepted') {
            loadFriends();
        } else if (data.type==='error') {
            console.error('chat error',data.error);
        }
    });
    ws.addEventListener('close',()=>{
        setTimeout(connectWs,2000);
    });
}

function renderTypingIndicator(usernames) {
    if (!usernames.length) {
        typingIndicator.textContent='';
        return;
    }
    if (usernames.length===1) {
        typingIndicator.textContent=`${usernames[0]} is typing...`;
    } else if (usernames.length===2) {
        typingIndicator.textContent=`${usernames[0]} and ${usernames[1]} are typing...`;
    } else {
        typingIndicator.textContent='Several people are typing...';
    }
}

async function switchChannel(channel) {
    currentChannel=channel;
    typingIndicator.textContent='';
    activeChannelName.textContent=channel;
    const meta=channelMeta.get(channel);
    const canPost=meta?meta.canPost:true;
    messageInput.disabled=!canPost;
    messageInput.placeholder=canPost?`Message #${channel}`:`You don't have permission to send messages in #${channel}`;
    sendBtn.disabled=!canPost;
    sendBtn.style.opacity=canPost?'1':'0.4';
    document.querySelectorAll('.channel-item').forEach(i=>{{
        i.classList.toggle('active',i.dataset.channel===channel);
    }});
    await loadHistory(channel);
    if (ws&&ws.readyState===WebSocket.OPEN) {
        ws.send(JSON.stringify({type:'join',channel}));
    }
}

function sendMessage() {
    const text=messageInput.value.trim();
    if (!text||!ws||ws.readyState!==WebSocket.OPEN) return;
    if (currentView==='dms') {
        if (!currentDmUser) return;
        ws.send(JSON.stringify({type:'dm',to:currentDmUser,text}));
        clearTimeout(dmTypingTimeout);
        isCurrentlyTyping=false;
        ws.send(JSON.stringify({type:'dm_typing',to:currentDmUser,isTyping:false}));
    } else {
        ws.send(JSON.stringify({type:'message',text}));
        clearTimeout(typingTimeout);
        isCurrentlyTyping=false;
        ws.send(JSON.stringify({type:'typing',isTyping:false}));
    }
    messageInput.value='';
}

async function loadChannels() {
    const token=getAuthToken();
    const res=await fetch('/api/chat/channels',{
        headers:{'Authorization':`Bearer ${token}`}
    });
    if (!res.ok) return [];
    const data=await res.json();
    return data.channels;
}

function buildSidebar(channels) {
    channelMeta.clear();
    channels.forEach(ch=>channelMeta.set(ch.id,{readOnly:ch.readOnly,canPost:ch.canPost}));
    const categories=new Map();
    channels.forEach((ch)=>{
        if (!categories.has(ch.category)) categories.set(ch.category,[]);
        categories.get(ch.category).push(ch);
    });
    sidebarScroll.innerHTML='';
    let first=true;
    for (const [categoryName,items] of categories) {
        if (!first) {
            const divider=document.createElement('div');
            divider.className='divider';
            sidebarScroll.appendChild(divider);
        }
        first=false;
        const category=document.createElement('div');
        category.className='category';
        const catLabel=document.createElement('div');
        catLabel.className='cat-label';
        catLabel.dataset.category=categoryName;
        catLabel.innerHTML=`<i data-lucide="chevron-down"></i><span>${escapeHtml(categoryName)}</span>`;
        const channelList=document.createElement('div');
        channelList.className='channel-list';
        items.forEach((ch)=>{
            const item=document.createElement('div');
            item.className='channel-item';
            item.dataset.channel=ch.id;
            const icon=ch.readOnly?'lock':'hash';
            item.innerHTML=`<i data-lucide="${icon}"></i><span>${escapeHtml(ch.name)}</span>`;
            item.addEventListener('click',()=>switchChannel(ch.id));
            channelList.appendChild(item);
        });
        catLabel.addEventListener('click',()=>{
            catLabel.classList.toggle('collapsed');
            channelList.classList.toggle('collapsed');
        });
        category.appendChild(catLabel);
        category.appendChild(channelList);
        sidebarScroll.appendChild(category);
    }
    lucide.createIcons();
}

sendBtn.addEventListener('click',sendMessage);
messageInput.addEventListener('keydown',(e)=>{
    if (e.key==='Enter') sendMessage();
});

messageInput.addEventListener('input',()=>{
    if (currentView==='dms') {
        if (!currentDmUser||!ws||ws.readyState!==WebSocket.OPEN) return;
        if (!isCurrentlyTyping) {
            isCurrentlyTyping=true;
            ws.send(JSON.stringify({type:'dm_typing',to:currentDmUser,isTyping:true}));
        }
        clearTimeout(dmTypingTimeout);
        dmTypingTimeout=setTimeout(()=>{
            isCurrentlyTyping=false;
            ws.send(JSON.stringify({type:'dm_typing',to:currentDmUser,isTyping:false}));
        },3000);
    } else {
        if (!ws||ws.readyState!==WebSocket.OPEN) return;
        if (!isCurrentlyTyping) {
            isCurrentlyTyping=true;
            ws.send(JSON.stringify({type:'typing',isTyping:true}));
        }
        clearTimeout(typingTimeout);
        typingTimeout=setTimeout(()=>{
            isCurrentlyTyping=false;
            ws.send(JSON.stringify({type:'typing',isTyping:false}));
        },3000);
    }
});

function closeModal() {
    modalOverlay.classList.remove('open');
    modalCard.innerHTML='';
}

modalOverlay.addEventListener('click',(e)=>{
    if (e.target===modalOverlay) closeModal();
});

async function openProfile(username) {
    const token=getAuthToken();
    const res=await fetch(`/api/chat/profile/${encodeURIComponent(username)}`,{
        headers:{'Authorization':`Bearer ${token}`}
    });
    if (!res.ok) return;
    const data=await res.json();
    if (data.profile.avatarUrl) avatarUrls.set(data.profile.username,data.profile.avatarUrl);
    canModerate=data.canModerate;
    renderProfile(data.profile,data.friendStatus,data.isSelf);
    modalOverlay.classList.add('open');
}

function friendActionHtml(status,username) {
    if (status==='friends') {
        return `<button class="modal-btn danger" data-action="remove-friend" data-username="${escapeHtml(username)}"><i data-lucide="user-x"></i>Remove Friend</button>`;
    }
    if (status==='outgoing') {
        return `<button class="modal-btn" disabled><i data-lucide="clock"></i>Request Sent</button>`;
    }
    if (status==='incoming') {
        return `<button class="modal-btn primary" data-action="accept-friend" data-username="${escapeHtml(username)}"><i data-lucide="user-check"></i>Accept Request</button>`;
    }
    return `<button class="modal-btn primary" data-action="add-friend" data-username="${escapeHtml(username)}"><i data-lucide="user-plus"></i>Add Friend</button>`;
}

function messageActionHtml(status,username) {
    if (status==='friends') {
        return `<button class="modal-btn primary" data-action="open-dm" data-username="${escapeHtml(username)}"><i data-lucide="message-circle"></i>Message</button>`;
    }
    return `<button class="modal-btn" disabled><i data-lucide="message-circle"></i>Message</button>`;
}

function roleBadgeHtml(profile) {
    const lightClass=isLightColour(profile.roleColor)?' on-light':'';
    return `<span class="modal-role-badge${lightClass}" style="background:${profile.roleColor}">${escapeHtml(profile.roleName)}</span>`;
}

function roleTagHtml(username) {
    const colour=roleColours.get(username);
    const name=roleNames.get(username);
    if (!colour||!name) return '';
    const lightClass=isLightColour(colour)?' on-light':'';
    return `<span class="role-tag${lightClass}" style="background:${colour}">${escapeHtml(name)}</span>`;
}

function formatMemberSince(iso) {
    const d=new Date(iso);
    return d.toLocaleDateString([],{month:'long',year:'numeric'});
}

function roleTagLine(profile) {
    const lightClass=isLightColour(profile.roleColor)?' on-light':'';
    return `<span class="modal-role-badge${lightClass}" style="background:${profile.roleColor}">${escapeHtml(profile.roleName)}</span>`;
}

function renderProfile(profile,friendStatus,isSelf) {
    modalCard.classList.remove('settings-card');
    modalCard.innerHTML=`
    <button class="modal-close" id="modalCloseBtn"><i data-lucide="x"></i></button>
    <div class="modal-left">
        <div class="modal-banner-card"></div>
        <div class="modal-avatar-wrap">
            <div class="modal-avatar${isSelf?' editable':''}" id="modalAvatarBox">
                <img src="${getAvatarUrl(profile.username)}" alt="">
                ${isSelf?`
                <div class="modal-avatar-overlay">
                    <div class="modal-avatar-overlay-text">Upload<br>Image</div>
                </div>
                <input type="file" id="modalAvatarFileInput" accept="image/png,image/jpeg,image/webp,image/gif" style="display:none;">
                `:''}
            </div>
        </div>
        <div class="modal-identity-block">
            <div class="modal-identity-row">
                <div class="modal-username">${escapeHtml(profile.username)}</div>
                ${roleTagLine(profile)}
            </div>
            <div class="modal-divider"></div>
            <div class="modal-actions">
                ${isSelf?`<button class="modal-btn primary" data-action="edit-profile"><i data-lucide="pencil"></i>Edit Profile</button>`:friendActionHtml(friendStatus,profile.username)+messageActionHtml(friendStatus,profile.username)}
            </div>
            ${!isSelf&&canModerate?`<button class="modal-btn" data-action="moderate" data-username="${escapeHtml(profile.username)}" style="width:100%;margin-top:6px;"><i data-lucide="shield"></i>Moderate</button>`:''}
            <div class="modal-info-block">
                <div class="modal-member-since"><i data-lucide="calendar"></i>Member since ${formatMemberSince(profile.createdAt)}</div>
            </div>
            ${profile.bio?`
            <div class="modal-field-label">About</div>
            <div class="modal-bio">${escapeHtml(profile.bio)}</div>
            `:''}
            <div class="modal-status" id="modalStatus"></div>
        </div>
    </div>
    <div class="modal-right">
        <div class="modal-tabs">
            <div class="modal-tab active" data-tab="activity">Activity</div>
            <div class="modal-tab" data-tab="mutual">Mutual Friends</div>
        </div>
        <div class="modal-tab-panel" id="modalTabPanel"></div>
    </div>`;
    lucide.createIcons();
    document.getElementById('modalCloseBtn').addEventListener('click',closeModal);
    renderProfileTab('activity',profile,isSelf);
    modalCard.querySelectorAll('.modal-tab').forEach(tab=>{
        tab.addEventListener('click',()=>{
            modalCard.querySelectorAll('.modal-tab').forEach(t=>t.classList.remove('active'));
            tab.classList.add('active');
            renderProfileTab(tab.dataset.tab,profile,isSelf);
        });
    });
    if (isSelf) {
        const avatarBox=document.getElementById('modalAvatarBox');
        const fileInput=document.getElementById('modalAvatarFileInput');
        avatarBox.addEventListener('click',()=>fileInput.click());
        fileInput.addEventListener('change',async()=>{
            const file=fileInput.files?.[0];
            if (!file) return;
            await uploadAvatarFile(file);
            openProfile(profile.username);
        });
    }
    modalCard.querySelectorAll('[data-action]').forEach(btn=>{
        btn.addEventListener('click',async()=>{
            const action=btn.dataset.action;
            const username=btn.dataset.username;
            const statusEl=document.getElementById('modalStatus');
            if (action==='edit-profile') return openSettings();
            if (action==='open-dm') {
                closeModal();
                switchToView('dms');
                openDmThread(username);
                return;
            }
            if (action==='moderate') {
                openModPanel(username,btn);
                return;
            }
            const endpoint={
                'add-friend':'/api/chat/friends/request',
                'accept-friend':'/api/chat/friends/accept',
                'remove-friend':'/api/chat/friends/remove'
            }[action];
            if (!endpoint) return;
            const token=getAuthToken();
            const res=await fetch(endpoint,{
                method:'POST',
                headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},
                body:JSON.stringify({username})
            });
            const result=await res.json();
            if (!res.ok) {
                if (statusEl) {
                    statusEl.textContent=result.error||'Something went wrong.';
                    statusEl.className='modal-status error';
                }
                return;
            }
            await loadFriends();
            openProfile(username);
        });
    });
}

function renderProfileTab(tab,profile,isSelf) {
    const panel=document.getElementById('modalTabPanel');
    if (tab==='activity') {
        panel.innerHTML=`
        <div class="modal-empty-state">
            <i data-lucide="activity" class="modal-empty-icon"></i>
            <div class="modal-empty-text">${escapeHtml(profile.username)} doesn't have any activity to share yet.</div>
        </div>`;
    } else {
        panel.innerHTML=`
        <div class="modal-empty-state">
            <i data-lucide="users" class="modal-empty-icon"></i>
            <div class="modal-empty-text">No mutual friends to show yet.</div>
        </div>`;
    }
    lucide.createIcons();
}

async function openSettings() {
    const token=getAuthToken();
    const res=await fetch(`/api/chat/profile/${encodeURIComponent(myUser)}`,{
        headers:{'Authorization':`Bearer ${token}`}
    });
    if (!res.ok) return;
    const data=await res.json();
    myProfile=data.profile;
    renderSettings(data.profile);
    modalOverlay.classList.add('open');
}

function renderSettings(profile) {
    modalCard.classList.add('settings-card');
    modalCard.innerHTML=`
    <button class="modal-close" id="modalCloseBtn"><i data-lucide="x"></i></button>
    <div class="settings-preview">
        <div class="settings-preview-card">
            <div class="settings-preview-banner"></div>
            <div class="settings-preview-body">
                <div class="settings-preview-avatar-wrap">
                    <div class="settings-preview-avatar" id="modalAvatarBox">
                        <img id="settingsAvatarPreview" src="${getAvatarUrl(profile.username)}" alt="">
                        <div class="modal-avatar-overlay">
                            <i data-lucide="upload"></i>
                            <div class="modal-avatar-overlay-text">Change</div>
                        </div>
                        <input type="file" id="modalAvatarFileInput" accept="image/png,image/jpeg,image/webp,image/gif" style="display:none;">
                    </div>
                </div>
                <div class="settings-preview-name">${escapeHtml(profile.username)}</div>
                <div class="settings-preview-bio" id="settingsPreviewBio">${escapeHtml(profile.bio||'')}</div>
            </div>
        </div>
    </div>
    <div class="settings-section">
        <div class="settings-row">
            <div class="modal-field-label">Username</div>
            <input class="modal-input" id="settingsUsernameInput" type="text" value="${escapeHtml(profile.username)}">
        </div>
        <div class="settings-row">
            <button class="modal-btn" id="settingsUsernameSaveBtn" style="width:100%;"><i data-lucide="at-sign"></i>Change username</button>
        </div>
        <div class="settings-row">
            <div class="modal-field-label">Bio</div>
            <textarea class="modal-textarea" id="settingsBioInput" rows="3" maxlength="280" placeholder="Tell people about yourself...">${escapeHtml(profile.bio||'')}</textarea>
        </div>
        <div class="modal-save-row">
            <button class="modal-btn" id="settingsCancelBtn">Cancel</button>
            <button class="modal-btn primary" id="settingsSaveBtn"><i data-lucide="check"></i>Save</button>
        </div>
        <div class="modal-status" id="modalStatus"></div>
    </div>`;
    lucide.createIcons();

    document.getElementById('modalCloseBtn').addEventListener('click',closeModal);
    document.getElementById('settingsCancelBtn').addEventListener('click',closeModal);

    const bioInput=document.getElementById('settingsBioInput');
    const previewBio=document.getElementById('settingsPreviewBio');
    bioInput.addEventListener('input',()=>{
        previewBio.textContent=bioInput.value;
    });

    const avatarBox=document.getElementById('modalAvatarBox');
    const fileInput=document.getElementById('modalAvatarFileInput');
    avatarBox.addEventListener('click',()=>fileInput.click());
    fileInput.addEventListener('change',async()=>{
        const file=fileInput.files?.[0];
        if (!file) return;
        const statusEl=document.getElementById('modalStatus');
        statusEl.textContent='Uploading...';
        statusEl.className='modal-status';
        const result=await uploadAvatarFile(file);
        if (!result.ok) {
            statusEl.textContent=result.error;
            statusEl.className='modal-status error';
            return;
        }
        document.getElementById('settingsAvatarPreview').src=result.avatarUrl;
        statusEl.textContent='Avatar updated.';
        statusEl.className='modal-status success';
    });

    document.getElementById('settingsUsernameSaveBtn').addEventListener('click',async()=>{
        const statusEl=document.getElementById('modalStatus');
        const newUsername=document.getElementById('settingsUsernameInput').value.trim();
        if (!newUsername||newUsername===profile.username) return;
        const token=getAuthToken();
        const res=await fetch('/api/auth/username',{
            method:'POST',
            headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},
            body:JSON.stringify({username:newUsername})
        });
        const result=await res.json();
        if (!res.ok) {
            statusEl.textContent=result.error||'Something went wrong.';
            statusEl.className='modal-status error';
            return;
        }
        setAuth(result.token,result.username);
        location.reload();
    });

    document.getElementById('settingsSaveBtn').addEventListener('click',async()=>{
        const statusEl=document.getElementById('modalStatus');
        const bio=bioInput.value;
        const token=getAuthToken();
        const formData=new FormData();
        formData.append('bio',bio);
        const res=await fetch('/api/chat/profile',{
            method:'PATCH',
            headers:{'Authorization':`Bearer ${token}`},
            body:formData
        });
        const result=await res.json();
        if (!res.ok) {
            statusEl.textContent=result.error||'Something went wrong.';
            statusEl.className='modal-status error';
            return;
        }
        statusEl.textContent='Saved.';
        statusEl.className='modal-status success';
    });
}

async function uploadAvatarFile(file) {
    const token=getAuthToken();
    const formData=new FormData();
    formData.append('avatar',file);
    const res=await fetch('/api/chat/profile',{
        method:'PATCH',
        headers:{'Authorization':`Bearer ${token}`},
        body:formData 
    });
    const result=await res.json();
    if (res.ok) {
        avatarUrls.set(myUser,result.profile.avatarUrl);
        userBarAvatar.innerHTML=`<img class="msg-avatar-img" src="${getAvatarUrl(myUser)}" alt="">`;
    }
    return res.ok;
}

userBar.addEventListener('click',openSettings);

sidebarHeader.addEventListener('click',(e)=>{
    e.stopPropagation();
    viewDropdown.classList.toggle('open');
});

document.addEventListener('click',(e)=>{
    if (!viewDropdown.contains(e.target)&&!sidebarHeader.contains(e.target)) {
        viewDropdown.classList.remove('open');
    }
});

viewDropdown.querySelectorAll('.view-opt').forEach(opt=>{
    opt.addEventListener('click',()=>{
        switchToView(opt.dataset.view);
        viewDropdown.classList.remove('open');
    });
});

function switchToView(view) {
    currentView=view;
    viewDropdown.querySelectorAll('.view-opt').forEach(o=>o.classList.toggle('active',o.dataset.view===view));
    sidebarViewLabel.textContent=view==='dms'?'Direct Messages':'Chat';
    if (view==='dms') {
        renderDmSidebar();
    } else {
        renderChatSidebar();
    }
}

function renderChatSidebar() {
    buildSidebar(cachedChannels);
    activeChannelName.textContent=currentChannel;
    contentArea.style.display='';
    document.querySelector('.prompt-bar').style.display='';
    document.querySelector('.topbar-tl i').setAttribute('data-lucide','hash');
    lucide.createIcons();
    loadHistory(currentChannel);
}

async function loadFriends() {
    const token=getAuthToken();
    const res=await fetch('/api/chat/friends',{
        headers:{'Authorization':`Bearer ${token}`}
    });
    if (!res.ok) return;
    friendsData=await res.json();
    updateDmBadge();
    if (currentView==='dms') renderDmSidebar();
}

function updateDmBadge() {
    const count=friendsData.incoming.length;
    dmBadge.style.display=count>0?'inline-block':'none';
    dmBadge.textContent=count;
}

function renderDmSidebar() {
    let html='';
    html+=`
    <div class="dm-add-row">
        <input class="dm-add-input" id="dmAddInput" type="text" placeholder="Add friend by username">
        <button class="dm-add-btn" id="dmAddBtn"><i data-lucide="user-plus"></i></button>
    </div>`;
    if (friendsData.incoming.length) {
        html+=`<div class="dm-section-label">Requests - ${friendsData.incoming.length}</div><div class="dm-list">`;
        html+=friendsData.incoming.map(f=>`
        <div class="dm-item" data-username="${escapeHtml(f.username)}">
            <div class="dm-item-avatar"><img class="msg-avatar-img" src="${getAvatarUrl(f.username)}" alt=""></div>
            <span class="dm-item-name">${escapeHtml(f.username)}</span>
            <div class="dm-item-actions">
                <button class="dm-request-btn accept" data-action="accept" data-username="${escapeHtml(f.username)}"><i data-lucide="check"></i></button>
                <button class="dm-request-btn decline" data-action="decline" data-username="${escapeHtml(f.username)}"><i data-lucide="x"></i></button>
            </div>
        </div>`).join('');
        html+=`</div>`;
    }
    html+=`<div class="dm-section-label">Friends — ${friendsData.accepted.length}</div><div class="dm-list">`;
    html+=friendsData.accepted.length?friendsData.accepted.map(f=>`
        <div class="dm-item${currentDmUser===f.username?' active':''}" data-username="${escapeHtml(f.username)}" data-open="1">
            <div class="dm-item-avatar"><img class="msg-avatar-img" src="${getAvatarUrl(f.username)}" alt=""></div>
            <span class="dm-item-name">${escapeHtml(f.username)}</span>
        </div>`).join(''):`<div style="padding:8px;font-size:12px;color:#606060;">No friends yet :(</div>`;
    html+=`</div>`;
    sidebarScroll.innerHTML=html;
    lucide.createIcons();
    document.getElementById('dmAddBtn').addEventListener('click',sendFriendReq);
    document.getElementById('dmAddInput').addEventListener('keydown',(e)=>{if (e.key==='Enter') sendFriendReq();});
    sidebarScroll.querySelectorAll('.dm-request-btn').forEach(btn=>{
        btn.addEventListener('click',async(e)=>{
            e.stopPropagation();
            const action=btn.dataset.action;
            const username=btn.dataset.username;
            const token=getAuthToken();
            await fetch(`/api/chat/friends/${action}`,{
                method:'POST',
                headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},
                body:JSON.stringify({username})
            });
            await loadFriends();
        });
    });
    sidebarScroll.querySelectorAll('.dm-item[data-open]').forEach(el=>{
        el.addEventListener('click',()=>openDmThread(el.dataset.username));
    });
}

async function sendFriendReq() {
    const input=document.getElementById('dmAddInput');
    const username=input.value.trim();
    if (!username) return;
    const token=getAuthToken();
    const res=await fetch('/api/chat/friends/request',{
        method:'POST',
        headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},
        body:JSON.stringify({username})
    });
    if (res.ok) input.value='';
    await loadFriends();
}

async function openDmThread(username) {
    currentDmUser=username;
    renderDmSidebar();
    activeChannelName.textContent=username;
    document.querySelector('.topbar-tl i').setAttribute('data-lucide','user');
    lucide.createIcons();
    messageInput.placeholder=`Message @${username}`;
    contentArea.innerHTML='';
    dmMessageRows.clear();
    const token=getAuthToken();
    const res=await fetch(`/api/chat/dms/${encodeURIComponent(username)}`,{
        headers:{'Authorization':`Bearer ${token}`}
    });
    if (!res.ok) return;
    const data=await res.json();
    lastMsgUsername=null;
    lastMsgTimestamp=null;
    data.messages.forEach(renderDmMessage);
}

function renderDmMessage(message) {
    const isMine=message.from===myUser;
    const displayName=isMine?myUser:messageRows.from;
    const fakeMsg={username:displayName,text:message.text,createdAt:message.createdAt,editedAt:message.editedAt,id:message.id,reactions:{}};
    renderMessage(fakeMsg);
}

function closeModPanel() {
    modPanel.classList.remove('open');
    modPanel.innerHTML='';
}

async function openModPanel(username,anchorEl) {
    const token=getAuthToken();
    const res=await fetch(`/api/chat/moderation/${encodeURIComponent(username)}`,{
        headers:{'Authorization':`Bearer ${token}`}
    });
    if (!res.ok) return;
    const data=await res.json();
    renderModPanel(data,anchorEl);
}

function modStatusBadgeHtml(data) {
    if (data.ban) return `<span class="mod-status-badge banned"><i data-lucide="ban"></i>Banned</span>`;
    if (data.mute) return `<span class="mod-status-badge muted"><i data-lucide="mic-off"></i>Muted</span>`;
    return `<span class="mod-status-badge clean"><i data-lucide="check"></i>No Action</span>`;
}

function renderModPanel(data,anchorEl) {
    const isOwnerViewer=myRole==='owner';
    const roleOptions=Object.keys(ROLE_NAMES_LOCAL).map(r=>`<option value="${r}"${data.role===r?' selected':''}>${ROLE_NAMES_LOCAL[r]}</option>`).join('');
    modPanel.innerHTML=`
    <div class="mod-panel-title"><i data-lucide="shield"></i>Moderate @${escapeHtml(data.username)}</div>
    <div class="mod-status-row">
        ${modStatusBadgeHtml(data)}
        ${data.ban?`<span>Reason: ${escapeHtml(data.ban.reason)}</span><span>${data.ban.expiresAt?`Expires: ${new Date(data.ban.expiresAt).toLocaleString()}`:'Permanent'}</span>`:''}
        ${data.mute?`<span>Muted: ${escapeHtml(data.mute.reason)}</span><span>${data.mute.expiresAt?`Expires: ${new Date(data.mute.expiresAt).toLocaleString()}`:'Permanent'}</span>`:''}
        <span>Known devices: <strong>${data.fingerprintCount}</strong></span>
    </div>
    ${isOwnerViewer?`<div class="mod-section-label">Role</div>
    <select class="mod-role-select" id="modRoleSelect">${roleOptions}</select>
    <button class="mod-action-btn full" id="modRoleSaveBtn" style="margin-bottom:12px;"><i data-lucide="save"></i>Update Role</button>`:''}
    <div class="mod-section-label">Warn</div>
    <div class="mod-form-row">
        <input type="text" id="modWarnReason" placeholder="Reason for warning">
    </div>
    <button class="mod-action-btn warn full" id="modWarnBtn" style="margin-bottom:12px;"><i data-lucide="alert-triangle"></i>Send warning</button>
    <div class="mod-section-label">Mute</div>
    <div class="mod-form-row">
        <input type="text" id="modMuteReason" placeholder="Reason for mute">
        <select id="modMuteDuration">
            <option value="">Permanent</option>
            <option value="10">10 minutes</option>
            <option value="60">1 hour</option>
            <option value="1440">1 day</option>
            <option value="10080">1 week<option>
        </select>
    </div>
    <div class="mod-section-label">Ban</div>
    <div class="mod-form-row">
        <input type="text" id="modBanReason" placeholder="Reason for ban">
        <select id="modBanDuration">
            <option value="">Permanent</option>
            <option value="60">1 hour</option>
            <option value="1440">1 day</option>
            <option value="10080">1 week</option>
        </select>
        <label class="mod-checkbox-row"><input type="checkbox" id="modFingerprintBan">Also fingerprint ban known devices</label>
    </div>
    <div class="mod-actions-grid">
        <button class="mod-action-btn danger" id="modBanBtn"><i data-lucide="ban"></i>Ban</button>
        <button class="mod-action-btn" id="modUnbanBtn"><i data-lucide="undo-2"></i>Unban</button>
    </div>
    ${data.warnings.length?`
    <div class="mod-section-label">Warning history</div>
    <div class="mod-warnings-list">
        ${data.warnings.slice().reverse().map(w=>`
        <div class="mod-warning-item">
            ${escapeHtml(w.reason)}
            <div class="mod-warning-meta">by ${escapeHtml(w.moderator)} · ${new Date(w.createdAt).toLocaleString()}</div>
        </div>`).join('')}
    </div>
    `:''}
    `;
    lucide.createIcons();
    positionModPanel(anchorEl);
    modPanel.classList.add('open');
    if (isOwnerViewer) {
        document.getElementById('modRoleSaveBtn').addEventListener('click',async()=>{
            const role=document.getElementById('modRoleSelect').value;
            const token=getAuthToken();
            const res=await fetch('/api/chat/moderation/role',{
                method:'POST',
                headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},
                body:JSON.stringify({username:data.username,role})
            });
            if (res.ok) {await loadMembers();buildMembers(currentMembers);openModPanel(data.username,anchorEl);}
        });
    }
    document.getElementById('modWarnBtn').addEventListener('click',async()=>{
        const reason=document.getElementById('modWarnReason').value.trim();
        if (!reason) return;
        const token=getAuthToken();
        const res=await fetch('/api/chat/moderation/warn',{
            method:'POST',
            headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},
            body:JSON.stringify({username:data.username,reason})
        });
        if (res.ok) openModPanel(data.username,anchorEl);
    });
    document.getElementById('modMuteBtn').addEventListener('click',async()=>{
        const reason=document.getElementById('modMuteReason').value.trim();
        const durationMinutes=document.getElementById('modMuteDuration').value||null;
        const token=getAuthToken();
        const res=await fetch('/api/chat/moderation/mute',{
            method:'POST',
            headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},
            body:JSON.stringify({username:data.username,reason,durationMinutes})
        });
        if (res.ok) openModPanel(data.username,anchorEl);
    });
    document.getElementById('modUnmuteBtn').addEventListener('click',async()=>{
        const token=getAuthToken();
        const res=await fetch('/api/chat/moderation/unmute',{
            method:'POST',
            headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},
            body:JSON.stringify({username:data.username})
        });
        if (res.ok) openModPanel(data.username,anchorEl);
    });
    document.getElementById('modBanBtn').addEventListener('click',async()=>{
        const reason=document.getElementById('modBanReason').value.trim();
        const durationMinutes=document.getElementById('modBanDuration').value||null;
        const fingerprintBan=document.getElementById('modFingerprintBan').checked;
        const token=getAuthToken();
        const res=await fetch('/api/chat/moderation/ban',{
            method:'POST',
            headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},
            body:JSON.stringify({username:data.username,reason,durationMinutes,fingerprintBan})
        });
        if (res.ok) openModPanel(data.username,anchorEl);
    });
    document.getElementById('modUnbanBtn').addEventListener('click',async()=>{
        const token=getAuthToken();
        const res=await fetch('/api/chat/moderation/unban',{
            method:'POST',
            headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},
            body:JSON.stringify({username:data.username})
        });
        if (res.ok) openModPanel(data.username,anchorEl);
    });
}

function positionModPanel(anchorEl) {
    if (!anchorEl) {modPanel.style.top='80px';modPanel.style.left='calc(50% + 190px)';return;}
    const rect=anchorEl.getBoundingClientRect();
    modPanel.style.top=`${Math.min(rect.top,window.innerHeight-500)}px`;
    modPanel.style.left=`${Math.min(rect.right+12,window.innerWidth-300)}px`;
}

const ROLE_NAMES_LOCAL={member:'Member',admin:'Admin',owner:'Owner'}

document.addEventListener('click',(e)=>{
    if (modPanel.classList.contains('open')&&!modPanel.contains(e.target)&&!e.target.closest('[data-action="moderate"]')) {
        closeModPanel();
    }
});

requireAuth().then(async(username)=>{
    if (!username) return;
    myUser=username;
    const channels=await loadChannels();
    cachedChannels=channels;
    buildSidebar(channels);
    currentMembers=await loadMembers();
    myRole=roleColours.has(myUser)?myRole:myRole;
    const myMember=currentMembers.find(m=>m.username===myUser);
    if (myMember) myRole=myMember.role;
    buildMembers(currentMembers);
    await loadFriends();
    userBarName.textContent=myUser;
    userBarAvatar.innerHTML=`<img class="msg-avatar-img" src="${getAvatarUrl(myUser)}" alt="">`;
    const defaultChannel=channels[0]?.id||'general';
    connectWs();
    switchChannel(defaultChannel);
});