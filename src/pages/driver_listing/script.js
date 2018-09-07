import firebase from 'firebase'
import func from '../../../custom_libs/func'
import moment from 'moment'
import progressbar from 'vue-progress-bar'
import router from 'vue-router'

import tableComp from '../../partials/components/html_utils/tabel_comp.vue'
import Datepicker from 'vuejs-datepicker';



export default {
    components: {
        'table_comp': tableComp,
        'progress-bar': progressbar,
        'date_picker': Datepicker,
    },
    created: function () {

        let self = this;
        const db = firebase.database();
        self.userRef = db.ref('/users');
        self.addaRef = db.ref('/adda_list');

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
                    var percent = (bar * 100) / 20;
                    self.progressValue[process_item] = percent

                    if (val.length === 20) {
                        item['time'] = moment(func.set_date_ser(new Date(func.decode_key(val)))).format("MM/DD/YYYY");
                    } else if (item.hasOwnProperty("createdAt")) {
                        item['time'] = moment(item.createdAt).format("MM/DD/YYYY");
                    }
                    grabData.push(item);
                    self.data2 = item;
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
            dataLoad: true,
            data1: [],
            data2: [],
            userRef: null,
            // profile: [],
            selectedIDs: [],
            counter: 45,
            max: 100,
            progressValue: [],
            removeID: "",
            data: "",
            info: "",
            addaDataKeys: [],
            addaList: [],
            selectedAdda: "Choose Adda",
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
        }
    },
    methods: {
        customFormatter(date) {
            return moment(date).format("MM/DD/YYYY");
        },
        al: function (v) {
            console.log(v);
        },
        changeSearch: function (e) {
 
            var UsersAO= this.UsersAOption ;
            var UsersBO= this.UsersBOption ;
            var SelectedAddaId = this.selectedAdda;
            var selectedVehicleID = this.selectedVehicle;
 
            let self = this;

            const db = firebase.database();
            self.userRef = db.ref('/users');
            self.addaRef = db.ref('/adda_list');


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
                        var percent = (bar * 100) / 20;
                        self.progressValue[process_item] = percent

                        if (val.length === 20) {
                            item['time'] = func.set_date_ser(new Date(func.decode_key(val)));
                        } else if (item.hasOwnProperty("createdAt")) {
                            item['time'] = moment(item.createdAt).format("MM/DD/YYYY");
                        } 

 




      if(SelectedAddaId =="Choose Adda" && selectedVehicleID =="Choose Vehicle"){
    d();
}else if(item['adda_ref'] == SelectedAddaId && selectedVehicleID == item['vehicle']){
    d();
}else if(SelectedAddaId =="Choose Adda"&& selectedVehicleID == item['vehicle']){
   d();
}else if(item['adda_ref'] == SelectedAddaId && selectedVehicleID =="Choose Vehicle"){
   d();
}
 

function d(){

if(UsersAO=="All" && UsersBO=="All"){ grabData.push(item);
}else if(UsersAO=="All" && UsersBO=="Blocked"){   if (item['blocked'] == true){  grabData.push(item);    }
}else if(UsersAO=="All" && UsersBO=="UnBlocked"){  if (item['blocked'] == false ){  grabData.push(item);    }////////////////////
}else if(UsersAO=="Actived" && UsersBO=="All"){  if(item['status'] == 1){   grabData.push(item);   }
}else if(UsersAO=="Actived" && UsersBO=="Blocked"){ if(item['status'] == 1 && item['blocked'] == true){  grabData.push(item);    }
}else if(UsersAO=="Actived" && UsersBO=="UnBlocked"){ if(item['status'] == 1 && item['blocked'] == false){  grabData.push(item);    } ////////////
}else if(UsersAO=="InActived" && UsersBO=="All"){  if(item['status'] == 0  ){   grabData.push(item);   }
}else if(UsersAO=="InActived" && UsersBO=="Blocked"){  if(item['status'] == 0 && item['blocked'] == true){   grabData.push(item);   }
}else if(UsersAO=="InActived" && UsersBO=="UnBlocked"){  if(item['status'] == 0 && item['blocked'] == false){ grabData.push(item);     } ///////////////////
}
 
}
 

 

                        self.data2 = item;
                        process_item++;
                        if (process_item === renderDataKeys.length) {
                            self.data1 = grabData;
                            self.dataLoad = false;
                        }
                    });
                }
            });
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
        select: function (key, index, event) {
            event.stopPropagation();
            let self = this;
            var IsAvailId = false;
            if (self.selectedIDs.length == 0) {
                self.selectedIDs.push(key);
            } else {

                self.data1.forEach(function (obj) {
                    if (obj.key == key) {
                        obj.selected = true;
                    }
                    // console.log(obj.selected+" "+obj.key);
                });

                self.selectedIDs.forEach(function (ID) {
                    if (ID == key) {
                        IsAvailId = false;
                    } else {
                        IsAvailId = true;
                    }
                });
                if (IsAvailId) {
                    self.selectedIDs.push(key);
                }

            }
            //console.log(self.selectedIDs)

        },
        unselect: function (key, index, event) {
            event.stopPropagation();

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