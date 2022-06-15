import esriConfig from 'esri/config';
import esriRequest from 'esri/request';



export function checkMixedContent(uri): string {
  if (typeof window.location.href === 'string' && window.location.href.indexOf('https://') === 0) {
    if (typeof uri === 'string' && uri.indexOf('http://') === 0) {
      uri = 'https:' + uri.substring(5);
    }
  }
  return uri;
}

export function endsWith(sv, sfx) {
  return sv.indexOf(sfx, sv.length - sfx.length) !== -1;
}

export function escapeForLucene(value) {
  let a = ['+', '-', '&', '!', '(', ')', '{', '}', '[', ']', '^', '"', '~', '*', '?', ':', '\\'];
  let r = new RegExp('(\\' + a.join('|\\') + ')', 'g');
  return value.replace(r, '\\$1');
}

export function generateId(): string {
  let t = null;
  if (typeof Date.now === 'function') {
    t = Date.now();
  } else {
    t = new Date().getTime();
  }
  let r = ('' + Math.random()).replace('0.', 'r');
  return (t + '' + r).replace(/-/g, '');
}

export function mitigateDropdownClip(dd, ddul) {
  // Dropdown menus clipped by scrollable container
  // let reposition = function() {
  //   let cs = domStyle.getComputedStyle(dd);
  //   let winBox = win.getBox();
  //   let ddGeom = domGeometry.position(dd);
  //   let ddulGeom = domGeometry.position(ddul);
  //   let t = ddGeom.y + ddGeom.h;
  //   let l = ddGeom.x;
  //   domStyle.set(ddul,"top",t+"px");
  //   domStyle.set(ddul,"left",l+"px");
  //   let position = t;
  //   let buttonHeight = ddGeom.h;
  //   let menuHeight = ddulGeom.h;
  //   let winHeight = winBox.h;
  //   if (position > menuHeight && winHeight - position < buttonHeight + menuHeight) {
  //     t = t - menuHeight - buttonHeight - 4;
  //     domStyle.set(ddul,"top",t+"px");
  //   }
  // };
  // reposition();
}

export function readItemJsonData(itemUrl) {
  // let n = itemUrl.indexOf("?");
  // if (n !== -1) itemUrl = itemUrl.substring(0,n);
  // let url = this.checkMixedContent(itemUrl);
  // url = itemUrl + "/data";
  // this.addCors(url);
  // return esriRequest({
  //   url: url,
  //   content: {f: "json"}
  //   handleAs: "json"
  // },{});
}

export function readRestInfo(url: string):Promise<__esri.RequestResponse> {
  url = checkMixedContent(url);
  return esriRequest(url, {
    responseType: "json",
    query: {
      f: 'json'
    },
  });
}
