function LastFmIntersector() {
  const INTERSECTED = `*** INTERSECTED ***`;
  let parentElem = null;
  let criteria = [];
  let maxScore = 0;
  let callback = function () { };
  let eachCallback = function () { };
  this.setEachCallback = function (cb) {
    eachCallback = cb;
  }
  const generateTable = function (result, _caption) {
    const wrapper = (() => {
      const div = document.createElement(`div`);
      div.className = `wrapper`;
      return div;
    })();
    const table = (() => {
      const table = document.createElement(`table`);
      const caption = (() => {
        const caption = document.createElement(`caption`);
        caption.className = result.length == 0 ? `not-found` : ``;
        const h2 = document.createElement(`h2`);
        h2.innerHTML = _caption;
        caption.append(h2);
        return caption;
      })();
      const thead = (() => {
        const thead = document.createElement(`thead`);
        const tr = (() => {
          const tr = document.createElement(`tr`);
          tr.className = `header`;
          return tr;
        })();
        const thName = (() => {
          const th = document.createElement(`th`);
          th.innerHTML = `Name`;
          return th;
        })();
        const thMatch = (() => {
          const th = document.createElement(`th`);
          th.innerHTML = `Match`;
          return th;
        })();
        tr.append(thName, thMatch);
        thead.append(tr);
        return thead;
      })();
      const tbody = (() => {
        const tbody = document.createElement(`tbody`);
        result.forEach(artist => {
          const name = artist.name;
          const match = artist.match;
          const url = artist.url;
          const tr = (() => {
            const tr = document.createElement(`tr`);
            const tdName = (() => {
              const td = document.createElement(`td`);
              td.className = `name`;
              const a = document.createElement(`a`);
              a.href = url;
              a.target = `_blank`;
              a.innerHTML = name;
              td.append(a);
              return td;
            })();
            const tdMatch = (() => {
              const td = document.createElement(`td`);
              td.className = `match`;
              const span = document.createElement(`span`);
              span.innerHTML = parseFloat(match).toFixed(5);
              td.append(span);
              return td;
            })();
            tr.append(tdName, tdMatch);
            return tr;
          })();
          tbody.append(tr);
        });
        return tbody;
      })();
      table.append(caption, thead, tbody);
      return table;
    })();
    wrapper.append(table);
    //
    const currentWrapper = document.querySelector(`.wrapper:first-child`);
    if (currentWrapper === null) {
      parentElem.append(wrapper);
    } else {
      parentElem.insertBefore(wrapper, currentWrapper);
    }
    //
    eachCallback();
  }
  this.run = function (artists, pe, cb) {
    criteria = artists;
    parentElem = pe;
    callback = cb;
    maxScore = criteria.length;
    searchSimilarArtists(criteria.pop());
  }
  const intersect = function () {
    const intersected = [];
    const tableFirst = parentElem.querySelector(`.wrapper:first-child > table`);
    const tableFurther = parentElem.querySelector(`.wrapper:not(:first-child) > table`);
    [...tableFirst.querySelectorAll(`tr:not(:first-child)`)].forEach(tr => {
      const a = tr.querySelector(`td.name > a`);
      const name = a.innerHTML;
      const url = a.href;
      const match = parseFloat(tr.querySelector(`td.match > span`).innerHTML);
      intersected.push({
        name,
        url,
        match,
        exists: 1,
      });
    });
    [...tableFurther.querySelectorAll(`tr:not(:first-child)`)].forEach(tr => {
      const name = tr.querySelector(`td.name > a`).innerHTML;
      const match = parseFloat(tr.querySelector(`td.match > span`).innerHTML);
      intersected.forEach(artist => {
        if (artist.name == name) {
          artist.match *= match;
          artist.exists++;
        }
      });
    });
    const intersectedFiltered = intersected.filter(artist => artist.exists === maxScore);
    const intersectedSorted = intersectedFiltered.sort((artistA, artistB) => artistB.match - artistA.match);
    generateTable(intersectedSorted, INTERSECTED);
    callback();
  }
  const searchSimilarArtists = function (artists) {
    if (artists === undefined) {
      intersect();
      return false;
    }
    fetch(`/${artists}/search`, {
      method: `GET`,
    })
      .then(response => response.json())
      .then(data => {
        generateTable(data.similar, artists);
        searchSimilarArtists(criteria.pop());
      });
  }
  this.showUsage = function () {
    console.info([
      `Usage:`,
      ` - showUsage()`,
      `    Shows this.`,
      ` - toggleMatch()`,
      `    Toggles match.`
    ].join(`\n`));
  }
  this.toggleMatch = function () {
    [...document.querySelectorAll(`td.match`)].forEach(td => {
      const isNone = [``, `none`].includes(td.style.display);
      td.style.display = isNone ? `table-cell` : `none`;
    });
  }
}
