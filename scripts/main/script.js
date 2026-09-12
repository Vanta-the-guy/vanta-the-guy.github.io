//beautification
lucide.createIcons();

const refBtn=document.getElementById('refBtn');

document.getElementById('refBtn').addEventListener('click',()=>{
    const icon=refBtn.querySelector('svg');
    icon.classList.remove('spinning');
    void icon.offsetWidth;
    icon.classList.add('spinning');
    icon.addEventListener('animationend',()=>icon.classList.remove('spinning'),{once:true});
    const frame=getActiveFrame();
    if (!frame||frame.style.display==='none') return;
    const loader=document.getElementById('bloader');
    const activeTab=document.querySelector('.tab.active');
    const tabId=activeTab?.dataset.tabId;
    const tabData=tabs[tabId];
    frame.classList.remove('loaded');
    loader.classList.add('active');
    const isInternal=tabData?.url?.startsWith('krypton://');
    if (isInternal) {
        const currentSrc=frame.dataset.internalSrc||frame.src;
        frame.src='';
        frame.onload=()=>{
            loader.classList.remove('active');
            frame.classList.add('loaded');
        };
        setTimeout(()=>{frame.src=currentSrc;},50);
    } else {
        const currentUrl=frame.dataset.currentUrl||tabData?.url;
        if (!currentUrl) {
            loader.classList.remove('active');
            frame.classList.add('loaded');
            return;
        }
        getSFrame(tabId).then(sframe=>{
            sframe.go(currentUrl);
            loader.classList.remove('active');
            frame.classList.add('loaded');
            startURLP(frame,tabId);
        });
    }
});

const tl='krypton';
const mText=document.getElementById('mainTl');
[...tl].forEach((char,i)=>{
    const span=document.createElement('span');
    span.className='main-char';
    span.textContent=char;
    span.style.animationDelay=`${i*0.06}s`;
    mText.appendChild(span);
});

const taglines=[
    'skdingindinfpodinfoingv',
    'wow.',
    'bradar what is this?',
    'you got games on yo phone'
];

const tagEl=document.getElementById('tagline');
let tagIdx=0;

function showTag() {
    const inner=document.createElement('span');
    inner.className='tagline-inner';
    inner.textContent=taglines[tagIdx];
    tagEl.innerHTML='';
    tagEl.appendChild(inner);
    requestAnimationFrame(()=>{
        requestAnimationFrame(()=>inner.classList.add('visible'));
    });
    tagIdx=(tagIdx+1)%taglines.length;
}

showTag();
setInterval(()=>{
    const inner=tagEl.querySelector('.tagline-inner');
    if (!inner) return;
    inner.classList.add('exit');
    inner.addEventListener('transitionend',()=>{
        const current=tagEl.querySelector('.tagline-inner');
        if (current) showTag();
    },{once:true});
},3000);

const tooltip=document.createElement('div');
tooltip.className='sb-tooltip';
document.body.appendChild(tooltip);
let tooltipT=null;
document.querySelectorAll('.sb-btn').forEach(btn=>{
    btn.addEventListener('mouseenter',()=>{
        const title=btn.getAttribute('title');
        if (!title) return;
        btn.setAttribute('data-title',title);
        btn.removeAttribute('title');
        const rect=btn.getBoundingClientRect();
        tooltip.classList.remove('visible');
        tooltip.textContent=title;
        tooltip.style.top=(rect.top+rect.height/2)+'px';
        tooltip.style.left=(rect.right+15)+'px';
        clearTimeout(tooltipT);
        tooltipT=setTimeout(()=>{
            tooltip.classList.add('visible');
        },10);
    });
    btn.addEventListener('mouseleave',()=>{
        clearTimeout(tooltipT);
        tooltip.classList.remove('visible');
        const title=btn.getAttribute('data-title');
        if (title) btn.setAttribute('title',title);
    });
});

//scram
const {Controller}=$scramjetController;
const {defaultConfig}=$scramjet;
const EpoxyTransport=self.EpoxyTransport.default;
let scramjet=null;

async function initScramjet() {
    await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    const serviceworker=navigator.serviceWorker.controller??(await navigator.serviceWorker.ready).active;
    const transport=new EpoxyTransport({wisp:"wss://wisp.englishrevision.site/"});
    await transport.init();
    scramjet=new Controller({
        serviceworker,
        transport,
        scramjetConfig:defaultConfig
    });
    await scramjet.wait();
}

