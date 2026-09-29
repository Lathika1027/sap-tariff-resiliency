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

                this._sProductFilter = "";

                this._sRiskFilter = "ALL";

                this._approvalStatus = "PENDING";
                this.getView().setModel(new sap.ui.model.json.JSONModel({ tariffs: [] }));

                // Load tariff data from SAP CAP backend
                this._loadBackendTariffs();

            },


            // =========================================================
            // LOAD TARIFF DATA FROM SAP CAP BACKEND
            // =========================================================

_loadBackendTariffs: function () {
    var oModel = this.getView().getModel();

    Promise.all([
        fetch("/tariff/TariffRules").then(function (response) {
            return response.json();
        }),
        fetch("/tariff/Products").then(function (response) {
            return response.json();
        })
    ])
        .then(function (aResults) {
            var aTariffs = aResults[0].value || [];
            var aProducts = aResults[1].value || [];

            var aMappedTariffs = aTariffs.map(function (tariff) {
                var product = aProducts.find(function (item) {
                    return item.hsCode === tariff.hsCode;
                });

                var oldRate = Number(tariff.previousTariffRate || 0);
                var newRate = Number(tariff.tariffRate || 0);

                var risk = "LOW";

                if (oldRate > 0) {
                    var relativeIncrease =
                        ((newRate - oldRate) / oldRate) * 100;

                    if (relativeIncrease > 30) {
                        risk = "HIGH";
                    } else if (relativeIncrease >= 10) {
                        risk = "MEDIUM";
                    }
                }

                return {
                    product: product ? product.productName : tariff.hsCode,
                    hsCode: tariff.hsCode,
                    origin: tariff.originCountryCode,
                    destination: tariff.destinationCountryCode,
                    oldTariff: oldRate,
                    newTariff: newRate,
                    change: newRate - oldRate,
                    risk: risk
                };
            });

            oModel.setProperty("/tariffs", aMappedTariffs);

            var productsAtRisk = aMappedTariffs.filter(function (item) {
                return item.risk === "HIGH";
            }).length;

            oModel.setProperty("/kpis", {
                productsAtRisk: productsAtRisk
            });

            MessageToast.show(
                "CAP backend connected: " +
                aMappedTariffs.length +
                " tariff rules loaded."
            );
        })
        .catch(function (error) {
            console.error("Failed to load tariff data:", error);
            MessageToast.show("Could not load tariff data from CAP backend.");
        });
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

                var oBinding =
                    oTable.getBinding("items");

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


                // Reload CAP data
                this._loadBackendTariffs();


                MessageToast.show(
                    "Tariff data refreshed successfully."
                );

            },


            // =========================================================
            // IMPACT ANALYSIS
            // =========================================================

            onAnalyzeImpact: function () {

                var that = this;

                MessageToast.show(
                    "Impact Agent analyzing tariff exposure..."
                );

                fetch("/ai/analyze", {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        event_index: 0
                    })
                })

                .then(function (response) {

                    if (!response.ok) {
                        throw new Error(
                            "AI Engine returned HTTP " +
                            response.status
                        );
                    }

                    return response.json();

                })

                .then(function (result) {

                    that._aiResult = result;

                    if (
                        result.status !==
                        "DISRUPTION_DETECTED"
                    ) {

                        MessageBox.information(
                            "No supply-chain disruption was detected.",
                            {
                                title: "AI Impact Analysis"
                            }
                        );

                        return;
                    }


                    var sensing =
                        result.sensing || {};

                    var impact =
                        result.impact || {};

                    var planning =
                        result.planning || {};

                    var financial =
                        impact.financial_impact || {};

                    var inventory =
                        impact.inventory_impact || {};

                    var risk =
                        impact.risk || {};

                    var recommendation =
                        planning.overall_recommendation || {};


                    var message =
                        "Impact analysis completed.\n\n" +

                        "Product: " +
                        (
                            impact.product_name ||
                            sensing.product_id ||
                            "N/A"
                        ) +

                        "\n\n" +

                        "Tariff: " +
                        (sensing.old_tariff || 0) +
                        "% → " +
                        (sensing.new_tariff || 0) +
                        "%\n\n" +

                        "Tariff increase: " +
                        (sensing.tariff_change || 0) +
                        " percentage points\n\n" +

                        "New landed cost: " +
                        (
                            financial.new_landed_cost ||
                            "N/A"
                        ) +
                        " per unit\n\n" +

                        "Inventory coverage: " +
                        (
                            inventory.inventory_days ||
                            "N/A"
                        ) +
                        " days\n\n" +

                        "Production risk: " +
                        (
                            risk.production_risk ||
                            "N/A"
                        ) +

                        "\n\n" +

                        "Recommended supplier: " +
                        (
                            recommendation.supplier_name ||
                            "N/A"
                        ) +

                        "\n\n" +

                        "Supplier country: " +
                        (
                            recommendation.country ||
                            "N/A"
                        ) +

                        "\n\n" +

                        "Recommendation: " +
                        (
                            recommendation.action ||
                            "Evaluate alternative supplier"
                        ) +

                        "\n\n" +

                        "Human approval required: " +
                        (
                            recommendation.requires_human_approval
                                ? "YES"
                                : "NO"
                        );


                    MessageBox.information(
                        message,
                        {
                            title: "AI Impact Analysis"
                        }
                    );


                    MessageToast.show(
                        "Real AI Impact Analysis completed successfully."
                    );

                })

                .catch(function (error) {

                    console.error(
                        "AI Engine Error:",
                        error
                    );

                    MessageBox.error(
                        "Could not connect to the AI Agent Engine.\n\n" +
                        "Error: " +
                        error.message,
                        {
                            title: "AI Engine Connection Error"
                        }
                    );

                });

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

                this._approvalStatus =
                    "APPROVED";

                var oApprovalStatus = this.byId("approvalStatus");
                var oExecutionStatus = this.byId("executionStatus");
                var oRecommendationStatus = this.byId("recommendationStatus");

                if (oApprovalStatus) {
                    oApprovalStatus.setInfo("APPROVED");
                    oApprovalStatus.setInfoState("Success");
                }

                if (oExecutionStatus) {
                    oExecutionStatus.setInfo("TRIGGERED");
                    oExecutionStatus.setInfoState("Success");
                }

                if (oRecommendationStatus) {
                    oRecommendationStatus.setText("APPROVED");
                    oRecommendationStatus.setState("Success");
                    oRecommendationStatus.setIcon("sap-icon://accept");
                }


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

                this._approvalStatus =
                    "REJECTED";

                var oApprovalStatus = this.byId("approvalStatus");
                var oExecutionStatus = this.byId("executionStatus");
                var oRecommendationStatus = this.byId("recommendationStatus");

                if (oApprovalStatus) {
                    oApprovalStatus.setInfo("REJECTED");
                    oApprovalStatus.setInfoState("Error");
                }

                if (oExecutionStatus) {
                    oExecutionStatus.setInfo("NOT EXECUTED");
                    oExecutionStatus.setInfoState("Error");
                }

                if (oRecommendationStatus) {
                    oRecommendationStatus.setText("REJECTED");
                    oRecommendationStatus.setState("Error");
                    oRecommendationStatus.setIcon("sap-icon://decline");
                }


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