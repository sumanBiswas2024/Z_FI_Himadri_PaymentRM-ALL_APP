sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/model/json/JSONModel',
	"sap/m/MessageBox",
	"sap/ui/core/ValueState",
	"sap/ui/core/Fragment"
], function(Controller, Filter, FilterOperator, JSONModel, MessageBox, ValueState, Fragment) {
	"use strict";

	return Controller.extend("FI_PaymentRM_All_App.controller.View1", {

		onInit: function() {
			// this.getcompanyCodeParametersData();
			this.getProfitCenterData();
			var oGlobalModel = this.getOwnerComponent().getModel("globalData");
			var that = this;

			if (oGlobalModel) {
				oGlobalModel.setProperty("/isPaymentRMVisible", true);
				oGlobalModel.setProperty("/isPaymentRMDetailsVisible", false);
				oGlobalModel.setProperty("/isPaymentAllVisible", false);
				oGlobalModel.setProperty("/RM", "X");
				oGlobalModel.setProperty("/RMDetails", "");
				oGlobalModel.setProperty("/All", "");
			}

			if (!this._oTableFragment) {
				sap.ui.core.Fragment.load({
					id: this.createId("tableFragment1"), // Use createId to avoid conflicts
					name: "FI_PaymentRM_All_App.Fragment.PaymentRM",
					controller: this
				}).then(function(oFragment) {
					that._oTableFragment = oFragment;
					that.getView().addDependent(that._oTableFragment);
				}).catch(function(error) {
					console.error("Error loading fragment:", error);
				});
			}
			if (!this._oTableFragment2) {
				sap.ui.core.Fragment.load({
					id: this.createId("tableFragment2"), // Use createId to avoid conflicts
					name: "FI_PaymentRM_All_App.Fragment.PaymentRMDetails",
					controller: this
				}).then(function(oFragment) {
					that._oTableFragment2 = oFragment;
					that.getView().addDependent(that._oTableFragment2);
				}).catch(function(error) {
					console.error("Error loading fragment:", error);
				});
			}
			var oVizFrame = sap.ui.core.Fragment.byId(this.createId("tableFragment1"), "idVizFrame");

			if (oVizFrame) {
				oVizFrame.setVizProperties({
					title: {
						visible: true,
						text: "Payment RM Summary Chart"
					}
				});
			} else {
				console.error("VizFrame not found in fragment!");
			}
			var oVizFrame2 = sap.ui.core.Fragment.byId(this.createId("tableFragment2"), "idVizFrame2");

			if (oVizFrame2) {
				oVizFrame2.setVizProperties({
					title: {
						visible: true,
						text: "Payment RM Details Chart"
					},
					plotArea: {

					}

				});
			} else {
				console.error("VizFrame not found in fragment!");
			}

		},
		onAfterRendering: function() {
			var oFilterBar = this.byId("filterbar");
			if (oFilterBar) {
				var oToolbar = oFilterBar.getAggregation("_toolbar");
				if (oToolbar) {
					var aContent = oToolbar.getContent();
					var oAdaptButton = null;

					for (var i = 0; i < aContent.length; i++) {
						if (aContent[i].getText && aContent[i].getText() === "Adapt Filters") {
							oAdaptButton = aContent[i];
							break;
						}
					}

					if (oAdaptButton) {
						oAdaptButton.setVisible(false); // Hide the button
					}
				}
			}
		},
		getProfitCenterData: function() {
			var that = this;
			var oModel = this.getOwnerComponent().getModel("ZN_VEND_PAY_RM_SUM_SRV_Model");
			var pUrl = "/F4_PrctrSet";

			sap.ui.core.BusyIndicator.show();
			oModel.read(pUrl, {
				// urlParameters: {
				// 	"sap-client": "400"
				// },
				success: function(response) {
					var pData = response.results;
					console.log(pData);
					sap.ui.core.BusyIndicator.hide();
					// set the ledger data 
					var oprofitCenterDataModel = that.getOwnerComponent().getModel("profitCenterData");
					oprofitCenterDataModel.setData(pData);

				},
				error: function(error) {
					sap.ui.core.BusyIndicator.hide();
					console.log(error);
					var errorObject = JSON.parse(error.responseText);
					sap.m.MessageBox.error(errorObject.error.message.value);
				}
			});

		},
		onSearch: function() {
			var that = this;
			this.getListData();
		},
		onRadioSelect: function(oEvent) {
			var selectedIndex = oEvent.getParameter("selectedIndex"); // Get selected radio button index
			var oGlobalModel = this.getOwnerComponent().getModel("globalData");
			// oModel.setProperty("/selectedRadioIndex", selectedIndex);
			if (selectedIndex === 0) { // Fiscal Year Wise selected
				oGlobalModel.setProperty("/isPaymentRMVisible", true);
				oGlobalModel.setProperty("/isPaymentRMDetailsVisible", false);
				oGlobalModel.setProperty("/isPaymentAllVisible", false);
			} else if (selectedIndex === 1) { // Quarterly Wise selected
				// oGlobalModel.setProperty("/isPaymentRMDetailsVisible",true);
				oGlobalModel.setProperty("/isPaymentRMVisible", false);
				oGlobalModel.setProperty("/isPaymentRMDetailsVisible", false);
				oGlobalModel.setProperty("/isPaymentAllVisible", true);
				oGlobalModel.setProperty("/All", "X");
			}
		},
		onNavigatePress: function(oEvent) {
			var oButton = oEvent.getSource();

			// Get the row context (data of the row where the button is pressed)
			var oContext = oButton.getBindingContext("listData");

			if (!oContext) {
				console.error("No data found for selected row.");
				return;
			}

			// Get the row data as a JSON object
			var oRowData = oContext.getObject();

			var sProfitCenter = oRowData.PRCTR;

			var that = this;
			var oModel = this.getOwnerComponent().getModel("ZN_VEND_PAY_RM_SUM_SRV_Model");
			var oGlobalModel = this.getOwnerComponent().getModel("globalData");
			var oGlobalData = oGlobalModel.getData();
			var sUrl = "/VEND_RM_DETSet";

			var bProfitCenter = new Filter('pa_prctr', FilterOperator.EQ, sProfitCenter);
			var cmpnyCode = new Filter('pa_bukrs', FilterOperator.EQ, oGlobalData.cmpnyCode);
			var fiscalYear = new Filter('pa_gjahr', FilterOperator.EQ, oGlobalData.fiscalYear);
			var fromDate = new Filter('pa_period_from', FilterOperator.EQ, oGlobalData.fromDate);
			var toDate = new Filter('pa_period_to', FilterOperator.EQ, oGlobalData.toDate);

			if (oGlobalModel) {
				oGlobalModel.setProperty("/isPaymentRMVisible", false);
				oGlobalModel.setProperty("/isPaymentRMDetailsVisible", true);
				oGlobalModel.setProperty("/titleProfitCenter", sProfitCenter);
			}

			// Define filters
			var aFilters = [];

			var oFilterGroup = new Filter({
				filters: [bProfitCenter, cmpnyCode, fiscalYear, fromDate, toDate],
				and: true // AND condition
			});

			oModel.read(sUrl, {
				filters: [oFilterGroup],
				success: function(response) {
					var oData = response.results;
					var oListDataDetailsModel = that.getOwnerComponent().getModel("listDataDetails");
					oListDataDetailsModel.setData(oData);
					var oGlobalDataModel = that.getOwnerComponent().getModel("globalData");
					oGlobalDataModel.setProperty("/showProfitCenterTable", false);
					oGlobalDataModel.setProperty("/showDetailsTable", true);
					oGlobalModel.setProperty("/RM", "");
					oGlobalModel.setProperty("/RMDetails", "X");
				},
				error: function() {
					MessageToast.show("Error fetching details");
				}
			});
		},
		onBackPress: function() {
			var oGlobalModel = this.getOwnerComponent().getModel("globalData");

			// Hide the current fragment and show the previous one
			oGlobalModel.setProperty("/isPaymentRMVisible", true);
			oGlobalModel.setProperty("/isPaymentRMDetailsVisible", false);
			oGlobalModel.setProperty("/RM", "X");
			oGlobalModel.setProperty("/RMDetails", "");
		},
		getListData: function() {
			// Validate input fields
			if (!this._validateInputFields()) {
				// Validation failed, return without fetching data
				return;
			}
			// var oPage = this.getView().byId("pageId");
			// var bExpanded = oPage.getHeaderExpanded();
			// oPage.setHeaderExpanded(!bExpanded);

			var that = this;
			var oModel = this.getOwnerComponent().getModel("ZN_VEND_PAY_RM_SUM_SRV_Model");
			var oGlobalData = this.getOwnerComponent().getModel("globalData").getData();
			//var oUrl = /ZFI_FCR_SRV/ZFI_FCRSet?$filter=Rldnr eq '0L' and Rbukrs eq '1100' and Ryear eq '2023' and PrctrGr eq 'FTRS' and MinPr eq '03' and MaxPr eq '10' and DET_FLAG eq 'X';

			// var oUrl = (oGlobalData.All==="X") ? "/VEND_ALL_SUMSet" : "/VEND_RM_SUMSet";
			var oUrl = "/VEND_RM_SUMSet";

			var aProfitCenters = oGlobalData.selectedProfitCenterArray;

			var aFilters = []; // Array to store all filters

			// Create an array of Profit Center filters
			var aProfitCenterFilters = aProfitCenters.map(function(prctr) {
				return new Filter("pa_prctr", FilterOperator.EQ, prctr);
			});

			// Create the OR condition for multiple Profit Centers
			var profitCenFilter = new Filter({
				filters: aProfitCenterFilters,
				and: false // OR condition
			});

			/*var ledgrNo = new Filter('Rldnr', FilterOperator.EQ, oGlobalData.ledgrNo);*/
			// var profitCen = new Filter('pa_prctr', FilterOperator.EQ, oGlobalData.proftCen);
			var cmpnyCode = new Filter('pa_bukrs', FilterOperator.EQ, oGlobalData.cmpnyCode);
			var fiscalYear = new Filter('pa_gjahr', FilterOperator.EQ, oGlobalData.fiscalYear);
			var fromDate = new Filter('pa_period_from', FilterOperator.EQ, oGlobalData.fromDate);
			var toDate = new Filter('pa_period_to', FilterOperator.EQ, oGlobalData.toDate);

			// Define filters
			var aFilters = [];

			var oFilterGroup = new Filter({
				filters: [profitCenFilter, cmpnyCode, fiscalYear, fromDate, toDate],
				and: true // AND condition
			});

			sap.ui.core.BusyIndicator.show();

			oModel.read(oUrl, {
				// urlParameters: {
				// 	"sap-client": "400"
				// },
				filters: [oFilterGroup],
				success: function(response) {
					var oData = response.results;
					console.log(oData);

					// var oListDataModel = that.getOwnerComponent().getModel("listData");
					// oListDataModel.setData(oData);

					// check in oData value is available or not 
					if (typeof oData !== 'undefined' && oData.length === 0) {

						// hide the busy indicator
						var oGlobalModel = that.getOwnerComponent().getModel("globalData");

						if (oGlobalModel) {
							oGlobalModel.setProperty("/isPaymentRMVisible", false);
							oGlobalModel.setProperty("/isPaymentRMDetailsVisible", false);
							oGlobalModel.setProperty("/RM", "X");
							oGlobalModel.setProperty("/RMDetails", "");
						}
						sap.ui.core.BusyIndicator.hide();
						sap.m.MessageBox.information('There are no data available!');
						// that._columnVisible();
					} else {
						// hide the busy indicator
						var oListDataModel = that.getOwnerComponent().getModel("listData");
						oListDataModel.setData(oData);
						sap.ui.core.BusyIndicator.hide();
					}

				},
				error: function(error) {
					sap.ui.core.BusyIndicator.hide();
					console.log(error);
					var errorObject = JSON.parse(error.responseText);
					sap.m.MessageBox.error(errorObject.error.message.value);
				}
			});
			
			var oModel2 = this.getOwnerComponent().getModel("ZN_VEND_PAY_RM_SUM_SRV_Model");
			var oUrl2 = "/VEND_ALL_SUMSet";
			oModel2.read(oUrl2, {
				// urlParameters: {
				// 	"sap-client": "400"
				// },
				filters: [oFilterGroup],
				success: function(response) {
					var oData = response.results;
					console.log(oData);

					// var oListDataModel = that.getOwnerComponent().getModel("listData");
					// oListDataModel.setData(oData);

					// check in oData value is available or not 
					if (typeof oData !== 'undefined' && oData.length === 0) {

						// hide the busy indicator
						var oGlobalModel = that.getOwnerComponent().getModel("globalData");

						// if (oGlobalModel) {
						// 	oGlobalModel.setProperty("/isPaymentRMVisible", false);
						// 	oGlobalModel.setProperty("/isPaymentRMDetailsVisible", false);
						// 	oGlobalModel.setProperty("/RM", "X");
						// 	oGlobalModel.setProperty("/RMDetails", "");
						// }
						sap.ui.core.BusyIndicator.hide();
						sap.m.MessageBox.information('There are no data available!');
						// that._columnVisible();
					} else {
						// hide the busy indicator
						var oAllListDataModel = that.getOwnerComponent().getModel("allListData");
						oAllListDataModel.setData(oData);
						sap.ui.core.BusyIndicator.hide();
					}

				},
				error: function(error) {
					sap.ui.core.BusyIndicator.hide();
					console.log(error);
					var errorObject = JSON.parse(error.responseText);
					sap.m.MessageBox.error(errorObject.error.message.value);
				}
			});

		},
		onProfitCenterDialog: function(oEvent) {

			var oView = this.getView();
			if (!oView.byId("idProfitCenterDialog")) {
				Fragment.load({
					id: oView.getId(),
					name: "FI_PaymentRM_All_App.Fragment.ProfitCenter",
					controller: this
				}).then(function(oDialog) {
					oView.addDependent(oDialog)
					oDialog.open();
				})
			} else {
				oView.byId("idProfitCenterDialog").open();
			}
		},
		handleValueDialogFromPeriod: function(oEvent) {
			this._fromYearInputId = oEvent.getSource().getId();
			var oView = this.getView();
			if (!oView.byId("fromDialog")) {
				Fragment.load({
					id: oView.getId(),
					name: "FI_PaymentRM_All_App.Fragment.FromPeriod",
					controller: this
				}).then(function(oDialog) {
					oView.addDependent(oDialog)
					oDialog.open();
				})
			} else {
				oView.byId("fromDialog").open();
			}
		},
		handleValueDialogToPeriod: function(oEvent) {
			this._toYearInputId = oEvent.getSource().getId();
			var oView = this.getView();
			if (!oView.byId("toDialog")) {
				Fragment.load({
					id: oView.getId(),
					name: "FI_PaymentRM_All_App.Fragment.ToPeriod",
					controller: this
				}).then(function(oDialog) {
					oView.addDependent(oDialog)
					oDialog.open();
				})
			} else {
				oView.byId("toDialog").open();
			}
		},
		onSelectProfitCenter: function() {
			var oList = this.byId("idProfitCenterList");
			var aSelectedItems = oList.getSelectedItems();
			var aSelectedValues = [];
			var aSelectedID = [];

			// Extract selected Functional Locations
			aSelectedItems.forEach(function(oItem) {
				aSelectedValues.push(oItem.getTitle()); // FunctionalLocation Name
				// aSelectedID.push(oItem.getDescription()); // FunctionalLocation ID
			});

			// Show selected values in Input field
			var sValue = aSelectedValues.join(", ");
			this.byId("inputProfitCenter").setValue(sValue);

			var sProfitCenterValues = this.byId("inputProfitCenter").getValue();

			var aProfitCenterArray = sProfitCenterValues.split(", ");

			var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
			if (oGlobalDataModel) {
				oGlobalDataModel.setProperty("/selectedProfitCenter", aSelectedID);
				oGlobalDataModel.setProperty("/selectedProfitCenterArray", aProfitCenterArray);
			}

			var oSearchField = this.byId("idProfitCenterSearchField"); // Remove Search Field
			oSearchField.setValue("");
			var oBinding = oList.getBinding("items");
			if (oBinding) {
				oBinding.filter([]); // Remove filters
			}

			oList.removeSelections(true); // Removes all List selections

			var oSelectAllCheckBox = this.byId("selectAllCheckBox");
			if (oSelectAllCheckBox) {
				oSelectAllCheckBox.setSelected(false);
			}

			// Close the dialog
			this.byId("idProfitCenterDialog").close();
		},

		onCloseDialog: function() {
			this.byId("idProfitCenterDialog").close();
		},
		onProfitCenterClear: function(oEvent) {
			var sValue = oEvent.getParameter("value"); // Get the input value
			var oList = this.byId("idProfitCenterList"); // Get the list
			var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");

			if (!sValue) { // If input is empty, clear selection
				oList.removeSelections(true); // Deselect all items
				if (oGlobalDataModel) {
					oGlobalDataModel.setProperty("/selectedProfitCenter", "");
					oGlobalDataModel.setProperty("/selectedProfitCenterArray", "");
				}
			}
		},
		onSearchProfitCenter: function(oEvent) {
			var sQuery = oEvent.getParameter("newValue"); // Get search input
			var oList = this.byId("idProfitCenterList");
			if (!oList) {
				console.error("List not found!");
				return;
			}

			var oBinding = oList.getBinding("items"); // Get binding of the List
			if (!oBinding) {
				console.error("List binding not found!");
				return;
			}

			var aFilters = [];
			if (sQuery && sQuery.length > 0) {
				var oFilter1 = new sap.ui.model.Filter("prctr", sap.ui.model.FilterOperator.Contains, sQuery);
				// var oFilter2 = new sap.ui.model.Filter("FunctionalLocation", sap.ui.model.FilterOperator.Contains, sQuery);
				aFilters.push(new sap.ui.model.Filter({
					filters: [oFilter1],
					and: false // Match either FunctionalLocationName or FunctionalLocation
				}));
			}

			// Apply the filters to the list binding
			oBinding.filter(aFilters);
		},
		onSelectAllChange: function(oEvent) {
			var bSelected = oEvent.getParameter("selected"); // CheckBox state
			var oList = this.byId("idProfitCenterList");
			if (!oList) {
				console.error("List not found!");
				return;
			}

			var aItems = oList.getItems(); // Get all list items

			// Select or Deselect all list items based on CheckBox state
			aItems.forEach(function(oItem) {
				oItem.setSelected(bSelected);
			});;
		},
		_handleValueFromPeriodSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");

			// Create filters for both ID and Month fields
			var oFilterId = new sap.ui.model.Filter("id", sap.ui.model.FilterOperator.Contains, sValue);
			var oFilterMonth = new sap.ui.model.Filter("month", sap.ui.model.FilterOperator.Contains, sValue);

			// Combine filters with OR condition
			var oCombinedFilter = new sap.ui.model.Filter({
				filters: [oFilterId, oFilterMonth],
				and: false // 'false' means OR condition
			});

			// Apply filter to the binding
			oEvent.getSource().getBinding("items").filter([oCombinedFilter]);
		},
		_handleValueToPeriodSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");

			// Create filters for both ID and Month fields
			var oFilterId = new sap.ui.model.Filter("id", sap.ui.model.FilterOperator.Contains, sValue);
			var oFilterMonth = new sap.ui.model.Filter("month", sap.ui.model.FilterOperator.Contains, sValue);

			// Combine filters with OR condition
			var oCombinedFilter = new sap.ui.model.Filter({
				filters: [oFilterId, oFilterMonth],
				and: false // 'false' means OR condition
			});

			// Apply filter to the binding
			oEvent.getSource().getBinding("items").filter([oCombinedFilter]);
		},
		_handleValueDialogFromPeriodClose: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var ledgerInput = this.byId(this._fromYearInputId);
				var newValue = oSelectedItem.getTitle();
				ledgerInput.setValue(newValue);

				//chk the blank input box validation
				var inputFromPeriod = this.byId("inputFromPeriod");
				if (newValue && newValue.trim()) {
					inputFromPeriod.setValueState(sap.ui.core.ValueState.None);
				} else {
					inputFromPeriod.setValueState(sap.ui.core.ValueState.Error);
				}

				var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
				if (oGlobalDataModel) {
					oGlobalDataModel.setProperty("/fromP", newValue);
				}
			}
			oEvent.getSource().getBinding("items").filter([]);
		},
		_handleValueDialogToPeriodClose: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var ledgerInput = this.byId(this._toYearInputId);
				var newValue = oSelectedItem.getTitle();
				ledgerInput.setValue(newValue);

				//chk the blank input box validation
				var inputToPeriod = this.byId("inputToPeriod");
				if (newValue && newValue.trim()) {
					inputToPeriod.setValueState(sap.ui.core.ValueState.None);
				} else {
					inputToPeriod.setValueState(sap.ui.core.ValueState.Error);
				}

				var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
				if (oGlobalDataModel) {
					oGlobalDataModel.setProperty("/toP", newValue);
				}
			}
			oEvent.getSource().getBinding("items").filter([]);
		},
		_validateInputFields: function() {
			/*var inputLedger = this.byId("inputLedger");*/
			var inputProfitCenter = this.byId("inputProfitCenter");
			var inputCompanyCode = this.byId("inputCompanyCode");
			var yearPicker = this.byId("yearPicker");
			var inputFromPeriod = this.byId("inputFromPeriod");
			var inputToPeriod = this.byId("inputToPeriod");
			// var inputGL = this.byId("inputGL");

			var isValid = true;
			var message = '';

			if (!inputProfitCenter.getValue()) {
				inputProfitCenter.setValueState(sap.ui.core.ValueState.Error);
				isValid = false;
				message += 'Profit Center, ';
			} else {
				inputProfitCenter.setValueState(sap.ui.core.ValueState.None);
			}
			if (!inputCompanyCode.getValue()) {
				inputCompanyCode.setValueState(sap.ui.core.ValueState.Error);
				isValid = false;
				message += 'Company Code, ';
			} else {
				inputCompanyCode.setValueState(sap.ui.core.ValueState.None);
			}
			if (!yearPicker.getValue()) {
				yearPicker.setValueState(sap.ui.core.ValueState.Error);
				isValid = false;
				message += 'Fiscal Year, ';
			} else {
				yearPicker.setValueState(sap.ui.core.ValueState.None);
			}
			if (!inputFromPeriod.getValue()) {
				inputFromPeriod.setValueState(sap.ui.core.ValueState.Error);
				isValid = false;
				message += 'From Period, ';
			} else {
				inputFromPeriod.setValueState(sap.ui.core.ValueState.None);
			}
			if (!inputToPeriod.getValue()) {
				inputToPeriod.setValueState(sap.ui.core.ValueState.Error);
				isValid = false;
				message += 'To Period, ';
			} else {
				inputToPeriod.setValueState(sap.ui.core.ValueState.None);
			}

			if (!isValid) {
				// Remove the last comma and space from the message
				message = message.slice(0, -2);
				sap.m.MessageBox.error("Please fill up the following fields: " + message);
				return false;
			}

			// Set global data properties
			var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
			if (oGlobalDataModel) {
				/*oGlobalDataModel.setProperty("/ledgrNo", inputLedger.getValue());*/
				oGlobalDataModel.setProperty("/cmpnyCode", inputCompanyCode.getValue());
				/*oGlobalDataModel.setProperty("/fiscalY", inputFiscalYear.getValue());*/
				oGlobalDataModel.setProperty("/fromDate", inputFromPeriod.getValue());
				oGlobalDataModel.setProperty("/toDate", inputToPeriod.getValue());
				oGlobalDataModel.setProperty("/proftCen", inputProfitCenter.getValue());
				oGlobalDataModel.setProperty("/fiscalYear", yearPicker.getValue());

			}

			return true;
		},
		onSelectChartType: function(oEvent) {
			var selectedIndex = oEvent.getParameter("selectedIndex"); // Get selected index
			var selectedKey;

			switch (selectedIndex) {
				case 0:
					selectedKey = "column"; // Column Chart
					break;
				case 1:
					selectedKey = "pie"; // Pie Chart
					break;
					// case 2:
					//     selectedKey = "line"; // Line Chart
					//     break;
					// case 3:
					//     selectedKey = "donut"; // Donut Chart
					//     break;
				default:
					selectedKey = "column";
			}
			var oGlobalModelData = this.getOwnerComponent().getModel("globalData").getData();
			// if (oGlobalModel) {
			// 	oGlobalModel.setProperty("/isPaymentRMVisible", false);
			// 	oGlobalModel.setProperty("/isPaymentRMDetailsVisible", false);
			// 	oGlobalModel.setProperty("/RM", "X");
			// 	oGlobalModel.setProperty("/RMDetails", "");
			// }
			if (oGlobalModelData.RM === "X") {

				var oVizFrame = sap.ui.core.Fragment.byId(this.createId("tableFragment1"), "idVizFrame");

				if (oVizFrame) {
					oVizFrame.setVizType(selectedKey);
					oVizFrame.setVizProperties({
						title: {
							visible: true,
							text: "Payment RM Summary Chart"
						},
						plotArea: {

						}

					});

				} else {
					console.error("VizFrame not found in fragment!");
				}
			} else if (oGlobalModelData.RMDetails === "X") {
				var oVizFrame2 = sap.ui.core.Fragment.byId(this.createId("tableFragment2"), "idVizFrame2");

				if (oVizFrame2) {
					oVizFrame2.setVizType(selectedKey);
					oVizFrame2.setVizProperties({
						title: {
							visible: true,
							text: "Payment RM Details Chart"
						},
						plotArea: {

						}

					});
				} else {
					console.error("VizFrame not found in fragment!");
				}
			}
		},
		onRadioButtonSelectList: function(oEvent) {
			var selectedIndex = oEvent.getParameter("selectedIndex"); // Get selected index
			var selectedKey;

			switch (selectedIndex) {
				case 0:
					selectedKey = "column"; // Column Chart
					break;
				case 1:
					selectedKey = "pie"; // Pie Chart
					break;
					// case 2:
					//     selectedKey = "line"; // Line Chart
					//     break;
					// case 3:
					//     selectedKey = "donut"; // Donut Chart
					//     break;
				default:
					selectedKey = "column";
			}
		}

	});
});