const express = require("express");
const { open } = require("sqlite");
const path = require("path");

const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "covid19India.db");

const app = express();

app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server Running on http://localhost:3000");
    });
  } catch (e) {
    console.log(`Dr Error : ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/states/", async (request, response) => {
  const getStateDetails = `SELECT state_id as stateId,state_name as stateName,
     population FROM state;`;
  const stateNames = await db.all(getStateDetails);
  response.send(stateNames);
});

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateDetails = `SELECT state_id as stateId,state_name as stateName,
     population FROM state WHERE state_id = ${stateId};`;
  const stateNames = await db.get(getStateDetails);
  response.send(stateNames);
});

app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const createDistrictDetails = `INSERT INTO district 
    (district_name,state_id,cases,cured,active,deaths) VALUES 
    ("${districtName}",${stateId},${cases},${cured},${active},${deaths});`;
  await db.run(createDistrictDetails);
  response.send("District Successfully Added");
});

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictDetails = `SELECT district_id as districtId,district_name as districtName, state_id as stateId,
     cases,cured,active,deaths FROM district WHERE district_id = ${districtId};`;
  const districtNames = await db.get(getDistrictDetails);
  response.send(districtNames);
});

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrict = `DELETE FROM district WHERE district_id = ${districtId};`;
  await db.run(deleteDistrict);
  response.send("District Removed");
});

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const updateDistrictDetails = `UPDATE district SET 
    district_name = "${districtName}",
    state_id = ${stateId},cases = ${cases},
    cured = ${cured},active=${active},deaths=${deaths};`;
  await db.run(updateDistrictDetails);
  response.send("District Details Updated");
});

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const stateStats = `SELECT SUM(cases) AS totalCases,
    SUM(cured) AS totalCured,SUM(active) AS totalActive,
    SUM(deaths) AS totalDeaths FROM district 
    WHERE state_id = ${stateId};`;
  const stateStatsDetails = await db.get(stateStats);
  response.send(stateStatsDetails);
});

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const stateDetails = `SELECT state_name as stateName  FROM district CROSS JOIN state  
 WHERE district_id = ${districtId};`;
  const stateName = await db.get(stateDetails);
  response.send(stateName);
});

module.exports = app;
