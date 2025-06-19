const express = require('express');
const cors = require('cors');
const hospitals = require('./mockHospitals.json');

const app = express();
app.use(cors());
const PORT = 5000;

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

app.get('/nearby-hospitals', (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'Missing lat/lng' });

  const userLat = parseFloat(lat);
  const userLng = parseFloat(lng);

  const filtered = hospitals.filter(h => {
    const d = getDistanceKm(userLat, userLng, h.location.lat, h.location.lng);
    return d <= 5;
  });

  res.json({ results: filtered });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
