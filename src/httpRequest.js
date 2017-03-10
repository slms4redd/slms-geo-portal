export default function(method, url) {
  return new Promise(function(resolve, reject) {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);

    xhr.onreadystatechange = function() {
      if (this.readyState === 4) {
        if (this.status === 200) {
          resolve(this.responseText);
        } else {
          reject({
            status: this.status,
            statusText: this.responseText || `Error getting data from ${url}`
          });
        }
      }
    };
    // xhr.onerror = function() {
    //   reject({
    //     status: this.status,
    //     statusText: xhr.statusText
    //   });
    // };
    xhr.send();
  });
}
