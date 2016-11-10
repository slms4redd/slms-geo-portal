export default function(url, successCalback, errorCalback) {
  const xmlhttp = new XMLHttpRequest();

  xmlhttp.onreadystatechange = function() {
    if (this.readyState === 4) {
      if (this.status === 200) {
        successCalback(this.responseText);
      } else {
        errorCalback(this.responseText);
      }
    }
  };

  xmlhttp.open("GET", url, true);
  xmlhttp.send();
}
