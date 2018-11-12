import firebase from 'firebase'
import moment from 'moment'
import func from '../../../custom_libs/func'

import exportPopup from '../../partials/components/modals/Export_popup.vue'
import jsPDF from 'jspdf'
require("jspdf-autotable");

import XLSX from 'xlsx'
import Datepicker from 'vuejs-datepicker';
import SimpleVueValidation from 'simple-vue-validator'
const Validator = SimpleVueValidation.Validator;
 
let LiverootUID = 'DerqRbXa2iZYe8Lw3bTrxI4jtv92';
let LiveadminUID = 'EqSMcc6A2yfgKAjiVnLMaGD82P93';
//import driverLogsSection from '../../partials/components/sections/driver_logs/index.vue'

export default {
    components: {
        'date_picker': Datepicker,
        export_popup: exportPopup,
    },
    created: function () {
        let self = this;

        firebase.auth().onAuthStateChanged((user) => {
            switch (user.uid) { 
 
                case LiverootUID:{self.isRoot = true; break}
                case LiveadminUID:{self.isRoot = false; break}    
            } 
        })
        self.$watch('debitTxt', function (val, oldVal) {
            self.debitTxt = self.$root.isNumber(val, oldVal);
        });
        self.$watch('creditTxt', function (val, oldVal) {
            self.creditTxt = self.$root.isNumber(val, oldVal);
        });
        self.$watch('narrationTxt', function (val, oldVal) {
            self.narrationTxt = self.$root.trim(val, oldVal);
        });

        const db = firebase.database();
        self.walletRef = db.ref('/wallet');
        self.driverComInvoiceRef = db.ref('/driver_commission_invoices');
        self.userReqInvoiceRef = db.ref('/user_request_invoices');
        self.completeReqRef = db.ref('/complete_requests');
        self.activeReqRef = db.ref('/user_active_requests');
        self.userReqRef = db.ref('/user_requests');
        self.driverBidsRef = db.ref('/driver_bids');
        self.userRef = db.ref('/users');
        self.addaListRef = db.ref('/adda_list');

        self.userRef.child(self.$route.params.id).on('value', function (snap) {
            self.dataLoad = false;
            let renderData = snap.val();
            if (renderData !== null) {
                renderData['key'] = snap.key;
                self.userData = renderData;
            } else {
                self.$router.push('/admin');
            }
        });
        self.driverBidsRef.on('value', function (driverBidsSnap) {
            let DataBids = [];
            driverBidsSnap.forEach(function (childSnapshot) {
                var item = childSnapshot
                item.forEach(key => {
                    if (key.key == self.$route.params.id) {
                        let data = key.val()
                        data.reqId = childSnapshot.key
                        data.driverId = key.key
                        DataBids.push(data)
                    }
                })
            })
            self.totalBids = DataBids.length
            self.filterBids = self.totalBids
            self.userReqRef.on('value', function (userReqSnap) {
                self.totalRequests = 0;
                userReqSnap.forEach(element => {
                    self.totalRequests += Object.values(element.val()).length;
                });
                userReqSnap.forEach(function (childSnapshot) {
                    var item = childSnapshot
                    DataBids.forEach(bid => {
                        item.forEach(req => {
                            if (req.key == bid.reqId) {
                                bid.clientid = childSnapshot.key
                            }
                        })
                    })
                })
            })
            let UsersData = []
            self.userRef.on('value', function (userSnap) {
                userSnap.forEach(function (childSnapshot) {
                    var item = childSnapshot.val()
                    item.userId = childSnapshot.key
                    UsersData.push(item)
                });
                DataBids.forEach(bid => {

                    UsersData.forEach(user => {
                        if (user.userId == bid.clientid) {
                            bid.clientData = user
                        }
                    })
                })
                self.bidsData = DataBids
            })
        })
    },
    data() {

        const db = firebase.database();
        return {
            isRoot:false,
            loading: true,
            sessionCol: db.ref("sessions"),
            todayLogs: [],
            weekLogs: [],
            dayLogs: [], //////Added by Awais
            allLogs: [],
            dataa: [],
            dataCount: 0,
            totalTimes: 0,
            todayLogsTSTime: moment.duration(),
            weekLogsTSTime: moment.duration(),
            dayLogsTSTime: moment.duration(), ////////////Added by Awais
            allLogsTSTime: moment.duration(),


            //currentlyShowing: 0,
            dataToShow: [],
            isNextAvaliable: false,
            isPrevAvaliable: false,
            counter: 1,
            totalPages: 0,
            // Bids Count
            totalBids: 0,
            filterBids: 0,
            // Total Request Count
            totalRequests: 0,
            // Search By Date Controller For FIltering
            searched: false,
            //currentlyShowingDAYS: 0,
            dataToShowDAYS: [],
            isNextAvaliableDAYS: false,
            isPrevAvaliableDAYS: false,
            counterDAYS: 1,
            totalPagesDAYS: 0,
            //////////////////////////////////////////////////////////////////////////
            ToDate: '',
            FromDate: '',
            dataLoad: true,
            dataLoad1: true,
            dataLoad2: true,
            dataLoad3: true,
            dataLoad4: true,
            dataLoad5: true,
            // loaded in variables
            userData: {},
            bidsData: {},
            completeReqData: {},
            pendingReqData: {},
            invoiceReqData: {},
            invoiceComData: {},
            walletData: {},

            Backup_bidsData: {},
            Backup_allLogs: [],
            Backup_completeReqData: {},
            Backup_pendingReqData: {},
            Backup_invoiceReqData: {},
            Backup_invoiceComData: {},

            Backup_walletData: {},
            IsBackup: false,

            invoiceComDataTotal: 0,
            invoiceReqDataTotal: 0,
            completeReqDataTotal: 0,
            pendingReqDataTotal: 0,
            // image load var
            profileImgLoad: true,
            cnicImgLoad: true,
            licenceImgLoad: true,
            letterImgLoad: true,
            profileImgURL: "",
            cnicImgURL: "",
            licenceImgURL: "",
            letterImgURL: "",
            // wallet var
            totDebit: 0,
            totCredit: 0,
            // database reference
            userRef: null,
            addaListRef: null, /////Added By Awais
            completeReqRef: null,
            activeReqRef: null,
            userReqRef: null,
            userReqInvoiceRef: null,
            driverComInvoiceRef: null,
            driverBidsRef: null,
            walletRef: null,
            // adda  fields
            AddaLoaded: true,
            // add voucher fields
            debitTxt: 0,
            creditTxt: 0,
            narrationTxt: "",
            mainErr: "",
            mainMsg: "",
            // search table
            search_table1: '',
            search_table2: '',
            search_table3: '',
            search_table4: '',
            search_table5: '',
            ckAll: false,
            ck0: false,
            ck1: false,
            ck2: false,
            ck3: false,
            ck4: false,
            ck5: false,
            ck6: false,
            ck7: false,
            ck8: false,
            ck9: false,
        }

    },
    validators: {
        narrationTxt: function (value) {
            return Validator.value(value).required().minLength(6).maxLength(100);
        }
    },

    mounted() {
        const self = this;
        if (self.$route.params.id) {
            self.sessionCol.orderByChild("userID").equalTo(self.$route.params.id).on('value', function (snap) {
                self.allLogs = [];
                self.allLogsTSTime = moment.duration();
                if (snap.val() !== null) {
                    snap.forEach(function (item) {
                        let data_set = {};
                        data_set.loginTimeM = moment(item.val().loginTime);
                        data_set.logOutTimeM = moment(item.val().logoutTime);
                        data_set.loginTime = moment(item.val().loginTime).format("DD/MMM/YYYY, hh:mm:ss a");
                        data_set.logoutTime = "";
                        data_set.duration = moment.duration();

                        if (item.val().hasOwnProperty("logoutTime")) {
                            data_set.logoutTime = moment(item.val().logoutTime).format("DD/MMM/YYYY, hh:mm:ss a");
                            data_set.duration.add(moment.duration(moment(item.val().logoutTime).diff(moment(item.val().loginTime))));
                        }
                        self.allLogsTSTime.add(data_set.duration);
                        self.allLogs.push(data_set);
                    });
                    self.dataToShow = self.allLogs;
                    self.isPrevAvaliable = false;

                }
                self.loading = false;
            });
        }
    },
    destroyed() {
        this.sessionCol.off();
    },
    watch: {
        allLogs: function (val) {
            this.filterLogs(this, val, this.ToDate, this.FromDate);
        },
        search_table1: function (val) {
            func.tableSearch(this.$refs.table1, val);
        },
        search_table2: function (val) {
            func.tableSearch(this.$refs.table2, val);
        },
        search_table3: function (val) {
            func.tableSearch(this.$refs.table3, val);
        },
        search_table4: function (val) {
            func.tableSearch(this.$refs.table4, val);
        },
        search_table5: function (val) {
            func.tableSearch(this.$refs.table5, val);
        },
        userData: function (val) {
            let self = this;
            if (val.type === 'driver') {
                self.complete_req_driver(self, val.key, val);
                self.pending_req_driver(self, val.key, val);
                self.user_req_invoices(self, val.key, val);
                self.driver_com_invoices(self, val.key);
                self.driver_wallet(self, val.key);
                self.getImgs(self, val.key);
                self.getAddaName(self, val.adda_ref);
            }
        }
    },
    methods: {
        checkSelectedList() {
            if (
                this.ck0 == true ||
                this.ck1 == true ||
                this.ck2 == true ||
                this.ck3 == true ||
                this.ck4 == true ||
                this.ck5 == true ||
                this.ck6 == true ||
                this.ck7 == true ||
                this.ck8 == true ||
                this.ck9 == true
            ) {
                return false;
            }
            return true;

        },
        ExportDataXLSX: function () {

            let self = this;
            if (self.checkSelectedList()) {
                alert("Please Select any One Condition");
                return;
            }
            let rowspendingReqData = {};
            Object.values(self.pendingReqData).forEach((data, index) => {
                rowspendingReqData.push({
                    "#": index + 1,
                    "Driver Name": data.driver_data.first_name + ' ' + data.driver_data.last_name,
                    "Client Name": data.client_data.first_name + ' ' + data.client_data.last_name,
                    "Origin": data.request_data.orgText,
                    "Destination": data.request_data.desText,
                    "Distance": data.request_data.disText,
                    "Duration": data.request_data.durText,
                    "Created At": data.request_data.createdAt,
                    "Vehicle Type": data.driver_data.vehicle,
                    "Amount": data.bid_data.amount,
                    "Status": data.active_req_data.status,
                })
            })



            let rowswalletData = [];
            let BDebit = 0;
            let BCredit = 0;
            let BBalance = 0;
            Object.values(self.walletData).forEach((data, index) => {
                rowswalletData.push({
                    "#": index + 1,
                    "Added Date": data.addedAt,
                    "Narration": data.narration,
                    "Debit": parseFloat(data.debit).toFixed(2),
                    "Credit": parseFloat(data.credit).toFixed(2),
                    "Balance": parseFloat(data.balance).toFixed(2),
                })
                BBalance = data.balance;
                BDebit += data.debit;
                BCredit += data.credit;
            })
            if (rowswalletData.length != 0) {
                BDebit = parseFloat(BDebit).toFixed(2);
                BCredit = parseFloat(BCredit).toFixed(2);
                rowswalletData.push({
                    "#": "",
                    "Added Date": "",
                    "Narration": "Balance",
                    "Debit": "",
                    "Credit": "",
                    "Balance": BBalance,
                })
                rowswalletData.push({
                    "#": "",
                    "Added Date": "",
                    "Narration": "Total",
                    "Debit": BDebit,
                    "Credit": BCredit,
                    "Balance": "",
                })
            }



            let rowsinvoiceComData = [];
            let TotalCommission = 0;
            Object.values(self.invoiceComData).forEach((data, index) => {
                rowsinvoiceComData.push({
                    "#": index + 1,
                    "Date": data.createdAt,
                    "Commission Invoice": data.invoice_no,
                    "Order Invoice#": data.order_invoice,
                    "Apply Commission(%)": data.apply_commission,
                    "Commission Amount": data.commission_amount,
                })
                TotalCommission += data.commission_amount;
            })
            if (rowsinvoiceComData.length != 0) {
                rowsinvoiceComData.push({
                    "#": "",
                    "Date": "",
                    "Commission Invoice": "",
                    "Order Invoice#": "",
                    "Apply Commission(%)": "Total",
                    "Commission Amount": TotalCommission,
                })
            }



            let rowsinvoiceReqData = [];
            let EarnAmount = 0;
            Object.values(self.invoiceReqData).forEach((data, index) => {
                rowsinvoiceReqData.push({
                    "#": index + 1,
                    "Date": data.createdAt,
                    "Details": data.req_data.orgText + " To " + data.req_data.desText + " | User :" + data.client_data.first_name + " " + data.client_data.last_name + " | Driver : " + data.driver_data.first_name + " " + data.driver_data.last_name,
                    "Invoice": data.invoice_no,
                    "Earn": data.amount,
                })
                EarnAmount += data.amount;
            });
            if (rowsinvoiceReqData.length != 0) {
                rowsinvoiceReqData.push({
                    "#": "",
                    "Date": "",
                    "Details": "",
                    "Invoice": "Total",
                    "Earn": EarnAmount,
                })
            }



            let rowsbidsData = [];
            self.bidsData.forEach((data, index) => {
                rowsbidsData.push({
                    "#": index + 1,
                    "Bid Time": self.formatDate(data.first_bid_time),
                    "Bid Price": data.amount,
                    "Client Name": data.clientData.first_name + " " + data.clientData.last_name,
                })
            })



            let rowsReqCompleted = [];
            let Total_Amount = 0;
            Object.values(self.completeReqData).forEach((data, index) => {

                rowsReqCompleted.push({
                    "#": index + 1,
                    "Driver Name": data.driver_data.first_name + ' ' + data.driver_data.last_name,
                    "Client Name": data.client_data.first_name + ' ' + data.client_data.last_name,
                    "Origin": data.request_data.orgText,
                    "Destination": data.request_data.desText,
                    "Distance": data.request_data.disText,
                    "Duration": data.request_data.durText,
                    "Created At": data.request_data.createdAt,
                    "Vehicle Type": data.driver_data.vehicle,
                    "Amount": data.bid_data.amount,
                });
                Total_Amount += parseInt(data.bid_data.amount);
            });
            if (rowsReqCompleted.length != 0) {
                rowsReqCompleted.push({
                    "#": "",
                    "Driver Name": "",
                    "Client Name": "",
                    "Origin": "",
                    "Destination": "",
                    "Distance": "",
                    "Duration": "",
                    "Created At": "",
                    "Vehicle Type": "Total",
                    "Amount": Total_Amount,
                });
            }



            let rowsLogDays = [];
            self.dataa.forEach((data, index) => {
                rowsLogDays.push({
                    '#': index + 1,
                    'Date': data.days,
                    'Duration': data.durations
                });
            });
            if (rowsLogDays.length != 0) {
                rowsLogDays.push({
                    '#': "",
                    'Date': "Total",
                    'Duration': self.totalTimes,
                });
            }



            var rows = [];
            self.dataToShow.forEach((dataP, index) => {
                rows.push({
                    '#': index + 1,
                    'Login Date/Time': dataP.loginTime,
                    'Logout Date/Time': dataP.logoutTime,
                    'Duration': self.timeFormat(dataP.duration)
                });
            });
            if (rows.length != 0) {
                rows.push({
                    '#': '',
                    'Login Date/Time': '',
                    'Logout Date/Time': "Total Time",
                    'Duration': self.timeFormat(self.allLogsTSTime)
                });
            }



            var rowsToday = [];
            self.todayLogs.forEach((dataP, index) => {
                rowsToday.push({
                    '#': index + 1,
                    'Login Date/Time': dataP.loginTime,
                    'Logout Date/Time': dataP.logoutTime,
                    'Duration': self.timeFormat(dataP.duration)
                });
            });
            if (rowsToday.length != 0) {
                rowsToday.push({
                    '#': "",
                    'Login Date/Time': "",
                    'Logout Date/Time': "Total Time",
                    'Duration': self.timeFormat(self.todayLogsTSTime)
                });
            }



            var rowsWeek = [];
            self.weekLogs.forEach((dataP, index) => {
                rowsWeek.push({
                    '#': index + 1,
                    'Login Date/Time': dataP.loginTime,
                    'Logout Date/Time': dataP.logoutTime,
                    'Duration': self.timeFormat(dataP.duration)
                });
            });
            if (rowsWeek.length != 0) {
                rowsWeek.push({
                    '#': "",
                    'Login Date/Time': "",
                    'Logout Date/Time': "Total Time",
                    'Duration': self.timeFormat(self.weekLogsTSTime)
                });
            }


            try {
                var ws_drivers = XLSX.utils.json_to_sheet(rowspendingReqData);
            } catch (e) {}
            try {
                var ws_drivers_wallet = XLSX.utils.json_to_sheet(rowswalletData);
            } catch (e) {}
            try {
                var ws_drivers_commission = XLSX.utils.json_to_sheet(rowsinvoiceComData);
            } catch (e) {}
            try {
                var ws_drivers_invoice = XLSX.utils.json_to_sheet(rowsinvoiceReqData);
            } catch (e) {}
            try {
                var ws_drivers_bids = XLSX.utils.json_to_sheet(rowsbidsData);
            } catch (e) {}
            try {
                var ws_drivers_ReqCompleted = XLSX.utils.json_to_sheet(rowsReqCompleted);
            } catch (e) {}
            try {
                var ws_drivers_LogDays = XLSX.utils.json_to_sheet(rowsLogDays);
            } catch (e) {}
            try {
                var ws_drivers_Logs = XLSX.utils.json_to_sheet(rows);
            } catch (e) {}
            try {
                var ws_drivers_TodayLogs = XLSX.utils.json_to_sheet(rowsToday);
            } catch (e) {}
            try {
                var ws_drivers_WeekLogs = XLSX.utils.json_to_sheet(rowsWeek);
            } catch (e) {}


            var wb = XLSX.utils.book_new();

            try {
                if (self.ck0) {
                    XLSX.utils.book_append_sheet(wb, ws_drivers_TodayLogs, "Logs Data by Today");
                }
            } catch (e) {}
            try {
                if (self.ck1) {
                    XLSX.utils.book_append_sheet(wb, ws_drivers_WeekLogs, "Logs Data by Week");
                }
            } catch (e) {}
            try {
                if (self.ck2) {
                    XLSX.utils.book_append_sheet(wb, ws_drivers_Logs, "Logs Data");
                }
            } catch (e) {}
            try {
                if (self.ck3) {
                    XLSX.utils.book_append_sheet(wb, ws_drivers_LogDays, "Logs Data by Days");
                }
            } catch (e) {}
            try {
                if (self.ck4) {
                    XLSX.utils.book_append_sheet(wb, ws_drivers, "Pending Requests Data");
                }
            } catch (e) {}
            try {
                if (self.ck5) {
                    XLSX.utils.book_append_sheet(wb, ws_drivers_ReqCompleted, "Completed Requests Data");
                }
            } catch (e) {}
            try {
                if (self.ck6) {
                    XLSX.utils.book_append_sheet(wb, ws_drivers_bids, "Driver Bids Bids: " + self.filterBids + " / Requests:" + self.totalRequests);
                }
            } catch (e) {}
            try {
                if (self.ck7) {
                    XLSX.utils.book_append_sheet(wb, ws_drivers_invoice, "Earnings Summary");
                }
            } catch (e) {}
            try {
                if (self.ck8) {
                    XLSX.utils.book_append_sheet(wb, ws_drivers_commission, "Commission Summary");
                }
            } catch (e) {}
            try {
                if (self.ck9) {
                    XLSX.utils.book_append_sheet(wb, ws_drivers_wallet, "Wallet Summary");
                }
            } catch (e) {}


            XLSX.writeFile(wb, self.$route.params.id + " " + moment().format("DD MMM YYYY HHMMSS") + ".xlsx");



        },
        ExportDataPDF: function () {
            let self = this;
            if (self.checkSelectedList()) {
                alert("Please Select any One Condition");
                return;
            }

            let columnpendingReqData = [{
                    title: "#",
                    dataKey: "iD"
                },
                {
                    title: "Driver Name",
                    dataKey: "driverName"
                },
                {
                    title: "Client Name",
                    dataKey: "clientName"
                },
                {
                    title: "Origin",
                    dataKey: "origin"
                },
                {
                    title: "Destination",
                    dataKey: "destination"
                },
                {
                    title: "Distance",
                    dataKey: "distance"
                },
                {
                    title: "Duration",
                    dataKey: "duration"
                },
                {
                    title: "Created At",
                    dataKey: "createdAt"
                },
                {
                    title: "Vehicle Type",
                    dataKey: "vehicleType"
                },
                {
                    title: "Amount",
                    dataKey: "amount"
                },
                {
                    title: "Status",
                    dataKey: "status"
                },
            ];
            let rowspendingReqData = [];
            Object.values(self.pendingReqData).forEach((data, index) => {
                rowspendingReqData.push({
                    "iD": index + 1,
                    "driverName": data.driver_data.first_name + ' ' + data.driver_data.last_name,
                    "clientName": data.client_data.first_name + ' ' + data.client_data.last_name,
                    "origin": data.request_data.orgText,
                    "destination": data.request_data.desText,
                    "distance": data.request_data.disText,
                    "duration": data.request_data.durText,
                    "createdAt": data.request_data.createdAt,
                    "vehicleType": data.driver_data.vehicle,
                    "amount": data.bid_data.amount,
                    "status": data.active_req_data.status,
                })
            })
            let columnswalletData = [{
                    title: "#",
                    dataKey: "iD"
                },
                {
                    title: "Added Date",
                    dataKey: "addedDate"
                },
                {
                    title: "Narration",
                    dataKey: "narration"
                },
                {
                    title: "Debit",
                    dataKey: "debit"
                },
                {
                    title: "Credit",
                    dataKey: "credit"
                },
                {
                    title: "Balance",
                    dataKey: "balance"
                },
            ];
            let rowswalletData = [];
            let BDebit = 0;
            let BCredit = 0;
            let BBalance = 0;
            Object.values(self.walletData).forEach((data, index) => {
                rowswalletData.push({
                    "iD": index + 1,
                    "addedDate": data.addedAt,
                    "narration": data.narration,
                    "debit": parseFloat(data.debit).toFixed(2),
                    "credit": parseFloat(data.credit).toFixed(2),
                    "balance": parseFloat(data.balance).toFixed(2),
                })
                BBalance = data.balance;
                BDebit += data.debit;
                BCredit += data.credit;
            })
            if (rowswalletData.length != 0) {
                BDebit = parseFloat(BDebit).toFixed(2);
                BCredit = parseFloat(BCredit).toFixed(2);
                rowswalletData.push({
                    "iD": "",
                    "addedDate": "",
                    "narration": "Balance",
                    "debit": "",
                    "credit": "",
                    "balance": BBalance,
                })
                rowswalletData.push({
                    "iD": "",
                    "addedDate": "",
                    "narration": "Total",
                    "debit": BDebit,
                    "credit": BCredit,
                    "balance": "",
                })
            }
            let columnsinvoiceComData = [{
                    title: "#",
                    dataKey: "iD"
                },
                {
                    title: "Date",
                    dataKey: "date"
                },
                {
                    title: "Commission Invoice",
                    dataKey: "commissionInvoice"
                },
                {
                    title: "Order Invoice#",
                    dataKey: "orderInvoice"
                },
                {
                    title: "Apply Commission(%)",
                    dataKey: "applyCommission"
                },
                {
                    title: "Commission Amount",
                    dataKey: "commissionAmount"
                },
            ];
            let rowsinvoiceComData = [];
            let TotalCommission = 0;
            Object.values(self.invoiceComData).forEach((data, index) => {
                rowsinvoiceComData.push({
                    "iD": index + 1,
                    "date": data.createdAt,
                    "commissionInvoice": data.invoice_no,
                    "orderInvoice": data.order_invoice,
                    "applyCommission": data.apply_commission,
                    "commissionAmount": data.commission_amount,
                })
                TotalCommission += data.commission_amount;
            })
            if (rowsinvoiceComData.length != 0) {
                rowsinvoiceComData.push({
                    "iD": "",
                    "date": "",
                    "commissionInvoice": "",
                    "orderInvoice": "",
                    "applyCommission": "Total",
                    "commissionAmount": TotalCommission,
                })
            }
            let columnsinvoiceReqData = [{
                    title: "#",
                    dataKey: "iD"
                },
                {
                    title: "Date",
                    dataKey: "date"
                },
                {
                    title: "Details",
                    dataKey: "details"
                },
                {
                    title: "Invoice",
                    dataKey: "invoice"
                },
                {
                    title: "Earn",
                    dataKey: "earn"
                },
            ];
            let rowsinvoiceReqData = [];
            let EarnAmount = 0;
            Object.values(self.invoiceReqData).forEach((data, index) => {
                rowsinvoiceReqData.push({
                    "iD": index + 1,
                    "date": data.createdAt,
                    "details": data.req_data.orgText + " To " + data.req_data.desText + " | User :" + data.client_data.first_name + " " + data.client_data.last_name + " | Driver : " + data.driver_data.first_name + " " + data.driver_data.last_name,
                    "invoice": data.invoice_no,
                    "earn": data.amount,
                })
                EarnAmount += data.amount;
            });
            if (rowsinvoiceReqData.length != 0) {
                rowsinvoiceReqData.push({
                    "iD": "",
                    "date": "",
                    "details": "",
                    "invoice": "Total",
                    "earn": EarnAmount,
                })
            }
            let columnsbidsData = [{
                    title: "#",
                    dataKey: "iD"
                },
                {
                    title: "Bid Time",
                    dataKey: "bidTime"
                },
                {
                    title: "Bid Price",
                    dataKey: "bidPrice"
                },
                {
                    title: "Client Name",
                    dataKey: "clientName"
                },
            ];
            let rowsbidsData = [];
            self.bidsData.forEach((data, index) => {
                rowsbidsData.push({
                    "iD": index + 1,
                    "bidTime": self.formatDate(data.first_bid_time),
                    "bidPrice": data.amount,
                    "clientName": data.clientData.first_name + " " + data.clientData.last_name,
                })
            })

            let columnsReqCompleted = [{
                    title: "#",
                    dataKey: "iD"
                },
                {
                    title: "Driver Name",
                    dataKey: "driverName"
                },
                {
                    title: "Client Name",
                    dataKey: "clientName"
                },
                {
                    title: "Origin",
                    dataKey: "origin"
                },
                {
                    title: "Destination",
                    dataKey: "destination"
                },
                {
                    title: "Distance",
                    dataKey: "distance"
                },
                {
                    title: "Duration",
                    dataKey: "duration"
                },
                {
                    title: "Created At",
                    dataKey: "createdAt"
                },
                {
                    title: "Vehicle Type",
                    dataKey: "vehicleType"
                },
                {
                    title: "Amount",
                    dataKey: "amount"
                },
            ];

            let rowsReqCompleted = [];
            let Total_Amount = 0;
            Object.values(self.completeReqData).forEach((data, index) => {

                rowsReqCompleted.push({
                    "iD": index + 1,
                    "driverName": data.driver_data.first_name + ' ' + data.driver_data.last_name,
                    "clientName": data.client_data.first_name + ' ' + data.client_data.last_name,
                    "origin": data.request_data.orgText,
                    "destination": data.request_data.desText,
                    "distance": data.request_data.disText,
                    "duration": data.request_data.durText,
                    "createdAt": data.request_data.createdAt,
                    "vehicleType": data.driver_data.vehicle,
                    "amount": data.bid_data.amount,
                });
                Total_Amount += parseInt(data.bid_data.amount);
            });
            if (rowsReqCompleted.length != 0) {
                rowsReqCompleted.push({
                    "iD": "",
                    "driverName": "",
                    "clientName": "",
                    "origin": "",
                    "destination": "",
                    "distance": "",
                    "duration": "",
                    "createdAt": "",
                    "vehicleType": "Total",
                    "amount": Total_Amount,
                });
            }

            let columnsLogDays = [{
                    title: "#",
                    dataKey: "iD"
                },
                {
                    title: "Date",
                    dataKey: "date"
                },
                {
                    title: "Duration",
                    dataKey: "D"
                }
            ];
            let rowsLogDays = [];
            self.dataa.forEach((data, index) => {
                rowsLogDays.push({
                    'iD': index + 1,
                    'date': data.days,
                    'D': data.durations
                });
            });
            if (rowsLogDays.length != 0) {
                rowsLogDays.push({
                    'iD': "",
                    'date': "Total",
                    'D': self.totalTimes,
                });
            }
            var columns = [{
                    title: "#",
                    dataKey: "iD"
                },
                {
                    title: "Login Date/Time",
                    dataKey: "LiT"
                },
                {
                    title: "Logout Date/Time",
                    dataKey: "LoT"
                },
                {
                    title: "Duration",
                    dataKey: "D"
                }
            ];
            var rows = [];
            self.dataToShow.forEach((dataP, index) => {
                rows.push({
                    'iD': index + 1,
                    'LiT': dataP.loginTime,
                    'LoT': dataP.logoutTime,
                    'D': self.timeFormat(dataP.duration)
                });
            });
            if (rows.length != 0) {
                rows.push({
                    'iD': '',
                    'LiT': '',
                    'LoT': "Total Time",
                    'D': self.timeFormat(self.allLogsTSTime)
                });
            }

            var columnsToday = [{
                    title: "#",
                    dataKey: "iD"
                },
                {
                    title: "Login Date/Time",
                    dataKey: "LiT"
                },
                {
                    title: "Logout Date/Time",
                    dataKey: "LoT"
                },
                {
                    title: "Duration",
                    dataKey: "D"
                }
            ];
            var rowsToday = [];
            self.todayLogs.forEach((dataP, index) => {
                rowsToday.push({
                    'iD': index + 1,
                    'LiT': dataP.loginTime,
                    'LoT': dataP.logoutTime,
                    'D': self.timeFormat(dataP.duration)
                });
            });
            if (rowsToday.length != 0) {
                rowsToday.push({
                    'iD': "",
                    'LiT': "",
                    'LoT': "Total Time",
                    'D': self.timeFormat(self.todayLogsTSTime)
                });
            }

            var columnsWeek = [{
                    title: "#",
                    dataKey: "iD"
                },
                {
                    title: "Login Date/Time",
                    dataKey: "LiT"
                },
                {
                    title: "Logout Date/Time",
                    dataKey: "LoT"
                },
                {
                    title: "Duration",
                    dataKey: "D"
                }
            ];
            var rowsWeek = [];
            self.weekLogs.forEach((dataP, index) => {
                rowsWeek.push({
                    'iD': index + 1,
                    'LiT': dataP.loginTime,
                    'LoT': dataP.logoutTime,
                    'D': self.timeFormat(dataP.duration)
                });
            });
            if (rowsWeek.length != 0) {
                rowsWeek.push({
                    'iD': "",
                    'LiT': "",
                    'LoT': "Total Time",
                    'D': self.timeFormat(self.weekLogsTSTime)
                });
            }
            var doc = new jsPDF("p", "pt");

            var img = new Image;

            var userProfile = {
                FullName: self.userData['first_name'].charAt(0).toUpperCase() + self.userData['first_name'].substr(1) + " " + self.userData['last_name'].charAt(0).toUpperCase() + self.userData['last_name'].substr(1),
                MobileNumber: self.userData['mob_no'].replace(/(\d{2})(\d{3})(\d{4})/, "0$2 $3"),
                AddaName: self.userData['adda_name'].toLowerCase().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' '),
            }
            let point = 130;
            let mar = 40;
            let btmsps = 10;
            let maxPageSize = 780;
            let startpoint = 50;
            img.onload = function () {
                doc.addImage(this, mar, 40, 60, 80);
                doc.setFontSize(10);
                doc.text(mar + 75, 75, 'Driver Name      : ' + userProfile.FullName);
                doc.text(mar + 75, 95, 'Mobile Number : ' + userProfile.MobileNumber);
                doc.text(mar + 75, 115, 'Adda Name       : ' + userProfile.AddaName);
                doc.setFontSize(10);
                if (self.FromDate == null || self.ToDate == null || self.FromDate == "" || self.ToDate == "") {

                } else {
                    doc.text(mar, 150, 'Data Filtered From   _________________ To _________________ ');
                    doc.text(mar + 100, 150, self.FromDate == "" ? "" : (self.FromDate == null ? "" : moment(self.FromDate).format("DD/MMM/YYYY")))
                    doc.text(mar + 210, 150, self.ToDate == "" ? "" : (self.ToDate == null ? "" : moment(self.ToDate).format("DD/MMM/YYYY")))
                }

                doc.setFontSize(16);

                if (self.ck0) {
                    point += 50;

                    if (rowsToday != 0) {
                        doc.text(mar, point, "Logs Data by Today");
                        point += btmsps;
                        doc.autoTable(columnsToday, rowsToday, {

                            styles: {
                                fontSize: 8,
                            },
                            headerStyles: {
                                fontSize: 8,
                            },
                            bodyStyles: {
                                fontSize: 8,
                            },
                            showHeader: 'firstPage',
                            drawRow: function (row, data) {
                                point = data.row.y;
                            },
                            startY: point,

                            margin: {
                                top: 10,
                                bottom: 10,
                                left: 40,
                                right: 40,
                            },
                            theme: 'grid'
                        });
                    } else {
                        doc.text(mar, point, "Logs Data by Today");
                        doc.setFontSize(10);
                        doc.text(mar, point + 20, " NO-DATA");
                        doc.setFontSize(14);
                    }
                }
                if (self.ck1) {
                    point += 50;

                    if (point > maxPageSize) {
                        doc.addPage();
                        point = startpoint;
                    }
                    if (rowsWeek != 0) {
                        doc.text(mar, point, "Logs Data by Week");
                        point += btmsps;
                        doc.autoTable(columnsWeek, rowsWeek, {

                            styles: {
                                fontSize: 8,
                            },
                            headerStyles: {
                                fontSize: 8,
                            },
                            bodyStyles: {
                                fontSize: 8,
                            },
                            showHeader: 'firstPage',
                            drawRow: function (row, data) {
                                point = data.row.y;
                            },
                            startY: point,

                            margin: {
                                top: 10,
                                bottom: 10,
                                left: 40,
                                right: 40,
                            },
                            theme: 'grid'
                        });
                    } else {
                        doc.text(mar, point, "Logs Data by Week");
                        doc.setFontSize(10);
                        doc.text(mar, point + 20, " NO-DATA");
                        doc.setFontSize(14);
                    }


                }
                if (self.ck2) {
                    point += 50;

                    if (point > maxPageSize) {
                        doc.addPage();
                        point = startpoint;
                    }
                    if (rows != 0) {
                        doc.text(mar, point, "Logs Data");
                        point += btmsps;
                        doc.autoTable(columns, rows, {

                            styles: {
                                fontSize: 8,
                            },
                            headerStyles: {
                                fontSize: 8,
                            },
                            bodyStyles: {
                                fontSize: 8,
                            },
                            showHeader: 'firstPage',
                            drawRow: function (row, data) {
                                point = data.row.y;
                            },
                            startY: point,

                            margin: {
                                top: 10,
                                bottom: 10,
                                left: 40,
                                right: 40,
                            },
                            theme: 'grid'
                        });
                    } else {
                        doc.text(mar, point, "Logs Data");
                        doc.setFontSize(10);
                        doc.text(mar, point + 20, " NO-DATA");
                        doc.setFontSize(14);
                    }
                }

                if (self.ck3) {
                    point += 50;
                    if (point > maxPageSize) {
                        doc.addPage();
                        point = startpoint;
                    }
                    if (rowsLogDays != 0) {
                        doc.text(mar, point, "Logs Data by Days");
                        point += btmsps;
                        doc.autoTable(columnsLogDays, rowsLogDays, {

                            styles: {
                                fontSize: 8,
                            },
                            headerStyles: {
                                fontSize: 8,
                            },
                            bodyStyles: {
                                fontSize: 8,
                            },
                            showHeader: 'firstPage',

                            drawRow: function (row, data) {
                                point = data.row.y;
                            },
                            startY: point,

                            margin: {
                                top: 10,
                                bottom: 10,
                                left: 40,
                                right: 40,
                            },
                            theme: 'grid'
                        });
                    } else {
                        doc.text(mar, point, "Logs Data by Days");
                        doc.setFontSize(10);
                        doc.text(mar, point + 20, " NO-DATA");
                        doc.setFontSize(14);
                    }
                }
                if (self.ck4) {
                    point += 50;
                    if (point > maxPageSize) {
                        doc.addPage();
                        point = startpoint;
                    }
                    if (rowspendingReqData != 0) {
                        doc.text(mar, point, "Pending Requests Data");
                        point += btmsps;
                        doc.autoTable(columnpendingReqData, rowspendingReqData, {
                            styles: {
                                columnWidth: 'auto'
                            },
                            columnStyles: {
                                iD: {
                                    columnWidth: 20,
                                    halign: 'center'
                                },
                                driverName: {
                                    columnWidth: 50,
                                    halign: 'center'
                                },
                                clientName: {
                                    columnWidth: 50,
                                    halign: 'center'
                                },
                                origin: {
                                    columnWidth: 65,
                                    fontSize: 7,
                                    halign: 'center'
                                },
                                destination: {
                                    columnWidth: 65,
                                    fontSize: 7,
                                    halign: 'center'
                                },
                                distance: {
                                    columnWidth: 50,
                                    halign: 'center'
                                },
                                duration: {
                                    columnWidth: 50,
                                    halign: 'center'
                                },
                                createdAt: {
                                    columnWidth: 60,
                                    halign: 'center'
                                },
                                vehicleType: {
                                    columnWidth: 40,
                                    halign: 'center'
                                },
                                amount: {
                                    columnWidth: 40,
                                    halign: 'right'
                                },
                                status: {
                                    halign: 'center'
                                },
                            },
                            styles: {
                                fontSize: 8,
                                overflow: 'linebreak',
                            },
                            headerStyles: {
                                fontSize: 8,
                            },
                            bodyStyles: {
                                fontSize: 8,
                            },
                            showHeader: 'firstPage',

                            drawRow: function (row, data) {
                                point = data.row.y;
                            },
                            startY: point,

                            margin: {
                                top: 10,
                                bottom: 10,
                                left: 40,
                                right: 40,
                            },
                            theme: 'grid'
                        });
                    } else {
                        doc.text(mar, point, "Pending Requests Data");
                        doc.setFontSize(10);
                        doc.text(mar, point + 20, " NO-DATA");
                        doc.setFontSize(14);
                    }

                }
                if (self.ck5) {
                    point += 50;
                    if (point > maxPageSize) {
                        doc.addPage();
                        point = startpoint;
                    }
                    if (rowsReqCompleted != 0) {
                        doc.text(mar, point, "Completed Requests Data");
                        point += btmsps;
                        doc.autoTable(columnsReqCompleted, rowsReqCompleted, {
                            styles: {
                                columnWidth: 'auto'
                            },
                            columnStyles: {
                                iD: {
                                    columnWidth: 20,
                                    halign: 'center'
                                },
                                driverName: {
                                    columnWidth: 50,
                                    halign: 'center'
                                },
                                clientName: {
                                    columnWidth: 50,
                                    halign: 'center'
                                },
                                origin: {
                                    columnWidth: 80,
                                    fontSize: 7,
                                    halign: 'center'
                                },
                                destination: {
                                    columnWidth: 80,
                                    fontSize: 7,
                                    halign: 'center'
                                },
                                distance: {
                                    columnWidth: 50,
                                    halign: 'center'
                                },
                                duration: {
                                    columnWidth: 50,
                                    halign: 'center'
                                },
                                createdAt: {
                                    columnWidth: 60,
                                    halign: 'center'
                                },
                                vehicleType: {
                                    columnWidth: 40,
                                    halign: 'center'
                                },
                                amount: {
                                    columnWidth: 40,
                                    halign: 'right'
                                },
                            },
                            styles: {
                                fontSize: 8,
                                overflow: 'linebreak',
                            },
                            headerStyles: {
                                fontSize: 8,
                            },
                            bodyStyles: {
                                fontSize: 8,
                            },
                            showHeader: 'firstPage',

                            drawRow: function (row, data) {
                                point = data.row.y;
                            },
                            startY: point,

                            margin: {
                                top: 10,
                                bottom: 10,
                                left: 40,
                                right: 40,
                            },
                            theme: 'grid'
                        });
                    } else {
                        doc.text(mar, point, "Completed Requests Data");
                        doc.setFontSize(10);
                        doc.text(mar, point + 20, " NO-DATA");
                        doc.setFontSize(14);
                    }

                }
                if (self.ck6) {


                    point += 50;
                    if (point > maxPageSize) {
                        doc.addPage();
                        point = startpoint;
                    }
                    if (rowsbidsData != 0) {
                        doc.text(mar, point, "Driver Bids Bids: " + self.filterBids + " / Requests:" + self.totalRequests);
                        point += btmsps;
                        doc.autoTable(columnsbidsData, rowsbidsData, {
                            styles: {
                                columnWidth: 'auto'
                            },
                            columnStyles: {
                                bidPrice: {
                                    halign: 'right'
                                },
                            },
                            styles: {
                                fontSize: 8,
                                overflow: 'linebreak',
                            },
                            headerStyles: {
                                fontSize: 8,
                            },
                            bodyStyles: {
                                fontSize: 8,
                            },
                            showHeader: 'firstPage',

                            drawRow: function (row, data) {
                                point = data.row.y;
                            },
                            startY: point,

                            margin: {
                                top: 10,
                                bottom: 10,
                                left: 40,
                                right: 40,
                            },
                            theme: 'grid'
                        });
                    } else {
                        doc.text(mar, point, "Driver Bids Bids: " + self.filterBids + " / Requests:" + self.totalRequests);
                        doc.setFontSize(10);
                        doc.text(mar, point + 20, " NO-DATA");
                        doc.setFontSize(14);
                    }

                }
                if (self.ck7) {
                    point += 50;
                    if (point > maxPageSize) {
                        doc.addPage();
                        point = startpoint;
                    }
                    if (rowsinvoiceReqData != 0) {
                        doc.text(mar, point, "Earnings Summary");
                        point += btmsps;
                        doc.autoTable(columnsinvoiceReqData, rowsinvoiceReqData, {
                            styles: {
                                columnWidth: 'auto'
                            },
                            columnStyles: {
                                iD: {
                                    columnWidth: 20,
                                    halign: 'center'
                                },
                                date: {
                                    columnWidth: 120,
                                    halign: 'center'
                                },
                                details: {
                                    columnWidth: 260
                                },
                                invoice: {
                                    columnWidth: 80
                                },
                                earn: {
                                    columnWidth: 40,
                                    halign: 'right'
                                },
                            },
                            styles: {
                                fontSize: 8,
                                overflow: 'linebreak',
                            },
                            headerStyles: {
                                fontSize: 8,
                            },
                            bodyStyles: {
                                fontSize: 8,
                            },
                            showHeader: 'firstPage',

                            drawRow: function (row, data) {
                                point = data.row.y;
                            },
                            startY: point,

                            margin: {
                                top: 10,
                                bottom: 10,
                                left: 40,
                                right: 40,
                            },
                            theme: 'grid'
                        });
                    } else {
                        doc.text(mar, point, "Earnings Summary");
                        doc.setFontSize(10);
                        doc.text(mar, point + 20, " NO-DATA");
                        doc.setFontSize(14);
                    }
                }
                if (self.ck8) {

                    point += 50;
                    if (point > maxPageSize) {
                        doc.addPage();
                        point = startpoint;
                    }
                    if (rowsinvoiceComData != 0) {
                        doc.text(mar, point, "Commission Summary");
                        point += btmsps;
                        doc.autoTable(columnsinvoiceComData, rowsinvoiceComData, {
                            styles: {
                                columnWidth: 'auto'
                            },
                            columnStyles: {

                                applyCommission: {
                                    halign: 'right'
                                },
                                commissionAmount: {
                                    halign: 'right'
                                },
                            },
                            styles: {
                                fontSize: 8,
                                overflow: 'linebreak',
                            },
                            headerStyles: {
                                fontSize: 8,
                            },
                            bodyStyles: {
                                fontSize: 8,
                            },
                            showHeader: 'firstPage',

                            drawRow: function (row, data) {
                                point = data.row.y;
                            },
                            startY: point,

                            margin: {
                                top: 10,
                                bottom: 10,
                                left: 40,
                                right: 40,
                            },
                            theme: 'grid'
                        });
                    } else {
                        doc.text(mar, point, "Commission Summary");
                        doc.setFontSize(10);
                        doc.text(mar, point + 20, " NO-DATA");
                        doc.setFontSize(14);
                    }
                }
                if (self.ck9) {

                    point += 50;
                    if (point > maxPageSize) {
                        doc.addPage();
                        point = startpoint;
                    }
                    if (rowswalletData != 0) {
                        doc.text(mar, point, "Wallet Summary");
                        point += btmsps;
                        doc.autoTable(columnswalletData, rowswalletData, {
                            styles: {
                                columnWidth: 'auto'
                            },
                            columnStyles: {
                                debit: {
                                    halign: 'right'
                                },
                                credit: {
                                    halign: 'right'
                                },
                                balance: {
                                    halign: 'right'
                                },

                            },
                            styles: {
                                fontSize: 8,
                                overflow: 'linebreak',
                            },
                            headerStyles: {
                                fontSize: 8,
                            },
                            bodyStyles: {
                                fontSize: 8,
                            },
                            showHeader: 'firstPage',

                            drawRow: function (row, data) {
                                point = data.row.y;
                            },
                            startY: point,

                            margin: {
                                top: 10,
                                bottom: 10,
                                left: 40,
                                right: 40,
                            },
                            theme: 'grid'
                        });
                    } else {
                        doc.text(mar, point, "Wallet Summary");
                        doc.setFontSize(10);
                        doc.text(mar, point + 20, " NO-DATA");
                        doc.setFontSize(14);
                    }

                }
                doc.setFontSize(10);
                doc.text(40, maxPageSize, "____________________                                                                                                       ____________________");
                doc.text(40, maxPageSize + 20, "   Issuing Authority                                                                                                                      Admin ROADIOAPP");
                doc.text(40, maxPageSize + 35, "      ROADIOAPP");

                doc.save(self.$route.params.id + " " + moment().format("DD MMM YYYY HHMMSS") + ".pdf");
            };
            img.crossOrigin = "*"; // for demo as we are at different origin than image
            (this.profileImgURL != '') ? img.src = this.profileImgURL: img.src = 'https://s3-eu-west-1.amazonaws.com/philips-future-health-index/wp-content/uploads/2016/05/20132859/user.png'; // some random imgur image


        },
        checkboxToggle(val) {
            let self = this;
            if (val) {
                self.ck0 = false;
                self.ck1 = false;
                self.ck2 = false;
                self.ck3 = false;
                self.ck4 = false;
                self.ck5 = false;
                self.ck6 = false;
                self.ck7 = false;
                self.ck8 = false;
                self.ck9 = false;
            } else {
                self.ck0 = !false;
                self.ck1 = !false;
                self.ck2 = !false;
                self.ck3 = !false;
                self.ck4 = !false;
                self.ck5 = !false;
                self.ck6 = !false;
                self.ck7 = !false;
                self.ck8 = !false;
                self.ck9 = !false;
            }

        },
        showPopup() {
            $("#confirm_popup").modal('show');
        },
        removeItem() {
            $("#confirm_popup").modal('hide');
            console.log("Remove Item Error: ");

        },
        filterLogs: function (self, allLogs, TodateV, fromdateV) {

            let TimeFrom = moment(fromdateV).startOf('day').unix()
            let TimeTo = moment(TodateV).endOf('day').unix()
            let data = [];
            allLogs.forEach(v => {

                if (this.FromDate == "" || this.ToDate == "" || this.FromDate == null || this.ToDate == null) {
                    data.push(v);
                } else {
                    let time = moment(v.loginTime).unix();
                    if (time >= TimeFrom && time <= TimeTo) {
                        data.push(v);
                    }
                }
            });
            allLogs = data;
            self.dataa = [];
            self.todayLogs = [];
            self.weekLogs = [];
            self.dayLogs = []; ///
            self.todayLogsTSTime = moment.duration();
            self.weekLogsTSTime = moment.duration();
            self.dayLogsTSTime = moment.duration(); ///
            var days = [];
            var durations = [];

            if (allLogs.length > 0) {

                const todayDate = moment().set({
                    hour: 0,
                    minute: 0,
                    second: 0
                });
                const weekDate = todayDate.clone().subtract(7, "days");
                allLogs.forEach(function (item) {
                    if (todayDate.unix() <= item.loginTimeM.unix()) {
                        self.todayLogs.push(item);
                        self.todayLogsTSTime.add(item.duration);
                    }
                    if (weekDate.unix() <= item.loginTimeM.unix()) {
                        self.weekLogs.push(item);
                        self.weekLogsTSTime.add(item.duration);
                    }
                    var durationsC = ((item.duration)._data['hours'] * 60 * 60) + ((item.duration)._data['minutes'] * 60) + (item.duration)._data['seconds'];
                    durations.push(durationsC);
                    days.push(moment(new Date(item.loginTimeM)).format("DD/MMM/YYYY"));

                });

                function secondsToHms(d) {
                    d = Number(d);
                    var h = Math.floor(d / 3600);
                    var m = Math.floor(d % 3600 / 60);
                    var s = Math.floor(d % 3600 % 60);
                    var hDisplay = h > 9 ? h + ":" : '0' + h + ":";
                    var mDisplay = m > 9 ? m + ":" : '0' + m + ":";
                    var sDisplay = s > 9 ? s : '0' + s;
                    return hDisplay + mDisplay + sDisplay;
                }
                var i;
                self.totalTimes = 0;
                for (i = 0; i < days.length; i++) {
                    var day = days[i];
                    var duration = durations[i];
                    var temp = true;
                    while (temp) {
                        if (days[i] == days[i + 1]) {
                            duration += durations[i + 1]
                            self.dataCount += 1;
                            i += 1;
                            temp + 1;
                        } else {
                            temp = false;
                        }
                    }

                    if (self.searched) {
                        let time = moment(day).unix();
                        let TimeFrom = moment(fromdateV).startOf('day').unix()
                        let TimeTo = moment(TodateV).endOf('day').unix()
                        if (self.FromDate == "" || self.ToDate == "" || self.FromDate == null || self.ToDate == null) {
                            self.dataa.push({
                                'days': day,
                                'durations': secondsToHms(duration)
                            });
                        } else {
                            if (time >= TimeFrom && time <= TimeTo) {
                                self.totalTimes += duration;
                                self.dataa.push({
                                    'days': day,
                                    'durations': secondsToHms(duration)
                                });
                            }
                        }
                    } else {
                        self.totalTimes += duration;
                        self.dataa.push({
                            'days': day,
                            'durations': secondsToHms(duration)
                        });
                    }

                }
                self.totalTimes = secondsToHms(self.totalTimes);
                self.dataToShowDAYS = self.dataa;
                self.dataToShow = allLogs;
                self.allLogsTSTime = moment.duration();
                self.dataToShow.forEach(element => {
                    self.allLogsTSTime.add(element.duration);
                });
                self.isPrevAvaliableDAYS = false;
            }
        },
        timeFormat: function (mDuration) {
            let hours = (mDuration.asHours().toString().length < 2) ? "0" + mDuration.asHours() : mDuration.asHours();
            let min = (mDuration.get('m').toString().length < 2) ? "0" + mDuration.get('m') : mDuration.get('m');
            let sec = (mDuration.get('s').toString().length < 2) ? "0" + mDuration.get('s') : mDuration.get('s');

            return parseInt(hours) + ":" + min + ":" + sec;
        },

        SearchByDate(DFrom, DTo) {

            let TimeFrom = moment(DFrom).startOf('day').unix()
            let TimeTo = moment(DTo).endOf('day').unix()
            let self = this;
            self.searched = true;
            if (!self.IsBackup) {
                self.Backup_allLogs = self.allLogs
                self.Backup_bidsData = self.bidsData
                self.Backup_completeReqData = self.completeReqData
                self.Backup_pendingReqData = self.pendingReqData
                self.Backup_invoiceReqData = self.invoiceReqData
                self.Backup_invoiceComData = self.invoiceComData
                self.Backup_walletData = self.walletData
                self.IsBackup = !self.IsBackup;
            } else {
                self.allLogs = self.Backup_allLogs
                self.bidsData = self.Backup_bidsData
                self.completeReqData = self.Backup_completeReqData
                self.pendingReqData = self.Backup_pendingReqData
                self.invoiceReqData = self.Backup_invoiceReqData
                self.invoiceComData = self.Backup_invoiceComData
                self.walletData = self.Backup_walletData
            }
            if (DFrom == "" || DTo == "" || DFrom == null || DTo == null) {
                self.allLogs = self.Backup_allLogs
                self.bidsData = self.Backup_bidsData
                self.completeReqData = self.Backup_completeReqData
                self.pendingReqData = self.Backup_pendingReqData
                self.invoiceReqData = self.Backup_invoiceReqData
                self.invoiceComData = self.Backup_invoiceComData
                self.walletData = self.Backup_walletData

            } else {
                self.totalRequests = 0;


                self.userReqRef.on('value', function (userReqSnap) {
                    userReqSnap.forEach(element => {
                        element.forEach(record => {
                            let time = moment(record.val().createdAt).unix();
                            if (time >= TimeFrom && time <= TimeTo) {
                                self.totalRequests++;
                            }

                        })

                    });
                })
                self.dataa = []
                self.allLogs = []
                self.allLogsTSTime = moment.duration();
                Object.values(self.Backup_allLogs).forEach(element => {
                    let time = moment(element.loginTime).unix()
                    if (time >= TimeFrom && time <= TimeTo) {

                        self.allLogsTSTime.add(element.duration);
                        self.allLogs.push(element);
                    }
                });
                self.dataToShow = self.allLogs;

                self.bidsData = []
                Object.values(self.Backup_bidsData).forEach(element => {
                    let time = moment(element.first_bid_time).unix()
                    if (time >= TimeFrom && time <= TimeTo) {
                        self.bidsData.push(element);
                    }
                });
                self.filterBids = self.bidsData.length
                self.completeReqData = []
                Object.values(self.Backup_completeReqData).forEach(element => {
                    let time = moment(element.request_data.createdAt).unix()
                    if (time >= TimeFrom && time <= TimeTo) {
                        self.completeReqData.push(element);
                    }
                });
                self.pendingReqData = []
                Object.values(self.Backup_pendingReqData).forEach(element => {
                    let time = moment(element.request_data.createdAt).unix()
                    if (time >= TimeFrom && time <= TimeTo) {
                        self.pendingReqData.push(element);
                    }
                })
                self.invoiceReqData = []
                Object.values(self.Backup_invoiceReqData).forEach(element => {
                    let time = moment(element.createdAt).unix()
                    if (time >= TimeFrom && time <= TimeTo) {
                        self.invoiceReqData.push(element);
                    }
                })
                self.invoiceComData = []
                Object.values(self.Backup_invoiceComData).forEach(element => {
                    let time = moment(element.createdAt).unix()
                    if (time >= TimeFrom && time <= TimeTo) {
                        self.invoiceComData.push(element);
                    }
                })
                self.walletData = []
                Object.values(self.Backup_walletData).forEach(element => {
                    let time = moment(element.addedAt).unix()
                    if (time >= TimeFrom && time <= TimeTo) {
                        self.walletData.push(element);
                    }

                })
            }

        },
        customFormatter(date) {
            return moment(date).format("DD/MMM/YYYY");
        },

        formatDate(val) {
            if (val === undefined) return "";
            if (val == 0) return "";
            return moment(val).format("hh:mm A DD/MMM/YYYY");
        },
        deActive: function (key) {
            let self = this;
            if (self.userRef) {
                self.userRef.child(key).update({
                    status: 0
                }, function (err) {
                    if (err) {
                        console.log(err)
                    }
                });
            }
        },
        active: function (key) {
            let self = this;
            if (self.userRef) {
                self.userRef.child(key).update({
                    status: 1
                }, function (err) {
                    if (err) {
                        console.log(err)
                    }
                });
            }
        },

        complete_req_driver: function (self, uid, driver_data) {
            self.completeReqRef.orderByChild('driver_uid').equalTo(uid).once('value').then(function (snap) {
                let com_req_data = snap.val();
                if (com_req_data !== null) {
                    let keys = Object.keys(com_req_data);
                    let key_length = keys.length;
                    let processItem = 0;
                    self.completeReqDataTotal = 0;
                    keys.forEach(function (row) {
                        let completed_req_data = com_req_data[row];
                        self.userReqRef.child(completed_req_data.client_uid + "/" + row).once('value', function (userReqSnap) {
                            let user_req_data = userReqSnap.val();
                            user_req_data['createdAt'] = func.set_date_ser(new Date(user_req_data.createdAt));
                            self.driverBidsRef.child(row + "/" + uid).once('value', function (bidSnap) {
                                let bid_data = bidSnap.val();
                                self.userRef.child(completed_req_data.client_uid).once('value', function (clientSnap) {
                                    let client_data = clientSnap.val();
                                    self.completeReqDataTotal += parseInt(bid_data.amount);
                                    self.completeReqData[row] = {
                                        client_data: client_data,
                                        driver_data: driver_data,
                                        request_data: user_req_data,
                                        bid_data: bid_data
                                    };
                                    processItem++;
                                    if (processItem === key_length) {
                                        self.completeReqData = func.sortObj(self.completeReqData);
                                        self.dataLoad1 = false;
                                    }
                                });
                            });
                        });
                    });
                } else {
                    self.dataLoad1 = false;
                }
            });
        },
        pending_req_driver: function (self, uid, driver_data) {
            self.activeReqRef.orderByChild('driver_uid').equalTo(uid).once('value').then(function (snap) {
                let pend_req_data = snap.val();
                if (pend_req_data !== null) {
                    let keys = Object.keys(pend_req_data);
                    let key_length = keys.length;
                    let processItem = 0;
                    self.pendingReqDataTotal = 0;
                    keys.forEach(function (row) {
                        let pending_req_data = pend_req_data[row];
                        self.userReqRef.child(row + "/" + pending_req_data.req_id).once('value', function (userReqSnap) {
                            let user_req_data = userReqSnap.val();
                            user_req_data['createdAt'] = func.set_date_ser(new Date(user_req_data.createdAt));
                            user_req_data['createdAt'] = func.set_date_ser(new Date(user_req_data.createdAt));
                            self.driverBidsRef.child(pending_req_data.req_id + "/" + uid).once('value', function (bidSnap) {
                                let bid_data = bidSnap.val();
                                self.userRef.child(row).once('value', function (clientSnap) {
                                    let client_data = clientSnap.val();
                                    self.pendingReqDataTotal += parseInt(bid_data.amount);
                                    self.pendingReqData[pending_req_data.req_id] = {
                                        client_data: client_data,
                                        driver_data: driver_data,
                                        active_req_data: pending_req_data,
                                        request_data: user_req_data,
                                        bid_data: bid_data
                                    };
                                    processItem++;
                                    if (processItem === key_length) {
                                        self.pendingReqData = func.sortObj(self.pendingReqData);
                                        self.dataLoad2 = false;
                                    }
                                });
                            });
                        });
                    });
                } else {
                    self.dataLoad2 = false;
                }
            });
        },
        user_req_invoices: function (self, uid, driver_data) {
            self.userReqInvoiceRef.orderByChild('driver_uid').equalTo(uid).once('value').then(function (userReqInvoiceSnap) {
                let userReqInvoiceData = userReqInvoiceSnap.val();
                if (userReqInvoiceData !== null) {
                    let keys = Object.keys(userReqInvoiceData);
                    let key_length = keys.length;
                    let processItem = 0;
                    self.invoiceReqDataTotal = 0;
                    keys.forEach(function (row) {
                        let invoice_data = userReqInvoiceData[row];
                        self.userReqRef.child(invoice_data.client_uid + "/" + invoice_data.req_id).once('value').then(function (reqSnap) {
                            let reqData = reqSnap.val();
                            self.userRef.child(invoice_data.client_uid).once('value', function (clientSnap) {
                                let client_data = clientSnap.val();
                                self.invoiceReqDataTotal += parseInt(invoice_data.amount);

                                self.invoiceReqData[row] = {
                                    client_data: client_data,
                                    driver_data: driver_data,
                                    req_data: reqData,
                                    createdAt: func.set_date_ser(new Date(func.decode_key(row))),
                                    invoice_no: func.getSetInvoiceNo(row, invoice_data.invoice_no, "U"),
                                    amount: invoice_data.amount
                                };
                                processItem++;
                                if (processItem === key_length) {
                                    self.invoiceReqData = func.sortObj(self.invoiceReqData);
                                    self.dataLoad3 = false;
                                }
                            });
                        });
                    });
                } else {
                    self.dataLoad3 = false;
                }
            });
        },
        driver_com_invoices: function (self, uid) {
            self.driverComInvoiceRef.orderByChild('driver_uid').equalTo(uid).once('value').then(function (driverComInvoiceSnap) {
                let driverComInvoiceData = driverComInvoiceSnap.val();
                if (driverComInvoiceData !== null) {
                    let keys = Object.keys(driverComInvoiceData);
                    let key_length = keys.length;
                    let processItem = 0;
                    self.invoiceComDataTotal = 0;
                    keys.forEach(function (key) {
                        let comInvItemData = driverComInvoiceData[key];
                        comInvItemData['createdAt'] = func.set_date_ser(new Date(func.decode_key(key)));
                        comInvItemData['invoice_no'] = func.getSetInvoiceNo(key, comInvItemData.invoice_no, "D");
                        self.userReqInvoiceRef
                            .child(comInvItemData.user_invoice_id)
                            .once('value')
                            .then(function (userReqInvSnap) {
                                let userReqInvData = userReqInvSnap.val();
                                comInvItemData['order_invoice'] = func.getSetInvoiceNo(userReqInvSnap.key, userReqInvData.invoice_no, "U");
                                comInvItemData['order_inv_key'] = userReqInvSnap.key;
                                self.invoiceComData[key] = comInvItemData;
                                self.invoiceComDataTotal = parseFloat(parseFloat(self.invoiceComDataTotal) + parseFloat(comInvItemData.commission_amount)).toFixed(2);;

                                processItem++;
                                if (processItem === key_length) {
                                    self.invoiceComData = func.sortObj(self.invoiceComData);
                                    self.dataLoad4 = false;
                                }
                            });
                    });
                } else {
                    self.dataLoad4 = false;
                }
            });
        },
        driver_wallet: function (self, uid) {
            self.walletRef.orderByChild('uid').equalTo(uid).on('value', function (walletSnap) {
                let walletData = walletSnap.val();
                if (walletData !== null) {
                    let keys = Object.keys(walletData);
                    let key_length = keys.length;
                    let processItem = 0;
                    let oldBalance = 0;
                    self.totDebit = 0;
                    self.totCredit = 0;
                    keys.forEach(function (row) {
                        let rowSel = walletData[row];
                        rowSel['addedAt'] = func.set_date_ser(new Date(func.decode_key(row)));
                        rowSel['balance'] = oldBalance = func.getBalance(oldBalance, rowSel.debit, rowSel.credit);
                        rowSel['balance'] = parseFloat(rowSel['balance']).toFixed(2);
                        self.totDebit += rowSel.debit;
                        self.totCredit += rowSel.credit;
                        self.walletData[row] = rowSel;
                        processItem++;
                        if (processItem === key_length) {
                            self.walletData = func.sortObj(self.walletData, false);
                            self.dataLoad5 = false;
                        }
                    });
                } else {
                    self.dataLoad5 = false;
                }
            });
        },
        addVoucher: function () {
            let self = this;
            if (self.userData !== null) {
                self.$validate().then(function (success) {
                    if (success) {
                        self.walletRef.push({
                            uid: self.userData.key,
                            narration: self.narrationTxt,
                            debit: self.debitTxt,
                            credit: self.creditTxt,
                            type: "driver_w",

                        }, function (err) {
                            if (err) {
                                self.mainErr = err.message;
                            } else {
                                self.narrationTxt = "";
                                self.debitTxt = 0;
                                self.creditTxt = 0;
                                self.validation.reset();
                                self.mainMsg = "Successfully add amount!";
                                setTimeout(function () {
                                    self.mainMsg = "";
                                }, 3000);
                            }
                        });
                    }
                });
            }
        },
        DeleteWallet: function (id) {
            let self = this;
            self.walletRef.child(id).remove().then(() => {

                var element = document.getElementById(id + '-tr');


                setTimeout(function () {
                    $(element).css('background-color', 'black');
                    $(element).fadeOut({
                        duration: 800
                    });

                }, 1000);
                $(element).css('background-color', 'red');





            }).catch((e) => {});

        },
        getLastRow: function (obj) {
            let keys = Object.keys(obj);
            let key_length = keys.length;
            return obj[keys[key_length - 1]];
        },
        Tofloat2(val) {
            return parseFloat(val).toFixed(2);
        },
        getAddaName: function (self, AddaID) {
            if (self.AddaLoaded) {
                let self = this;
                self.addaListRef.orderByChild('id').equalTo(AddaID).on('value', function (snapshot) {

                    snapshot.forEach(function (childSnapshot) {
                        var value = childSnapshot.val();
                        self.userData['adda_name'] = value.place_name;
                    });
                });
                self.AddaLoaded = false;
            }
        },

        getImgs: function (self, uid) {
            const storage = firebase.storage();
            if (self.profileImgLoad) {
                let ref = storage.ref('profile_images/' + uid + '.jpg');
                ref.getDownloadURL().then(function (url) {
                    self.profileImgURL = url;
                    self.profileImgLoad = false;
                }, function (err) {
                    self.profileImgLoad = false;
                });
            }
            if (self.cnicImgLoad) {
                let ref = storage.ref('driver_cnic_images/' + uid + '.jpg');
                ref.getDownloadURL().then(function (url) {
                    self.cnicImgURL = url;
                    self.cnicImgLoad = false;
                }, function (err) {
                    self.cnicImgLoad = false;
                });
            }
            if (self.licenceImgLoad) {
                let ref = storage.ref('driver_license_images/' + uid + '.jpg');
                ref.getDownloadURL().then(function (url) {
                    self.licenceImgURL = url;
                    self.licenceImgLoad = false;
                }, function (err) {
                    self.licenceImgLoad = false;
                });
            }
            if (self.letterImgLoad) {
                let ref = storage.ref('driver_registration_letter_images/' + uid + '.jpg');
                ref.getDownloadURL().then(function (url) {
                    self.letterImgURL = url;
                    self.letterImgLoad = false;
                }, function (err) {
                    self.letterImgLoad = false;
                });
            }
        }
    }
}