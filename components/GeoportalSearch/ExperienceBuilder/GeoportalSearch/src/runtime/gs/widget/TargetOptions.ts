export default class TargetOptions {
  constructor() {}

  getPrimarySearchResponse = function (result, task) {
    let self = this,
      searchResponse = null;
    if (Array.isArray(result)) {
      if (result.length > 0) {
        result.forEach((targetResult) => {
          let entity, k;
          if (targetResult) {
            k = targetResult.target;
            entity = targetResult.entity;
            if (task.primaryTargetKey === k) {
              searchResponse = entity;
            }
            self._targets.forEach((target) => {
              if (k === target.key) {
                let v = '-';
                if (entity && typeof entity.total === 'number') {
                  v = entity.total.toLocaleString();
                }
                target.nodeInfo.countNode.innerHTML = v;
              }
            });
          }
        });
      }
    } else {
      searchResponse = result;
      let v = '-';
      if (task.target === this._activeTarget) {
        if (result && typeof result.total === 'number') {
          v = result.total.toLocaleString();
        }
      }
      if (this._activeTarget) {
        this._activeTarget.nodeInfo.countNode.innerHTML = v;
      }
    }
    if (!searchResponse) {
      searchResponse = { error: 'No search response.' };
    }
    return searchResponse;
  };
}
