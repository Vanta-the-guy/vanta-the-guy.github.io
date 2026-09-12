lucide.createIcons();

const gameGrid=document.getElementById('gameGrid');
const overlay=document.createElement('div');
const st=document.getElementById('st');
overlay.className='provider-overlay';
document.body.appendChild(overlay);

let page=1;
let loading=false;
let exhausted=false;
const PAGE_SIZE=50;

(async ()=>{
    await Lumin.init({
        headless:true,
        onReady:()=>console.log('lumin ready'),
        onError:()=>console.error('lumin error',err)
    });
    const saved=localStorage.getItem('gameProvider')||'lumin';
    document.querySelectorAll('.provider-opt').forEach(o=>{
        isActive=o.dataset.value===saved;
        o.classList.toggle('active',isActive);
        if (isActive) document.getElementById('providerLabel').textContent=o.querySelector('span').textContent;
    });
    await loadProvider(saved);
    const observer=new IntersectionObserver(async (entries)=>{
        if (entries[0].isIntersecting&&!loading&&!exhausted) await loadMore();
    },{threshold:0.1});
    observer.observe(st);
})();

const cardObserver=new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
        const img=entry.target.querySelector('img');
        if (entry.isIntersecting) {
            entry.target.style.visibility='visible';
            if (img&&img.dataset.src) {
                img.src=img.dataset.src;
                delete img.dataset.src;
            }
        } else {
            entry.target.style.visibility='hidden';
            if (img&&img.src) {
                img.dataset.src=img.src;
                img.src='';
            }
        }
    });
},{rootMargin:'200px'});

async function loadMore() {
    loading=true;
    const res=await Lumin.getGames({page,limit:PAGE_SIZE,q:currQuery});
    if (!res.games.length||page>=res.pages) exhausted=true;
    const imgUrls=await Promise.all(
        res.games.map(g=>Lumin.getImageUrl(g.image_token))
    );
    res.games.forEach((game,i)=>{
        const card=document.createElement('div');
        card.className='game-card';
        card.innerHTML=`
        <img src="${imgUrls[i]}" alt="${game.name}" loading="lazy">
        <div class="game-card-nm">${game.name}</div>`;
        card.onclick=()=>launchGame(game.id);
        cardObserver.observe(card);
        gameGrid.insertBefore(card,st);
    });
    const loader=document.getElementById('gridLd');
    if (loader&&gameGrid.querySelectorAll('.game-card').length>0) {
        loader.remove();
    }
    page++;
    loading=false;
    syncGR();
}

function launchGame(id) {
    Lumin.loadGame(id);
    const wfp=setInterval(()=>{
        const flyout=document.querySelector('.lumin-player-flyout');
        if (flyout) {
            clearInterval(wfp);
            flyout.style.display='none';
            const closeBtn=document.createElement('button');
            closeBtn.id='customClose';
            closeBtn.innerHTML='<i data-lucide="x" width="18" height="18"></i>';
            closeBtn.style.cssText=`
            position: fixed;
            top: 14px;
            left: 14px;
            z-index: 9999999;
            width: 32px;
            height: 32px;
            background: #080808;
            border: 1px solid #2a2a2a;
            border-radius: 50%;
            color: #808080;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background 0.2s ease, border-color 0.2s ease;`;
            closeBtn.addEventListener('mouseenter', () => {
                closeBtn.style.background = '#141414';
                closeBtn.style.borderColor = '#3a3a3a';
            });
            closeBtn.addEventListener('mouseleave', () => {
                closeBtn.style.background = '#080808';
                closeBtn.style.borderColor = '#2a2a2a';
            });
            closeBtn.addEventListener('click',()=>{
                const luminClose=document.querySelector('.lumin-player-close');
                if (luminClose) luminClose.click();
                closeBtn.remove();
            });
            document.body.appendChild(closeBtn);
            lucide.createIcons();
        }
    },100);
}

function syncGR() {
    const grid=document.getElementById('gameGrid');
    const colWidth=grid.querySelector('.game-card')?.offsetWidth;
    if (colWidth) grid.style.gridAutoRows=colWidth+'px';
}

let currProvider=localStorage.getItem('gameProvider')||'lumin';
let staticData=[];

async function loadProvider(provider) {
    currProvider=provider;
    localStorage.setItem('gameProvider',provider);
    currQuery='';
    document.getElementById('searchInput').value='';
    gameGrid.querySelectorAll('.game-card').forEach(c=>c.remove());
    if (!document.getElementById('gridLd')) {
        const ld=document.createElement('div');
        ld.className='grid-ld';
        ld.id='gridLd';
        ld.innerHTML='<div class="grid-spinner"></div>';
        gameGrid.insertBefore(ld,st);
    }
    if (provider==='lumin') {
        page=1;
        exhausted=false;
        await loadMore();
        return;
    }
    const res=await fetch(`../../assets/json/${provider}.json`);
    const json=await res.json();
    staticData=json;
    renderStatic();
}

function renderStatic() {
    gameGrid.querySelectorAll('.game-card').forEach(c=>c.remove());
    const loader=document.getElementById('gridLd');
    if (loader) loader.remove();
    const filtered=currQuery?staticData.filter(g=>g.name.toLowerCase().includes(currQuery.toLowerCase())):staticData;
    filtered.forEach(game=>{
        const card=document.createElement('div');
        card.className='game-card';
        card.innerHTML=`
        <img src="${game.img}" alt=${game.name} loading="lazy">
        <div class="game-card-nm">${game.name}</div>`;
        card.addEventListener('click',()=>{
            if (window.parent) {
                const iframe=window.parent.document.getElementById('browserFrame')||window.parent.getActiveFrame?.();
                const gameFrame=window.parent.document.querySelector('.bframe:not([style*="display:none"])');
                if (gameFrame) {
                    gameFrame.src=game.url;
                }
            }
        });
        cardObserver.observe(card);
        gameGrid.insertBefore(card,st);
    });
    syncGR();
}

document.getElementById('providerBtn').addEventListener('click',e=>{
    e.stopPropagation();
    const dr=document.getElementById('providerDr');
    const chv=document.getElementById('providerChv');
    const isOpen=dr.classList.toggle('open');
    chv.classList.toggle('open',isOpen);
    overlay.classList.toggle('active',isOpen);
});

document.addEventListener('click',()=>{
    document.getElementById('providerDr').classList.remove('open');
    document.getElementById('providerChv').classList.remove('open');
    overlay.classList.remove('active');
});

document.querySelectorAll('.provider-opt').forEach(opt=>{
    opt.addEventListener('click',()=>{
        document.querySelectorAll('.provider-opt').forEach(o=>o.classList.remove('active'));
        opt.classList.add('active');
        document.getElementById('providerLabel').textContent=opt.querySelector('span').textContent;
        loadProvider(opt.dataset.value);
    });
});

let debounce;
let currQuery='';
document.getElementById('searchInput').addEventListener('input',(e)=>{
    clearTimeout(debounce);
    debounce=setTimeout(()=>{
        currQuery=e.target.value.trim();
        if (currProvider==='lumin') {
            page=1;
            exhausted=false;
            gameGrid.querySelectorAll('.game-card').forEach(c=>c.remove());
            loadMore();
        } else {
            renderStatic();
        }
    },300);
});