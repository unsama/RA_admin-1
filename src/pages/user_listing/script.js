import firebase from 'firebase'
import func from '../../../custom_libs/func'
import moment from 'moment'
import XLSX from 'xlsx'
import Datepicker from 'vuejs-datepicker';
import tableComp from '../../partials/components/html_utils/tabel_comp.vue'

export default {
    components: {
        'table_comp': tableComp,
        'date_picker': Datepicker,
    },
    created: function () {
        let self = this;

        const db = firebase.database();
        self.userRef = db.ref('/users');
        self.userRef.orderByChild('type').equalTo('client').on('value', function (snap) {
            let renderData = snap.val();
            self.data1 = [];
            if (renderData !== null) {
                let renderDataKeys = Object.keys(renderData);
                let process_item = 0;
                let grabData = [];
                renderDataKeys.forEach(function (val) {
                    let item = renderData[val];
                    item['key'] = val;
                    item['time'] = "";
                    if (val.length === 20) {
                        item['time'] = func.set_date_ser(new Date(func.decode_key(val)));
                    } else if (item.hasOwnProperty("createdAt")) {
                        item['time'] = moment(item.createdAt).format("hh:mm A DD/MMM/YYYY");
                    }
                    grabData.push(item);
                    process_item++;
                    if (process_item === renderDataKeys.length) {
                        self.data1 = grabData;
                        self.data1_ = grabData;
                        self.dataLoad = false;
                    }
                });
            }
        });
        if (self.$route.query.Activeusers) {
            self.UsersAOption = self.$route.query.Activeusers;
            if (self.$route.query.FromDate || self.$route.query.ToDate) {
                self.FromDate = moment.unix(self.$route.query.FromDate).format('DD/MMM/YYYY');
                self.ToDate = moment.unix(self.$route.query.ToDate).format('DD/MMM/YYYY'); 
            }
            self.changeSearch();
        }
    },
    data: function () {
        return {
            dataLoad: true,
            selectedUserIDs: [],
            CheckAll: false,
            data1: [],
            data1_: [],
            userRef: null,
            FromDate: "",
            ToDate: "",
            UsersAOption: "All",
        }
    },
    methods: {
        changeSearch() {
            let self = this;
            self.data1 = [];
            let FDate = '';
            let TDate = '';
            if (self.FromDate == '' || self.ToDate == '' || self.FromDate == null || self.ToDate == null) {} else {
                FDate = moment(self.FromDate).startOf('day').unix();
                TDate = moment(self.ToDate).endOf('day').unix();
            }
            self.data1_.forEach(user => {
                if (FDate == "" || TDate == "" || FDate == null || TDate == null) {
                    if (self.UsersAOption == 'Actived') {
                        if (user.status == 1) {
                            self.data1.push(user)
                        }
                    }
                    if (self.UsersAOption == 'InActived') { 
                        if (user.status == 0) {
                            self.data1.push(user)
                        }
                    }
                    if (self.UsersAOption == 'All') {

                        self.data1.push(user)
                    }
                } else {
                    if (moment(user.createdAt).unix() >= FDate && moment(user.createdAt).unix() <= TDate && self.UsersAOption == 'Actived') {
                        if (user.status == 1) {
                            self.data1.push(user)
                        }
                    }
                    if (moment(user.createdAt).unix() >= FDate && moment(user.createdAt).unix() <= TDate && self.UsersAOption == 'InActived') {
                         
                        if (user.status == 0) {
                            self.data1.push(user)
                        }
                    }
                    if (moment(user.createdAt).unix() >= FDate && moment(user.createdAt).unix() <= TDate && self.UsersAOption == 'All') {

                        self.data1.push(user)
                    }
                }
            });
        },
        EXPORT_File: function () {
            let _g = this;
            let data = [];
            _g.data1.forEach(user => {
                delete user.password;
                data.push(user);
            });

            /* make the worksheet */
            var ws = XLSX.utils.json_to_sheet(data);

            /* add to workbook */
            var wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Users");

            /* generate an XLSX file */
            XLSX.writeFile(wb, "ExportUsersData.xlsx");
        },
        CheckAlls: function (checkAll) {
            let self = this;
            self.selectedUserIDs = [];
            if (!checkAll) {
                self.data1.forEach(user => {
                    self.selectedUserIDs.push(user.key)
                });
            }
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

        block: function (key, index, event) {
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
        unblock: function (key, index, event) {
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