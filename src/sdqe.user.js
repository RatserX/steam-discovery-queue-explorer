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
// @version      0.3
// ==/UserScript==

const settings = {};

settings.app = {
  retryMax: 3,
  retryOnFailedRequest: false,
  retryOnFailedResponse: true,
};

settings.explore = {
  retryMax: 3,
  retryOnFailedRequest: false,
  retryOnFailedResponse: true,
};

settings.queue = {
  identifierMax: 1,
};

class App {
  /** @type {Connection} */
  #connection;

  /** @type {Localization} */
  #localization;

  /** @type {State} */
  #state;

  /** @type {Web} */
  #web;

  createConnection = () => {
    this.#connection = new Connection(this.#state, this.#web);
    return this.#connection;
  }

  createLocalization = () => {
    this.#localization = new Localization();
    return this.#localization;
  }

  createState = () => {
    this.#state = new State();
    return this.#state;
  }

  createWeb = () => {
    this.#web = new Web(this.#connection, this.#localization, this.#state);
    return this.#web;
  }
}

class Connection {
  /** @type {State} */
  #state;

  /** @type {Web} */
  #web;

  constructor(state, web) {
    this.#state = state;
    this.#web = web;
  };

  app = (gameId) => {
    let willRetry = false;
    const input = Helper.Host.base('/app/10');
  
    fetch(input, {
      body: Helper.Host.serialize({
        appid_to_clear_from_queue: gameId,
        sessionid: g_sessionID,
      }),
      headers: {
        'Content-Type':
          'application/x-www-form-urlencoded;boundary=;charset=utf-8',
      },
      method: 'POST',
    })
      .then((_) => {
        let gameIndex = this.#state.get('gameIndex');
        let queueId = this.#state.get('queueId');
  
        const gameCount = this.#state.get('gameCount');
        const gameLength = this.#state.get('gameLength');
        const activityProgressValue = ((gameIndex + 1) * 100) / gameLength;

        this.#state.set('activityProgressValue', activityProgressValue);
        this.#state.set('gameCount', gameCount + 1);
  
        if (++gameIndex < gameLength) {
          this.#state.set('gameCount', gameIndex);
        } else {
          if (++queueId < settings.queue.identifierMax) {
            this.#state.set('queueId', queueId);
            this.explore();
          }
        }
      })
      .catch((_) => {
        willRetry = settings.app.retryOnFailedRequest;
      })
      .finally(() => {
        let appRetry = this.#state.get(`appRetry${gameId}`);
  
        if (willRetry && ++appRetry <= settings.app.retryMax) {
          this.#state.set(`appRetry${gameId}`, appRetry);
          this.app(gameId);
        }
      });
  }

  explore = () => {
    let willRetry = false;
    const input = Helper.Host.base('/explore/generatenewdiscoveryqueue');

    fetch(input, {
      body: Helper.Host.serialize({
        queuetype: 0,
        sessionid: g_sessionID,
      }),
      headers: {
        'Content-Type':
          'application/x-www-form-urlencoded;boundary=;charset=utf-8',
      },
      method: 'POST',
    })
      .then((response) => response.json())
      .then((data) => {
        if (
          data.hasOwnProperty('queue') &&
          data.hasOwnProperty('rgAppData') &&
          data.hasOwnProperty('settings')
        ) {
          const gameLength = data.queue.length;
          const queueId = this.#state.get('queueIndex');

          this.#state.set('gameIndex', 0);
          this.#state.set('gameLength', gameLength);
          data.queue.forEach((gameId) => {
            const rgAppDataItem = data.rgAppData[gameId];
            const props = {
              id: `sqde-game-${queueId}-${gameId}`,
              gameId,
              queueId,
              discountBlock: rgAppDataItem.discount_block,
              header: rgAppDataItem.header,
              name: rgAppDataItem.name,
              os_linux: rgAppDataItem.os_linux,
              os_macos: rgAppDataItem.os_macos,
              os_windows: rgAppDataItem.os_windows,
              urlName: rgAppDataItem.url_name,
            };

            this.#state.set(`appRetry${gameId}`, 0);
            this.#web.game(props);
            this.app(gameId);
          });
        } else {
          willRetry = settings.explore.retryOnFailedResponse;
        }
      })
      .catch((_) => {
        willRetry = settings.explore.retryOnFailedRequest;
      })
      .finally(() => {
        let exploreRetry = this.#state.get('exploreRetry');
        if (willRetry && ++exploreRetry <= settings.explore.retryMax) {
          this.#state.set('exploreRetry', exploreRetry);
          this.explore();
        }
      });
  }
}

