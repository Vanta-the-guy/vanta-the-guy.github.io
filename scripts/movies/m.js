lucide.createIcons();

const TMDB_KEY='8ba4dd5ea54099d75f6b822f094d8075';
const TMDB_BASE='https://api.themoviedb.org/3';
const IMG_BASE='https://image.tmdb.org/t/p/w342';
const VIDKING_BASE='https://www.vidking.net/embed';

const movieGrid=document.getElementById('movieGrid');
const st=document.getElementById('st');
const searchInput=document.getElementById('searchInput');

let page=1;
let loading=false;
let exhausted=false;
let currCat='all';
let currQuery='';
let isTv=false;

async function fetchTMDB(path,params={}) {
    const url=new URL(TMDB_BASE+path);
    url.searchParams.set('api_key',TMDB_KEY);
    url.searchParams.set('language','en-US');
    Object.entries(params).forEach(([k,v])=>url.searchParams.set(k,v));
    const res=await fetch(url.toString());
    if (!res.ok) throw new Error(`TMDB ${res.status}`);
    return res.json();
}

function getCatEndpoint(cat,pageNum,query) {
    if (query) {
        const type=isTv?'tv':'movie';
        return [`/search/${type}`,{query,page:pageNum}];
    }
    switch (cat) {
        case 'all': return ['/movie/popular',{page:pageNum}];
        case 'trending': return [`/trending/${isTv?'tv':'movie'}/week`,{page:pageNum}];
        case 'popular': return [isTv?'/tv/popular':'/movie/popular',{page:pageNum}];
        case 'top_rated': return [isTv?'/tv/top_rated':'/movie/top_rated',{page:pageNum}];
        case 'now_playing': return isTv?['/tv/on_the_air',{page:pageNum}]:['/movie/now_playing',{page:pageNum}];
        case 'tv': return ['/tv/popular',{page:pageNum}];
        default: return ['/movie/popular',{page:pageNum}];
    }
}

function buildCard(item,tv) {
    if (!item||!item.id) return null;
    const title=tv?(item.name||item.original_name):(item.title||item.original_title);
    const date=tv?item.first_air_date:item.release_date;
    const year=date?date.slice(0,4):'';
    const rating=item.vote_average?item.vote_average.toFixed(1):null;
    const poster=item.poster_path?IMG_BASE+item.poster_path:null;
    const card=document.createElement('div');
    card.className='movie-card';
    if (poster) {
        card.innerHTML=`
        <div class="movie-card-inner">
            <img src="${poster}" alt="${title}" loading="lazy">
            <div class="movie-card-info">
                <div class="movie-card-title">${title}</div>
                <div class="movie-card-meta">
                    ${year?`<span class="movie-card-year">${year}</span>`:''}
                    ${rating?`<span class="movie-card-rating"><i data-lucide="star"></i>${rating}</span>`:''}
                </div>
            </div>
        </div>`;
    } else {
        card.innerHTML=`
        <div class="movie-card-inner">
            <div class="movie-card-fallback">
                <i data-lucide="film"></i>
            </div>
            <div class="movie-card-info">
                <div class="movie-card-title">${title}</div>
                <div class="movie-card-meta">
                    ${year?`<span class="movie-card-year">${year}</span>`:''}
                    ${rating?`<span class="movie-card-rating"><i data-lucide="star"></i>${rating}</span>`:''}
                </div>
            </div>
        </div>`;
    }
    lucide.createIcons({nodes:[card]});
    card.addEventListener('click',()=>launchMedia(item.id,tv));
    return card;
}

function closeOvr(ovr) {
    if (!ovr||!ovr.parentNode) return;
    const box=ovr.querySelector('.ep-ovr-box');
    ovr.style.animation='ovrOut 0.2s cubic-bezier(0.4,0,0.2,1) forwards';
    if (box) box.style.animation='boxOut 0.15s cubic-bezier(0.4,0,0.2,1) forwards';
    setTimeout(()=>{
        if (ovr.parentNode) ovr.parentNode.removeChild(ovr);
    },200);
}

function navigate(url) {
    try {
        window.parent.nav(url);
    } catch (e) {
        window.top.location.href=url;
    }
}

function launchMedia(id,tv) {
    if (!id) return;
    if (tv) {
        showEpSel(id);
    } else {
        navigate(`${VIDKING_BASE}/movie/${id}?color=60a5fa&autoPlay=true`);
    }
}

