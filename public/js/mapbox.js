/*eslint-disable*/

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoibWFuaXNocGF0aWwyMDA0IiwiYSI6ImNtY2x2cm1lZzBmcnEya3NkODRhZHU3eWEifQ.eeQNTPBPQQiKFtD0VqWG3A';
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11',
    projection: 'mercator', // Display the map as a globe, since satellite-v9 defaults to Mercator
    scrollZoom: false,
    //   zoom: 10,
    //   interactive:false,
    //   center: [30, 15],
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    //Create Marker
    const el = document.createElement('div');
    el.className = 'marker';

    //Add Marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    //Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description} </p>`)
      .addTo(map);
    //Extend Map Bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
