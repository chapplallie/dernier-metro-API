"use strict";

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for logging (should be before routes)
app.use((req, res, next) => {
    const t0 = Date.now();

    res.on('finish', () => {
        const t1 = Date.now();
        const duration = t1 - t0;
        console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });

    next();
});

function nextArrival(now = new Date(), headwayMin = 3) {

    const tz = 'Europe/Paris';
    const toHM = d => String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
//   const end = new Date(now); end.setHours(1,15,0,0);         // 01:15
//   const lastWindow = new Date(now); lastWindow.setHours(0,45,0,0); // 00:45
//   if (now > end) return { service: 'closed', tz };
//   const next = new Date(now.getTime() + headwayMin*60*1000);
//   return { nextArrival: toHM(next), isLast: now >= lastWindow, headwayMin, tz };
 
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Service is closed between 01:15 and 05:30
  const isServiceClosed =
    (currentHour > 1 || (currentHour === 1 && currentMinute > 15)) && 
    (currentHour < 5 || (currentHour === 5 && currentMinute < 30));

  if (isServiceClosed) {
    return { service: 'closed', tz };
  }
  
  // Last metro between 00:45 and 01:15
  const isLastWindow = (currentHour === 0 && currentMinute >= 45) || 
                       (currentHour === 1 && currentMinute <= 15);
  
  const next = new Date(now.getTime() + headwayMin * 60 * 1000);
  return { 
    nextArrival: toHM(next), 
    isLast: isLastWindow, 
    headwayMin, 
    tz 
  };
}

app.get("/health", (req, res) => {
    return res.status(200).json({
        status: "ok",
        message: "API dernier metro est UP"
    });
});

app.get("/next-metro", (req, res) => {
    const station = req.query.station;

    if (!station) {
        return res.status(400).json({
            message: "Le paramètre station est obligatoire",
            error: "missing station"
        });
    }

    const timing = nextArrival();
    
    // If service = closed
    if (timing.service === 'closed') {
        return res.status(200).json({
            station: station,
            line: "M7",
            service: "closed",
            message: "Le metro est fermé",
            tz: timing.tz
        });
    }

    const result = {
        station: station,
        line: "M7",
        headwayMin: timing.headwayMin,
        nextArrival: timing.nextArrival,
        isLast: timing.isLast,
        tz: timing.tz
    };
    
    return res.status(200).json(result);
});

// 404 catch-all handler (should be last)
app.use((req, res, next) => {
    return res.status(404).json({
        message: "La route demandée est introuvable",
        error: "Route not found"
    });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
