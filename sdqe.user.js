// ==UserScript==
// @author       RatserX
// @description  Alternate explorer for the Steam Discovery Queue
// @description  auto, bot, discovery, explorer, queue, ratser, ratserx, steam, userscript
// @grant        none
// @icon         https://store.steampowered.com/favicon.ico
// @match        http://store.steampowered.com/explore*
// @match        https://store.steampowered.com/explore*
// @name         Steam Discovery Queue Explorer
// @namespace    https://github.com/RatserX/steam-discovery-queue-explorer
// @downloadURL  https://github.com/RatserX/steam-discovery-queue-explorer/raw/master/sdqe.user.js
// @updateURL    https://github.com/RatserX/steam-discovery-queue-explorer/raw/master/sdqe.user.js
// @version      5.1
// ==/UserScript==

const settings = {};
const localization = {};
const lifecycle = {};
const host = {};
const element = {};
const connection = {};
const app = {};

settings.app = {
    retryMax: 3,
    retryOnFailedRequest: false,
    retryOnFailedResponse: true
};

settings.explore = {
    retryMax: 3,
    retryOnFailedRequest: false,
    retryOnFailedResponse: true
};

settings.queue = {
    identifierMax: 1
};

localization._content = {
    "english": {
        exploreGame: "Games explored",
        exploreQueue: "Explore your queue",
        exploreQueueProduct: "Explore the products in your queue."
    },
    "spanish": {
        exploreGame: "Juegos explorados",
        exploreQueue: "Explora tu lista",
        exploreQueueProduct: "Explora los productos en tu lista."
    }
};

localization.language = "english";

localization.setLanguage = (searchElement) => {
    const keys = Object.keys(localization._content);
    const isLanguage = keys.includes(searchElement);
    localization.language = isLanguage ? searchElement : localization.language;
};

localization.format = (key) => {
    const language = localization.language;
    const content = localization._content[language];
    
    return content[key];
};

lifecycle._state = {};

lifecycle.getState = (key, initial = null) => lifecycle._state[key] ?? initial;

lifecycle.setState = (key, value) => {
    const state = lifecycle.getState(key);

    if (state !== value) {
        lifecycle._state[key] = value;
    
        const type = `state_${key}`;
        const event = new CustomEvent(type, { detail: value });
        const nodes = document.querySelectorAll(`[data-event-type="${type}"]`);
    
        nodes.forEach((node) => node.dispatchEvent(event));
    }
};

host.base = (url) => {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    return `${protocol}//${hostname}${url}`;
};

host.query = (url, name) => {
    const separatedUrls = url.split("?");
    const init = separatedUrls[1];
    const searchParameters = new URLSearchParams(init);
    
    return searchParameters.get(name);
};

host.serialize = (init) => {
    const searchParameters = new URLSearchParams(init);

    return searchParameters.toString();
};

element.addEventListener = (selectors, events) => {
    document
        .querySelectorAll(selectors)
        .forEach((node) => {
            const listener = node.getAttribute("data-event-listener");
            const type = node.getAttribute("data-event-type");
            
            if (listener in events) {
                node.addEventListener(type, events[listener]);
            }
        });
};

element.insertAdjacentHTML = (text, selectors, position = "afterend") => {
    document
        .querySelectorAll(selectors)
        .forEach((node) => node.insertAdjacentHTML(position, text));
};

element.removeContent = (selectors) => {
    document
        .querySelectorAll(selectors)
        .forEach((node) => node.parentNode.removeChild(node));
};

connection.app = (gameId) => {
    let willRetry = false;
    const input = host.base("/app/10");
    
    fetch(input, {
        body: host.serialize({
            appid_to_clear_from_queue: gameId,
            sessionid: g_sessionID
        }),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded;boundary=;charset=utf-8"
        },
        method: "POST"
    })
        .then((_) => {
            let gameIndex = lifecycle.getState("gameIndex");
            let queueId = lifecycle.getState("queueId");

            const gameCount = lifecycle.getState("gameCount");
            const gameLength = lifecycle.getState("gameLength");
            const activityProgressValue = (gameIndex + 1) * 100 / gameLength;
            
            lifecycle.setState("activityProgressValue", activityProgressValue);
            lifecycle.setState("gameCount", gameCount + 1);

            if (++gameIndex < gameLength) {
                lifecycle.setState("gameIndex", gameIndex);
            } else {
                if (++queueId < settings.queue.identifierMax) {
                    lifecycle.setState("queueId", queueId);
                    connection.explore();
                }
            }
        })
        .catch((_) => {
            willRetry = settings.app.retryOnFailedRequest;
        })
        .finally(() => {
            let appRetry = lifecycle.getState(`appRetry${gameId}`);
            
            if (willRetry && ++appRetry <= settings.app.retryMax) {
                lifecycle.setState(`appRetry${gameId}`, appRetry);
                connection.app(gameId);
            }
        });
};

