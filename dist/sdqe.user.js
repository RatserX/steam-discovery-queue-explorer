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
// @downloadURL  https://github.com/RatserX/steam-discovery-queue-explorer/raw/main/dist/sdqe.user.js
// @updateURL    https://github.com/RatserX/steam-discovery-queue-explorer/raw/main/dist/sdqe.user.js
// @version      0.2
// ==/UserScript==
const settings={},localization={},lifecycle={},host={},element={},connection={},app={};settings.app={retryMax:3,retryOnFailedRequest:!1,retryOnFailedResponse:!0},settings.explore={retryMax:3,retryOnFailedRequest:!1,retryOnFailedResponse:!0},settings.queue={identifierMax:1},localization._content={english:{exploreGame:"Games explored",exploreQueue:"Explore your queue",exploreQueueProduct:"Explore the products in your queue."},spanish:{exploreGame:"Juegos explorados",exploreQueue:"Explora tu lista",exploreQueueProduct:"Explora los productos en tu lista."}},localization.language="english",localization.setLanguage=e=>{var t=Object.keys(localization._content).includes(e);localization.language=t?e:localization.language},localization.format=e=>{var t=localization.language;return localization._content[t][e]},lifecycle._state={},lifecycle.getState=(e,t=null)=>lifecycle._state[e]??t,lifecycle.setState=(e,t)=>{if(lifecycle.getState(e)!==t){lifecycle._state[e]=t;e="state_"+e;const a=new CustomEvent(e,{detail:t});document.querySelectorAll(`[data-event-type="${e}"]`).forEach(e=>e.dispatchEvent(a))}},host.base=e=>{var t=window.location.hostname;return window.location.protocol+"//"+t+e},host.query=(e,t)=>{e=e.split("?")[1];return new URLSearchParams(e).get(t)},host.serialize=e=>{return new URLSearchParams(e).toString()},element.addEventListener=(e,i)=>{document.querySelectorAll(e).forEach(e=>{var t=e.getAttribute("data-event-listener"),a=e.getAttribute("data-event-type");t in i&&e.addEventListener(a,i[t])})},element.insertAdjacentHTML=(t,e,a="afterend")=>{document.querySelectorAll(e).forEach(e=>e.insertAdjacentHTML(a,t))},element.removeContent=e=>{document.querySelectorAll(e).forEach(e=>e.parentNode.removeChild(e))},connection.app=t=>{let a=!1;var e=host.base("/app/10");fetch(e,{body:host.serialize({appid_to_clear_from_queue:t,sessionid:g_sessionID}),headers:{"Content-Type":"application/x-www-form-urlencoded;boundary=;charset=utf-8"},method:"POST"}).then(e=>{var t=lifecycle.getState("gameIndex"),a=lifecycle.getState("queueId"),i=lifecycle.getState("gameCount"),n=lifecycle.getState("gameLength"),o=100*(t+1)/n;lifecycle.setState("activityProgressValue",o),lifecycle.setState("gameCount",i+1),++t<n?lifecycle.setState("gameIndex",t):++a<settings.queue.identifierMax&&(lifecycle.setState("queueId",a),connection.explore())}).catch(e=>{a=settings.app.retryOnFailedRequest}).finally(()=>{let e=lifecycle.getState("appRetry"+t);a&&++e<=settings.app.retryMax&&(lifecycle.setState("appRetry"+t,e),connection.app(t))})},connection.explore=()=>{let t=!1;var e=host.base("/explore/generatenewdiscoveryqueue");fetch(e,{body:host.serialize({queuetype:0,sessionid:g_sessionID}),headers:{"Content-Type":"application/x-www-form-urlencoded;boundary=;charset=utf-8"},method:"POST"}).then(e=>e.json()).then(a=>{if(a.hasOwnProperty("queue")&&a.hasOwnProperty("rgAppData")&&a.hasOwnProperty("settings")){var e=a.queue.length;const i=lifecycle.getState("queueIndex");lifecycle.setState("gameIndex",0),lifecycle.setState("gameLength",e),a.queue.forEach(e=>{var t=a.rgAppData[e],t={gameId:e,queueId:i,discountBlock:t.discount_block,header:t.header,name:t.name,os_linux:t.os_linux,os_macos:t.os_macos,os_windows:t.os_windows,urlName:t.url_name};lifecycle.setState("appRetry"+e,0),app.game.render(t),connection.app(e)})}else t=settings.explore.retryOnFailedResponse}).catch(e=>{t=settings.explore.retryOnFailedRequest}).finally(()=>{let e=lifecycle.getState("exploreRetry");t&&++e<=settings.explore.retryMax&&(lifecycle.setState("exploreRetry",e),connection.explore())})},app.action={document:()=>`<div id="sqde-action" class="discovery_queue_customize_ctn">
    <div class="btnv6_blue_hoverfade btn_medium" data-event data-event-listener="handleActionClick" data-event-type="click">
        <span>${localization.format("exploreQueue")}</span>
    </div>
    <span> ${localization.format("exploreQueueProduct")} </span>
</div>`,event:{handleActionClick:()=>{element.removeContent("#sqde-activity"),lifecycle.setState("activityProgressValue",0),lifecycle.setState("gameCount",0),lifecycle.setState("exploreRetry",0),lifecycle.setState("queueId",0),app.activity.render(),connection.explore()}},render:()=>{var e=app.action.document();element.insertAdjacentHTML(e,".discovery_queue_customize_ctn","beforebegin"),element.addEventListener("#sqde-action [data-event]",app.action.event)}},app.activity={document:()=>{var e=lifecycle.getState("activityProgressValue"),t=lifecycle.getState("gameCount");return`<div id="sqde-activity">
    <div id="sqde-activity-status" data-event data-event-listener="handleIsMaximizedState" data-event-type="state_isMaximized">
        <div class="info">
            <span>${localization.format("exploreGame")}: <span data-event data-event-listener="handleGameCountState" data-event-type="state_gameCount">${t}</span></span>
        </div>
        <a class="resize" href="#" title="Resize" data-event data-event-listener="handleResizeClick" data-event-type="click">
            <div class="expander">&nbsp;</div>
        </a>
    </div>
    <div id="sqde-activity-content" data-event data-event-listener="handleIsMaximizedState" data-event-type="state_isMaximized"></div>
    <div id="sqde-activity-progress">
        <div class="value" style="width: ${e}%" data-event data-event-listener="handleActivityProgressValueState" data-event-type="state_activityProgressValue"></div>
    </div>
</div>`},event:{handleActivityProgressValueState:e=>{var t=e.detail;e.target.style.width=t+"%"},handleGameCountState:e=>{var t=e.detail;e.target.innerHTML=t},handleIsMaximizedState:e=>{var t=e.detail;e.target.classList[t?"add":"remove"]("maximize")},handleResizeClick:()=>{var e="isMaximized",t=lifecycle.getState(e);lifecycle.setState(e,!t)}},render:()=>{var e=app.activity.document();element.insertAdjacentHTML(e,"body","beforeend"),element.addEventListener("#sqde-activity [data-event]",app.activity.event)}},app.game={document:e=>{const t=e.os_linux?'<span class="platform_img linux"></span>':"",a=e.os_macos?'<span class="platform_img mac"></span>':"",i=e.os_windows?'<span class="platform_img win"></span>':"";return`<a class="game" href="https://store.steampowered.com/app/${e.gameId}/${e.urlName}" id="sqde-game-${e.queueId}-${e.gameId}" target="_blank">
    <img class="media" src="${e.header}">
    <div class="info">
        <span class="name">${e.name}</span>
        <span class="platform">${i}${a}${t}</span>
    </div>
    <div class="cost">${e.discountBlock}</div>
</a>`},render:e=>{e=app.game.document(e);element.insertAdjacentHTML(e,"#sqde-activity-content","beforeend")}},app.style={document:()=>`<style id="sqde-style" type="text/css">
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
</style>`,render:()=>{var e=app.style.document();element.insertAdjacentHTML(e,"head","beforeend")}},(()=>{var e=host.query(window.location.href,"l");localization.setLanguage(e??"english"),element.removeContent("#sqde-style"),app.style.render(),element.removeContent("#sqde-action"),app.action.render()})();