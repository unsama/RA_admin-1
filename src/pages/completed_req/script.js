import firebase from 'firebase'
import func from '../../../custom_libs/func'
import moment from 'moment'
import _ from 'lodash'

import tableComp from '../../partials/components/html_utils/tabel_comp.vue'
import ListBids from '../../partials/components/modals/list_bids.vue'
import Datepicker from 'vuejs-datepicker';
import XLSX from 'xlsx'


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
        self.completeReqRef = db.ref('/complete_requests');
        self.driverBidsRef = db.ref('/driver_bids'),

            self.completeRequestListener();
    },
    destroyed() {
        this.completeReqRef.off();
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
            completeReqRef: null,
            driverBidsRef: null,
            assign_req_id_md: '',
            reqestTime: '',
            FromDate: "",
            ToDate: "",
            IsBackuped: false,
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
            await self.completeReqRef.on('value', async function (snap) {
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
            });
        }
    }
}