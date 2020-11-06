const baseTitle = document.title;
const formArtists = document.querySelector(`#formArtists`);
const inputArtists = formArtists.querySelector(`input[name=inputArtists]`);
const submit = formArtists.querySelector(`button[type=submit]`);
const container = document.querySelector(`#container`);
const lfi = new LastFmIntersector();
let isPopState = false;
//
window.onload = () => {
  formArtists.addEventListener(`submit`, handlerSubmit);
  window.addEventListener(`keydown`, handlerKeyDown);
  window.addEventListener(`popstate`, handlerPopState);
  const defaultArtists = location.pathname.substr(1);
  if (defaultArtists != ``) {
    inputArtists.value = unescape(defaultArtists);
    formArtists.dispatchEvent(new Event(`submit`));
  }
};
const handlerPopState = function(ev) {
  isPopState = true;
  const artists = ev.state.artists.join(`,`);
  inputArtists.value = unescape(artists);
  formArtists.dispatchEvent(new Event(`submit`));
  isPopState = false;
}
const handlerKeyDown = function(ev) {
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
}
const handlerSubmit = function(ev) {
  const artistsInputted = inputArtists.value.replace(/ *, */, `,`).split(`,`)
    .map(a => a.trim())
    .filter(a => a !== ``);
  const artistsComma = artistsInputted.join(`,`);
  const artistsCommaSpace = artistsInputted.join(`, `);
  inputArtists.value = artistsCommaSpace;
  [...container.children].forEach(c => { c.remove() });
  if (artistsInputted.length >= 2) {
    const title = `${baseTitle} - ${artistsCommaSpace}`;
    document.title = title;
    if (!isPopState) {
      history.pushState({artists: artistsInputted}, title, artistsComma);
    }
    inputArtists.blur();
    inputArtists.disabled = true;
    submit.disabled = true;
    submit.style.cursor = `default`;
    lfi.run(artistsInputted, container, function () {
      inputArtists.disabled = false;
      submit.disabled = false;
      submit.style.cursor = `pointer`;
    });
  }
  else {
    alert(`Artists should be specified over two separating with commas.`);
  }
  ev.preventDefault();
}
