/* ---------- data: hand checked top 5 for the sample cities (typical prices per person, CHF) ---------- */
const CURATED = {
  zurich: [
    { name: "Old Town and Grossmünster", why: "Medieval lanes and the twin towered church; climb the tower for city views.", cost: 5, hours: 2, lat: 47.3700, lng: 8.5440 },
    { name: "Lake Zurich boat cruise", why: "A short round trip from Bürkliplatz with Alps views on clear days.", cost: 9, hours: 1.5, lat: 47.3664, lng: 8.5410 },
    { name: "Uetliberg mountain", why: "Zurich's own mountain, 20 minutes by train, with a lookout tower.", cost: 9, hours: 3, lat: 47.3496, lng: 8.4915 },
    { name: "Kunsthaus Zürich", why: "One of Switzerland's top art museums, from Monet to Giacometti.", cost: 24, hours: 2.5, lat: 47.3703, lng: 8.5482 },
    { name: "Lindt Home of Chocolate", why: "Interactive chocolate museum with tastings and a giant chocolate fountain.", cost: 15, hours: 2, lat: 47.3191, lng: 8.5450 },
  ],
  lucerne: [
    { name: "Chapel Bridge and Water Tower", why: "The 14th century covered wooden bridge that defines Lucerne.", cost: 0, hours: 1, lat: 47.0516, lng: 8.3075 },
    { name: "Mount Pilatus Golden Round Trip", why: "Boat, the world's steepest cogwheel railway and a cable car in one loop.", cost: 120, hours: 6, lat: 46.9790, lng: 8.2550 },
    { name: "Mount Rigi", why: "The Queen of the Mountains, with lake views on three sides.", cost: 80, hours: 5, lat: 47.0567, lng: 8.4850 },
    { name: "Swiss Museum of Transport", why: "Trains, planes and space travel; great for kids.", cost: 35, hours: 3, lat: 47.0525, lng: 8.3360 },
    { name: "Lion Monument", why: "A moving rock carving honoring Swiss Guards, a short walk from the old town.", cost: 0, hours: 0.5, lat: 47.0585, lng: 8.3105 },
  ],
  interlaken: [
    { name: "Jungfraujoch, Top of Europe", why: "Europe's highest railway station, with glacier views and an ice palace.", cost: 220, hours: 8, lat: 46.5475, lng: 7.9853 },
    { name: "Harder Kulm", why: "A 10 minute funicular to a viewing deck over both lakes and the Eiger.", cost: 40, hours: 2, lat: 46.6970, lng: 7.8516 },
    { name: "Tandem paragliding", why: "Fly over Interlaken and land in the central park, no experience needed.", cost: 180, hours: 2, lat: 46.6863, lng: 7.8632 },
    { name: "Lake Brienz and Iseltwald", why: "Turquoise water and the lakeside pier made famous online.", cost: 30, hours: 3, lat: 46.7110, lng: 7.9640 },
    { name: "Lauterbrunnen and Staubbach Falls", why: "A valley of 72 waterfalls, free to walk; the train ride is extra.", cost: 15, hours: 3, lat: 46.5936, lng: 7.9091 },
  ],
  zermatt: [
    { name: "Gornergrat railway", why: "A cogwheel train to 3,089 m facing the Matterhorn and 29 peaks over 4,000 m.", cost: 120, hours: 4, lat: 45.9833, lng: 7.7845 },
    { name: "Matterhorn Glacier Paradise", why: "Europe's highest cable car station, with year round snow.", cost: 110, hours: 4, lat: 45.9380, lng: 7.7300 },
    { name: "Sunnegga and the 5 Lakes Walk", why: "Easy hike with the Matterhorn reflected in mountain lakes.", cost: 30, hours: 4, lat: 46.0130, lng: 7.7760 },
    { name: "Matterhorn Museum", why: "The story of the first ascent and the village's history.", cost: 12, hours: 1, lat: 46.0207, lng: 7.7480 },
    { name: "Gorner Gorge", why: "Wooden walkways through a dramatic glacier carved gorge.", cost: 5, hours: 1, lat: 46.0110, lng: 7.7440 },
  ],
};
const CURATED_CURRENCY="CHF";
const cityKey=c=>String(c||"").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/^luzern$/,"lucerne");
