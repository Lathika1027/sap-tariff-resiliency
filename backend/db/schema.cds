namespace tariffresiliency;

entity Countries {
    key countryCode : String(3);
    countryName     : String(100);
    region          : String(50);
}
entity Products {
    key productId       : String(20);
    productName         : String(100);
    hsCode              : String(20);
    category            : String(50);
    unit                : String(10);
    active              : Boolean default true;
    countryCode         : String(3);
}
entity Suppliers {
    key supplierId      : String(20);
    supplierName        : String(100);
    countryCode         : String(3);
    riskScore           : Decimal(5,2);
    leadTimeDays        : Integer;
    currency            : String(3);
    active              : Boolean default true;
}
entity SupplierProducts {
    key supplierProductId : String(20);
    supplierId            : String(20);
    productId             : String(20);
    unitPrice             : Decimal(15,2);
    currency              : String(3);
    minimumOrderQty       : Integer;
    leadTimeDays          : Integer;
    capacity              : Integer;
    active                : Boolean default true;
}
entity TariffRules {
    key tariffId              : String(20);
    hsCode                    : String(20);
    originCountryCode         : String(3);
    destinationCountryCode    : String(3);
    tariffRate                : Decimal(10,2);
    previousTariffRate        : Decimal(10,2);
    tariffType                : String(30);
    effectiveFrom             : Date;
    effectiveTo               : Date;
    source                    : String(200);
    status                    : String(20);
}
entity BOMs {
    key bomId       : String(20);
    productId       : String(20);
    version         : String(10);
    validFrom       : Date;
    validTo         : Date;
}
entity BOMItems {
    key bomItemId           : String(20);
    bomId                   : String(20);
    componentProductId      : String(20);
    quantity                : Decimal(15,3);
    unit                    : String(10);
}
entity PurchaseOrders {
    key poId                  : String(20);
    supplierId               : String(20);
    poDate                   : Date;
    expectedDeliveryDate     : Date;
    status                   : String(30);
    currency                 : String(3);
    totalValue               : Decimal(15,2);
}
entity PurchaseOrderItems {
    key poItemId        : String(20);
    poId                : String(20);
    productId           : String(20);
    quantity            : Integer;
    unitPrice           : Decimal(15,2);
    currency            : String(3);
    deliveryDate        : Date;
}
entity Routes {
    key routeId               : String(20);
    originCountryCode         : String(3);
    destinationCountryCode    : String(3);
    originPort                : String(100);
    destinationPort           : String(100);
    carrier                   : String(100);
    transitDays               : Integer;
    congestionIndex           : Decimal(5,2);
    transportCost             : Decimal(15,2);
    currency                  : String(3);
    active                    : Boolean default true;
}
entity RiskEvents {
    key eventId               : String(20);
    eventType                 : String(50);
    hsCode                    : String(20);
    originCountryCode         : String(3);
    destinationCountryCode    : String(3);
    oldTariff                 : Decimal(10,2);
    newTariff                 : Decimal(10,2);
    impactLevel               : String(20);
    detectedAt                : Timestamp;
    status                    : String(20);
}
entity Scenarios {
    key scenarioId             : String(20);
    scenarioName               : String(100);
    productId                  : String(20);
    currentSupplierId          : String(20);
    alternativeSupplierId      : String(20);
    shiftPercentage            : Decimal(5,2);
    currentTariff              : Decimal(10,2);
    newTariff                  : Decimal(10,2);
    currentLandedCost          : Decimal(15,2);
    newLandedCost              : Decimal(15,2);
    currentLeadTime            : Integer;
    newLeadTime                : Integer;
    supplierRisk               : Decimal(5,2);
    createdAt                  : Timestamp;
}