class Helper {
  static Element = class {
    static dispatchEvent = (type, value, name = null) => {
      const parsedType = name ? `${type}_${name}` : type;
      const selectors = name ? `[data-event-${type}-name="${name}"]` : `[data-event-${type}-listener]`;

      const event = new CustomEvent(parsedType, { detail: value });
      const nodes = document.querySelectorAll(selectors);
      nodes.forEach((node) => node.dispatchEvent(event));
    };

    static insertAdjacentHTML = (text, selectors, position = 'afterend') => {
      document
        .querySelectorAll(selectors)
        .forEach((node) => node.insertAdjacentHTML(position, text));
    };

    static removeContent = (selectors) => {
      document
        .querySelectorAll(selectors)
        .forEach((node) => node.parentNode.removeChild(node));
    };
  };

  static Host = class {
    static base = (url) => {
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      return `${protocol}//${hostname}${url}`;
    };
    
    static query = (url, name) => {
      const separatedUrls = url.split('?');
      const init = separatedUrls[1];
      const searchParameters = new URLSearchParams(init);
      return searchParameters.get(name);
    };
    
    static serialize = (init) => {
      const searchParameters = new URLSearchParams(init);
      return searchParameters.toString();
    };
  };
};

class Localization {
  #language = "english";
  #resource = {
    english: {
      exploreGame: 'Games explored',
      exploreQueue: 'Explore your queue',
      exploreQueueProduct: 'Explore the products in your queue.',
    },
    spanish: {
      exploreGame: 'Juegos explorados',
      exploreQueue: 'Explora tu lista',
      exploreQueueProduct: 'Explora los productos en tu lista.',
    },
  };
  
  format = (key) => this.#resource[this.#language][key];
  use = (selectedLanguage) => {
    const languages = Object.keys(this.#resource);
    const isLanguage = languages.includes(selectedLanguage);
    this.#language = isLanguage ? selectedLanguage : this.#language;
  };
};

class State {
  #storage = {};
  
  get = (name) => this.#storage[name];
  set = (name, value) => {
    const currentValue = this.get(name);
    if (currentValue !== value) {
      this.#storage[name] = value;
      Helper.Element.dispatchEvent("state", value, name);
    }
  }
}

class Web {
  /** @type {Connection} */
  #connection;

  /** @type {Localization} */
  #localization;

  /** @type {State} */
  #state;

  #generateEvents = (...events) => {
    const dataEventAttributes = [];
    const dataEventTypes = [];

    events.forEach((eventItems) => {
      const type = eventItems[0];
      const listener = eventItems[1];
      const name = eventItems[2];

      let attribute = `data-event-${type}-listener="${listener}"`;
      if (name) attribute += ` data-event-${type}-name="${name}"`;

      dataEventAttributes.push(attribute);
      dataEventTypes.push(type);
    });
    
