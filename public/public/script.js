const map = L.map("map").setView([52.52, 13.405], 6);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

// Altersabfrage (18+)
if (!localStorage.getItem("isAdult")) {
  document.getElementById("ageGate").style.display = "block";
}
function confirmAge() {
  localStorage.setItem("isAdult", "true");
  document.getElementById("ageGate").style.display = "none";
  document.getElementById("ghostBtn").style.display = "inline-block";
}

// Häuser laden
fetch("/houses")
  .then(r => r.json())
  .then(data => {
    data.forEach(h => {
      const icon = L.icon({
        iconUrl: h.verified
          ? "https://emojiapi.dev/api/v1/check_mark_button/64.png"
          : "https://emojiapi.dev/api/v1/jack_o_lantern/64.png",
        iconSize: [28, 28]
      });

      L.marker([h.lat, h.lng], { icon })
        .addTo(map)
        .bindPopup(`🎃 ${h.time || ""}`);
    });
  });

// Geister laden (anonym)
fetch("/ghosts")
  .then(r => r.json())
  .then(gs => {
    gs.forEach(g => {
      const icon = L.icon({
        iconUrl: "https://emojiapi.dev/api/v1/ghost/64.png",
        iconSize: [24, 24]
      });
      L.marker([g.lat, g.lng], { icon }).addTo(map);
    });
  });

// Geist hinzufügen
function addGhost() {
  if (!navigator.geolocation) {
    alert("GPS nicht verfügbar");
    return;
  }
  navigator.geolocation.getCurrentPosition(pos => {
    const lat = +(pos.coords.latitude.toFixed(3));
    const lng = +(pos.coords.longitude.toFixed(3));

    fetch("/ghosts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lng })
    }).then(() => location.reload());
  });
}

// Formular
function openForm() {
  document.getElementById("form").style.display = "block";
}
function closeForm() {
  document.getElementById("form").style.display = "none";
}
function submitHouse() {
  const address = document.getElementById("address").value;
  const time = document.getElementById("time").value;
  const verified = document.getElementById("verified").checked;

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${address}`)
    .then(r => r.json())
    .then(d => {
      if (!d[0]) return alert("Adresse nicht gefunden");

      fetch("/houses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: d[0].lat,
          lng: d[0].lon,
          time,
          verified
        })
      }).then(() => location.reload());
    });
}