const scramjetReady=initScramjet();

//browsing
function nav(input) {
    let url=input.trim();
    if (!url) return;
    const home=document.querySelector('.main');
    const loader=document.getElementById('bloader');
    const pageCont=document.getElementById('pageCont');
    if (!url.includes('.')&&!url.startsWith('http')) {
        url='https://duckduckgo.com/?q='+encodeURIComponent(url);
    } else if (!url.startsWith('http://')&&!url.startsWith('https://')) {
        url='https://'+url;
    }
    const activeTab=document.querySelector('.tab.active');
    const tabId=activeTab.dataset.tabId;
    let frame=tabs[tabId]?.frame;
    if (!frame) {
        frame=document.createElement('iframe');
        frame.className='bframe';
        frame.style.display='none';
        frame.src='about:blank';
        const activeTab=document.querySelector('.tab.active');
        if (activeTab) {
            activeTab.querySelector('.tab-tl').textContent='New Tab';
            activeTab.querySelector('.tab-fav').innerHTML='<i data-lucide="globe"></i>';
            lucide.createIcons();
        }
        pageCont.appendChild(frame);
    }
    document.querySelectorAll('.bframe').forEach(f=>f.style.display='none');
    hideHome();
    frame.classList.remove('loaded');
    void frame.offsetWidth;
    frame.style.display='block';
    loader.classList.add('active');
    tabs[tabId]={url,frame,sframe:tabs[tabId]?.sframe||null};
    activeTab.querySelector('.tab-tl').textContent=new URL(url).hostname;
    setUrl(url);
    getSFrame(tabId).then(sframe=>{
        sframe.go(url);
        loader.classList.remove('active');
        requestAnimationFrame(()=>{
            requestAnimationFrame(()=>{
                frame.classList.add('loaded');
            });
        });
        frame.dataset.navCount=(parseInt(frame.dataset.navCount||'0')+1).toString();
        frame.dataset.fwCount='0';
        updNavBtns(frame);
        startURLP(frame,tabId);
    });
}
window.nav=nav;

function getActiveFrame() {
    const activeTab=document.querySelector('.tab.active');
    if (!activeTab) return null;
    return tabs[activeTab.dataset.tabId]?.frame||null;
}

window.getActiveFrame=getActiveFrame;

function setUrl(url) {
    urlInput.value=url;
    urlDisplay.innerHTML=formatUrl(url);
    if (!urlFocused) {
        urlDisplay.style.display='block';
        urlInput.style.display='none';
    }
}

let urlPollInt=null;
let lastHref='';

function extractRealUrl(rewrittenHref) {
    try {
        const u = new URL(rewrittenHref);
        const parts = u.pathname.split('/').filter(Boolean);
        const last = parts[parts.length-1];
        const decoded = decodeURIComponent(last);
        if (decoded.startsWith('http://')||decoded.startsWith('https://')) {
            return decoded;
        }
    } catch (e) {}
    return null;
}

