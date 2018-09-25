import firebase from 'firebase'
import moment from 'moment'
import func from '../../../custom_libs/func'
 
import exportPopup from '../../partials/components/modals/Export_popup.vue'

import Datepicker from 'vuejs-datepicker';
import SimpleVueValidation from 'simple-vue-validator'
const Validator = SimpleVueValidation.Validator;

//import driverLogsSection from '../../partials/components/sections/driver_logs/index.vue'

export default {
    components: { 
        'date_picker': Datepicker,
        export_popup : exportPopup,
    },
    created: function () {
        let self = this;

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
            self.totalBids=DataBids.length
            self.filterBids=self.totalBids
            self.userReqRef.on('value', function (userReqSnap) {
                self.totalRequests=0;
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
            totalBids:0,
            filterBids:0,
            // Total Request Count
            totalRequests:0,

            //currentlyShowingDAYS: 0,
            dataToShowDAYS: [],
            isNextAvaliableDAYS: false,
            isPrevAvaliableDAYS: false,
            counterDAYS: 1,
            totalPagesDAYS: 0,
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
            ckAll:false,
            ck0:false,
            ck1:false,
            ck2:false,
            ck3:false,
            ck4:false,
            ck5:false,
            ck6:false,
            ck7:false,
            ck8:false,
            ck9:false,
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

            this.filterLogs(this, val);
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
        ExportData:function(){
            
        },
        checkboxToggle(val){
            let self = this;
            if(val){
            self.ck0=false;self.ck1=false;self.ck2=false;self.ck3=false;self.ck4=false;self.ck5=false;self.ck6=false;self.ck7=false;self.ck8=false;self.ck9=false;
            }else{
                self.ck0=!false;self.ck1=!false;self.ck2=!false;self.ck3=!false;self.ck4=!false;self.ck5=!false;self.ck6=!false;self.ck7=!false;self.ck8=!false;self.ck9=!false;
            }

        },
        showPopup () { 
            $("#confirm_popup").modal('show');
        },
        removeItem () { 
            $("#confirm_popup").modal('hide'); 
                    console.log("Remove Item Error: " ); 
              
        },
        filterLogs: function (self, allLogs) {
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
                self.totalTimes += duration;
                self.dataa.push({
                    'days': day ,
                    'durations': secondsToHms(duration)
                });
            }
            self.totalTimes = secondsToHms(self.totalTimes);
            self.dataToShowDAYS = self.dataa; 
            self.isPrevAvaliableDAYS = false;}
        },
        timeFormat: function (mDuration) {
            let hours = (mDuration.asHours().toString().length < 2) ? "0" + mDuration.asHours() : mDuration.asHours();
            let min = (mDuration.get('m').toString().length < 2) ? "0" + mDuration.get('m') : mDuration.get('m');
            let sec = (mDuration.get('s').toString().length < 2) ? "0" + mDuration.get('s') : mDuration.get('s');

            return parseInt(hours) + ":" + min + ":" + sec;
        },
        
        SearchByDate(DFrom, DTo) {
            
            let TimeFrom = moment(DFrom).unix()
            let TimeTo = moment(DTo).unix()
            let self = this;
 
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
self.totalRequests=0;


                self.userReqRef.on('value', function (userReqSnap) {
                    userReqSnap.forEach(element => {
                        element.forEach(record => {
                           let time =   moment(record.val().createdAt ).unix()
 
                              if(time >TimeFrom && time < TimeTo){ 
                                  self.totalRequests++;
                              }

                        })
                         
                    });
                }) 



                self.dataa = [] 
                self.allLogs = []
                self.allLogsTSTime = moment.duration();
                  Object.values(self.Backup_allLogs ).forEach(element => {
                      let time =moment(element.loginTime).unix()
                      if(time >TimeFrom && time < TimeTo){

                        self.allLogsTSTime.add(element.duration);
                          self.allLogs.push(element); 
                       }   
                   }); 
                    self.dataToShow =self.allLogs ;

                self.bidsData = []
                Object.values(self.Backup_bidsData).forEach(element => {
                    let time = moment(element.first_bid_time).unix()
                    if (time > TimeFrom && time < TimeTo) {
                        self.bidsData.push(element);
                    }
                });
                self.filterBids = self.bidsData.length
                self.completeReqData = []
                Object.values(self.Backup_completeReqData).forEach(element => {
                    let time = moment(element.request_data.createdAt).unix()
                    if (time > TimeFrom && time < TimeTo) {
                        self.completeReqData.push(element);
                    }
                });
                self.pendingReqData = []
                Object.values(self.Backup_pendingReqData).forEach(element => {
                    let time = moment(element.request_data.createdAt).unix()
                    if (time > TimeFrom && time < TimeTo) {
                        self.pendingReqData.push(element);
                    }
                })
                self.invoiceReqData = []
                Object.values(self.Backup_invoiceReqData).forEach(element => {
                    let time = moment(element.createdAt).unix()
                    if (time > TimeFrom && time < TimeTo) {
                        self.invoiceReqData.push(element);
                    }
                })
                self.invoiceComData = []
                Object.values(self.Backup_invoiceComData).forEach(element => {
                    let time = moment(element.createdAt).unix()
                    if (time > TimeFrom && time < TimeTo) {
                        self.invoiceComData.push(element);
                    }
                })
                self.walletData = []
                Object.values(self.Backup_walletData).forEach(element => {
                    let time = moment(element.addedAt).unix()
                    if (time > TimeFrom && time < TimeTo) {
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
                /*console.log(pend_req_data);
                 self.dataLoad2 = false;*/
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
                                self.invoiceComDataTotal += comInvItemData.commission_amount;
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
                            type: "driver_w"
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
        getLastRow: function (obj) {
            let keys = Object.keys(obj);
            let key_length = keys.length;
            return obj[keys[key_length - 1]];
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