connection.explore = () => {
    let willRetry = false;
    const input = host.base("/explore/generatenewdiscoveryqueue");

    fetch(input, {
        body: host.serialize({
            queuetype: 0,
            sessionid: g_sessionID
        }),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded;boundary=;charset=utf-8"
        },
        method: "POST"
    })
        .then(response => response.json())
        .then((data) => {
            if (
                data.hasOwnProperty("queue") &&
                data.hasOwnProperty("rgAppData") &&
                data.hasOwnProperty("settings")
            ) {
                const gameLength = data.queue.length;
                const queueId = lifecycle.getState("queueIndex");
                
                lifecycle.setState("gameIndex", 0);
                lifecycle.setState("gameLength", gameLength);
                data.queue.forEach((gameId) => {
                    const rgAppDataItem = data.rgAppData[gameId];
                    const props = {
                        gameId,
                        queueId,
                        discountBlock: rgAppDataItem.discount_block,
                        header: rgAppDataItem.header,
                        name: rgAppDataItem.name,
                        os_linux: rgAppDataItem.os_linux,
                        os_macos: rgAppDataItem.os_macos,
                        os_windows: rgAppDataItem.os_windows,
                        urlName: rgAppDataItem.url_name
                    };
                    
                    lifecycle.setState(`appRetry${gameId}`, 0);
                    app.game.render(props);
                    connection.app(gameId);
                });
            } else {
                willRetry = settings.explore.retryOnFailedResponse;
            }
        })
        .catch((_) => {
            willRetry = settings.explore.retryOnFailedRequest;
        })
        .finally(() => {
            let exploreRetry = lifecycle.getState("exploreRetry");

            if (willRetry && ++exploreRetry <= settings.explore.retryMax) {
                lifecycle.setState("exploreRetry", exploreRetry);
                connection.explore();
            }
        });
};

app.action = {
    document: () => {
        return (
`<div id="sqde-action" class="discovery_queue_customize_ctn">
    <div class="btnv6_blue_hoverfade btn_medium" data-event data-event-listener="handleActionClick" data-event-type="click">
        <span>${localization.format("exploreQueue")}</span>
    </div>
    <span> ${localization.format("exploreQueueProduct")} </span>
</div>`
        );
    },
    event: {
        handleActionClick: () => {
            element.removeContent("#sqde-activity");
            lifecycle.setState("activityProgressValue", 0);
            lifecycle.setState("gameCount", 0);
            lifecycle.setState("exploreRetry", 0);
            lifecycle.setState("queueId", 0);

            app.activity.render();
            connection.explore();
        }
    },
    render: () => {
        const html = app.action.document();

        element.insertAdjacentHTML(html, ".discovery_queue_customize_ctn", "beforebegin");
        element.addEventListener("#sqde-action [data-event]", app.action.event);
    }
};

app.activity = {
    document: () => {
        const activityProgressValue = lifecycle.getState("activityProgressValue");
        const gameCount = lifecycle.getState("gameCount");

        return (
`<div id="sqde-activity">
    <div id="sqde-activity-status" data-event data-event-listener="handleIsMaximizedState" data-event-type="state_isMaximized">
        <div class="info">
            <span>${localization.format("exploreGame")}: <span data-event data-event-listener="handleGameCountState" data-event-type="state_gameCount">${gameCount}</span></span>
        </div>
        <a class="resize" href="#" title="Resize" data-event data-event-listener="handleResizeClick" data-event-type="click">
            <div class="expander">&nbsp;</div>
        </a>
    </div>
    <div id="sqde-activity-content" data-event data-event-listener="handleIsMaximizedState" data-event-type="state_isMaximized"></div>
    <div id="sqde-activity-progress">
        <div class="value" style="width: ${activityProgressValue}%" data-event data-event-listener="handleActivityProgressValueState" data-event-type="state_activityProgressValue"></div>
    </div>
</div>`
        );
    },
    event: {
        handleActivityProgressValueState: (event) => {
            const activityProgressValue = event.detail;
            const target = event.target;
            target.style.width = `${activityProgressValue}%`;
        },
        handleGameCountState: (event) => {
            const gameCount = event.detail;
            const target = event.target;
            target.innerHTML = gameCount;
        },
        handleIsMaximizedState: (event) => {
            const isMaximized = event.detail;
            const target = event.target;
            const action = (isMaximized ? "add" : "remove");

            target.classList[action]("maximize");
        },
        handleResizeClick: () => {
            const key = "isMaximized";
            const isMaximized = lifecycle.getState(key);

            lifecycle.setState(key, !isMaximized);
        }
    },
    render: () => {
        const html = app.activity.document();

        element.insertAdjacentHTML(html, "body", "beforeend");
        element.addEventListener("#sqde-activity [data-event]", app.activity.event);
    }
};