function startURLP(frame,tabId) {
    if (urlPollInt) clearInterval(urlPollInt);
    lastHref='';
    let firstPoll=true;
    urlPollInt=setInterval(()=>{
        try {
            const href=frame.contentWindow.location.href;
            if (href && href!==lastHref && href!=='about:blank') {
                const realUrl=extractRealUrl(href);
                if (realUrl&&tabs[tabId]) {
                    tabs[tabId].url=realUrl;
                }
                const oldPath=(()=>{try{return new URL(lastHref).pathname;}catch(e){return lastHref;}})();
                const newPath=(()=>{try{return new URL(href).pathname;}catch(e){return href;}})();
                const oldHost=(()=>{try{return new URL(lastHref).hostname;}catch(e){return '';}})();
                const newHost=(()=>{try{return new URL(href).hostname;}catch(e){return '';}})();
                const isNewPage=!firstPoll&&(newHost!==oldHost||newPath!==oldPath);
                lastHref=href;
                firstPoll=false;
                if (isNewPage) {
                    const loader=document.getElementById('bloader');
                    frame.classList.remove('loaded');
                    loader.classList.add('active');
                    const checkContent=setInterval(()=>{
                        try {
                            const doc=frame.contentDocument||frame.contentWindow.document;
                            const hasContent=doc&&doc.body&&(doc.body.children.length>0||doc.body.textContent.trim().length>0);
                            if (hasContent) {
                                clearInterval(checkContent);
                                loader.classList.remove('active');
                                frame.classList.add('loaded');
                            }
                        } catch (e) {}
                    },100);
                    setTimeout(()=>{
                        clearInterval(checkContent);
                        loader.classList.remove('active');
                        frame.classList.add('loaded');
                    },5000);
                }
            }
            const decoded=tabs[tabId]?.url||href;
            if (decoded&&decoded!==urlInput.value&&!urlFocused) {
                setUrl(decoded);
                frame.dataset.currentUrl=decoded;
                try {
                    const iframeDoc=frame.contentDocument||frame.contentWindow.document;
                    const pageTitle=iframeDoc.title;
                    const activeTab=document.querySelector('.tab.active');
                    if (activeTab&&pageTitle) {
                        activeTab.querySelector('.tab-tl').textContent=pageTitle;
                        tabs[activeTab.dataset.tabId].title=pageTitle;
                    }
                    let faviconUrl=null;
                    const iconLink=iframeDoc.querySelector('link[rel="icon"],link[rel="shortcut icon"],link[rel="apple-touch-icon"]');
                    if (iconLink&&iconLink.href) faviconUrl=iconLink.href;
                    if (!faviconUrl) {
                        try {
                            const u=new URL(decoded);
                            faviconUrl=u.origin+'/favicon.ico';
                        } catch (e) {}
                    }
                    if (faviconUrl&&activeTab) {
                        const favCont=activeTab.querySelector('.tab-fav');
                        const img=new Image();
                        img.onload=()=>{
                            favCont.innerHTML='';
                            const i=document.createElement('img');
                            i.src=faviconUrl;
                            i.style.cssText='width:14px;height:14px;object-fit:contain;';
                            favCont.appendChild(i);
                        };
                        img.onerror=()=>{
                            favCont.innerHTML='<i data-lucide="globe"></i>';
                            lucide.createIcons();
                        };
                        img.src=faviconUrl;
                    }
                } catch (e) {}
                const activeTab=document.querySelector('.tab.active');
                if (activeTab) {
                    try {
                        tabs[activeTab.dataset.tabId].url=decoded;
                    } catch (e) {}
                }
            }
        } catch(e){}
    },300);
}

document.querySelector(".url-input").addEventListener("keydown",e=>{
    if (e.key==='Enter') nav(e.target.value);
});

document.querySelector(".main-search-input").addEventListener("keydown",e=>{
    if (e.key==='Enter') nav(e.target.value);
});

//url formatting
const urlInput=document.querySelector('.url-input');
const urlContainer=document.querySelector('.url-intainer');
const urlDisplay=document.createElement('div');
urlDisplay.className='url-display';
urlDisplay.style.display='none';
urlContainer.appendChild(urlDisplay);
let urlFocused=false;

urlDisplay.addEventListener('click',()=>{
    urlDisplay.style.display='none';
    urlInput.style.display='block';
    urlFocused=true;
    urlInput.focus();
    urlInput.select();
});

urlDisplay.addEventListener('focus',()=>{
    urlFocused=true;
});

urlInput.addEventListener('blur',()=>{
    urlFocused=false;
    if (urlInput.value) {
        urlDisplay.innerHTML=formatUrl(urlInput.value);
        urlDisplay.style.display='block';
        urlInput.style.display='none';
    }
});

function formatUrl(url) {
    try {
        const urlObj=new URL(url);
        return `<span class="url-proto">${urlObj.protocol}//</span><span class="url-domain">${urlObj.hostname}</span><span class="url-path">${urlObj.pathname}${urlObj.search}${urlObj.hash}</span>`;
    } catch (e) {
        return `<span class="url-domain">${url}</span>`;
    }
}

//hist nav handling
function updNavBtns(frame) {
    if (!frame) {
        document.getElementById('backBtn').disabled=true;
        document.getElementById('fwBtn').disabled=true;
        return;
    }
    document.getElementById('backBtn').disabled=parseInt(frame.dataset.navCount||'0')<=0;
    document.getElementById('fwBtn').disabled=parseInt(frame.dataset.fwCount||'0')<=0;
}

