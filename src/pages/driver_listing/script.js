// import firebase from 'firebase'
// import func from '../../../custom_libs/func'
// import moment from 'moment'
// import progressbar from 'vue-progress-bar'
// import _ from 'lodash'
//
//
// import tableComp from '../../partials/components/html_utils/tabel_comp.vue'
//
// export default {
//     components: {
//         'table_comp': tableComp,
//         'progress-bar': progressbar,
//     },
//     created: function () {
//         let self = this;
//
//         const db = firebase.database();
//         self.userRef = db.ref('/users');
//         self.addaListRef = db.ref('/adda_list');
//
//         self.userRef.orderByChild('type').equalTo('driver').on('value', function (snap) {
//             let renderData = snap.val();
//             self.data1 = [];
//             if (renderData !== null) {
//                 let renderDataKeys = Object.keys(renderData);
//                 let process_item = 0;
//                 let grabData = [];
//                 renderDataKeys.forEach(function (val) {
//                     let item = renderData[val];
//                     item['key'] = val;
//                     item['time'] = "";
//                     item['adda_name'] = "";
//                     var bar = Object.keys(item).length;
//                     var percent = (bar * 100) / 20;
//                     self.progressValue[process_item] = percent;
//                     if (val.length === 20) {
//                         item['time'] = func.set_date_ser(new Date(func.decode_key(val)));
//                     } else if (item.hasOwnProperty("createdAt")) {
//                         item['time'] = moment(item.createdAt).format("hh:mm A DD/MM/YYYY");
//                     }
//                     if (item.adda_ref!==null){
//                         self.addaListRef.orderByChild('id').on('child_added', function (addasnap) {
//                             let addaData = addasnap.val();
//
//                         });
//                     }
//
//                     grabData.push(item);
//                     process_item++;
//                     if (process_item === renderDataKeys.length) {
//                         self.data1 = grabData;
//                         self.dataLoad = false;
//                     }
//
//                 });
//             }
//
//         });
//
//     },
//     data: function () {
//         return {
//             dataLoad: true,
//             data1: [],
//             userRef: null,
//             profile: [],
//             counter: 45,
//             max: 100,
//             progressValue: [],
//             removeID: "",
//         }
//     },
//     methods: {
//         deActive: function (key, index, event) {
//             event.stopPropagation();
//             let self = this;
//             if(self.userRef){
//                 self.userRef.child(key).update({
//                     status: 0
//                 }, function (err) {
//                     if(err){
//                         console.log(err)
//                     }
//                 });
//             }
//         },
//         active: function (key, index, event) {
//             event.stopPropagation();
//             let self = this;
//             if(self.userRef){
//                 self.userRef.child(key).update({
//                     status: 1
//                 }, function (err) {
//                     if(err){
//                         console.log(err)
//                     }
//                 });
//             }
//         },
//         block: function (key, index) {
//             event.stopPropagation();
//             let self = this;
//             if(self.userRef){
//                 self.userRef.child(key).update({
//                     blocked: true
//                 }, function (err) {
//                     if(err){
//                         console.log(err)
//                     }else{
//
//                         self.data1.splice(index, 1);
//                     }
//                 });
//             }
//         },
//         unblock: function (key, index) {
//             event.stopPropagation();
//             let self = this;
//             if(self.userRef){
//                 self.userRef.child(key).update({
//                     blocked: false
//                 }, function (err) {
//                     if(err){
//                         console.log(err)
//                     }else{
//
//                         self.data1.splice(index, 1);
//                     }
//                 });
//             }
//         },
//     }
// }

import firebase from 'firebase'
import func from '../../../custom_libs/func'
import moment from 'moment'
import progressbar from 'vue-progress-bar'


import tableComp from '../../partials/components/html_utils/tabel_comp.vue'

export default {
    components: {
        'table_comp': tableComp,
        'progress-bar': progressbar,
    },
    created: function () {
        let self = this;

        const db = firebase.database();
        self.userRef = db.ref('/users');
        self.addaListRef = db.ref('/adda_list');

        self.userRef.orderByChild('type').equalTo('driver').on('value', function (snap) {
            self.addaListRef.orderByChild('place_name').on('value', function (addasnap) {
                let addadata = addasnap.val();

                let renderData = snap.val();
                self.data1 = [];
                if (renderData !== null) {
                    let renderDataKeys = Object.keys(renderData);
                    let addaDataKeys = Object.keys(addadata);
                    let process_item = 0;
                    let grabData = [];
                    let grabData2 = [];
                    renderDataKeys.forEach(function (val) {
                        let item = renderData[val];
                        let item2 = addadata[addaDataKeys[process_item]];
                        item['key'] = val;
                        item['time'] = "";
                        var bar = Object.keys(item).length;
                        var percent = (bar * 100) / 20;
                        self.progressValue[process_item] = percent;
                        if (val.length === 20) {
                            item['time'] = func.set_date_ser(new Date(func.decode_key(val)));
                        } else if (item.hasOwnProperty("createdAt")) {
                            item['time'] = moment(item.createdAt).format("hh:mm A DD/MM/YYYY");
                        }
                        grabData.push(item);
                        grabData2.push(item2);
                        process_item++;
                        if (process_item === renderDataKeys.length) {
                            self.data1['renderData'] = grabData;
                            self.data1['addadata'] = grabData2;
                            self.dataLoad = false;
                        }


                    });
                    console.log(self.data1);
                }

            });
        });
    },

    data: function () {
        return {
            dataLoad: true,
            data1: [],
            userRef: null,
            profile: [],
            counter: 45,
            max: 100,
            progressValue: [],
            removeID: "",

            invData: null,
            userReqInvoiceRef: null,
            userReqRef: null,

            walletRef: null,
            afterdis: '',
            disprice: '',
        }
    },
    methods: {
        deActive: function (key, index, event) {
            event.stopPropagation();
            let self = this;
            if(self.userRef){
                self.userRef.child(key).update({
                    status: 0
                }, function (err) {
                    if(err){
                        console.log(err)
                    }
                });
            }
        },
        active: function (key, index, event) {
            event.stopPropagation();
            let self = this;
            if(self.userRef){
                self.userRef.child(key).update({
                    status: 1
                }, function (err) {
                    if(err){
                        console.log(err)
                    }
                });
            }
        },
        block: function (key, index) {
            event.stopPropagation();
            let self = this;
            if(self.userRef){
                self.userRef.child(key).update({
                    blocked: true
                }, function (err) {
                    if(err){
                        console.log(err)
                    }else{

                        self.data1.splice(index, 1);
                    }
                });
            }
        },
        unblock: function (key, index) {
            event.stopPropagation();
            let self = this;
            if(self.userRef){
                self.userRef.child(key).update({
                    blocked: false
                }, function (err) {
                    if(err){
                        console.log(err)
                    }else{

                        self.data1.splice(index, 1);
                    }
                });
            }
        },
    }
}