    return `data-event="${dataEventTypes.join(",")}" ${dataEventAttributes.join(" ")}"`;
  };
  
  #registerEvents = (id, listenerObject) => {
    document.querySelectorAll(`#${id} [data-event]`).forEach((node) => {
      const event = node.getAttribute("data-event");
      const types = event.split(",");

      types.forEach((type) => {
        const listener = node.getAttribute(`data-event-${type}-listener`);
        const name = node.getAttribute(`data-event-${type}-name`);

        if (listener in listenerObject) {
          const parsedListener = listenerObject[listener];
          const parsedType = name ? `${type}_${name}` : type;
          node.addEventListener(parsedType, parsedListener);
        }
      });
    });
  };

  constructor(connection, localization, state) {
    this.#connection = connection;
    this.#localization = localization;
    this.#state = state;
  };
  
  action = (props = {}) => {
    props.id = props.id ?? "sqde-action";

    const listenerObject = {
      handleActionClick: () => {
        Helper.Element.removeContent('#sqde-activity');

        this.#state.set('activityProgressValue', 0);
        this.#state.set('gameCount', 0);
        this.#state.set('exploreRetry', 0);
        this.#state.set('queueId', 0);

        this.activity();
        this.#connection.explore();
      }
    };

    const text = `
<div id="${props.id}" class="discovery_queue_customize_ctn">
  <div class="btnv6_blue_hoverfade btn_medium" ${this.#generateEvents(['click', 'handleActionClick'])}>
    <span>${this.#localization.format('exploreQueue')}</span>
  </div>
  <span> ${this.#localization.format('exploreQueueProduct')} </span>
</div>`;

    Helper.Element.insertAdjacentHTML(text, '.discovery_queue_customize_ctn', 'beforebegin');
    this.#registerEvents(props.id, listenerObject);
  };

  activity = (props = {}) => {
    props.id = props.id ?? "sqde-activity";

    const listenerObject = {
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
        const action = isMaximized ? 'add' : 'remove';
        target.classList[action]('maximize');
      },
      handleResizeClick: () => {
        const key = 'isMaximized';
        const isMaximized = this.#state.get(key);
        this.#state.set(key, !isMaximized);
      }
    };

    const text = `
<div id="${props.id}">
  <div id="sqde-activity-status" ${this.#generateEvents(['state', 'handleIsMaximizedState', 'isMaximized'])}>
    <div class="info">
      <span>${this.#localization.format('exploreGame')}: <span ${this.#generateEvents(['state', 'handleGameCountState', 'gameCount'])}>${gameCount}</span></span>
    </div>
    <a class="resize" href="#" title="Resize" ${this.#generateEvents(['click', 'handleResizeClick'])}>
      <div class="expander">&nbsp;</div>
    </a>
  </div>
  <div id="sqde-activity-content" ${this.#generateEvents(['state', 'handleIsMaximizedState', 'isMaximized'])}></div>
  <div id="sqde-activity-progress">
    <div class="value" style="width: ${activityProgressValue}%" ${this.#generateEvents(['state', 'handleActivityProgressValueState', 'activityProgressValue'])}></div>
  </div>
</div>`;

    Helper.Element.insertAdjacentHTML(text, 'body', 'beforeend');
    this.#registerEvents(props.id, listenerObject);
  };

  game = (props = {}) => {
    props.id = props.id ?? "sqde-game";

    const platform = {
      linux: props.os_linux ? '<span class="platform_img linux"></span>' : '',
      macos: props.os_macos ? '<span class="platform_img mac"></span>' : '',
      windows: props.os_windows ? '<span class="platform_img win"></span>' : '',
    };

    const text = `
<a class="game" href="https://store.steampowered.com/app/${props.gameId}/${props.urlName}" id="${props.id}" target="_blank">
  <img class="media" src="${props.header}">
  <div class="info">
    <span class="name">${props.name}</span>
    <span class="platform">${platform.windows}${platform.macos}${platform.linux}</span>
  </div>
  <div class="cost">${props.discountBlock}</div>
</a>`;

    Helper.Element.insertAdjacentHTML(text, '#sqde-activity-content', 'beforeend');
  };

  style = (props = {}) => {
    props.id = props.id ?? "sqde-style";

    const text = `
<style id="${props.id}" type="text/css">
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
</style>`;

    Helper.Element.insertAdjacentHTML(text, 'head', 'beforeend');
  };
};

(() => {
  const app = new App();
  
  const localization = app.createLocalization();
  const web = app.createWeb();

  app.createConnection();
  app.createState();

  const selectedLanguage = Helper.Host.query(window.location.href, 'l');
  localization.use(selectedLanguage ?? 'english');

  Helper.Element.removeContent('#sqde-style');
  web.style();

  Helper.Element.removeContent('#sqde-action');
  web.action();
})();