document.getElementById('backBtn').addEventListener('click',()=>{
    const frame=getActiveFrame();
    if (!frame) return;
    const activeTab=document.querySelector('.tab.active');
    const tabId=activeTab?.dataset.tabId;
    const navCount=parseInt(frame.dataset.navCount||'0');
    if (navCount<=0) return;
    if (navCount===1) {
        //go home
        if (urlPollInt) clearInterval(urlPollInt);
        frame.style.display='none';
        frame.src='about:blank';
        const activeTab=document.querySelector('.tab.active');
        if (activeTab) {
            activeTab.querySelector('.tab-tl').textContent='New Tab';
            activeTab.querySelector('.tab-fav').innerHTML='<i data-lucide="globe"></i>';
            lucide.createIcons();
        }
        frame.classList.remove('loaded');
        document.querySelector('.main').style.display='';
        showTag();
        urlInput.value='';
        urlDisplay.style.display='none';
        urlInput.style.display='block';
        frame.dataset.navCount='0';
        frame.dataset.fwCount=(parseInt(frame.dataset.fwCount||'0')+1).toString();
        updNavBtns(frame);
        return;
    }
    if (urlPollInt) clearInterval(urlPollInt);
    const loader=document.getElementById('bloader');
    frame.classList.remove('loaded');
    loader.classList.add('active');
    frame.dataset.navCount=(navCount-1).toString();
    frame.dataset.fwCount=(parseInt(frame.dataset.fwCount||'0')+1).toString();
    try {
        frame.contentWindow.history.back();
    } catch (e) {}
    setTimeout(()=>{
        loader.classList.remove('active');
        frame.classList.add('loaded');
        startURLP(frame,tabId);
        updNavBtns(frame);
    },600);
});

document.getElementById('fwBtn').addEventListener('click',()=>{
    const frame=getActiveFrame();
    if (!frame) return;
    const activeTab=document.querySelector('.tab.active');
    const tabId=activeTab?.dataset.tabId;
    const fwCount=parseInt(frame.dataset.fwCount||'0');
    if (fwCount<=0) return;
    if (urlPollInt) clearInterval(urlPollInt);
    const loader=document.getElementById('bloader');
    if (frame.style.display==='none') {
        if (tabs[tabId]?.url) {
            frame.style.display='block';
            document.querySelector('.main').style.display='none';
            frame.classList.add('active');
            frame.dataset.navCount=(parseInt(frame.dataset.navCount||'0')+1).toString();
            frame.dataset.fwCount=(fwCount-1).toString();
            try {frame.contentWindow.history.forward();} catch (e) {}
            setTimeout(()=>{
                loader.classList.remove('active');
                frame.classList.add('loaded');
                startURLP(frame,tabId);
                updNavBtns(frame);
            },600);
        }
        return;
    }
    frame.classList.remove('loaded');
    loader.classList.add('active');
    frame.dataset.navCount=(parseInt(frame.dataset.navCount||'0')+1).toString();
    frame.dataset.fwCount=(fwCount-1).toString();
    try {frame.contentWindow.history.forward();} catch (e) {}
    setTimeout(()=>{
        loader.classList.remove('active');
        frame.classList.add('loaded');
        startURLP(frame,tabId);
        updNavBtns(frame);
    },600);
});

//tab handling
let tabs={};
let tabCount=1;

tabs[1]={url:'',frame:null,sframe:null};

async function getSFrame(tabId) {
    await scramjetReady;
    const tab=tabs[tabId];
    if (!tab.sframe) {
        tab.sframe=scramjet.createFrame(tab.frame);
    }
    return tab.sframe;
}

function createTab(url=null) {
    tabCount++;
    const tabBar=document.getElementById('tabBar');
    const ntBtn=document.getElementById('ntBtn');
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    const tab=document.createElement('div');
    tab.className='tab active';
    tab.dataset.tabId=tabCount;
    tab.innerHTML=`
    <div class="tab-fav"><i data-lucide="globe"></i></div>
    <span class="tab-tl">New Tab</span>
    <div class="tab-cl"><i data-lucide="x"></i></div>`;
    tabBar.insertBefore(tab,ntBtn);
    lucide.createIcons();
    tabs[tabCount]={url:'',frame:null,sframe:null};
    addTabListeners(tab);
    swTab(tabCount);
    if (url) nav(url);
}