app.game = {
    document: (props) => {
        const platform = {
            linux: (props.os_linux ? "<span class=\"platform_img linux\"></span>" : ""),
            macos: (props.os_macos ? "<span class=\"platform_img mac\"></span>" : ""),
            windows: (props.os_windows ? "<span class=\"platform_img win\"></span>" : "")
        };

        return (
`<a class="game" href="https://store.steampowered.com/app/${props.gameId}/${props.urlName}" id="sqde-game-${props.queueId}-${props.gameId}" target="_blank">
    <img class="media" src="${props.header}">
    <div class="info">
        <span class="name">${props.name}</span>
        <span class="platform">${platform.windows}${platform.macos}${platform.linux}</span>
    </div>
    <div class="cost">${props.discountBlock}</div>
</a>`
        );
    },
    render: (props) => {
        const html = app.game.document(props);

        element.insertAdjacentHTML(html, "#sqde-activity-content", "beforeend");
    }
};

app.style = {
    document: () => {
        return (
`<style id="sqde-style" type="text/css">
    #sqde-activity { position: fixed; bottom: 0px; left: 0px; width: 100%; z-index: 12; }
    #sqde-activity-content { display: grid; grid-column-gap: 5px; grid-template-columns: 1fr 1fr 1fr; max-height: 148px; padding: 9px; overflow-y: scroll; scroll-behavior: smooth; transition: max-height 1.32s cubic-bezier(0, 1, 0, 1); background-color: var(--gpStoreDarkerGrey); }
    #sqde-activity-content::-webkit-scrollbar { height: 12px; width: 14px; z-index: 12; background: transparent; }
    #sqde-activity-content::-webkit-scrollbar-thumb { width: 10px; z-index: 12; border: 4px solid var(--gpStoreDarkerGrey); border-radius: 10px; background-color: var(--gpStoreLighterGrey); background-clip: padding-box; transition: background-color .32s ease-in-out; }
    #sqde-activity-content::-webkit-scrollbar-thumb:hover { background-color: var(--gpStoreLightGrey); }
    #sqde-activity-content > .game { display: flex; height: 69px; margin-bottom: 5px; background-color: #16202d; }
    #sqde-activity-content > .game:hover { background-color: #101822; }
    #sqde-activity-content > .game > .media { padding-right: 14px; }
    #sqde-activity-content > .game > .info { display: grid; grid-auto-rows: min-content; padding-top: 6px; }
    #sqde-activity-content > .game > .info > .name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; line-height: 18px; font-size: 1.25em; color: #c7d5e0; }
    #sqde-activity-content > .game > .info > .platform { line-height: 20px; opacity: 0.3; }
    #sqde-activity-content > .game > .cost { margin-left: auto; margin-right: 16px; margin-top: 23px; }
    #sqde-activity-content > .game > .cost > .discount_block.no_discount { width: auto; }
    #sqde-activity-content > .game > .cost > .discount_block > .discount_pct { margin-right: 4px; margin-top: 8px; padding: 0px 4px; line-height: 18px; font-size: 14px; }
    #sqde-activity-content > .game > .cost > .discount_block > .discount_prices { float: right; background-color: transparent; }
    #sqde-activity-content > .game > .cost > .discount_block > .discount_prices > .discount_original_price { font-size: 11px; color: #626366; }
    #sqde-activity-content > .game > .cost > .discount_block > .discount_prices > .discount_final_price { font-size: 13px; color: #9099a1; }
    #sqde-activity-content.maximize { max-height: 296px; }
    #sqde-activity-progress { position: relative; height: 3px; width: 100%; background-color: var(--gpStoreDarkerGrey); }
    #sqde-activity-progress > .value { position: absolute; left: 0; top: 0; height: 100%; background-color: #214b6b; transition: width 1.32s ease-in-out; }
    #sqde-activity-status { display: flex; align-items: center; background-color: #214b6b; }
    #sqde-activity-status > .info { padding: 12px; font-size: 15px; font-weight: 300; }
    #sqde-activity-status > .resize { padding: 12px; justify-self: end; margin-left: auto; }
    #sqde-activity-status > .resize > .expander { width: 14px; height: 13px; background-image: url("https://store.akamai.steamstatic.com/public/images/v6/app/review_graph_expander.png"); }
    #sqde-activity-status.maximize > .resize > .expander { background-position: 0px -13px; }
    @media (max-width: 1400px) {
        #sqde-activity-content { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 992px) {
        #sqde-activity-content { grid-template-columns: 1fr; }
    }
</style>`
        );
    },
    render: () => {
        const html = app.style.document();

        element.insertAdjacentHTML(html, "head", "beforeend");
    }
};

(() => {
    const searchElement = host.query(window.location.href, "l");

    localization.setLanguage(searchElement ?? "english");
    element.removeContent("#sqde-style");
    app.style.render();
    element.removeContent("#sqde-action");
    app.action.render();
})();
