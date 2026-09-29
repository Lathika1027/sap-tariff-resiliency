using { tariffresiliency as db } from '../db/schema';

@path: '/tariff'
service TariffService {

    entity Countries
        as projection on db.Countries;

    entity Products
        as projection on db.Products;

    entity Suppliers
        as projection on db.Suppliers;

    entity SupplierProducts
        as projection on db.SupplierProducts;

    entity TariffRules
        as projection on db.TariffRules;

    entity BOMs
        as projection on db.BOMs;

    entity BOMItems
        as projection on db.BOMItems;

    entity PurchaseOrders
        as projection on db.PurchaseOrders;

    entity PurchaseOrderItems
        as projection on db.PurchaseOrderItems;

    entity Routes
        as projection on db.Routes;

    entity RiskEvents
        as projection on db.RiskEvents;

    entity Scenarios
        as projection on db.Scenarios;
}
