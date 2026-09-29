function createScenarios(tariffEvent, supplierScenarios) {

    const currentSupplier = supplierScenarios.find(
        supplier => supplier.country === tariffEvent.origin
    );

    const scenarios = [];

    // Scenario 1: Keep current supplier
    if (currentSupplier) {
        scenarios.push({
            scenarioId: "SCENARIO_1",
            strategy: "KEEP_CURRENT_SUPPLIER",
            supplier: currentSupplier.supplier,
            country: currentSupplier.country,
            tariffRate: currentSupplier.tariffRate,
            tariffCost: currentSupplier.tariffCost,
            shippingCost: currentSupplier.shippingCost,
            totalCost: currentSupplier.totalCost,
            transitDays: currentSupplier.transitDays,
            riskScore: currentSupplier.riskScore
        });
    }

    // Scenario 2: Switch supplier
    supplierScenarios
        .filter(supplier => supplier.country !== tariffEvent.origin)
        .forEach(supplier => {

            scenarios.push({
                scenarioId: `SWITCH_TO_${supplier.country.toUpperCase()}`,
                strategy: "SWITCH_SUPPLIER",
                supplier: supplier.supplier,
                country: supplier.country,
                tariffRate: supplier.tariffRate,
                tariffCost: supplier.tariffCost,
                shippingCost: supplier.shippingCost,
                totalCost: supplier.totalCost,
                transitDays: supplier.transitDays,
                riskScore: supplier.riskScore
            });
        });

    return scenarios;
}

module.exports = {
    createScenarios
};