async function showEpSel(tvId) {
    const data=await fetchTMDB(`/tv/${tvId}`);
    const seasons=(data.seasons||[]).filter(s=>s.season_number>0);
    const ovr=document.createElement('div');
    ovr.className='ep-ovr';
    ovr.innerHTML=`
    <div class="ep-ovr-box">
        <div class="ep-ovr-header">
            <span class="ep-ovr-title">${data.name}</span>
            <button class="ep-ovr-close"><i data-lucide="x"></i></button>
        </div>
        <div class="ep-sels">
            <select class="ep-sel" id="seasonSel">
                ${seasons.map(s=>`<option value="${s.season_number}">Season ${s.season_number}</option>`).join('')}
            </select>
            <select class="ep-sel" id="episodeSel"></select>
        </div>
        <button class="ep-watch-btn">
            <i data-lucide="play"></i> Watch
        </button>
    </div>`;
    document.body.appendChild(ovr);
    lucide.createIcons({nodes:[ovr]});
    const seasonSel=ovr.querySelector('#seasonSel');
    const episodeSel=ovr.querySelector('#episodeSel');
    async function loadEpisodes(seasonNum) {
        const sData=await fetchTMDB(`/tv/${tvId}/season/${seasonNum}`);
        const episodes=sData.episodes||[];
        episodeSel.innerHTML=episodes.map(e=>`<option value="${e.episode_number}">Ep ${e.episode_number}: ${e.name}</option>`).join('');
    }
    await loadEpisodes(seasonSel.value);
    seasonSel.addEventListener('change',()=>loadEpisodes(seasonSel.value));
    ovr.querySelector('.ep-watch-btn').addEventListener('click',()=>{
        const s=seasonSel.value;
        const e=episodeSel.value;
        closeOvr(ovr);
        navigate(`${VIDKING_BASE}/tv/${tvId}/${s}/${e}?color=60a5fa&autoPlay=true`);
    });
    ovr.querySelector('.ep-ovr-close').addEventListener('click',()=>closeOvr(ovr));
    ovr.addEventListener('click',e=>{if (e.target===ovr)closeOvr(ovr);});
}

async function loadMore() {
    if (loading||exhausted) return;
    loading=true;
    const tv=currCat==='tv'||isTv;
    const [path,params]=getCatEndpoint(currCat,page,currQuery);
    try {
        const data=await fetchTMDB(path,params);
        const results=data.results||[];
        if (!results.length||page>=(data.total_pages||1)) exhausted=true;
        const loader=document.getElementById('gridLd');
        if (results.length===0&&page===1) {
            if (loader) loader.remove();
            const empty=document.createElement('div');
            empty.className='grid-empty';
            empty.innerHTML='<i data-lucide="search-x"></i><span>No results found</span>';
            lucide.createIcons({nodes:[empty]});
            movieGrid.insertBefore(empty,st);
        } else {
            results.forEach(item=>{
                const card=buildCard(item,tv);
                if (card) movieGrid.insertBefore(card,st);
            });
            if (loader&&movieGrid.querySelectorAll('.movie-card').length>0) {
                loader.remove();
            }
        }
        page++;
    } catch (err) {
        alert('Failed to load shows: TMDB error :(')
        const loader=document.getElementById('gridLd');
        if (loader) loader.remove();
    }
    loading=false;
}

function reload() {
    page=1;
    exhausted=false;
    movieGrid.querySelectorAll('.movie-card, .grid-empty').forEach(c=>c.remove());
    if (!document.getElementById('gridLd')) {
        const ld=document.createElement('div');
        ld.className='grid-ld';
        ld.id='gridLd';
        ld.innerHTML='<div class="grid-spinner"></div>';
        movieGrid.insertBefore(ld,st);
    }
    loadMore();
}

document.querySelectorAll('.cat-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
        document.querySelectorAll('.cat-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        currCat=btn.dataset.cat;
        isTv=currCat==='tv';
        currQuery='';
        searchInput.value='';
        reload();
    });
});

let debounce;
searchInput.addEventListener('input',e=>{
    clearTimeout(debounce);
    debounce=setTimeout(()=>{
        currQuery=e.target.value.trim();
        reload();
    },350);
});

const observer=new IntersectionObserver(async entries=>{
    if (entries[0].isIntersecting&&!loading&&!exhausted) await loadMore();
},{threshold:0.1});

observer.observe(st);

reload();