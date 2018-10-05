import firebase from 'firebase'
import func from '../../../custom_libs/func'
import moment from 'moment'
import _ from 'lodash'
import XLSX from 'xlsx'
import tableComp from '../../partials/components/html_utils/tabel_comp.vue'
import ListBids from '../../partials/components/modals/list_bids.vue'
import Datepicker from 'vuejs-datepicker'

export default {
    components: {
        'table_comp': tableComp,
        'date_picker': Datepicker,
        'list_bids': ListBids
    },
    created: function () {
        let self = this;

        const db = firebase.database();
        self.userRef = db.ref('/users');
        self.userReqRef = db.ref('/user_requests');
        self.driverBidsRef = db.ref('/driver_bids'),

            self.cancelRequestListener();

    },
    destroyed() {
        this.userReqRef.off();
    },
    data: function () {
        return {
            dataLoad: true,
            all: [],
            week: [],
            today: [],
            all_: [],
            week_: [],
            today_: [],
            userRef: null,
            userReqRef: null,
            driverBidsRef: null,
            assign_req_id_md: '',
            reqestTime: '',
            ExportOptions: ["All"],
        }
    },
    methods: {
        FilterData: function () {
            let self = this;
            if (!self.IsBackuped) {
                self.all_ = self.all;
                self.week_ = self.week;
                self.today_ = self.today;
                self.IsBackuped = true;
            }
            let startTime = moment(self.FromDate).startOf('day').unix();
            let endTime = moment(self.ToDate).endOf('day').unix()


            self.all = [];
            self.all_.forEach(function (item) {
                if (moment(item.reqData.createdAt).unix() >= startTime && moment(item.reqData.createdAt).unix() <= endTime) {
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
                    // Start From Here

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
                    //console.log(snap.val())

                    await Promise.all(_.map(snap.val(), async (userReqs, key) => {
                        await Promise.all(_.map(userReqs, async (reqs) => {
                            if (reqs.hasOwnProperty("canceledAt")) {

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
                    self.week = week_grabData;

                    self.dataLoad = false;
                } else {
                    self.dataLoad = false;
                }
            })
        }
    }
}