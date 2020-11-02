
const formArtists = document.querySelector(`#formArtists`);
const inputArtists = formArtists.querySelector(`input[name=inputArtists]`);
const submit = formArtists.querySelector(`button[type=submit]`);
const container = document.querySelector(`#container`);
const lfi = new LastFmIntersector();
//
window.onload = () => {
  const artists = location.pathname.substr(1);
  inputArtists.value = unescape(artists);
  formArtists.addEventListener(`submit`, formArtistsSubmit);
  if (inputArtists.value != ``) {
    formArtists.dispatchEvent(new Event(`submit`));
  }
  window.addEventListener(`keydown`, ev => {
    const isFocused = document.activeElement === inputArtists;
    if (isFocused) {
      return;
    }
    if (ev.key === `/`) {
      inputArtists.focus();
      ev.preventDefault();
    } else if (ev.key === `t`) {
      lfi.toggleMatch();
    }
  })
};
const formArtistsSubmit = function (e) {
  const ia = inputArtists.value.replace(/ *, */, `,`).split(`,`).map(a => a.trim());
  inputArtists.value = ia.join(`, `);
  [...container.children].forEach(c => { c.remove() });
  artists = splitArtists(inputArtists.value);
  if (artists.length >= 2) {
    history.pushState(null, document.title, ia.join(`,`));
    inputArtists.blur();
    inputArtists.disabled = true;
    submit.disabled = true;
    submit.style.cursor = `default`;
    lfi.run(artists, container, function () {
      inputArtists.disabled = false;
      submit.disabled = false;
      submit.style.cursor = `pointer`;
    });
  }
  else {
    alert(`Artists should be specified over two separating with commas.`);
  }
  e.preventDefault();
}
const splitArtists = function(artists) {
  const arrArtists = artists.split(`,`).map(a => {
    const trimmedArtist = a.trim();
    const tagMerge = trimmedArtist.match(/\((.*\|.*)\)/);
    if (tagMerge != null) {
      return trimmedArtist.replace(/ *\| */g, `|`).slice(1, -1);
    }
    return trimmedArtist;
  }).filter(a => a !== ``);
  return arrArtists;
}