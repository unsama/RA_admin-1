import firebase from 'firebase'
import func from '../../../custom_libs/func'
import moment from 'moment'
import _ from 'lodash'

import tableComp from '../../partials/components/html_utils/tabel_comp.vue'
import ListBids from '../../partials/components/modals/list_bids.vue' 

export default {
    components: {
        'table_comp': tableComp,
        'list_bids': ListBids
    },
    created: function () {
        let self = this;

        const db = firebase.database();
        self.userRef = db.ref('/users');
        self.userReqRef = db.ref('/user_requests');
        self.driverBidsRef =  db.ref('/driver_bids'), 

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
            userRef: null,
            userReqRef: null,
            driverBidsRef:null,                
            assign_req_id_md: '',
            reqestTime:'',
        }
    },
    methods: {
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
            for(let i=1; i < 7; i++){
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
                                let clientSnap = await self.userRef.child(key).once('value') ;

                                let CountBids = 0;

                                try{
                                CountBids = Object.values( BidsSnap.val()).length;}
                                catch(ex){ }
                                if(CountBids ===null){
                                    CountBids = 0;
                                }
                                grabData.push({
                                    clientData: clientSnap.val(),
                                    reqData: reqs,
                                    BidsData : BidsSnap.val(),
                                    Bids : CountBids
                                    
                                })
                                //console.log( clientSnap.val() );
                               // console.log( Object.values( BidsSnap.val()).length  );
                                //console.log(reqs.id);
                               // console.log(key); 
                                
                            }
                        }))
                    }))
 
                 //  console.log(_.size(grabData[1].Bids));
                  //  console.log(grabData[2].Bids);
                    // sorted here desc/asc
                    self.all = await _.orderBy(grabData, function (row) { return row.reqData.createdAt }, ['desc'])

                    // grabdata for today date
                    let today_grabData = [];
                    const today_date = moment().format("DD/MMM/YYYY")
                    await Promise.all(_.map(self.all, async (row) => {
                        const req_date = moment(row.reqData.createdAt).format("DD/MMM/YYYY");
                        if(req_date === today_date) {
                            today_grabData.push(row)
                        }
                    }))
                    self.today = today_grabData;

                    // grabdata here week dates
                    let week_dates = await self.genWeekDays()
                    let week_grabData = []
                    await Promise.all(_.map(self.all, async (row) => {
                        const req_date = moment(row.reqData.createdAt).format("DD/MMM/YYYY");
                        const search = await _.find(week_dates, function (date) { return date === req_date })
                        if(typeof search !== 'undefined') {
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