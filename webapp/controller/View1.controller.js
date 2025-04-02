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
		onSearch: function () {
            var that = this;
            this.getListData();
        },
        getListData: function() {
			// Validate input fields
			if (!this._validateInputFields()) {
				// Validation failed, return without fetching data
				return;
			}

			var that = this;
			var oModel = this.getOwnerComponent().getModel("ZN_VEND_PAY_RM_SUM_SRV_Model");
			var oGlobalData = this.getOwnerComponent().getModel("globalData").getData();
			//var oUrl = /ZFI_FCR_SRV/ZFI_FCRSet?$filter=Rldnr eq '0L' and Rbukrs eq '1100' and Ryear eq '2023' and PrctrGr eq 'FTRS' and MinPr eq '03' and MaxPr eq '10' and DET_FLAG eq 'X';

			// var oUrl = (oGlobalData.Dept !== "" && oGlobalData.listS === "") ? "/GLAC_GR_SUMSet" : "/DEPTSet";
			var oUrl = "/VEND_RM_SUMSet";

			/*var ledgrNo = new Filter('Rldnr', FilterOperator.EQ, oGlobalData.ledgrNo);*/
			var profitCen = new Filter('pa_prctr', FilterOperator.EQ, oGlobalData.proftCen);
			var cmpnyCode = new Filter('pa_bukrs', FilterOperator.EQ, oGlobalData.cmpnyCode);
			var fiscalYear = new Filter('pa_gjahr', FilterOperator.EQ, oGlobalData.fiscalYear);
			var fromDate = new Filter('pa_period_from', FilterOperator.EQ, oGlobalData.fromDate);
			var toDate = new Filter('pa_period_to', FilterOperator.EQ, oGlobalData.toDate);

			// Define filters
			var aFilters = [];

			var oFilterGroup = new Filter({
				filters: [profitCen, cmpnyCode, fiscalYear, fromDate, toDate],
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

					var oListDataModel = that.getOwnerComponent().getModel("listData");
					oListDataModel.setData(oData);

					// check in oData value is available or not 
					if (typeof oData !== 'undefined' && oData.length === 0) {

						// hide the busy indicator
						sap.ui.core.BusyIndicator.hide();
						sap.m.MessageBox.information('There are no data available!');
						// that._columnVisible();
					} else {
						// hide the busy indicator
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
        onSelectProfitCenter: function () {
            var oList = this.byId("idProfitCenterList");
            var aSelectedItems = oList.getSelectedItems();
            var aSelectedValues = [];
            var aSelectedID = [];

            // Extract selected Functional Locations
            aSelectedItems.forEach(function (oItem) {
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

            var oSearchField = this.byId("idProfitCenterSearchField");  // Remove Search Field
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

        onCloseDialog: function () {
            this.byId("idProfitCenterDialog").close();
        },
        onProfitCenterClear: function (oEvent) {
            var sValue = oEvent.getParameter("value"); // Get the input value
            var oList = this.byId("idProfitCenterList"); // Get the list
           var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");

            if (!sValue) {    // If input is empty, clear selection
                oList.removeSelections(true); // Deselect all items
                if(oGlobalDataModel)
                {
                oGlobalDataModel.setProperty("/selectedProfitCenter", "");
                oGlobalDataModel.setProperty("/selectedProfitCenterArray", "");
                }
            }
        },
        onSearchProfitCenter: function (oEvent) {
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
        onSelectAllChange: function (oEvent) {
            var bSelected = oEvent.getParameter("selected"); // CheckBox state
            var oList = this.byId("idProfitCenterList");
            if (!oList) {
                console.error("List not found!");
                return;
            }

            var aItems = oList.getItems(); // Get all list items

            // Select or Deselect all list items based on CheckBox state
            aItems.forEach(function (oItem) {
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


	});
});