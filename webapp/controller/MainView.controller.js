sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType",
    "sap/m/MessageBox"
], function (
    Controller,
    MessageToast,
    Filter,
    FilterOperator,
    FilterType,
    MessageBox
) {
    "use strict";

    return Controller.extend(
        "com.hackfest.tariff.tariffresiliency.controller.MainView",
        {

            // =========================================================
            // INITIALIZATION
            // =========================================================

            onInit: function () {

                // Product search value
                this._sProductFilter = "";

                // Risk filter
                this._sRiskFilter = "ALL";

                // Approval status
                this._approvalStatus = "PENDING";

            },


            // =========================================================
            // TARIFF MONITOR - PRODUCT SEARCH
            // =========================================================

            onProductSearch: function (oEvent) {

                this._sProductFilter =
                    oEvent.getParameter("value") || "";

                this._applyTariffFilters();

            },


            // =========================================================
            // TARIFF MONITOR - RISK FILTER
            // =========================================================

            onRiskFilter: function (oEvent) {

                this._sRiskFilter =
                    oEvent.getSource().getSelectedKey();

                this._applyTariffFilters();

            },


            // =========================================================
            // APPLY PRODUCT + RISK FILTER TOGETHER
            // =========================================================

            _applyTariffFilters: function () {

                var oTable = this.byId("tariffTable");

                if (!oTable) {
                    return;
                }

                var oBinding = oTable.getBinding("items");

                if (!oBinding) {
                    return;
                }

                var aFilters = [];


                // -----------------------------------------------------
                // PRODUCT FILTER
                // -----------------------------------------------------

                if (
                    this._sProductFilter &&
                    this._sProductFilter.trim() !== ""
                ) {

                    aFilters.push(
                        new Filter(
                            "product",
                            FilterOperator.Contains,
                            this._sProductFilter.trim()
                        )
                    );

                }


                // -----------------------------------------------------
                // RISK FILTER
                // -----------------------------------------------------

                if (
                    this._sRiskFilter &&
                    this._sRiskFilter !== "ALL"
                ) {

                    aFilters.push(
                        new Filter(
                            "risk",
                            FilterOperator.EQ,
                            this._sRiskFilter
                        )
                    );

                }


                // -----------------------------------------------------
                // NO FILTER
                // -----------------------------------------------------

                if (aFilters.length === 0) {

                    oBinding.filter(
                        [],
                        FilterType.Application
                    );

                }


                // -----------------------------------------------------
                // PRODUCT + RISK FILTER
                // BOTH MUST MATCH
                // -----------------------------------------------------

                else {

                    var oCombinedFilter =
                        new Filter({
                            filters: aFilters,
                            and: true
                        });

                    oBinding.filter(
                        [oCombinedFilter],
                        FilterType.Application
                    );

                }


                // -----------------------------------------------------
                // USER MESSAGE
                // -----------------------------------------------------

                if (
                    this._sProductFilter &&
                    this._sRiskFilter !== "ALL"
                ) {

                    MessageToast.show(
                        "Product: " +
                        this._sProductFilter +
                        " | Risk: " +
                        this._sRiskFilter
                    );

                }

                else if (this._sProductFilter) {

                    MessageToast.show(
                        "Searching for: " +
                        this._sProductFilter
                    );

                }

                else if (
                    this._sRiskFilter !== "ALL"
                ) {

                    MessageToast.show(
                        "Showing " +
                        this._sRiskFilter +
                        " risk tariffs."
                    );

                }

            },


            // =========================================================
            // REFRESH TARIFF DATA
            // =========================================================

            onRefresh: function () {

                var oSearch =
                    this.byId("productSearch");

                if (oSearch) {
                    oSearch.setValue("");
                }


                var oRiskSelect =
                    this.byId("riskSelect");

                if (oRiskSelect) {
                    oRiskSelect.setSelectedKey("ALL");
                }


                this._sProductFilter = "";

                this._sRiskFilter = "ALL";


                var oTable =
                    this.byId("tariffTable");

                if (oTable) {

                    var oBinding =
                        oTable.getBinding("items");

                    if (oBinding) {

                        oBinding.filter(
                            [],
                            FilterType.Application
                        );

                    }

                }


                var oModel =
                    this.getView().getModel();

                if (oModel) {
                    oModel.refresh(true);
                }


                MessageToast.show(
                    "Tariff data refreshed successfully."
                );

            },


            // =========================================================
            // IMPACT ANALYSIS
            // =========================================================

            onAnalyzeImpact: function () {

                MessageToast.show(
                    "Impact Agent analyzing tariff exposure..."
                );


                setTimeout(function () {

                    MessageBox.information(

                        "Impact analysis completed.\n\n" +

                        "Affected suppliers: 3\n" +

                        "Affected purchase orders: 12\n" +

                        "Estimated cost impact: ₹24.6 Lakhs\n" +

                        "Supply risk: HIGH",

                        {
                            title: "AI Impact Analysis"
                        }

                    );

                }, 1000);

            },


            // =========================================================
            // SCENARIO SIMULATOR
            // =========================================================

            onRunScenario: function () {

                var oProduct =
                    this.byId("scenarioProduct");

                var oCurrentSource =
                    this.byId("currentSource");

                var oAlternativeSource =
                    this.byId("alternativeSource");

                var oQuantity =
                    this.byId("quantityInput");


                var sProduct =
                    oProduct
                        ? oProduct.getSelectedKey()
                        : "Laptop";


                var sCurrentSource =
                    oCurrentSource
                        ? oCurrentSource.getValue()
                        : "China";


                var sAlternativeSource =
                    oAlternativeSource
                        ? oAlternativeSource.getSelectedKey()
                        : "Vietnam";


                var sQuantity =
                    oQuantity
                        ? oQuantity.getValue()
                        : "10000";


                // -----------------------------------------------------
                // VALIDATE ALTERNATIVE SOURCE
                // -----------------------------------------------------

                if (!sAlternativeSource) {

                    MessageBox.warning(
                        "Please select an alternative source."
                    );

                    return;

                }


                // -----------------------------------------------------
                // VALIDATE QUANTITY
                // -----------------------------------------------------

                if (
                    !sQuantity ||
                    Number(sQuantity) <= 0
                ) {

                    MessageBox.warning(
                        "Please enter a valid quantity."
                    );

                    return;

                }


                // -----------------------------------------------------
                // START SIMULATION
                // -----------------------------------------------------

                MessageToast.show(
                    "Simulation Agent analyzing " +
                    sProduct +
                    "..."
                );


                var that = this;


                setTimeout(function () {

                    that._updateScenarioResults(
                        sProduct,
                        sCurrentSource,
                        sAlternativeSource,
                        sQuantity
                    );


                    MessageBox.success(

                        "Scenario analysis completed.\n\n" +

                        "AI Simulation Agent evaluated " +
                        "the sourcing alternative.",

                        {
                            title: "Scenario Analysis Complete"
                        }

                    );

                }, 1200);

            },


            // =========================================================
            // UPDATE SCENARIO RESULTS
            // =========================================================

            _updateScenarioResults: function (
                sProduct,
                sCurrentSource,
                sAlternativeSource,
                sQuantity
            ) {

                var oTable =
                    this.byId("scenarioTable");


                if (!oTable) {
                    return;
                }


                var aItems =
                    oTable.getItems();


                if (aItems.length < 4) {
                    return;
                }


                // -----------------------------------------------------
                // DEMO SCENARIO DATA
                // -----------------------------------------------------

                var mScenarioData = {

                    "Laptop": {

                        tariff: "18%",

                        alternativeTariff: "8%",

                        currentCost: "₹24.6L",

                        alternativeCost: "₹18.2L",

                        currentLeadTime: "18 days",

                        alternativeLeadTime: "22 days",

                        currentRisk: "HIGH",

                        alternativeRisk: "MEDIUM"

                    },


                    "Electric Motor": {

                        tariff: "15%",

                        alternativeTariff: "8%",

                        currentCost: "₹21.4L",

                        alternativeCost: "₹17.8L",

                        currentLeadTime: "20 days",

                        alternativeLeadTime: "23 days",

                        currentRisk: "HIGH",

                        alternativeRisk: "MEDIUM"

                    },


                    "Display Panel": {

                        tariff: "7%",

                        alternativeTariff: "5%",

                        currentCost: "₹14.2L",

                        alternativeCost: "₹13.4L",

                        currentLeadTime: "16 days",

                        alternativeLeadTime: "19 days",

                        currentRisk: "MEDIUM",

                        alternativeRisk: "LOW"

                    },


                    "Solar Module": {

                        tariff: "16%",

                        alternativeTariff: "8%",

                        currentCost: "₹19.8L",

                        alternativeCost: "₹15.9L",

                        currentLeadTime: "24 days",

                        alternativeLeadTime: "27 days",

                        currentRisk: "MEDIUM",

                        alternativeRisk: "LOW"

                    },


                    "Industrial Sensor": {

                        tariff: "6%",

                        alternativeTariff: "4%",

                        currentCost: "₹11.5L",

                        alternativeCost: "₹10.9L",

                        currentLeadTime: "14 days",

                        alternativeLeadTime: "17 days",

                        currentRisk: "LOW",

                        alternativeRisk: "LOW"

                    }

                };


                var oData =
                    mScenarioData[sProduct] ||
                    mScenarioData["Laptop"];


                // -----------------------------------------------------
                // ROW 1 - TARIFF
                // -----------------------------------------------------

                var aCells =
                    aItems[0].getCells();

                aCells[1].setText(
                    oData.tariff
                );

                aCells[2].setText(
                    oData.alternativeTariff
                );


                // -----------------------------------------------------
                // ROW 2 - LANDED COST
                // -----------------------------------------------------

                aCells =
                    aItems[1].getCells();

                aCells[1].setText(
                    oData.currentCost
                );

                aCells[2].setText(
                    oData.alternativeCost
                );


                // -----------------------------------------------------
                // ROW 3 - LEAD TIME
                // -----------------------------------------------------

                aCells =
                    aItems[2].getCells();

                aCells[1].setText(
                    oData.currentLeadTime
                );

                aCells[2].setText(
                    oData.alternativeLeadTime
                );


                // -----------------------------------------------------
                // ROW 4 - RISK
                // -----------------------------------------------------

                aCells =
                    aItems[3].getCells();

                aCells[1].setText(
                    oData.currentRisk
                );

                aCells[2].setText(
                    oData.alternativeRisk
                );


                // -----------------------------------------------------
                // COMPLETION MESSAGE
                // -----------------------------------------------------

                MessageToast.show(

                    "Scenario updated for " +
                    sProduct +
                    " | " +
                    sCurrentSource +
                    " → " +
                    sAlternativeSource +
                    " | Quantity: " +
                    sQuantity

                );

            },


            // =========================================================
            // APPROVE RECOMMENDATION
            // =========================================================

            onApprove: function () {

                this._approvalStatus = "APPROVED";


                MessageBox.success(

                    "Scenario approved successfully.\n\n" +

                    "Execution Agent has been triggered.",

                    {
                        title: "Recommendation Approved"
                    }

                );


                MessageToast.show(
                    "Execution Agent started."
                );

            },


            // =========================================================
            // REJECT RECOMMENDATION
            // =========================================================

            onReject: function () {

                this._approvalStatus = "REJECTED";


                MessageBox.warning(

                    "The AI recommendation has been rejected.\n\n" +

                    "No execution will be performed.",

                    {
                        title: "Recommendation Rejected"
                    }

                );


                MessageToast.show(
                    "Scenario rejected."
                );

            }

        }
    );
});