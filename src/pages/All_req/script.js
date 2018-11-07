import firebase from 'firebase'
import func from '../../../custom_libs/func'
import moment from 'moment'
import _ from 'lodash'
import XLSX from 'xlsx'
import tableComp from '../../partials/components/html_utils/tabel_comp.vue'
import ListBids from '../../partials/components/modals/list_bids.vue'
import Datepicker from 'vuejs-datepicker'
import {
    isUndefined
} from 'util';

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

                case LiverootUID:
                    {
                        self.isRoot = true;;
                        break
                    }
                case LiveadminUID:
                    {
                        self.isRoot = false; //self.$router.push('/admin');;
                        break
                    }


            }
        })
        const db = firebase.database();
        self.userRef = db.ref('/users');
        self.userReqRef = db.ref('/user_requests');
        self.completeReqRef = db.ref('/complete_requests');
        self.driverBidsRef = db.ref('/driver_bids');
        self.userRequestsRef = db.ref('/user_requests');
        self.userRequestInvoicesRef = db.ref('/user_request_invoices');
        self.driverCommissionInvoicesRef = db.ref('/driver_commission_invoices');
        self.deletedRequestsRef = db.ref('/deleted_requests');
        self.walletRef = db.ref('/wallet');
        self.cancelRequestListener();
        if (self.$route.query.FromDate || self.$route.query.ToDate) {
            self.FromDate = moment.unix(self.$route.query.FromDate ).format("DD/MMM/YYYY");
            self.ToDate = moment.unix(self.$route.query.ToDate).format("DD/MMM/YYYY");
            self.FilterData();
        }



    },
    destroyed() {
        this.userReqRef.off();
    },
    data: function () {
        return {
            selectedOption: 'All',
            isRoot: false,
            iti: 0,
            search_t: "",
            IsBackuped: false,
            dataLoad: true,
            SelectedRequest: [],
            SelectToday: false,
            SelectWeek: false,
            SelectAll: false,
            all: [],
            week: [],
            today: [],
            all_: [],
            week_: [],
            today_: [],
            userRef: null,
            userReqRef: null,
            driverBidsRef: null,
            user_requestsRef: null,
            deletedRequestsRef: null,
            assign_req_id_md: '',
            reqestTime: '',
            ExportOptions: ["All"],
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
                    self.userRequestsRef.child(id).remove() //////////// Delete From 
                    self.driverBidsRef.child(ids[1]).remove() //////////// Delete From 


                    self.completeReqRef.child(ids[1]).remove() //////////// Delete From 

                    self.userRequestInvoicesRef.orderByChild('req_id').equalTo(ids[1]).once("value", function (snapshotUserReq) {
                        snapshotUserReq.forEach(function (data) {

                            self.walletRef.orderByChild('narration').once('value', snap => {
                                let IDDATA = ('U' + data.val().invoice_no);
                                snap.forEach(wData => {
                                    let IDVALUE = wData.val().narration;
                                    let VARFORMATCHING = IDVALUE.substr(IDVALUE.length - IDDATA.length);
                                    if (VARFORMATCHING == IDDATA) {
                                        self.walletRef.child(wData.key).remove() //////////// Delete From 
                                    }
                                });
                            })
                            self.userRequestInvoicesRef.child(data.key).remove(e => {
                                // console.log("Done>");
                            }) //////////// Delete From 
                        });

                    });

                    self.driverCommissionInvoicesRef.orderByChild('req_id').equalTo(ids[1]).once("value", function (snapshot) {
                        snapshot.forEach(function (data) {
                            self.driverCommissionInvoicesRef.child(data.key).remove() //////////// Delete From 
                        });
                    })

                });


            });


            self.cancelRequestListener();
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
            self.SelectedRequest = [];
            self.SelectToday = false;
            self.SelectWeek = false;
            self.SelectAll = false;

            let searches = _.filter(self.search_t.toLowerCase().split(";"), function (srh) {
                if (srh !== "") {
                    return srh;
                }
            });
            let TextedFiltered = [];


            self.all_.forEach((item, ind) => {
                let DataArray = [];
                try {
                    DataArray.push((ind + 1).toString().toLowerCase());
                } catch (e) {}
                try {
                    DataArray.push((self.dateFormat(item.reqData.createdAt)).toString().toLowerCase());
                } catch (e) {}
                try {
                    DataArray.push((self.dateFormat(item.reqData.canceledAt)).toString().toLowerCase());
                } catch (e) {}
                try {
                    DataArray.push((item.Bids).toString().toLowerCase());
                } catch (e) {}
                try {
                    DataArray.push((item.reqData.id).toString().toLowerCase());
                } catch (e) {}
                try {
                    DataArray.push((item.clientData.first_name).toString().toLowerCase());
                } catch (e) {}
                try {
                    DataArray.push((item.clientData.last_name).toString().toLowerCase());
                } catch (e) {}
                try {
                    DataArray.push((item.clientData.mob_no).toString().toLowerCase());
                } catch (e) {}
                try {
                    DataArray.push((item.reqData.orgText).toString().toLowerCase());
                } catch (e) {}
                try {
                    DataArray.push((item.reqData.desText).toString().toLowerCase());
                } catch (e) {}
                try {
                    DataArray.push((item.reqData.disText).toString().toLowerCase());
                } catch (e) {}
                try {
                    DataArray.push((item.reqData.durText).toString().toLowerCase());
                } catch (e) {}
                try {
                    DataArray.push((item.reqData.vecType).toString().toLowerCase());
                } catch (e) {}
                try {
                    DataArray.push((item.reqData.reason).toString().toLowerCase());
                } catch (e) {}
                try {
                    DataArray.push((item.reqData.labours).toString().toLowerCase());
                } catch (e) {}
                try {
                    DataArray.push((item.reqData.floors).toString().toLowerCase());
                } catch (e) {}

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
                    TextedFiltered.push(item);
                }
            })

            let startTime = self.FromDate == "" ? '' : self.FromDate == undefined ? '' : moment(self.FromDate).startOf('day').unix();
            let endTime = self.ToDate == "" ? '' : self.ToDate == undefined ? '' : moment(self.ToDate).endOf('day').unix();

            self.all = [];
            TextedFiltered.forEach(function (item, ind) {

                if ((moment(item.reqData.createdAt).unix() >= startTime && moment(item.reqData.createdAt).unix() <= endTime) || (startTime == '' || endTime == '')) {


                    if (item.reqData.hasOwnProperty("canceledAt") && self.selectedOption == "Canceled")
                        self.all.push(item);
                    if (!(item.reqData.hasOwnProperty("canceledAt")) && self.selectedOption == "Completed")
                        self.all.push(item);
                    if (self.selectedOption == "All")
                        self.all.push(item);

                }
            });
            self.week = [];
            self.week_.forEach(function (item, ind) {
                if (moment(item.reqData.createdAt).unix() >= startTime && moment(item.reqData.createdAt).unix() <= endTime) {
                    self.week.push(item);
                }
            });
            self.today = [];
            self.today_.forEach(function (item, ind) {
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
                        "Created Date": self.dateFormat(row.reqData.createdAt),
                        "Canceled Date": self.dateFormat(row.reqData.canceledAt),
                        "Bids": row.Bids,
                        "Request No": row.reqData.id,
                        "Client Name": row.clientData.first_name + " " + row.clientData.last_name,
                        "Client Number": row.clientData.mob_no,
                        "Origin": row.reqData.orgText,
                        "Destination": row.reqData.desText,
                        "Distance": row.reqData.disText,
                        "Duration": row.reqData.durText,
                        "Required Vehicle": row.reqData.vecType,
                        "Reason": row.reqData.reason,
                        "Labours": row.reqData.labours,
                        "Floors": row.reqData.floors,
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

            /* add to workbook */
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
                XLSX.writeFile(wb, "Export_Canceled_Requests_Data.xlsx");
            } catch (e) {
                alert("Select Any One Option For Export");
            }

        },
        dateFormat(ms) {
            if (isUndefined(ms)) {
                return ms;
            }

            return moment(ms).format("hh:mm A, DD/MMM/YYYY")
        },
        openBidsReq(req_id, req_time) {
            this.assign_req_id_md = req_id;
            this.reqestTime = req_time;
            //console.log(req_id);
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
        async cancelRequestListener() {
            const self = this

            await self.userReqRef.on('value', async function (snap) {
                self.dataLoad = true
                self.all = []
                self.week = []
                self.today = []

                let grabData = []

                if (snap.numChildren() > 0) {

                    await Promise.all(_.map(snap.val(), async (userReqs, key) => {
                        await Promise.all(_.map(userReqs, async (reqs) => {
                            if ( /*reqs.hasOwnProperty("canceledAt")*/ true) {

                                let BidsSnap = await self.driverBidsRef.child(reqs.id).once('value');
                                let clientSnap = await self.userRef.child(key).once('value');

                                let CountBids = 0;

                                try {
                                    CountBids = Object.values(BidsSnap.val()).length;
                                } catch (ex) {}
                                if (CountBids === null) {
                                    CountBids = 0;
                                }
                                grabData.push({
                                    clientData: clientSnap.val(),
                                    reqData: reqs,
                                    BidsData: BidsSnap.val(),
                                    Bids: CountBids

                                })

                            }
                        }))
                    }))

                    self.all_ = await _.orderBy(grabData, function (row) {
                        return row.reqData.createdAt
                    }, ['desc'])
                    self.all = await _.orderBy(grabData, function (row) {
                        return row.reqData.createdAt
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
                    self.FilterData();
                } else {
                    self.dataLoad = false;
                    self.FilterData();
                }
            })

        }
    }
}