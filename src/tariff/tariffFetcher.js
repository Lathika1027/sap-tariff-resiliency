const tariffs = require("./mockTariffs.json");

function fetchTariffs() {
    return tariffs.map(tariff => ({
        eventType: "TARIFF_UPDATE",
        product: tariff.product,
        hsCode: tariff.hsCode,
        origin: tariff.origin,
        destination: tariff.destination,
        oldTariff: tariff.oldTariff,
        newTariff: tariff.newTariff,
        change: tariff.newTariff - tariff.oldTariff,
        timestamp: new Date().toISOString()
    }));
}

module.exports = {
    fetchTariffs
};