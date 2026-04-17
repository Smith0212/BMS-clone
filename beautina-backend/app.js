require("dotenv").config()
const con = require("./config/database")
const express = require("express")
const { text, json, urlencoded } = express
const cors = require("cors")
const { join, resolve } = require("path")
const { readFileSync } = require("fs")
const { createServer } = require("https")
// const firebaseService = require("./utils/firebaseService") // Firebase service
const { GLOBALS: _GLOBALS } = require("./config/constants")
// const { startSchedulers } = require('./utils/schedulers')

const app = express()

// Setting up EJS as view engine
app.set('view engine', 'ejs')
app.set('views', join(__dirname, 'modules/v1/api_documentation'))


// Initialize Firebase Admin SDK
// try {
//   const serviceAccount = require("./redeem-plus-firebase-adminsdk-fbsvc-2ae9ac6135.json")
//   firebaseService.initialize(serviceAccount)
//   console.log("Firebase Admin SDK initialized successfully")
// } catch (error) {
//   console.warn("Firebase Admin SDK initialization failed:", error.message)
//   console.warn("Push notifications will not work until Firebase credentials are properly configured")
// }



// app.use(cors())
const corsOptions = {
  origin: true, // allow all origins
  credentials: true, // allow cookies/auth headers
};

app.use(cors(corsOptions));

app.use(text())
app.use(json())
app.use(urlencoded({ extended: true }))

// Import all module routes
const v1Routes = require("./modules/v1/app-routing")

// Mount all v1 routes
app.use("/api/v1", v1Routes)


// API Documentation route
app.get("/v1/api_document", (req, res) => {
  res.render('api_doc', { GLOBALS: _GLOBALS })
})

app.get("/test", (req, res) => {
  console.log("Test API called")
  res.send("API is running...")
})

// Initialize database connection and start server
async function startServer() {
  try {
    // Test database connection and fetch credentials
    const client = await con.connect();
    console.log("Database connection established ✅");

    // Fetch credentials
    const credentialsFetched = await require('./utils/getCredentials')(con);
    if (credentialsFetched) {
      console.log("Credentials fetched successfully ✅");
    } else {
      console.error("Failed to fetch credentials ❌");
      process.exit(1);
    }

    client.release();

    // Start the server
    const port = 8856;
    // console.log("DEV_MODE:", process.env.DEV_MODE);

      app.listen(port, () => {
        console.log(`Server running on port: ${port}`);
        console.log(`API Documentation: http://localhost:${port}/v1/api_document`);
        console.log(`API Documentation: http://13.235.173.222:${port}/v1/api_document`)
        // Start schedulers after server is ready
        // try {
        //   startSchedulers()
        // } catch (e) {
        //   console.warn('Schedulers not started:', e?.message || e)
        // }
      });

  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

// Start the server
startServer();



// // for deployed server
// console.log("deployed server")
// const projectRootPath = resolve(__dirname + '../../../../../../');
// console.log("hello", projectRootPath)
//   // listen for requests
//   ;(async () => {
//     try {

//       // Test database connection and fetch credentials
//       const client = await con.connect()
//       console.log("Database connection established ✅")

//       // Fetch credentials
//       const credentialsFetched = await require('./utils/getCredentials')(client)
//       if (credentialsFetched) {
//         console.log("Credentials fetched successfully ✅")
//       } else {
//         console.error("Failed to fetch credentials ❌")
//         process.exit(1)
//       }

//       client.release()
//       // Prefer HTTPS with Let's Encrypt certs; fallback to HTTP if certs missing
//       const keyPath = "/etc/letsencrypt/live/hyperlinkdevteam.link/privkey.pem"
//       const certPath = "/etc/letsencrypt/live/hyperlinkdevteam.link/fullchain.pem"
//       const port = process.env.PORT || 5000
//       let server
//       try {
//         const key = readFileSync(keyPath)
//         const cert = readFileSync(certPath)
//         server = createServer({ key, cert }, app).listen(port, () => {
//           console.log("HTTPS server is running", { port })
//           console.log(`API Documentation: https://hyperlinkdevteam.link:${port}/v1/api_document`)
//           try {
//             startSchedulers()
//           } catch (e) {
//             console.warn('Schedulers not started:', e?.message || e)
//           }
//         })
//       } catch (certErr) {
//         console.warn("HTTPS certs not found or unreadable, starting HTTP server instead:", certErr.message)
//         server = app.listen(port, () => {
//           console.log("HTTP server is running", { port })
//         })
//       }


//     } catch (err) {
//       console.error("Error starting HTTPS server:", err)
//       process.exit(1)
//     }
//   })()





// for open street map :

//  run and tee full console output into quickstart_run.log
// ./quickstart.sh india 2>&1 | tee quickstart_run.log
// What the script does (high level): stops previous DB, downloads the OSM PBF for the chosen area, runs import pipeline (Imposm → PostGIS), runs SQL postprocessing, and generates ./data/$MBTILES_FILE.

// for open street map local tileserver
// docker run --rm -it \
//   -v "$(pwd)/data:/data" \
//   -v "$(pwd)/fonts:/usr/src/app/fonts" \
//   -p 8080:8080 \
//   maptiler/tileserver-gl
