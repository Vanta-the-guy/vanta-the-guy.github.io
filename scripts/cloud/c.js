lucide.createIcons();
import { Raccoon } from "./raccoon.js";

const items = [
    {
        name: "Cyberpunk 2077",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=117&name=Cyberpunk%202077",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/library_600x900.jpg"
    },
    {
        name: "Grand Theft Auto V",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=209",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/271590/library_600x900.jpg"
    },
    {
        name: "Elden Ring",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=598",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/library_600x900.jpg"
    },
    {
        name: "Sim Racing Telemetry - F1 22",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=1014&name=Sim%20Racing%20Telemetry%20-%20F1%2022",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1692250/library_600x900.jpg"
    },
    {
        name: "Little Nightmares III",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=1021&name=Little%20Nightmares%20III",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2136470/library_600x900.jpg"
    },
    {
        name: "SAND LAND",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=1018&name=SAND%20LAND",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1979440/library_600x900.jpg"
    },
    {
        name: "X-Plane 11",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=1016&name=X-Plane%2011",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/269950/library_600x900.jpg"
    },
    {
        name: "GUILTY GEAR -STRIVE-",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=1015&name=GUILTY%20GEAR%20-STRIVE-",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1384160/library_600x900.jpg"
    },
    {
        name: "Clair Obscur: Expedition 33",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=1013&name=Clair%20Obscur%3A%20Expedition%2033",
        imageUrl: "https://cdn1.epicgames.com/spt-assets/330dace5ffc74156987f91d454ac544b/project-w-1kt2x.jpg"
    },
    {
        name: "Easy Red 2",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=1012&name=Easy%20Red%202",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1325710/library_600x900.jpg"
    },
    {
        name: "JDM: Japanese Drift Master",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=1003&name=JDM%3A%20Japanese%20Drift%20Master",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1153410/library_600x900.jpg"
    },
    {
        name: "The First Berserker: Khazan",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=1002&name=The%20First%20Berserker%3A%20Khazan",
        imageUrl: "https://clouddosage.com/wp-content/uploads/2025/03/The-First-Berserker-Khazan-review-feature.jpg"
    },
    {
        name: "Blue Prince",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=1001&name=Blue%20Prince",
        imageUrl: "https://assets.nintendo.com/image/upload/q_auto/f_auto/store/software/switch2/70010000109038/b981f7ef5d2df071e77e83bbe6ded66110931ecdb62571ad2086d5523bf4af06"
    },
    {
        name: "Only Up",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=999&name=Only%20Up",
        imageUrl: "https://static0.gamerantimages.com/wordpress/wp-content/uploads/2023/07/only-up-can-you-save-the-game.jpg"
    },
    {
        name: "Schedule 1",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=998&name=Schedule%201",
        imageUrl: "https://static0.srcdn.com/wordpress/wp-content/uploads/sharedimages/2025/03/schedule-i-tag-page-cover-art.jpg?w=1200&h=900&fit=crop"
    },
    {
        name: "RuneScape: Dragonwilds",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=996&name=RuneScape%3A%20Dragonwilds",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1343400/library_600x900.jpg"
    },
    {
        name: "Poppy Playtime: Chapter 4",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=975&name=Poppy%20Playtime%3A%20Chapter%204",
        imageUrl: "https://cdn1.epicgames.com/spt-assets/465c0f6c95d04b1c86b280b4925fee2d/poppy-playtime-1g4f9.jpg"
    },
    {
        name: "Raft",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=974&name=Raft",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/648800/library_600x900.jpg"
    },
    {
        name: "Football Manager 2023",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=985&name=Football%20Manager%202023",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1904540/library_600x900.jpg"
    },
    {
        name: "Platform 8",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=980&name=Platform%208",
        imageUrl: "https://playism.com/wp-content/uploads/2024/11/06_8th_Logo_Keyart-1024x576.jpg"
    },
    {
        name: "Uncharted 4",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=970&name=Uncharted%204",
        imageUrl: "https://preview.redd.it/i-made-this-uncharted-4-poster-v0-pg0s83b9l7p61.jpg?auto=webp&s=e2c84c3ef21742b2fd7da369394a0ce6b60ee0bd"
    },
    {
        name: "Cities: Skylines 2",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=995&name=Cities%3A%20Skylines%202",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/949230/library_600x900.jpg"
    },
    {
        name: "Frostpunk 2",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=992&name=Frostpunk%202",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1601580/library_600x900.jpg"
    },
    {
        name: "Poppy Playtime: Chapter 2",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=966&name=Poppy%20Playtime%3A%20Chapter%202",
        imageUrl: "https://cdn1.epicgames.com/spt-assets/465c0f6c95d04b1c86b280b4925fee2d/poppy-playtime-1g3iv.png"
    },
    {
        name: "Poppy Playtime: Chapter 1",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=965&name=Poppy%20Playtime%3A%20Chapter%201",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1721470/library_600x900.jpg"
    },
    {
        name: "Poppy Playtime: Chapter 3",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=958&name=Poppy%20Playtime%3A%20Chapter%203",
        imageUrl: "https://cdn.displate.com/artwork/857x1200/2026-01-29/51bf7d02-f692-4d5a-bb6d-6b8b01295343.jpg"
    },
    {
        name: "Mafia III: Definitive Edition",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=973&name=Mafia%20III%3A%20Definitive%20Edition",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/360430/library_600x900.jpg"
    },
    {
        name: "Mafia II: Definitive Edition",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=972&name=Mafia%20II%3A%20Definitive%20Edition",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1030830/library_600x900.jpg"
    },
    {
        name: "TCG Card Shop",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=971&name=TCG%20Card%20Shop",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3070070/library_600x900.jpg"
    },
    {
        name: "Undertale",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=969&name=Undertale",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/391540/library_600x900.jpg"
    },
    {
        name: "Counter-Strike 2 (Steam)",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=1022&name=Counter-Strike%202%20%28Steam%29",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/730/library_600x900.jpg"
    },
    {
        name: "God of War: Ragnarök",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=963&name=God%2520of%2520War%253A%2520Ragnar%C3%B6k",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2322010/library_600x900.jpg"
    },
    {
        name: "Supermarket Simulator",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=952&name=Supermarket%20Simulator",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2670630/library_600x900.jpg"
    },
    {
        name: "Brotato",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=946&name=Brotato",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1942280/library_600x900.jpg"
    },
    {
        name: "Sniper: Ghost Warrior Contracts 2",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=914&name=Sniper%EF%BC%9AGhost%2520Warrior%2520Contracts2",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1338770/library_600x900.jpg"
    },
    {
        name: "God of War 4",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=587",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1593500/library_600x900.jpg"
    },
    {
        name: "Halo: The Master Chief Collection",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=890&name=Halo%3A%20The%20Master%20Chief%20Collection",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/976730/library_600x900.jpg"
    },
    {
        name: "Ratchet & Clank: Rift Apart",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=791&name=Ratchet%20%26%20Clank",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1895880/library_600x900.jpg"
    },
    {
        name: "The Last of Us Part I",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=765&name=The%2520Last%2520of%2520Us%E2%84%A2%2520Part%2520I",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1888930/library_600x900.jpg"
    },
    {
        name: "Hollow Knight",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=2&name=Hollow%20Knight",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/367520/library_600x900.jpg"
    },
    {
        name: "Neon Abyss",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=815&name=Neon%20Abyss",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/788100/library_600x900.jpg"
    },
    {
        name: "Need for Speed: Payback",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=723&name=Need%20for%20Speed%3A%20Payback",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1222680/library_600x900.jpg"
    },
    {
        name: "SpongeBob: Battle for Bikini Bottom",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=714&name=SpongeBob%20SquarePants%3A%20Battle%20for%20Bikini%20Bottom",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/969990/library_600x900.jpg"
    },
    {
        name: "Hogwarts Legacy",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=697&name=Hogwarts%20Legacy",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/990080/library_600x900.jpg"
    },
    {
        name: "SpongeBob: The Cosmic Shake",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=687&name=SpongeBob%20SquarePants%3A%20The%20Cosmic%20Shake",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1282150/library_600x900.jpg"
    },
    {
        name: "Drift Racing Online",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=676&name=Drift%20Racing%20Online",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/635260/library_600x900.jpg"
    },
    {
        name: "Choo-Choo Charles",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=669&name=Choo-Choo%20Charles",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1766740/library_600x900.jpg"
    },
    {
        name: "NBA 2K23",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=633&name=NBA%202K23",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1919590/library_600x900.jpg"
    },
    {
        name: "Ranch Simulator 22",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=630&name=Ranch%20Simulator22",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1119730/library_600x900.jpg"
    },
    {
        name: "Marvel’s Spider-Man Remastered",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=625&name=Marvel%E2%80%99s%2520Spider-Man%2520Remastered",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1817070/library_600x900.jpg"
    },
    {
        name: "Stray",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=620&name=Stray",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1332010/library_600x900.jpg"
    },
    {
        name: "Subnautica: Below Zero",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=612&name=Subnautica%20Zero",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/848450/library_600x900.jpg"
    },
    {
        name: "GhostWire: Tokyo",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=610&name=GhostWire%3A%20Tokyo",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1475810/library_600x900.jpg"
    },
    {
        name: "Nintendo Star Brawl",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=602&name=Nintendo%20Star%20Brawl",
        imageUrl: "https://howlongtobeat.com/games/98586_Nickelodeon_All_Star.jpg"
    },
    {
        name: "LEGO The Incredibles",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=597&name=LEGO%20The%20Incredibles",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/818320/library_600x900.jpg"
    },
    {
        name: "Watch Dogs: Legion",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=590&name=Watch%20Dogs%3A%20Legion",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2239550/library_600x900.jpg"
    },
    {
        name: "Cooking Simulator",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=585&name=Cooking%20Simulator",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/641320/library_600x900.jpg"
    },
    {
        name: "FIFA 19",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=581&name=FIFA19",
        imageUrl: "https://m.media-amazon.com/images/M/MV5BOGQ5ZWZiOTQtY2IwYS00YTY0LTgxMDktOTZkNmI4MmIyYzU0XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg"
    },
    {
        name: "Arma 3",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=515&name=Arma%203",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/107410/library_600x900.jpg"
    },
    {
        name: "Assassin's Creed: Brotherhood",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=513&name=Assassin%27s%20Creed%3A%20Brotherhood",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/48190/library_600x900.jpg"
    },
    {
        name: "Assassin's Creed: Revelations",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=512&name=Assassin%27s%20Creed%3A%20Revelations%20",
        imageUrl: "https://i.ebayimg.com/images/g/EGwAAOSw-oFkUy8q/s-l1200.jpg"
    },
    {
        name: "Assassin's Creed: Black Flag",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=509&name=Assassin%27s%20Creed%3A%20Black%20Flag",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/242050/library_600x900.jpg"
    },
    {
        name: "Assassin's Creed: Syndicate",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=465&name=Assassin%27s%20Creed%3A%20Syndicate",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/368500/library_600x900.jpg"
    },
    {
        name: "Football: PES 2021",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=462&name=Football%EF%BC%9APES%25202021",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1259970/library_600x900.jpg"
    },
    {
        name: "A Way Out",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=458&name=A%20Way%20Out",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1222700/library_600x900.jpg"
    },
    {
        name: "Days Gone",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=449&name=Days%20Gone",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1259420/library_600x900.jpg"
    },
    {
        name: "Forza Horizon 4",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=445&name=Forza%20Horizon%204",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1293830/library_600x900.jpg"
    },
    {
        name: "My Friend Pedro",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=421&name=My%20Friend%20Pedro",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/557340/library_600x900.jpg"
    },
    {
        name: "Control",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=398&name=Control",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/870780/library_600x900.jpg"
    },
    {
        name: "Halo: Reach",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=390&name=Halo%3A%20Reach",
        imageUrl: "https://i.ebayimg.com/images/g/0OYAAOSwyiZmvQLW/s-l1200.jpg"
    },
    {
        name: "Fallout 4",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=314&name=Fallout%204",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/377160/library_600x900.jpg"
    },
    {
        name: "It Takes Two",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=305&name=It%20Takes%20Two",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1426210/library_600x900.jpg"
    },
    {
        name: "Minecraft: Dungeons",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=301&name=Minecraft%3ADungeons",
        imageUrl: "https://myhotposters.com/cdn/shop/products/mL4386_1024x1024.jpg?v=1748533618"
    },
    {
        name: "Destiny 2",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=1024&name=Destiny%202%20%28Steam%29",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1085660/library_600x900.jpg"
    },
    {
        name: "War Thunder",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=1023&name=War%20Thunder%20%28Steam%29",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/236390/library_600x900.jpg"
    },
    {
        name: "Wolf Mate",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=1011&name=Wolf%20Mate",
        imageUrl: "https://gamefaqs.gamespot.com/a/box/7/6/1/1127761_side.jpg"
    },
    {
        name: "Crashlands 2",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=994&name=Crashlands%202",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2402220/library_600x900.jpg"
    },
    {
        name: "Mandragora",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=993&name=Mandragora%3A%20Whispers%20of%20the%20Witch%20Tree",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1792660/library_600x900.jpg"
    },
    {
        name: "Manor Lords",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=991&name=Manor%20Lords",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1363080/library_600x900.jpg"
    },
    {
        name: "inZOI",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=990&name=inZOI",
        imageUrl: "https://m.media-amazon.com/images/M/MV5BMzI1M2ZjOGUtNGY0OC00ZTgxLTliZmYtMDllZjY0M2MzMjE2XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg"
    },
    {
        name: "AI LIMIT",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=989&name=AI%20LIMIT",
        imageUrl: "https://s.pacn.ws/1/p/1cm/ai-limit-deluxe-edition-875333.1.jpg?v=sye45f"
    },
    {
        name: "Horizon Zero Dawn",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=988&name=Horizon%20Zero%20Dawn",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1151640/library_600x900.jpg"
    },
    {
        name: "Dead Space 3",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=987&name=Dead%2520Space%E2%84%A2%25203",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1238060/library_600x900.jpg"
    },
    {
        name: "Deathloop",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=986&name=Deathloop",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1252330/library_600x900.jpg"
    },
    {
        name: "Dead Space 2",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=984&name=Dead%20Space%202",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/47780/library_600x900.jpg"
    },
    {
        name: "Inside the Backrooms",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=982&name=Inside%20the%20Backrooms",
        imageUrl: "https://assets.nintendo.com/image/upload/f_auto/q_auto/dpr_1.5/c_scale,w_400/store/software/switch/70010000119130/69e66e404e25d4ff28bcfec8dccda2a1c689cdbc741b2ee8d57c301f41a6f8d2"
    },
    {
        name: "Five Hearts Under One Roof",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=979&name=Five%20Hearts%20Under%20One%20Roof",
        imageUrl: "https://cdn1.epicgames.com/spt-assets/6b211baddecd4526a95438db45166835/five-hearts-under-one-roof-18o7v.png"
    },
    {
        name: "The Callisto Protocol",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=977&name=The%20Callisto%20Protocol",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1544020/library_600x900.jpg"
    },
    {
        name: "ARK: Survival Ascended",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=976&name=ARK%3A%20Survival%20Ascended",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2399830/library_600x900.jpg"
    },
    {
        name: "Yandere Simulator",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=968&name=Yandere%20Simulator",
        imageUrl: "https://m.media-amazon.com/images/M/MV5BN2FhMmUwNDQtNTk1Mi00NzZhLWFmZDItNWZjYzVjYTM0N2Y1XkEyXkFqcGc@._V1_.jpg"
    },
    {
        name: "Amanda the Adventurer",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=967&name=%20Amanda%20the%20Adventurer",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2166060/library_600x900.jpg"
    },
    {
        name: "Watch Dogs 2",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=74&name=Watch%20Dogs%202",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/447040/library_600x900.jpg"
    },
    {
        name: "Doom Eternal",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=415&name=Doom%20Eternal",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/782330/library_600x900.jpg"
    },
    {
        name: "Cuphead",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=66&name=Cuphead",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/268910/library_600x900.jpg"
    },
    {
        name: "ONE PIECE: PIRATE WARRIORS 4",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=201&name=ONE%20PIECE%3A%20PIRATE%20WARRIORS%204",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1089090/library_600x900.jpg"
    },
    {
        name: "Attack On Titan 2",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=96&name=Attack%20On%20Titan2",
        imageUrl: "https://store-images.s-microsoft.com/image/apps.3749.67116328302209369.766d5242-c87b-4e0a-9cef-7b3e870a4a02.1558a40a-d19b-4b5d-b0fd-9c9a565fa1ae"
    },
    {
        name: "Minecraft: Legends",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=735&name=Minecraft%3A%20Legends",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1928870/library_600x900.jpg"
    },
    {
        name: "Wobbly Life",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=943&name=Wobbly%20Life",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1211020/library_600x900.jpg"
    },
    {
        name: "Overcooked 2",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=196&name=Overcooked%202",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/728880/library_600x900.jpg"
    },
    {
        name: "One Piece: Burning Blood",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=50&name=One%20Piece%3A%20Burning%20Blood",
        imageUrl: "https://store-images.s-microsoft.com/image/apps.1442.66233392027083247.615b47ed-f09e-4545-8c0b-0d140d30f2e0.2e737e62-0949-4dad-b5d4-82a8950790ad"
    },
    {
        name: "Alba: A Wildlife Adventure",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=451&name=Alba%3A%20A%20Wildlife%20Adventure",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1337010/library_600x900.jpg"
    },
    {
        name: "Resident Evil: Revelations 2",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=102&name=Resident%20Evil%3A%20Revelations%202",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/287290/library_600x900.jpg"
    },
    {
        name: "Resident Evil 2: Remake",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=25&name=Resident%20Evil%202%3A%20Remake",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/883710/library_600x900.jpg"
    },
    {
        name: "Ori and the Will of the Wisps",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=49&name=Ori%20and%20the%20Will%20of%20the%20Wisps",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1057090/library_600x900.jpg"
    },
    {
        name: "Party Hard 2",
        url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=411&name=Party%20Hard2",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/572430/library_600x900.jpg"
    }
];

