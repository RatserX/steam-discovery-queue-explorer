import HostHelper from '../../helpers/host-helper';
import connectionSettings from '../../settings/connection-settings';

export default (gameId) => {
  let retry = 0;
  const input = HostHelper.base('/app/10');
  const promise = () =>
    new Promise((resolve, reject) => {
      let rejectReason = null;
      let willRetry = false;

      fetch(input, {
        body: HostHelper.serialize({
          appid_to_clear_from_queue: gameId,
          sessionid: g_sessionID,
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;boundary=;charset=utf-8',
        },
        method: 'POST',
      })
        .then((response) => resolve(response))
        .catch((reason) => {
          rejectReason = reason;
          willRetry = connectionSettings.app.retryOnFailedRequest;
        })
        .finally(() => {
          if (willRetry && ++retry <= connectionSettings.app.retryMax) {
            promise().then(resolve).catch(reject);
          } else {
            reject(rejectReason);
          }
        });
    });

  return promise();
};
