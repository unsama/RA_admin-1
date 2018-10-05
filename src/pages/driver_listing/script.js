import firebase from 'firebase'
import func from '../../../custom_libs/func'
import moment from 'moment'
import progressbar from 'vue-progress-bar'
import router from 'vue-router'

import XLSX from 'xlsx'

import tableComp from '../../partials/components/html_utils/tabel_comp.vue'
import Datepicker from 'vuejs-datepicker';
import vueMultiselect from 'vue-multiselect';


export default {
    components: {
        'table_comp': tableComp,
        'progress-bar': progressbar,
        'date_picker': Datepicker,
        'vue-multiselect': vueMultiselect,
    },
    created: function () {

        let self = this;
        const db = firebase.database();
        self.userRef = db.ref('/users');
        self.addaRef = db.ref('/adda_list');
        self.onlineDriversRef = db.ref('/online_drivers');

        let DataA = [];

        self.addaRef.on('value', function (addasnap) {

            addasnap.forEach(function (addaitem) {

                var dt = addaitem.val()
                if (dt !== null) {
                    let d = Object.keys(dt);
                    var obj = {};
                    d.forEach(function (val) {
                        obj["id"] = dt['id'];
                        obj["name"] = dt['place_name'];
                    });
                    DataA.push(obj);
                }
            });
        });
        self.addaList = DataA;
        self.userRef.orderByChild('type').equalTo('driver').on('value', function (snap) {

            let renderData = snap.val();
            self.data1 = [];
            if (renderData !== null) {
                let renderDataKeys = Object.keys(renderData);
                let process_item = 0;
                let grabData = [];
                renderDataKeys.forEach(function (val) {
                    let item = renderData[val];
                    //item['selected'] = false;
                    item['key'] = val;
                    item['time'] = "";
                    item['place_name'] = "";
                    if (item.hasOwnProperty("adda_ref")) {
                        self.addaRef.orderByChild('id').equalTo(item.adda_ref).on('value', function (addasnap) {
                            let addaData = addasnap.val();
                            let addadatkeys = Object.keys(addaData);
                            addadatkeys.forEach(function (val) {

                                let addaitem = addaData[val];
                                item['place_name'] = addaitem.place_name;
                            });
                        });
                    }
                    var bar = Object.keys(item).length;
                    var percent = (bar * 100) / 22; //////
                    self.progressValue[process_item] = percent

                    if (val.length === 20) {
                        //item['time'] = moment(func.set_date_ser(new Date(func.decode_key(val)))).format("DD/MMM/YYYY");
                        item['time'] = moment(new Date(func.decode_key(val))).format("DD/MMM/YYYY");
                    } else if (item.hasOwnProperty("createdAt")) {
                        item['time'] = moment(item.createdAt).format("DD/MMM/YYYY");
                    }
                    grabData.push(item);
                    // self.data2 = item;
                    process_item++;
                    if (process_item === renderDataKeys.length) {
                        self.data1 = grabData;
                        self.dataLoad = false;
                    }
                });
            }

        });

    },
    data: function () {
        return {
            Addavalues: [],
            selectedAddaList: [],
            dataLoad: true,
            data1: [],
            // data2: [],
            userRef: null,
            onlineDriversRef: null,
            // profile: [],
            selectedIDs: [],
            selectedAllIDs: false,
            counter: 45,
            max: 100,
            progressValue: [],
            removeID: "",
            data: "",
            info: "",
            addaDataKeys: [],
            addaList: [],
            // selectedAdda: "Choose Adda",
            selectedVehicle: "Choose Vehicle",
            pPage: 10,
            ActiveUsers: "",
            BlockedUsers: "",
            FromDate: "",
            ToDate: "",
            SearchActived: "",
            SearchBlocked: "",
            UsersAOption: "All",
            UsersBOption: "All",
            UsersCOption: "All",
        }
    },
    methods: {

        customLabel(option) {
            return `${option.name}` //- ${option.language}

        },

        checkAllDrivers(v) {
            let self = this;
            self.selectedIDs = [];
            if (!v) {
                self.data1.forEach(item => {
                    self.selectedIDs.push(item.key)
                });
            }
        },

        customFormatter(date) {
            return moment(date).format("DD/MMM/YYYY");
        },

        changeSearch: function (e) {


            var startDate = this.FromDate === null ? '' : this.FromDate;
            var endDate = this.ToDate === null ? '' : this.ToDate;

            var UsersAO = this.UsersAOption;
            var UsersBO = this.UsersBOption;
            var UsersCO = this.UsersCOption;
            var SelectedAddaIds = [];
            this.Addavalues.forEach(addaVal => {
                SelectedAddaIds.push(addaVal.id);
            });
            var selectedVehicleID = this.selectedVehicle;
            let self = this;

            const db = firebase.database();
            self.userRef = db.ref('/users');
            self.addaRef = db.ref('/adda_list');
            self.onlineDriversRef = db.ref('/online_drivers');


            let DataA = [];

            self.addaRef.on('value', function (addasnap) {

                addasnap.forEach(function (addaitem) {

                    var dt = addaitem.val()
                    if (dt !== null) {
                        let d = Object.keys(dt);
                        var obj = {};
                        d.forEach(function (val) {
                            obj["id"] = dt['id'];
                            obj["name"] = dt['place_name'];
                        });
                        DataA.push(obj);
                    }
                });
            });
            self.addaList = DataA;

            self.userRef.orderByChild('type').equalTo('driver').on('value', function (snap) {

                let renderData = snap.val();
                self.data1 = [];
                if (renderData !== null) {
                    let renderDataKeys = Object.keys(renderData);
                    let process_item = 0;
                    let grabData = [];
                    renderDataKeys.forEach(function (val) {
                        let item = renderData[val];
                        item['selected'] = false;
                        item['key'] = val;
                        item['time'] = "";
                        item['place_name'] = "";
                        if (item.hasOwnProperty("adda_ref")) {

                            self.addaRef.orderByChild('id').equalTo(item.adda_ref).on('value', function (addasnap) {
                                let addaData = addasnap.val();
                                let addadatkeys = Object.keys(addaData);
                                addadatkeys.forEach(function (val) {

                                    let addaitem = addaData[val];
                                    item['place_name'] = addaitem.place_name;
                                });
                            });
                        }
                        var bar = Object.keys(item).length;
                        //var percent = (bar * 100) / 20;
                        var percent = (bar * 100) / 22;
                        self.progressValue[process_item] = percent

                        if (val.length === 20) {
                            //item['time'] = func.set_date_ser(new Date(func.decode_key(val)));
                            // item['time'] = moment(func.set_date_ser(new Date(func.decode_key(val)))).format("DD/MMM/YYYY");
                            item['time'] = moment(new Date(func.decode_key(val))).format("DD/MMM/YYYY");
                        } else if (item.hasOwnProperty("createdAt")) {
                            item['time'] = moment(item.createdAt).format("DD/MMM/YYYY");
                        }
                        var SelectedAddaId = "Choose Adda";
                        let OnlineDrivers = [];
                        self.onlineDriversRef.once('value', function (activeDriverssnap) {
                            activeDriverssnap.forEach(function (activeDriver) {
                                OnlineDrivers.push(activeDriver.key);

                            });
                            if (UsersCO == "Online") {
                                let DriverOffline = false;
                                OnlineDrivers.forEach(id => {
                                    if (id == item['key']) {
                                        DriverOffline = true;
                                    }
                                });
                                if (DriverOffline) {
                                    a0();
                                }

                            } else if (UsersCO == "Offline") {
                                let DriverOffline = false;
                                OnlineDrivers.forEach(id => {
                                    if (id == item['key']) {
                                        DriverOffline = true;
                                    }
                                });
                                if (!DriverOffline) {
                                    a0();
                                }
                            } else {
                                a0();
                            }
                        })


                        ////////////

                        function a0() {

                            if (!SelectedAddaIds.length) {

                                if (startDate == "" && endDate == "") {
                                    a();
                                } else if (moment(startDate).unix() <= moment(item['time']).unix() && moment(endDate).unix() >= moment(item['time']).unix()) {
                                    a();
                                }
                            } else {
                                SelectedAddaIds.forEach(id => {
                                    SelectedAddaId = id;

                                    if (startDate == "" && endDate == "") {
                                        a();
                                    } else if (moment(startDate).unix() <= moment(item['time']).unix() && moment(endDate).unix() >= moment(item['time']).unix()) {
                                        a();
                                    }
                                });
                            }
                        }

                        function a() {


                            if (SelectedAddaId == "Choose Adda" && selectedVehicleID == "Choose Vehicle") {
                                d();
                            } else if (item['adda_ref'] == SelectedAddaId && selectedVehicleID == item['vehicle']) {
                                d();
                            } else if (SelectedAddaId == "Choose Adda" && selectedVehicleID == item['vehicle']) {
                                d();
                            } else if (item['adda_ref'] == SelectedAddaId && selectedVehicleID == "Choose Vehicle") {
                                d();
                            }
                        }

                        function d() {

                            if (UsersAO == "All" && UsersBO == "All") {
                                grabData.push(item);
                            } else if (UsersAO == "All" && UsersBO == "Blocked") {
                                if (item['blocked'] == true) {
                                    grabData.push(item);
                                }
                            } else if (UsersAO == "All" && UsersBO == "UnBlocked") {
                                if (item['blocked'] == false) {
                                    grabData.push(item);
                                } ////////////////////
                            } else if (UsersAO == "Actived" && UsersBO == "All") {
                                if (item['status'] == 1) {
                                    grabData.push(item);
                                }
                            } else if (UsersAO == "Actived" && UsersBO == "Blocked") {
                                if (item['status'] == 1 && item['blocked'] == true) {
                                    grabData.push(item);
                                }
                            } else if (UsersAO == "Actived" && UsersBO == "UnBlocked") {
                                if (item['status'] == 1 && item['blocked'] == false) {
                                    grabData.push(item);
                                } ////////////
                            } else if (UsersAO == "InActived" && UsersBO == "All") {
                                if (item['status'] == 0) {
                                    grabData.push(item);
                                }
                            } else if (UsersAO == "InActived" && UsersBO == "Blocked") {
                                if (item['status'] == 0 && item['blocked'] == true) {
                                    grabData.push(item);
                                }
                            } else if (UsersAO == "InActived" && UsersBO == "UnBlocked") {
                                if (item['status'] == 0 && item['blocked'] == false) {
                                    grabData.push(item);
                                } ///////////////////
                            }

                        }




                        // self.data2 = item;
                        process_item++;
                        if (process_item === renderDataKeys.length) {
                            self.data1 = grabData;
                            self.dataLoad = false;
                        }
                    });
                }
            });
            this.$emit('update');
        },

        deActive: function (key, index, event) {
            event.stopPropagation();
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
        ExportData: function () {
            let self = this; 
            let DriverS = [];
            self.data1.forEach((driver, index) => {
                DriverS.push({
                    "#": index + 1,
                    "Driver Name": driver.first_name + " " + driver.last_name,
                    "Driver Email": driver.email,
                    "Mobile#": driver.mob_no,
                    "Adda Name": driver.place_name,
                    "CNIC#": driver.cnic_no,
                    "Vehicle Type": driver.vehicle,
                    "Created Time": driver.time,
                    "Action": driver.status,
                    "Status": driver.blocked
                })
            }); 
        var ws = XLSX.utils.json_to_sheet(DriverS);
         
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Drivers");
         
        XLSX.writeFile(wb, "ExportDriversData.xlsx");
        },

        active: function (key, index, event) {
            event.stopPropagation();
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
        block: function (key, index) {
            event.stopPropagation();
            let self = this;
            if (self.userRef) {
                self.userRef.child(key).update({
                    blocked: true
                }, function (err) {
                    if (err) {
                        console.log(err)
                    } else {

                        self.data1.splice(index, 1);
                    }
                });
            }
        },
        unblock: function (key, index) {
            event.stopPropagation();
            let self = this;
            if (self.userRef) {
                self.userRef.child(key).update({
                    blocked: false
                }, function (err) {
                    if (err) {
                        console.log(err)
                    } else {

                        self.data1.splice(index, 1);
                    }
                });
            }
        },
    }
}