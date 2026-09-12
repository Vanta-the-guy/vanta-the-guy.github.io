lucide.createIcons();

const chatBtn=document.getElementById('chatBtn');
const chatDr=document.getElementById('chatDr');
const chatChv=document.getElementById('chatChv');
const overlay=document.getElementById('overlay');
const ncBtn=document.getElementById('ncBtn');
const chatLabel=document.getElementById('chatLabel');
const chatList=document.getElementById('chatList');
const sendBtn=document.getElementById('sendBtn');
const sendIcon=document.getElementById('sendIcon');
const stopIcon=document.getElementById('stopIcon');
let currentController=null;

chatBtn.addEventListener('click',()=>{
    chatDr.classList.toggle('open');
    chatChv.classList.toggle('open');
    overlay.classList.toggle('active');
});

overlay.addEventListener('click',()=>{
    chatDr.classList.remove('open');
    chatChv.classList.remove('open');
    overlay.classList.remove('active');
});

ncBtn.addEventListener('click',startNewChat);

// ai functionality
const GEMINI_MODEL="gemini-3-flash-preview";
const textInput=document.getElementById('textInput');
const contentArea=document.getElementById('contentArea');

async function askGemini(prompt,signal) {
    const res=await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
        {
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                'x-goog-api-key':GEMINI_API_KEY
            },
            body:JSON.stringify({
                contents:[{parts:[{text:prompt}]}]
            }),
            signal
        }
    );
    if (!res.ok) {
        const err=await res.text();
        throw new Error(`gemini error ${res.status}: ${err}`);
    }
    const data=await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text??"(no response)";
}

function setStopMode(active) {
    sendBtn.classList.toggle('stop-mode',active);
}

function appendMsg(role,text) {
    const msg=document.createElement('div');
    msg.className=`msg msg-${role}`;
    if (role==='ai') {
        msg.innerHTML=marked.parse(text);
    } else {
        msg.textContent=text;
    }
    contentArea.appendChild(msg);
    contentArea.scrollTop=contentArea.scrollHeight;
}

async function handleSend() {
    const prompt=textInput.value.trim();
    if (!prompt) return;
    const chat=getActiveChat();
    if (!chat.messages.length) {
        contentArea.innerHTML='';
        contentArea.classList.add('chat-mode');
        chat.title=prompt.length>28?prompt.slice(0,28)+'...':prompt;
        renderChatList();
    }
    chat.messages.push({role:'user',text:prompt});
    appendMsg('user',prompt);
    textInput.value='';
    saveChats();
    setStopMode(true);
    currentController=new AbortController();
    appendMsg('ai','');
    const thinkingEl=contentArea.lastElementChild;
    thinkingEl.innerHTML=`
    <div class="msg-thinking">
        <div class="thinking-spinner"></div>
        <span class="thinking-text">Thinking</span>
    </div>`;
    try {
        const reply=await askGemini(prompt,currentController.signal);
        thinkingEl.innerHTML=marked.parse(reply);
        chat.messages.push({role:'ai',text:reply});
    } catch (err) {
        if (err.name==='AbortError') {
            thinkingEl.innerHTML=marked.parse('*Stopped.*');
            chat.messages.push({role:'ai',text:'Stopped'});
        } else {
            thinkingEl.textContent='Uh oh, something went wrong: '+err.message;
            thinkingEl.classList.add('msg-error');
            chat.messages.push({role:'ai',text:thinkingEl.textContent});
        }
    } finally {
        setStopMode(false);
        saveChats();
    }
}

function handleStop() {
    if (currentController) currentController.abort();
}

sendBtn.addEventListener('click',()=>{
    if (currentController) {
        handleStop();
    } else {
        handleSend();
    }
});
textInput.addEventListener('keydown',(e)=>{
    if (e.key==='Enter') handleSend();
});

