import firebase from 'firebase'
import func from '../../../custom_libs/func'
import moment from 'moment'
import _ from 'lodash'
import XLSX from 'xlsx'
import tableComp from '../../partials/components/html_utils/tabel_comp.vue'
import ListBids from '../../partials/components/modals/list_bids.vue'
import Datepicker from 'vuejs-datepicker'

 
let LiverootUID = 'DerqRbXa2iZYe8Lw3bTrxI4jtv92';
let LiveadminUID = 'EqSMcc6A2yfgKAjiVnLMaGD82P93';
export default {
    components: {
        'table_comp': tableComp,
        'date_picker': Datepicker,
        'list_bids': ListBids
    },
    created: function () {
        let self = this;
        firebase.auth().onAuthStateChanged((user) => {
            switch (user.uid) { 
 
                case LiverootUID:{self.isRoot = true; break}
                case LiveadminUID:{self.isRoot = false; break}    
            } 
        })
        const db = firebase.database();
        //const storage = firebase.storage();
        self.userRef = db.ref('/users');
        self.userReqRef = db.ref('/user_requests');
        self.completeReqRef = db.ref('/complete_requests');
        self.driverBidsRef = db.ref('/driver_bids');
        self.userRequestsRef = db.ref('/user_requests');
        self.userRequestInvoicesRef = db.ref('/user_request_invoices');
        self.driverCommissionInvoicesRef = db.ref('/driver_commission_invoices');
        self.deletedRequestsRef = db.ref('/deleted_requests');
        self.walletRef = db.ref('/wallet');
        self.completeRequestListener();
        if (self.$route.query.FromDate || self.$route.query.ToDate) { 
            self.FromDate = moment.unix(self.$route.query.FromDate ).format("DD/MMM/YYYY");
            self.ToDate = moment.unix(self.$route.query.ToDate).format("DD/MMM/YYYY");
            self.FilterData();
        }
    },
    destroyed() {
        this.completeReqRef.off();
    },
    data: function () {
        return {
            isRoot:false,
            search_t: "",
            SelectedRequest: [],
            dataLoad: true,
            all: [],
            week: [],
            today: [],
            all_: [],
            week_: [],
            today_: [],
            userRef: null,
            userReqRef: null,
            completeReqRef: null,
            driverBidsRef: null,
            userRequestsRef: null,
            parcelImagesRef: null,
            parcelThumbsRef: null,
            deletedRequestsRef:null,
            userRequestInvoicesRef:null,
            ImGRef:null,
            walletRef: null,
            driverCommissionInvoicesRef: null,
            assign_req_id_md: '',
            reqestTime: '',
            FromDate: "",
            ToDate: "",
            IsBackuped: false,
            ExportOptions: ["All"],
            SelectToday: false,
            SelectWeek: false,
            SelectAll: false,
        }
    },
    methods: {
        deleteData: function () {
            let self = this;
            self.dataLoad = true;

            let DeleteList = [];

            self.userRequestsRef.once('value', snap => {
                snap.forEach(el => {
                    let A__key = el.key;
                    Object.keys(el.val()).forEach(sbel => {
                        self.SelectedRequest.forEach(id => {
                            if (id == sbel) {
                                DeleteList.push(A__key + '/' + sbel);
                                //console.log('data matched');
                            }
                        });
                    });
                });
               // console.log("Start")
                DeleteList.forEach(id => {

                    //console.log(id);
                    let ids = id.split("/");
                    self.deletedRequestsRef.child(ids[1]).set('Deleted');
                    self.userRequestsRef.child(id).remove()     //////////// Delete From 
                    self.driverBidsRef.child(ids[1]).remove()     //////////// Delete From 
 

                    self.completeReqRef.child(ids[1]).remove()     //////////// Delete From 

                    self.userRequestInvoicesRef.orderByChild('req_id').equalTo(ids[1]).once("value", function (snapshotUserReq) {
                        snapshotUserReq.forEach(function (data) {

                            self.walletRef.orderByChild('narration').once('value', snap => {
                                let IDDATA = ('U' + data.val().invoice_no);
                                snap.forEach(wData => {
                                    let IDVALUE = wData.val().narration;
                                    let VARFORMATCHING = IDVALUE.substr(IDVALUE.length - IDDATA.length);
                                    if (VARFORMATCHING == IDDATA) {
                                        self.walletRef.child(wData.key).remove()     //////////// Delete From 
                                    }
                                });
                            })
                            self.userRequestInvoicesRef.child(data.key).remove(e=>{ console.log("Done>"); })  //////////// Delete From 
                        });
                           
                    });
                    
                    self.driverCommissionInvoicesRef.orderByChild('req_id').equalTo(ids[1]).once("value", function (snapshot) {
                        snapshot.forEach(function (data) {
                            self.driverCommissionInvoicesRef.child(data.key).remove()     //////////// Delete From 
                        });
                    })

                });

                //console.log("End")
            });


            self.completeRequestListener();
            self.dataLoad = !true;
        },

        toggleSelectToday: function () {
            let self = this;
            self.SelectToday = !self.SelectToday;
            let TodayRequests = [];
            self.week.forEach(req => {
                TodayRequests.push(req.reqData.id)
            });
            if (self.SelectToday) {
                self.SelectedRequest = self.SelectedRequest.filter(function (el) {
                    return !TodayRequests.includes(el);
                });
                self.SelectedRequest = self.SelectedRequest.concat(TodayRequests)
            } else {
                self.SelectedRequest = self.SelectedRequest.filter(function (el) {
                    return !TodayRequests.includes(el);
                });

            }

            if (self.SelectToday) {} else {}
        },
        toggleSelectWeek: function () {
            let self = this;
            self.SelectWeek = !self.SelectWeek;
            let WeekRequests = [];
            self.week.forEach(req => {
                WeekRequests.push(req.reqData.id)
            });


            if (self.SelectWeek) {
                self.SelectedRequest = self.SelectedRequest.filter(function (el) {
                    return !WeekRequests.includes(el);
                });
                self.SelectedRequest = self.SelectedRequest.concat(WeekRequests)
            } else {
                self.SelectedRequest = self.SelectedRequest.filter(function (el) {
                    return !WeekRequests.includes(el);
                });


            }
        },
        toggleSelectAll: function () {
            let self = this;
            self.SelectAll = !self.SelectAll;

            self.SelectedRequest = [];
            if (self.SelectAll) {
                self.all.forEach(req => {
                    self.SelectedRequest.push(req.reqData.id)
                });
                self.SelectToday = true;
                self.SelectWeek = true;
            } else {
                self.SelectToday = false;
                self.SelectWeek = false;
            }
        },
        FilterData: function () {
            let self = this;
            if (!self.IsBackuped) {
                self.all_ = self.all;
                self.week_ = self.week;
                self.today_ = self.today;
                self.IsBackuped = true;
            }


            let searches = _.filter(self.search_t.toLowerCase().split(";"), function (srh) {
                if (srh !== "") {
                    return srh;
                }
            });
            let TextedFiltered = [];
 
            self.all_.forEach((row, ind) => {
                let DataArray = [];

                try { DataArray.push((ind + 1).toString())  } catch (e) {}
                try { DataArray.push((self.dateFormat(row.reqData.createdAt)).toString().toLowerCase()) } catch (e) {}
                try { DataArray.push((row.reqData.id).toString().toLowerCase()) } catch (e) {}
                try { DataArray.push((row.clientData.first_name).toString().toLowerCase())} catch (e) {}
                try { DataArray.push((row.clientData.last_name).toString().toLowerCase())} catch (e) {}
                try { DataArray.push((row.clientData.mob_no).toString().toLowerCase())} catch (e) {}
                try { DataArray.push((row.Bids).toString().toLowerCase())} catch (e) {}
                try { DataArray.push((row.driverData.first_name).toString().toLowerCase())} catch (e) {}
                try { DataArray.push((row.driverData.last_name).toString().toLowerCase())} catch (e) {}
                try { DataArray.push((row.driverData.mob_no).toString().toLowerCase())} catch (e) {}
                try { DataArray.push((row.reqData.orgText).toString().toLowerCase())} catch (e) {}
                try { DataArray.push((row.reqData.desText).toString().toLowerCase())} catch (e) {}
                try { DataArray.push((row.reqData.disText).toString().toLowerCase())} catch (e) {}
                try { DataArray.push((row.reqData.durText).toString().toLowerCase())} catch (e) {}
                try { DataArray.push((row.reqData.vecType).toString().toLowerCase())} catch (e) {}
                try { DataArray.push((row.driverData.vehicle).toString().toLowerCase())} catch (e) {}
                try { DataArray.push((self.dateFormat(row.compReqData.reach_time)).toString().toLowerCase() )  } catch (e) {}
                try { DataArray.push((self.dateFormat(row.compReqData.active_time)).toString().toLowerCase() ) } catch (e) {}
                try { DataArray.push((self.dateFormat(row.compReqData.complete_time)).toString().toLowerCase() ) } catch (e) {}
                try { DataArray.push((row.compReqData.rating).toString().toLowerCase())} catch (e) {}
                try { DataArray.push((row.reqData.labours).toString().toLowerCase())} catch (e) {}
                try { DataArray.push((row.reqData.floors).toString().toLowerCase())} catch (e) {}

                let matched = [];
                searches.forEach(sear => {
                    let m = false;
                    DataArray.forEach((de) => { 
                        if (de.includes(sear)) {
                            m = true;
                        }
                    })
                    matched.push(m);
                });
                let canPut = true;
                matched.forEach(matchey => {
                    if (!matchey) canPut = false;
                });
                if (canPut) {
                    TextedFiltered.push(row);
                }
            })




            let startTime = self.FromDate == "" ? '' : self.FromDate == undefined ? '' : moment(self.FromDate).startOf('day').unix()
            let endTime = self.ToDate == "" ? '' : self.ToDate == undefined ? '' : moment(self.ToDate).endOf('day').unix()



            self.all = [];
            TextedFiltered.forEach(function (item, ind) {
                if ((moment(item.reqData.createdAt).unix() >= startTime && moment(item.reqData.createdAt).unix() <= endTime) || (startTime == '' || endTime == '')) {
                    self.all.push(item);
                }
            });
            self.week = [];
            self.week_.forEach(function (item) {
                if (moment(item.reqData.createdAt).unix() >= startTime && moment(item.reqData.createdAt).unix() <= endTime) {
                    self.week.push(item);
                }
            });
            self.today = [];
            self.today_.forEach(function (item) {
                if (moment(item.reqData.createdAt).unix() >= startTime && moment(item.reqData.createdAt).unix() <= endTime) {
                    self.today.push(item);
                }
            });

        },
        exportData() {

            let self = this;

            function F(Data) {
                let Fdata = [];
                Data.forEach((row, ind) => {

                    Fdata.push({
                        "#": ind + 1,
                        "Date": self.dateFormat(row.reqData.createdAt),
                        "Request No.": row.reqData.id,
                        "Client Name": row.clientData.first_name + " " + row.clientData.last_name,
                        "Client Number": row.clientData.mob_no,
                        "Bids": row.Bids,
                        "Driver Name": row.driverData.first_name + " " + row.driverData.last_name,
                        "Driver Number": row.driverData.mob_no,
                        "Origin": row.reqData.orgText,
                        "Destination": row.reqData.desText,
                        "Distance": row.reqData.disText,
                        "Duration": row.reqData.durText,
                        "Required Vehicle": row.reqData.vecType,
                        "Driver Vehicle": row.driverData.vehicle,
                        "Reach Time": self.dateFormat(row.compReqData.reach_time),
                        "Start Time": self.dateFormat(row.compReqData.active_time),
                        "Completed Time": self.dateFormat(row.compReqData.complete_time),
                        "Parcel Rating": row.compReqData.rating,
                        "Labours": row.reqData.labours,
                        "Floors": row.reqData.floors
                    })

                });
                return Fdata;
            }

            let XAllData = F(self.all);
            let XTodayData = F(self.today);
            let XWeekData = F(self.week);

            var wsall = XLSX.utils.json_to_sheet(XAllData);
            var wstoday = XLSX.utils.json_to_sheet(XTodayData);
            var wsweek = XLSX.utils.json_to_sheet(XWeekData);

            var wb = XLSX.utils.book_new();
            self.ExportOptions.forEach(opt => {
                switch (opt) {
                    case 'All':
                        XLSX.utils.book_append_sheet(wb, wsall, "All Completed Requests");
                        break
                    case 'Week':
                        XLSX.utils.book_append_sheet(wb, wsweek, "Week Completed Requests");
                        break
                    case 'Today':
                        XLSX.utils.book_append_sheet(wb, wstoday, "Today Completed Requests");
                        break
                }
            });

            /* generate an XLSX file */

            try {
                XLSX.writeFile(wb, "Export_Completed_Requests_Data.xlsx");

            } catch (e) {
                alert("Select Any One Option For Export");
            }

        },
        dateFormat(ms) {
            return moment(ms).format("hh:mm A, DD/MMM/YYYY")
        },
        openBidsReq(req_id, req_time) {
            this.assign_req_id_md = req_id;
            this.reqestTime = req_time;
        },
        genWeekDays() {
            let grabDates = []
            let m_date = moment();
            grabDates.push(m_date.format('DD/MMM/YYYY'))
            for (let i = 1; i < 7; i++) {
                grabDates.push(m_date.subtract(1, 'd').format('DD/MMM/YYYY'))
            }
            return grabDates
        },
        async completeRequestListener() {
            const self = this;
            // snap means total number of snapshot in complete request list
            await self.completeReqRef.once('value', async function (snap) {
                self.dataLoad = true;
                self.all = [];
                self.week = [];
                self.today = [];

                let grabData = [];

                if (snap.numChildren() > 0) {

                    // compReqSnap means inner item in complete request list
                    await Promise.all(_.map(snap.val(), async (compReqData, key) => {
                        let reqSnap = await self.userReqRef.child(compReqData.client_uid + "/" + key).once('value')
                        // console.log(reqSnap.id)
                        let clientSnap = await self.userRef.child(compReqData.client_uid).once('value')
                        let driverSnap = await self.userRef.child(compReqData.driver_uid).once('value')
                        let BidsSnap = await self.driverBidsRef.child(reqSnap.key).once('value')
                        let CountBids = 0;
                        try {
                            CountBids = Object.values(BidsSnap.val()).length;
                        } catch (ex) {}
                        if (CountBids === null) {
                            CountBids = 0;
                        }
                        grabData.push({
                            compReqData,
                            reqData: reqSnap.val(),
                            clientData: clientSnap.val(),
                            driverData: driverSnap.val(),
                            BidsData: BidsSnap.val(),
                            Bids: CountBids
                        });
                    }))

                    // sorted here desc/asc
                    self.all = await _.orderBy(grabData, function (row) {
                        let createdAtD = '';
                        try {
                            createdAtD = row.reqData.createdAt
                        } catch (ex) {}
                        return createdAtD
                    }, ['desc'])
                    self.all_ = await _.orderBy(grabData, function (row) {
                        let createdAtD = '';
                        try {
                            createdAtD = row.reqData.createdAt
                        } catch (ex) {}
                        return createdAtD
                    }, ['desc'])

                    // grabdata for today date
                    let today_grabData = [];
                    const today_date = moment().format("DD/MMM/YYYY")
                    await Promise.all(_.map(self.all, async (row) => {
                        const req_date = moment(row.reqData.createdAt).format("DD/MMM/YYYY");
                        if (req_date === today_date) {
                            today_grabData.push(row)
                        }
                    }))
                    self.today_ = today_grabData;
                    self.today = today_grabData;

                    // grabdata here week dates
                    let week_dates = await self.genWeekDays()
                    let week_grabData = []
                    await Promise.all(_.map(self.all, async (row) => {
                        const req_date = moment(row.reqData.createdAt).format("DD/MMM/YYYY");
                        const search = await _.find(week_dates, function (date) {
                            return date === req_date
                        })
                        if (typeof search !== 'undefined') {
                            week_grabData.push(row)
                        }
                    }))
                    self.week_ = week_grabData;
                    self.week = week_grabData;
                    self.dataLoad = false;
                } else {
                    self.dataLoad = false;
                }
            });
        }
    }
}