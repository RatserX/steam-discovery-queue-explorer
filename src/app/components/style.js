import ElementHelper from '../../helpers/element-helper';

export default (props = {}) => {
  props.id = props.id ?? 'sqde-style';

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

  ElementHelper.insertAdjacentHTML(text, 'head', 'beforeend');
};