function swTab(tabId) {
    document.querySelectorAll('.bframe').forEach(f=>f.style.display='none');
    if (urlPollInt) clearInterval(urlPollInt);
    document.getElementById('bloader').classList.remove('active');
    const tab=tabs[tabId];
    const home=document.querySelector('.main');
    if (tab.frame) {
        tab.frame.style.display='block';
        home.style.display='none';
        showTag();
        setUrl(tab.url);
        if (!tab.url.startsWith('krypton://')) {
            startURLP(tab.frame,tabId);
        }
    } else {
        home.style.display='';
        urlInput.value='';
        urlDisplay.style.display='none';
        urlInput.style.display='block';
    }
}

function closeTab(tabId) {
    if (document.querySelectorAll('.tab').length<=1) return;
    const tab=document.querySelector(`.tab[data-tab-id="${tabId}"]`);
    const wasActive=tab.classList.contains('active');
    tab.style.transition='min-width 0.2s ease, max-width 0.2s ease, opacity 0.2s ease, padding 0.2s ease';
    tab.style.minWidth='0';
    tab.style.maxWidth='0';
    tab.style.opacity='0';
    tab.style.padding='0';
    tab.style.overflow='hidden';
    setTimeout(()=>{
        if (tabs[tabId]?.frame) tabs[tabId].frame.remove();
        delete tabs[tabId];
        tab.remove();
        if (wasActive) {
            const rem=document.querySelector('.tab');
            if (rem) {
                rem.classList.add('active');
                swTab(rem.dataset.tabId);
            }
        }
    },200);
}

function addTabListeners(tab) {
    tab.addEventListener('click',(e)=>{
        if (e.target.closest('.tab-cl')) {
            closeTab(tab.dataset.tabId);
        } else {
            document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
            tab.classList.add('active');
            swTab(tab.dataset.tabId);
        }
    });
}

document.getElementById('ntBtn').addEventListener('click',()=>createTab());
addTabListeners(document.querySelector('.tab[data-tab-id="1"]'));

//shortcuts nav
document.querySelectorAll('.shortcut').forEach(sc=>{
    sc.addEventListener('click',()=>{
        const title=sc.querySelector('.sc-title').textContent.trim().toLowerCase();
        const urls={
            'google':'https://google.com',
            'youtube':'https://youtube.com',
            'discord':'https://discord.com/app',
            'tiktok':'https://tiktok.com',
            'geforce now':'https://play.geforcenow.com',
            'roblox':'https://roblox.com'
        };
        if (urls[title]) nav(urls[title]);
    });
});

//sidebar handling
function loadInternal(path,kryptonUrl='krypton://internal',sidebarId=null) {
    const pageCont=document.getElementById('pageCont');
    const home=document.querySelector('.main');
    const activeTab=document.querySelector('.tab.active');
    const tabId=activeTab.dataset.tabId;
    let frame=tabs[tabId]?.frame;
    if (!frame) {
        frame=document.createElement('iframe');
        frame.className='bframe';
        frame.style.display='none';
        pageCont.appendChild(frame);
    }
    document.querySelectorAll('.bframe').forEach(f=>f.style.display='none');
    hideHome();
    frame.classList.remove('loaded');
    void frame.offsetWidth;
    frame.style.display='block';
    frame.src=path;
    tabs[tabId]={url:kryptonUrl,frame};
    const label=kryptonUrl.replace('krypton://','');
    const specialLabels={ai:'AI'};
    activeTab.querySelector('.tab-tl').textContent=specialLabels[label]??(label.charAt(0).toUpperCase()+label.slice(1));
    activeTab.querySelector('.tab-fav').innerHTML='<i data-lucide="atom"></i>';
    lucide.createIcons();
    frame.onload=()=>{
        requestAnimationFrame(()=>{
            requestAnimationFrame(()=>{
                frame.classList.add('loaded');
            });
        });
    };
    urlInput.value=kryptonUrl;
    urlDisplay.innerHTML=formatUrl(kryptonUrl);
    urlDisplay.style.display='block';
    urlInput.style.display='none';
    if (urlPollInt) clearInterval(urlPollInt);
    updNavBtns(null);
    setSidebarActive(sidebarId);
}

function hideHome(cb) {
    const home=document.querySelector('.main');
    if (home.style.display==='none') {if (cb) cb(); return;}
    home.classList.add('hidden');
    setTimeout(()=>{
        home.style.display='none';
        home.classList.remove('hidden');
        if (cb) cb();
    },250);
}

