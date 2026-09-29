const express = require("express");

const { fetchTariffs } = require("./src/tariff/tariffFetcher");
const { subscribe, publish } = require("./src/events/eventBus");
const { simulateLogistics } = require("./src/logistics/logisticsSimulator");
const { createScenarios } = require("./src/simulation/scenarioSimulator");

const apiRoutes = require("./src/api/routes");


/* ==========================================
   EVENT BUS + LOGISTICS SIMULATION
   ========================================== */

subscribe("TARIFF_UPDATE", (event) => {

    console.log("\n[LOGISTICS SIMULATOR] Received tariff update");

    const supplierScenarios = simulateLogistics(event);

    const scenarios = createScenarios(
        event,
        supplierScenarios
    );

    console.log("\n--- BUSINESS SCENARIOS ---");

    scenarios.forEach(scenario => {

        console.log(`
Scenario: ${scenario.scenarioId}
Strategy: ${scenario.strategy}
Supplier: ${scenario.supplier}
Country: ${scenario.country}
Tariff: ${scenario.tariffRate}%
Total Cost: $${scenario.totalCost}
Transit: ${scenario.transitDays} days
Risk: ${scenario.riskScore}
`);
    });
});


/* ==========================================
   PUBLISH TARIFF EVENTS
   ========================================== */

const tariffEvents = fetchTariffs();

tariffEvents.forEach(event => {
    publish(event);
});


/* ==========================================
   REST API
   ========================================== */

const app = express();

app.use(express.json());

app.use("/api", apiRoutes);


app.get("/", (req, res) => {

    res.json({
        application: "SAP Tariff Resiliency - Person 4 Integration",
        status: "running",
        endpoints: [
            "/api/tariffs",
            "/api/simulation",
            "/api/resilience-input"
        ]
    });

});


const PORT = 4000;

app.listen(PORT, () => {

    console.log("\n=================================");
    console.log(" PERSON 4 INTEGRATION API");
    console.log("=================================");
    console.log(`Server running on port ${PORT}`);
    console.log("\nAvailable endpoints:");
    console.log(`http://localhost:${PORT}/`);
    console.log(`http://localhost:${PORT}/api/tariffs`);
    console.log(`http://localhost:${PORT}/api/simulation`);
    console.log(`http://localhost:${PORT}/api/resilience-input`);
});