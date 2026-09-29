const express = require("express");

const router = express.Router();

const { fetchTariffs } = require("../tariff/tariffFetcher");
const { simulateLogistics } = require("../logistics/logisticsSimulator");
const { createScenarios } = require("../simulation/scenarioSimulator");


/*
 * GET /api/tariffs
 *
 * Returns all current tariff events.
 */
router.get("/tariffs", (req, res) => {

    const tariffEvents = fetchTariffs();

    res.json({
        status: "success",
        count: tariffEvents.length,
        tariffs: tariffEvents
    });
});


/*
 * GET /api/simulation
 *
 * Runs logistics and supplier simulations
 * for all tariff events.
 */
router.get("/simulation", (req, res) => {

    const tariffEvents = fetchTariffs();

    const results = tariffEvents.map(event => {

        const supplierScenarios = simulateLogistics(event);

        const scenarios = createScenarios(
            event,
            supplierScenarios
        );

        return {
            tariffEvent: event,
            scenarios: scenarios
        };
    });

    res.json({
        status: "success",
        results: results
    });
});


/*
 * GET /api/resilience-input
 *
 * Main integration endpoint for Person 2.
 */
router.get("/resilience-input", (req, res) => {

    const tariffEvents = fetchTariffs();

    const results = tariffEvents.map(event => {

        const supplierScenarios = simulateLogistics(event);

        const scenarios = createScenarios(
            event,
            supplierScenarios
        );

        return {
            product: event.product,
            hsCode: event.hsCode,
            origin: event.origin,
            destination: event.destination,

            tariff: {
                old: event.oldTariff,
                new: event.newTariff,
                change: event.change
            },

            scenarios: scenarios
        };
    });

    res.json({
        status: "success",
        source: "PERSON4-INTEGRATION",
        data: results
    });
});


module.exports = router;