const suppliers = require("./suppliers.json");

function simulateLogistics(tariffEvent) {

    console.log("\n=================================");
    console.log("     LOGISTICS SIMULATION");
    console.log("=================================");

    console.log(`Product: ${tariffEvent.product}`);
    console.log(`HS Code: ${tariffEvent.hsCode}`);
    console.log(`Origin: ${tariffEvent.origin}`);
    console.log(`Destination: ${tariffEvent.destination}`);
    console.log(`New Tariff: ${tariffEvent.newTariff}%`);

    const scenarios = suppliers.map(supplier => {

        const tariffCost =
    supplier.baseCost * (supplier.tariffRate / 100);

        const totalCost =
            supplier.baseCost +
            supplier.shippingCost +
            tariffCost;

        return {
            supplier: supplier.name,
            country: supplier.country,
            baseCost: supplier.baseCost,
            tariffRate: supplier.tariffRate,
            tariffCost: tariffCost,
            shippingCost: supplier.shippingCost,
            totalCost: totalCost,
            transitDays: supplier.transitDays,
            riskScore: supplier.riskScore
        };
    });

    return scenarios;
}

module.exports = {
    simulateLogistics
};