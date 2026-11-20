/* 全国交通事故マップ（試作版） MapLibre GL JS + PMTiles */
(function () {
  'use strict';
  var YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
  var DOW = ['日', '月', '火', '水', '木', '金', '土'];
  var PARTY = [
    ['', 'すべて', null],
    ['ped', '歩行者', [61]],
    ['bic', '自転車', [51, 52]],
    ['mot', '二輪車（原付含む）', [31, 32, 33, 34, 35, 36, 43]],
    ['car', '乗用車', [1, 2, 3, 4, 5, 7]],
    ['trk', '貨物車', [11, 12, 13, 14, 17]],
    ['spc', '特殊車', [21, 22, 23, 24]],
    ['trn', '路面電車・列車', [41, 42]]
  ];
  var AGE = [
    ['', 'すべて', null], ['a1', '0〜24歳', [1]], ['a2', '25〜34歳', [25]], ['a3', '35〜44歳', [35]],
    ['a4', '45〜54歳', [45]], ['a5', '55〜64歳', [55]], ['a6', '65〜74歳', [65]], ['a7', '75歳以上', [75]],
    ['a8', '65歳以上', [65, 75]]
  ];
  var JUMP = [['全国', 37.5, 137.5, 4.6], ['北海道', 43.4, 142.8, 6.2], ['青森', 40.8, 140.7, 8], ['岩手', 39.6, 141.4, 7.5], ['宮城', 38.4, 140.9, 8.2], ['秋田', 39.7, 140.4, 7.8], ['山形', 38.5, 140.1, 8], ['福島', 37.4, 140.2, 7.8], ['茨城', 36.3, 140.3, 8.2], ['栃木', 36.7, 139.8, 8.3], ['群馬', 36.5, 138.9, 8.5], ['埼玉', 35.99, 139.4, 9], ['千葉', 35.5, 140.2, 8.4], ['東京', 35.69, 139.6, 9.5], ['神奈川', 35.4, 139.4, 9.5], ['新潟', 37.5, 138.9, 7.6], ['富山', 36.65, 137.2, 9], ['石川', 36.8, 136.8, 8.5], ['福井', 35.9, 136.2, 8.8], ['山梨', 35.6, 138.6, 9], ['長野', 36.15, 138.0, 8], ['岐阜', 35.8, 137.0, 8.3], ['静岡', 35.0, 138.3, 8.3], ['愛知', 35.0, 137.2, 8.8], ['三重', 34.5, 136.4, 8.3], ['滋賀', 35.2, 136.1, 9], ['京都', 35.1, 135.5, 8.7], ['大阪', 34.65, 135.5, 9.3], ['兵庫', 35.0, 134.8, 8.3], ['奈良', 34.35, 135.8, 9], ['和歌山', 33.9, 135.5, 8.7], ['鳥取', 35.4, 133.8, 8.7], ['島根', 35.0, 132.7, 8], ['岡山', 34.9, 133.8, 8.7], ['広島', 34.6, 132.8, 8.5], ['山口', 34.2, 131.5, 8.5], ['徳島', 33.9, 134.3, 9], ['香川', 34.25, 133.9, 9.5], ['愛媛', 33.6, 132.9, 8.5], ['高知', 33.5, 133.4, 8.6], ['福岡', 33.6, 130.7, 8.9], ['佐賀', 33.3, 130.1, 9.3], ['長崎', 33.0, 129.8, 8.4], ['熊本', 32.6, 130.8, 8.5], ['大分', 33.2, 131.4, 8.8], ['宮崎', 32.1, 131.3, 8.4], ['鹿児島', 31.5, 130.6, 8], ['沖縄', 26.5, 127.9, 8.2]];
  var BASE = {
    gsi_pale: { tiles: ['https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png'], max: 18, attr: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院</a>' },
    gsi_std: { tiles: ['https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png'], max: 18, attr: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院</a>' },
    esri_photo: { tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], max: 19, attr: 'Esri, Maxar, Earthstar Geographics, and the GIS User Community' },
    gsi_photo: { tiles: ['https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg'], max: 18, attr: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院</a>' },
    gsi_blank: { tiles: ['https://cyberjapandata.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png'], max: 14, attr: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院</a>' },
    osm: { tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], max: 19, attr: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors' }
  };
  var $ = function (id) { return document.getElementById(id); };
  var cb = {};

  /* ---------- 状態 ---------- */
  var S = defaults();
  function defaults() {
    return { y: YEARS.slice(), m: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], w: [1, 2, 3, 4, 5, 6, 7, 0], h0: 0, h1: 23, ac: 'all', ty: 'all', pa: '', ag: '', wx: '', dn: '', mode: 'both', bm: 'gsi_pale', wd: false };
  }


  /* ---------- 点の色（利用者が選べる） ---------- */
  var YCOL = ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d'];
  var CATS = {
    ac: { name: '事故内容', items: [['死亡', '#e60012'], ['負傷', '#2f6fb3']] },
    time: { name: '時間帯', items: [['朝(5-9時)', '#2f6fb3'], ['昼(10-15時)', '#f2c200'], ['夕(16-19時)', '#f07d00'], ['夜(20-4時)', '#4b2a8c']] },
    ty: { name: '事故類型', items: [['人対車両', '#e60012'], ['車両相互', '#2f6fb3'], ['車両単独', '#2e9e4f']] },
    y: { name: '統計年', items: YEARS.map(function (y, i) { return [y + '年', YCOL[i]]; }) }
  };
  var CB = { by: 'ac', col: {} };
  function colDefault(k) { return CATS[k].items.map(function (it) { return it[1]; }); }
  function loadCB() {
    try { var j = JSON.parse(localStorage.getItem('pointColors') || 'null'); if (j && CATS[j.by]) { CB.by = j.by; CB.col = j.col || {}; } } catch (e) {}
  }
  function saveCB() { try { localStorage.setItem('pointColors', JSON.stringify(CB)); } catch (e) {} }
  function curCols(k) { var d = colDefault(k), c = CB.col[k] || []; return d.map(function (x, i) { return c[i] || x; }); }
  function pointColorExpr() {
    var k = CB.by, c = curCols(k), H = ['get', 'h'];
    if (k === 'ac') return ['case', ['==', ['get', 'ac'], 1], c[0], c[1]];
    if (k === 'ty') return ['case', ['==', ['get', 'ty'], 1], c[0], ['==', ['get', 'ty'], 21], c[1], c[2]];
    if (k === 'time') return ['case', ['all', ['>=', H, 5], ['<=', H, 9]], c[0], ['all', ['>=', H, 10], ['<=', H, 15]], c[1], ['all', ['>=', H, 16], ['<=', H, 19]], c[2], c[3]];
    var e = ['case']; YEARS.forEach(function (y, i) { if (i < YEARS.length - 1) e.push(['==', ['get', 'y'], y], c[i]); }); e.push(c[YEARS.length - 1]); return e;
  }
  function applyPointColor() {
    if (map && map.getLayer('pt')) map.setPaintProperty('pt', 'circle-color', pointColorExpr());
    var lg = $('dotLegend'); if (!lg) return;
    var c = curCols(CB.by), h = '';
    CATS[CB.by].items.forEach(function (it, i) { h += '<span><i class="dot" style="background:' + c[i] + '"></i>' + it[0] + '</span>'; });
    lg.innerHTML = h + '<small>（点・ズーム11以上。死亡事故は大きく表示）</small>';
  }
  function buildColorUI() {
    var sel = $('colorBy'); if (!sel) return;
    sel.innerHTML = Object.keys(CATS).map(function (k) { return '<option value="' + k + '">' + CATS[k].name + '</option>'; }).join('');
    sel.value = CB.by;
    function rows() {
      var c = curCols(CB.by), box = $('colorRows'); box.innerHTML = '';
      CATS[CB.by].items.forEach(function (it, i) {
        var l = document.createElement('label'); l.className = 'crow';
        var inp = document.createElement('input'); inp.type = 'color'; inp.value = c[i];
        inp.addEventListener('input', function () { var cc = curCols(CB.by); cc[i] = inp.value; CB.col[CB.by] = cc; saveCB(); applyPointColor(); });
        l.appendChild(inp); l.appendChild(document.createTextNode(' ' + it[0])); box.appendChild(l);
      });
    }
    sel.addEventListener('change', function () { CB.by = sel.value; saveCB(); rows(); applyPointColor(); });
    $('colorReset').addEventListener('click', function () { delete CB.col[CB.by]; saveCB(); rows(); applyPointColor(); });
    rows(); applyPointColor();
  }

  /* ---------- UI構築 ---------- */
  function checks(el, items, key) {
    el.innerHTML = '';
    items.forEach(function (it) {
      var l = document.createElement('label');
      var i = document.createElement('input'); i.type = 'checkbox'; i.value = it[0]; i.dataset.key = key;
      l.appendChild(i); l.appendChild(document.createTextNode(it[1])); el.appendChild(l);
      i.addEventListener('change', function () { readChecks(key); apply(); });
    });
  }
  function readChecks(key) {
    var el = { y: 'years', m: 'months', w: 'dows' }[key];
    S[key] = Array.prototype.map.call($(el).querySelectorAll('input:checked'), function (i) { return +i.value; });
  }
  function writeChecks(key) {
    var el = { y: 'years', m: 'months', w: 'dows' }[key];
    Array.prototype.forEach.call($(el).querySelectorAll('input'), function (i) { i.checked = S[key].indexOf(+i.value) >= 0; });
  }
  function fillSelect(sel, items) {
    sel.innerHTML = '';
    items.forEach(function (it) { var o = document.createElement('option'); o.value = it[0]; o.textContent = it[1]; sel.appendChild(o); });
  }
  function buildUI() {
    checks($('years'), YEARS.map(function (y) { return [y, y]; }), 'y');
    checks($('months'), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (m) { return [m, m]; }), 'm');
    checks($('dows'), DOW.map(function (d, i) { return [i + 1, d]; }).concat([[0, '祝']]), 'w');
    var hs = []; for (var h = 0; h < 24; h++) hs.push([h, h]);
    fillSelect($('h0'), hs); fillSelect($('h1'), hs);
    fillSelect($('party'), PARTY.map(function (p) { return [p[0], p[1]]; }));
    fillSelect($('age'), AGE.map(function (p) { return [p[0], p[1]]; }));
    var wxs = [['', 'すべて']].concat(Object.keys(cb.wx || {}).map(function (k) { return [k, cb.wx[k]]; }));
    fillSelect($('wx'), wxs);
    var dns = [['', 'すべて']].concat(Object.keys(cb.dn || {}).map(function (k) { return [k, cb.dn[k]]; }));
    fillSelect($('dn'), dns);
    buildColorUI();
    fillSelect($('jump'), [['', '（選択してください）']].concat(JUMP.map(function (j, i) { return [i, j[0]]; })));
    $('jump').addEventListener('change', function (e) { if (e.target.value === '') return; var j = JUMP[+e.target.value]; map.flyTo({ center: [j[2], j[1]], zoom: j[3] }); });
    ['h0', 'h1'].forEach(function (id) { $(id).addEventListener('change', function () { S.h0 = +$('h0').value; S.h1 = +$('h1').value; apply(); }); });
    Array.prototype.forEach.call(document.querySelectorAll('input[name=mode]'), function (r) { r.addEventListener('change', function () { S.mode = r.value; apply(); }); });
    Array.prototype.forEach.call(document.querySelectorAll('input[name=ac]'), function (r) { r.addEventListener('change', function () { S.ac = r.value; apply(); }); });
    Array.prototype.forEach.call(document.querySelectorAll('input[name=ty]'), function (r) { r.addEventListener('change', function () { S.ty = r.value; apply(); }); });
    $('party').addEventListener('change', function () { S.pa = this.value; apply(); });
    $('age').addEventListener('change', function () { S.ag = this.value; apply(); });
    $('wx').addEventListener('change', function () { S.wx = this.value; apply(); });
    $('dn').addEventListener('change', function () { S.dn = this.value; apply(); });
    $('wDeath').addEventListener('change', function () { S.wd = this.checked; apply(); });
    $('basemap').addEventListener('change', function () { S.bm = this.value; apply(); });
    document.addEventListener('click', function (e) {
      var t = e.target; if (!t.dataset) return;
      var map2 = { years: 'y', months: 'm' };
      if (t.dataset.all) { S[map2[t.dataset.all]] = t.dataset.all === 'years' ? YEARS.slice() : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; writeChecks(map2[t.dataset.all]); apply(); }
      if (t.dataset.none) { S[map2[t.dataset.none]] = []; writeChecks(map2[t.dataset.none]); apply(); }
      if (t.dataset.preset === 'winter') { S.m = [12, 1, 2]; writeChecks('m'); apply(); }
      if (t.dataset.preset === 'summer') { S.m = [6, 7, 8]; writeChecks('m'); apply(); }
      if (t.dataset.hour) { var p = t.dataset.hour.split(','); S.h0 = +p[0]; S.h1 = +p[1]; syncUI(); apply(); }
    });
    $('reset').addEventListener('click', function () { var bm = S.bm, mode = S.mode; S = defaults(); S.bm = bm; S.mode = mode; syncUI(); apply(); });
    $('copy').addEventListener('click', function () {
      saveHash(true);
      var done = function () { $('copy').textContent = 'コピーしました'; setTimeout(function () { $('copy').textContent = 'この条件のリンクをコピー'; }, 1500); };
      if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(done, done); else done();
    });
    $('togglePanel').addEventListener('click', function () { var b = document.body; if (b.classList.contains('panel-hidden')) { b.classList.remove('panel-hidden'); b.classList.add('panel-open'); } else b.classList.toggle('panel-open'); setTimeout(function () { if (map) map.resize(); }, 50); });
    $('closePanel').addEventListener('click', function () { document.body.classList.remove('panel-open'); document.body.classList.add('panel-hidden'); setTimeout(function () { if (map) map.resize(); }, 50); });
    $('closeDetail').addEventListener('click', closeDetail);
  }
  function syncUI() {
    writeChecks('y'); writeChecks('m'); writeChecks('w');
    $('h0').value = S.h0; $('h1').value = S.h1;
    $('party').value = S.pa; $('age').value = S.ag; $('wx').value = S.wx; $('dn').value = S.dn;
    $('wDeath').checked = S.wd; $('basemap').value = S.bm;
    Array.prototype.forEach.call(document.querySelectorAll('input[name=mode]'), function (r) { r.checked = r.value === S.mode; });
    Array.prototype.forEach.call(document.querySelectorAll('input[name=ac]'), function (r) { r.checked = r.value === S.ac; });
    Array.prototype.forEach.call(document.querySelectorAll('input[name=ty]'), function (r) { r.checked = r.value === S.ty; });
    $('hourLabel').textContent = S.h0 + '〜' + S.h1 + '時' + (S.h0 > S.h1 ? '（日またぎ）' : '');
  }

  /* ---------- フィルタ ---------- */
  function listOf(tbl, key) { var r = tbl.filter(function (x) { return x[0] === key; })[0]; return r ? r[2] : null; }
  function coreFilter() {
    var f = ['all'];
    f.push(['in', ['get', 'y'], ['literal', S.y.length ? S.y : [-1]]]);
    if (S.m.length < 12) f.push(['in', ['get', 'm'], ['literal', S.m.length ? S.m : [-1]]]);
    var dows = S.w.filter(function (x) { return x > 0; });
    if (S.w.length < 8) {
      var any = ['any', ['in', ['get', 'dw'], ['literal', dows.length ? dows : [-1]]]];
      if (S.w.indexOf(0) >= 0) any.push(['==', ['get', 'hl'], 1]);
      f.push(any);
    }
    if (S.h0 !== 0 || S.h1 !== 23) {
      if (S.h0 <= S.h1) f.push(['all', ['>=', ['get', 'h'], S.h0], ['<=', ['get', 'h'], S.h1]]);
      else f.push(['any', ['>=', ['get', 'h'], S.h0], ['<=', ['get', 'h'], S.h1]]);
    }
    if (S.ac !== 'all') f.push(['==', ['get', 'ac'], +S.ac]);
    if (S.ty !== 'all') f.push(['==', ['get', 'ty'], +S.ty]);
    var pg = listOf(PARTY, S.pa);
    if (pg) f.push(['any', ['in', ['get', 'pa'], ['literal', pg]], ['in', ['get', 'pb'], ['literal', pg]]]);
    var ag = listOf(AGE, S.ag);
    if (ag) f.push(['any', ['in', ['get', 'aa'], ['literal', ag]], ['in', ['get', 'ab'], ['literal', ag]]]);
    if (S.wx) f.push(['==', ['get', 'wx'], +S.wx]);
    if (S.dn) f.push(['==', ['get', 'dn'], +S.dn]);
    return f;
  }
  function meshWeight() {
    var tgs = S.ty === 'all' ? [1, 2, 3] : (S.ty === '1' ? [1] : (S.ty === '21' ? [2] : [3]));
    var acs = S.ac === 'all' ? [1, 2] : [+S.ac];
    var terms = [];
    S.y.forEach(function (y) { acs.forEach(function (a) { tgs.forEach(function (t) {
      var g = ['coalesce', ['get', 'c' + (y - 2000) + a + t], 0];
      terms.push(a === 1 && S.wd ? ['*', g, 5] : g);
    }); }); });
    return terms.length ? ['+'].concat(terms) : 0;
  }
  function coreWeight() { return S.wd ? ['case', ['==', ['get', 'ac'], 1], 5, 1] : 1; }

  /* ---------- 地図 ---------- */
  var map;
  var abs = function (p) { return 'pmtiles://' + new URL(p, location.href).href; };
  function initMap() {
    var protocol = new pmtiles.Protocol();
    maplibregl.addProtocol('pmtiles', protocol.tile);
    var style = { version: 8, sources: {}, layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#eef1f4' } }] };
    Object.keys(BASE).forEach(function (k) {
      style.sources['bm_' + k] = { type: 'raster', tiles: BASE[k].tiles, tileSize: 256, maxzoom: BASE[k].max, attribution: BASE[k].attr };
      style.layers.push({ id: 'bm_' + k, type: 'raster', source: 'bm_' + k, layout: { visibility: k === S.bm ? 'visible' : 'none' } });
    });
    var ini = hashView() || { center: [137.5, 37.5], zoom: 4.6 };
    map = new maplibregl.Map({ container: 'map', style: style, center: ini.center, zoom: ini.zoom, maxZoom: 18, hash: false, attributionControl: { compact: true } });
    window.__map = map; map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-right');
    map.on('load', function () {
      map.addSource('mesh', { type: 'vector', url: abs('data/mesh.pmtiles') });
      map.addSource('core', { type: 'vector', url: abs('data/core.pmtiles') });
      var ramp = ['interpolate', ['linear'], ['heatmap-density'], 0, 'rgba(44,123,182,0)', 0.15, 'rgba(44,123,182,0.55)', 0.35, 'rgba(171,217,233,0.75)', 0.55, 'rgba(255,255,191,0.85)', 0.75, 'rgba(253,174,97,0.9)', 1, 'rgba(215,25,28,0.95)'];
      map.addLayer({ id: 'hm-mesh', type: 'heatmap', source: 'mesh', 'source-layer': 'mesh', maxzoom: 11, paint: {
        'heatmap-weight': ['interpolate', ['linear'], 0, 0, 0, 1, 1],
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 3, 4, 5, 3, 7, 1.6, 9, 1.0, 11, 0.8],
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 3, 8, 6, 13, 8, 18, 10, 28, 11, 34],
        'heatmap-color': ramp,
        'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 9, 0.85, 11, 0.7] } });
      map.addLayer({ id: 'hm-core', type: 'heatmap', source: 'core', 'source-layer': 'acc', minzoom: 11, paint: {
        'heatmap-weight': 1,
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 11, 0.25, 14, 0.5, 17, 1.1],
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 11, 6, 14, 14, 17, 32],
        'heatmap-color': ramp,
        'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 11, 0.8, 15, 0.8, 17, 0.45] } });
      map.addLayer({ id: 'pt', type: 'circle', source: 'core', 'source-layer': 'acc', minzoom: 11, layout: { 'circle-sort-key': ['case', ['==', ['get', 'ac'], 1], 1, 0] }, paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'],
          11, ['case', ['==', ['get', 'ac'], 1], 3, 1.2],
          14, ['case', ['==', ['get', 'ac'], 1], 6.5, 3],
          17, ['case', ['==', ['get', 'ac'], 1], 11, 7]],
        'circle-color': pointColorExpr(),
        'circle-opacity': ['case', ['==', ['get', 'ac'], 1], 1, 0.75],
        'circle-stroke-color': ['case', ['==', ['get', 'ac'], 1], '#fff', '#fff'],
        'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 12, ['case', ['==', ['get', 'ac'], 1], 1, 0], 15, ['case', ['==', ['get', 'ac'], 1], 1.6, 0.8]] } });
      map.addSource('sel', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addLayer({ id: 'sel', type: 'circle', source: 'sel', paint: { 'circle-radius': 11, 'circle-color': 'rgba(255,255,255,0)', 'circle-stroke-color': '#111', 'circle-stroke-width': 2.5 } });
      map.on('mousemove', 'pt', onHover); map.on('mouseleave', 'pt', function () { $('tip').hidden = true; map.getCanvas().style.cursor = ''; });
      map.on('click', function (e) { document.body.classList.remove('panel-open'); onClick(e); });
      map.on('moveend', function () { saveHash(); updateCount(); });
      map.on('idle', updateCount);
      var ct; map.on('data', function () { clearTimeout(ct); ct = setTimeout(updateCount, 400); });
      apply();
    });
  }

  function apply() {
    syncUI();
    if (!map || !map.getLayer('pt')) return;
    Object.keys(BASE).forEach(function (k) { map.setLayoutProperty('bm_' + k, 'visibility', k === S.bm ? 'visible' : 'none'); });
    var f = coreFilter();
    map.setFilter('pt', f); map.setFilter('hm-core', f);
    map.setPaintProperty('hm-core', 'heatmap-weight', coreWeight());
    var w = meshWeight();
    map.setPaintProperty('hm-mesh', 'heatmap-weight', w === 0 ? 0 : ['interpolate', ['linear'], w, 0, 0, 3, 0.1, 20, 0.3, 100, 0.65, 400, 1]);
    var showH = S.mode !== 'points', showP = S.mode !== 'heat';
    ['hm-mesh', 'hm-core'].forEach(function (id) { map.setLayoutProperty(id, 'visibility', showH ? 'visible' : 'none'); });
    map.setLayoutProperty('pt', 'visibility', showP ? 'visible' : 'none');
    var low = S.m.length < 12 || S.h0 !== 0 || S.h1 !== 23 || S.w.length < 8 || S.pa || S.ag || S.wx || S.dn;
    $('lowzoomNote').style.color = low ? '#b45309' : '';
    saveHash(); updateCount();
  }

  /* ---------- 件数 ---------- */
  function uniq(fs) {
    var seen = {}, out = [];
    fs.forEach(function (f) { var c = f.geometry.coordinates; var k = c[0].toFixed(6) + ',' + c[1].toFixed(6) + JSON.stringify(f.properties); if (!seen[k]) { seen[k] = 1; out.push(f); } });
    return out;
  }
  function updateCount() {
    var z = map.getZoom();
    if (z < 12) { $('count').textContent = 'ズーム12以上で、画面内の件数（概数）を表示します'; return; }
    if (S.mode === 'heat') { $('count').textContent = ''; return; }
    var n = uniq(map.queryRenderedFeatures({ layers: ['pt'] })).length;
    $('count').textContent = '画面内の件数（概数）：' + n.toLocaleString() + '件';
  }

  /* ---------- ホバー・クリック ---------- */
  function lab(f, v) { var t = cb[f]; return t && t[String(v)] !== undefined ? t[String(v)] : v; }
  function hit(pt) {
    var r = 7, bb = [[pt.x - r, pt.y - r], [pt.x + r, pt.y + r]];
    return uniq(map.queryRenderedFeatures(bb, { layers: ['pt'] }));
  }
  function onHover(e) {
    var fs = hit(e.point); if (!fs.length) { $('tip').hidden = true; return; }
    map.getCanvas().style.cursor = 'pointer';
    var p = fs[0].properties;
    var t = $('tip');
    t.innerHTML = p.y + '年 ' + p.m + '月 ' + p.h + '時台<br>' + lab('ty', p.ty) + '／' + lab('ac', p.ac) + '（死者' + p.dead + '・負傷' + p.inj + '）' + (fs.length > 1 ? '<br>ほか ' + (fs.length - 1) + '件（クリックで一覧）' : '');
    t.hidden = false; t.style.left = (e.point.x + 14) + 'px'; t.style.top = (e.point.y + 14) + 'px';
  }
  var cands = [], curSel = 0, reqId = 0;
  function onClick(e) {
    if (!map.getLayer('pt') || map.getLayoutProperty('pt', 'visibility') === 'none' || map.getZoom() < 11) return;
    var fs = hit(e.point);
    if (!fs.length) { closeDetail(); return; }
    cands = fs; showCand(0);
  }
  function closeDetail() { $('detail').hidden = true; map.getSource('sel').setData({ type: 'FeatureCollection', features: [] }); map.resize(); }
  function showCand(i) {
    curSel = i; var f = cands[i];
    map.getSource('sel').setData({ type: 'FeatureCollection', features: [{ type: 'Feature', geometry: f.geometry, properties: {} }] });
    $('detail').hidden = false; map.resize();
    renderDetail(f, null, true);
    var id = ++reqId;
    fetchDetail(f, id);
  }
  function fetchDetail(f, id) {
    var y = f.properties.y, tries = 0;
    if (map.getLayer('det')) map.removeLayer('det'); if (map.getSource('det')) map.removeSource('det');
    map.addSource('det', { type: 'vector', url: abs('data/acc_' + y + '.pmtiles') });
    map.addLayer({ id: 'det', type: 'circle', source: 'det', 'source-layer': 'acc', minzoom: 11, paint: { 'circle-radius': 12, 'circle-opacity': 0.01, 'circle-stroke-width': 0 } });
    var cx = f.geometry.coordinates[0], cy = f.geometry.coordinates[1], pr = f.properties;
    (function poll() {
      if (id !== reqId) { cleanup(); return; }
      var res = map.isSourceLoaded('det') ? map.querySourceFeatures('det', { sourceLayer: 'acc' }).filter(function (g) {
        var c = g.geometry.coordinates, q = g.properties;
        return Math.abs(c[0] - cx) < 2e-5 && Math.abs(c[1] - cy) < 2e-5 && q.m === pr.m && q.h === pr.h && q.ac === pr.ac && q.dead === pr.dead && q.inj === pr.inj && q.dw === pr.dw && q.ty === pr.ty && q.pa === pr.pa && q.pb === pr.pb && q.aa === pr.aa && q.ab === pr.ab;
      }) : [];
      if (res.length) { renderDetail(f, res[0].properties, false); cleanup(); return; }
      if (++tries > 40) { renderDetail(f, null, false); cleanup(); return; }
      setTimeout(poll, 150);
    })();
    function cleanup() { if (map.getLayer('det')) map.removeLayer('det'); if (map.getSource('det')) map.removeSource('det'); }
  }
  function row(k, v) { return '<tr><th>' + k + '</th><td>' + v + '</td></tr>'; }
  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function renderDetail(f, d, loading) {
    var p = f.properties, q = d || p, h = '';
    var fatal = p.ac === 1;
    var title = d ? (q.yo + '年' + q.m + '月' + q.d + '日（' + DOW[(q.dw + 6) % 7] + '）' + q.h + '時' + (q.mi < 10 ? '0' : '') + q.mi + '分') : (p.y + '年 ' + p.m + '月 ' + p.h + '時台');
    h += '<h3>' + title + '</h3><span class="badge" style="background:' + (fatal ? '#d7191c' : '#2f6fb3') + '">' + lab('ac', p.ac) + '</span>死者' + p.dead + '人・負傷者' + p.inj + '人';
    if (cands.length > 1) {
      h += '<p style="margin:8px 0 0;font-size:12px;color:#6b7785">この付近の事故：' + cands.length + '件</p><ul class="cands">';
      cands.forEach(function (c, i) { h += '<li data-i="' + i + '" class="' + (i === curSel ? 'on' : '') + '">' + c.properties.y + '/' + c.properties.m + ' ' + c.properties.h + '時</li>'; });
      h += '</ul>';
    }
    h += '<table>';
    h += row('事故類型', lab('ty', p.ty));
    if (d) {
      h += row('都道府県', lab('pref', q.pref));
      var cn = CITY[q.pref] && CITY[q.pref][q.city];
      h += row('市区町村', cn ? esc(cn) + '（' + q.city + '）' : '（コード ' + q.city + '）');
      h += row('警察署等／本票番号', q.ps + ' ／ ' + q.no);
    }
    h += row('昼夜', lab('dn', p.dn)) + row('天候', lab('wx', p.wx));
    if (d) {
      h += row('路面状態', lab('rs', q.rs)) + row('地形', lab('tp', q.tp)) + row('道路形状', lab('rf', q.rf)) + row('信号機', lab('sg', q.sg)) + row('歩車道区分', lab('wk', q.wk)) + row('衝突地点', lab('cp', q.cp)) + row('祝日', lab('hl', q.hl));
    }
    h += row('当事者A', lab('pa', p.pa) + '<br>年齢：' + lab('aa', p.aa) + (d ? '<br>速度規制：' + lab('sa', q.sa) + '<br>人身損傷：' + lab('ia', q.ia) : ''));
    h += row('当事者B', lab('pb', p.pb) + '<br>年齢：' + lab('ab', p.ab) + (d ? '<br>速度規制：' + lab('sb', q.sb) + '<br>人身損傷：' + lab('ib', q.ib) : ''));
    h += '</table>';
    if (loading) h += '<p class="note">詳細項目を読み込み中…</p>';
    else if (!d) h += '<p class="note">詳細項目を取得できませんでした。</p>';
    $('detailBody').innerHTML = h;
    Array.prototype.forEach.call($('detailBody').querySelectorAll('.cands li'), function (li) { li.addEventListener('click', function () { showCand(+li.dataset.i); }); });
  }

  /* ---------- URL（共有） ---------- */
  function hashView() {
    var m = /(?:^|&)map=([\d.]+)\/(-?[\d.]+)\/(-?[\d.]+)/.exec(location.hash.slice(1)); if (!m) return null;
    return { zoom: +m[1], center: [+m[3], +m[2]] };
  }
  function loadHash() {
    var P = new URLSearchParams(location.hash.slice(1));
    var num = function (s) { return s === '' ? [] : s.split(',').map(Number); };
    if (P.has('y')) S.y = num(P.get('y')); if (P.has('m')) S.m = num(P.get('m')); if (P.has('w')) S.w = num(P.get('w'));
    if (P.has('h')) { var h = num(P.get('h')); S.h0 = h[0]; S.h1 = h[1]; }
    ['ac', 'ty', 'pa', 'ag', 'wx', 'dn', 'mode', 'bm'].forEach(function (k) { if (P.has(k)) S[k] = P.get(k); });
    if (!BASE[S.bm]) S.bm = 'gsi_pale';
    if (P.has('wd')) S.wd = P.get('wd') === '1';
  }
  var hashTimer;
  function saveHash(now) {
    if (!map) return;
    var run = function () {
      var c = map.getCenter(), D = defaults(), P = new URLSearchParams();
      P.set('map', map.getZoom().toFixed(2) + '/' + c.lat.toFixed(5) + '/' + c.lng.toFixed(5));
      if (S.y.join() !== D.y.join()) P.set('y', S.y.join());
      if (S.m.join() !== D.m.join()) P.set('m', S.m.join());
      if (S.w.join() !== D.w.join()) P.set('w', S.w.join());
      if (S.h0 !== 0 || S.h1 !== 23) P.set('h', S.h0 + ',' + S.h1);
      ['ac', 'ty', 'pa', 'ag', 'wx', 'dn'].forEach(function (k) { if (S[k] !== D[k]) P.set(k, S[k]); });
      if (S.mode !== D.mode) P.set('mode', S.mode); if (S.bm !== D.bm) P.set('bm', S.bm); if (S.wd) P.set('wd', '1');
      history.replaceState(null, '', '#' + P.toString());
    };
    clearTimeout(hashTimer); if (now) run(); else hashTimer = setTimeout(run, 300);
  }

  /* ---------- 起動 ---------- */
  loadCB();
  var CITY = {};
  fetch('data/city.json').then(function (r) { return r.json(); }).catch(function () { return {}; }).then(function (c) { CITY = c; });
  fetch('data/codebook.json').then(function (r) { return r.json(); }).catch(function () { return {}; }).then(function (j) {
    cb = j; cb.pref = cb.pref || {};
    loadHash(); buildUI(); syncUI(); initMap();
  });
})();