const grid=document.getElementById('gameGrid');
const st=document.getElementById('st');
const searchInput=document.getElementById('searchInput');

const cardObserver=new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
        const img=entry.target.querySelector('img');
        if (entry.isIntersecting) {
            entry.target.style.visiblility='visible';
            if (img&&img.dataset.src) {
                img.src=img.dataset.src;
                delete img.dataset.src;
            }
        } else {
            entry.target.style.visiblility='hidden';
            if (img&&img.src) {
                img.dataset.src=img.src;
                img.src='';
            }
        }
    });
},{rootMargin:'200px'});

function syncGR() {
    const first=grid.querySelector('.game-card');
    if (first) grid.style.gridAutoRows=first.offsetWidth+'px';
}

function navigate(url) {
    const gameFrame=window.parent?.document?.querySelector?.('.bframe:not([style*="display:none"])');   
    if (gameFrame) {
        gameFrame.src=url;
    } else {
        window.open(url,'_blank');
    }
}

let _SIP=false;

async function handleGC(item) {
    if (_SIP) return;
    _SIP =true;
    console.log(item.name);
    window.parent.postMessage({
        type:'LAUNCH_GAME',
        item:item
    },'*');
    setTimeout(()=>{_SIP=false;},5000);
}

function renderCards(data) {
    grid.querySelectorAll('.game-card').forEach(c=>c.remove());
    data.forEach(item=>{
        const card=document.createElement('div');
        card.className='game-card';
        card.innerHTML=`
        <img src="${item.imageUrl}" alt="${item.name}" loading="lazy">
        <div class="game-card-nm">${item.name}</div>`;
        card.addEventListener('click',()=>handleGC(item));
        cardObserver.observe(card);
        grid.insertBefore(card,st);
    });
    syncGR();
}

function filterAR(query) {
    const q=query.toLowerCase().trim();
    const filtered=q?items.filter(i=>i.name.toLowerCase().includes(q)):items;
    renderCards(filtered);
}

renderCards(items);

let debounce;
searchInput.addEventListener('input',e=>{
    clearTimeout(debounce);
    debounce=setTimeout(()=>filterAR(e.target.value),250);
});

window.addEventListener('resize',syncGR);