document.getElementById('homeBtn').addEventListener('click',()=>{
    const activeTab=document.querySelector('.tab.active');
    const tabId=activeTab?.dataset.tabId;
    const frame=tabs[tabId]?.frame;
    const home=document.querySelector('.main');
    if (frame&&frame.style.display!=='none') {
        frame.classList.remove('loaded');
        setTimeout(()=>{
            frame.style.display='none';
            frame.src='about:blank';
        },250);
    }
    if (urlPollInt) clearInterval(urlPollInt);
    home.style.display='';
    home.classList.add('hidden');
    requestAnimationFrame(()=>{
        requestAnimationFrame(()=>home.classList.remove('hidden'));
    });
    urlInput.value='';
    urlDisplay.style.display='none';
    urlInput.style.display='block';
    if (tabs[tabId]) tabs[tabId]={url:'',frame:null};
    activeTab.querySelector('.tab-tl').textContent='New Tab';
    activeTab.querySelector('.tab-fav').innerHTML='<i data-lucide="globe"></i>';
    lucide.createIcons();
    updNavBtns(null);
    showTag();
    setSidebarActive('homeBtn');
});

function setSidebarActive(id) {
    document.querySelectorAll('.sb-btn').forEach(b=>b.classList.remove('active'));
    if (id) document.getElementById(id)?.classList.add('active');
}

document.getElementById('gmBtn').addEventListener('click',()=>{
    loadInternal('../../pages/g.html','krypton://games','gmBtn');
});

document.getElementById('mvBtn').addEventListener('click',()=>{
    loadInternal('../../pages/m.html','krypton://movies','mvBtn');
});

document.getElementById('cdBtn').addEventListener('click',()=>{
    loadInternal('../pages/c.html','krypton://cloud','cdBtn');
});

document.getElementById('aiBtn').addEventListener('click',()=>{
    loadInternal('../pages/a.html','krypton://ai','aiBtn');
});

document.getElementById('msBtn').addEventListener('click',()=>{
    loadInternal('../pages/l.html','krypton://music','msBtn');
});

document.getElementById('chBtn').addEventListener('click',()=>{
    loadInternal('../pages/t.html','krypton://chat','chBtn');
});

let isLG=false;
const loader=document.getElementById('bloader');

if (loader) {
    const originalRemove=loader.classList.remove.bind(loader.classList);
    loader.classList.remove=function(...args) {
        if (isLG&&args.includes('active')) return;
        originalRemove(...args);
    };
}

//raccoon handling
window.addEventListener('message',async (event)=>{
    if (event.data.type==='LAUNCH_GAME') {
        const item=event.data.item;
        console.log('received',item.name);
        const stored=localStorage.getItem('raccoon_credentials');
        const userToken=localStorage.getItem('www.raccoongame.com@user_token');
        if (stored||userToken) {
            nav(item.url);
            return;
        } else {
            console.log('no creds');
        }
        const frameGetter=()=>{
            const pageCont=document.getElementById('pageCont');
            if (!pageCont) return null;
            const frames=Array.from(pageCont.querySelectorAll('.bframe'));
            return frames.find(f=>f.style.display!=='none'&&!f.src.includes('pages'))||null;
        }
        const SIGNUP_URL='https://www.raccoongame.com/login?redirect_uri='+'https%3A%2F%2Fwww.raccoongame.com%2Fweb2%2Fdist%2F%23%2Fplatform%2Fcloudgame';
        nav(SIGNUP_URL);
        let attempts=0;
        let maxAttempts=60;
        while (attempts<maxAttempts) {
            await new Promise(r=>setTimeout(r,500));
            attempts++;
            const frame=frameGetter();
            if (!frame) continue;
            if (frame.classList.contains('loaded')) {
                try {
                    const frameWin=frame.contentWindow;
                    const frameDoc=frame.contentDocument||frameWin.document;
                    if (frameWin.$&&typeof frameWin.to_register==='function'&&typeof frameWin.post==='function') {
                        console.log('starting racooon');
                        break;
                    }
                } catch (e) {
                    console.log('na');
                }
            }
        }
        if (attempts>=maxAttempts) {
            console.warn('timeout');
        }
        const {Raccoon}=await import('../cloud/raccoon.js');
        const signup=new Raccoon();
        try {
            const credentials=await signup.run(nav,item.url,frameGetter);
            console.log('completed');
            console.log(item.url);
            await new Promise(r=>setTimeout(r,2000));
            nav(item.url);
        } catch (err) {
            console.error('failed',err);
            console.error(err.stack);
            nav(item.url);
        }
    }
});