//chat state
const STORAGE_KEY="krypton_chats";
let chats=loadChats();
let activeChatId=chats.length?chats[0].id:createChat();

function loadChats() {
    try {
        const raw=localStorage.getItem(STORAGE_KEY);
        return raw?JSON.parse(raw):[];
    } catch {
        return [];
    }
}

function saveChats() {
    localStorage.setItem(STORAGE_KEY,JSON.stringify(chats));
}

function createChat() {
    const num=chats.length+1;
    const chat={id:Date.now().toString(),title:`Chat ${num}`,messages:[]};
    chats.unshift(chat);
    saveChats();
    return chat.id;
}

function getActiveChat() {
    return chats.find(c=>c.id===activeChatId);
}

function switchChat(id) {
    activeChatId=id;
    renderChatList();
    renderMsgs();
    chatDr.classList.remove('open');
    chatChv.classList.remove('open');
    overlay.classList.remove('active');
}

function startNewChat() {
    activeChatId=createChat();
    renderChatList();
    renderMsgs();
    chatDr.classList.remove('open');
    chatChv.classList.remove('open');
    overlay.classList.remove('active');
}

function renderChatList() {
    chatList.innerHTML='';
    chats.forEach(chat=>{
        const opt=document.createElement('div');
        opt.className='chat-opt'+(chat.id===activeChatId?' active':'');
        opt.innerHTML=`
        <div class="chat-opt-main">
            <i data-lucide="message-circle"></i>
            <span></span>
        </div>
        <div class="chat-del">
            <i data-lucide="trash-2"></i>
        </div>`;
        opt.querySelector('.chat-opt-main span').textContent=chat.title;
        opt.querySelector('.chat-opt-main').addEventListener('click',()=>switchChat(chat.id));
        opt.querySelector('.chat-del').addEventListener('click',(e)=>{
            e.stopPropagation();
            deleteChat(chat.id);
        });
        chatList.appendChild(opt);
    });
    lucide.createIcons();
    const active=getActiveChat();
    chatLabel.textContent=active?active.title:'Chats';
}

function deleteChat(id) {
    const index=chats.findIndex(c=>c.id===id);
    if (index===-1) return;
    chats.splice(index,1);
    if (chats.length===0) {
        activeChatId=createChat();
    } else if (id===activeChatId) {
        activeChatId=chats[0].id;
    }
    saveChats();
    renderChatList();
    renderMsgs();
}

function renderMsgs() {
    const chat=getActiveChat();
    contentArea.innerHTML='';
    if (!chat.messages.length) {
        contentArea.classList.remove('chat-mode');
        renderEGrid();
        return;
    }
    contentArea.classList.add('chat-mode');
    chat.messages.forEach(m=>appendMsg(m.role,m.text));
}

function renderEGrid() {
    const grid=document.createElement('div');
    grid.className='example-grid';
    const examples=[
        {icon:'atom',title:'Explain quantum physics',sub:'in simple terms',prompt:'Explain quantum physics in simple terms.'},
        {icon:'feather',title:'Write a short story',sub:'about a lost robot',prompt:'Write a short story about a lost robot'},
        {icon:'bug',title:'Debug my code',sub:'and explain the fix',prompt:'Debug my code and explain the fix'},
        {icon:'map',title:'Plan a trip',sub:'to Japan for 7 days',prompt:'Plan a trip to Japan for 7 days'}
    ];
    examples.forEach(ex=>{
        const card=document.createElement('div');
        card.className='example-card';
        card.dataset.prompt=ex.prompt;
        card.innerHTML=`<i data-lucide="${ex.icon}" class="example-icon"></i><div class="example-title">${ex.title}</div><div class="example-sub">${ex.sub}</div>`;
        card.addEventListener('click',()=>{
            textInput.value=ex.prompt;
            handleSend();
        });
        grid.appendChild(card);
    });
    contentArea.appendChild(grid);
    lucide.createIcons();
}

renderChatList();
renderMsgs();