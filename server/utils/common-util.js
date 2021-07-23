/* eslint-disable max-len */
// calculates distance between two points on map
exports.haversine_distance = (origin, destination) => {
  if (!(origin.lat && origin.lng && destination.lat && destination.lng)){
    return;
  }

  var R = 3958.8; // Radius of the Earth in miles
  var rlat1 = origin.lat * (Math.PI / 180); // Convert degrees to radians
  var rlat2 = destination.lat * (Math.PI / 180); // Convert degrees to radians
  var difflat = rlat2 - rlat1; // Radian difference (latitudes)
  var difflon =
      (destination.lng - origin.lng) * (Math.PI / 180); // Radian difference (longitudes)

  var d =
      2 *
      R *
      Math.asin(
        Math.sqrt(
          Math.sin(difflat / 2) * Math.sin(difflat / 2) +
            Math.cos(rlat1) *
              Math.cos(rlat2) *
              Math.sin(difflon / 2) *
              Math.sin(difflon / 2),
        ),
      );
    // 1 mi = 1.609344 km
  return d * 1.609344;
};

