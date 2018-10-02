<template lang="pug">
    div
        .box
            .box-body
                div.table-responsive
                    h3.box-title(style="margin-bottom: -26px;") Delivery In Progress
                    div.text-center(v-if='dataLoad')
                        i.fa.fa-refresh.fa-spin.fa-3x.fa-fw
                    h3.text-center(style='margin: 15px 0;' v-if='!dataLoad && all.length === 0')
                        | No Data Found!
                    table_comp(v-if='!dataLoad && all.length > 0' v-bind:per_page="10")
                        template(slot="thead")
                            tr
                                th S.No#
                                th Date
                                th Request ID
                                th Origin
                                th Destination
                                th Distance
                                th Duration
                                th Require Vehicle
                                //th Parcel Images
                                th Action
                        template(slot="tbody")
                            tr(v-for='(row, ind) in all')
                                td {{ ind+1 }}
                                td {{ row.req_data.createdAt }}
                                td {{ row.req_data.id }}
                                td {{ row.req_data.orgText }}
                                td {{ row.req_data.desText }}
                                td {{ row.req_data.disText }}
                                td {{ row.req_data.durText }}
                                td {{ row.req_data.vecType }}
                                //td  
                                  button.btn.btn-sm.btn-info(data-toggle='modal' data-target='#parcel_images' v-on:click='openImagesPP(row.req_data["parcelUriArray"])' style="margin-bottom: 5px;margin-right: 5px;")
                                    i.fa.fa-eye
                                td
                                    button.btn.btn-info.mr-10(data-toggle='modal' data-target='#parcel_details' v-on:click='openDetailPP(row)') Details
                                    template(v-if="row.pend_req_data.status === 'req.accept'")
                                        button.btn.btn-info(v-on:click='statusChange(row.pend_req_data.status, row.pend_req_data.user_uid)') Reached
                                    template(v-if="row.pend_req_data.status === 'req.pickup'")
                                        button.btn.btn-info(v-on:click='statusChange(row.pend_req_data.status, row.pend_req_data.user_uid)') Pick Up
                                    template(v-if="row.pend_req_data.status === 'req.active'")
                                        button.btn.btn-info(v-on:click='statusChange(row.pend_req_data.status, row.pend_req_data.user_uid)') Delivered
                                    template(v-if="row.pend_req_data.status === 'req.complete'")
                                        button.btn.btn-info(disabled) Completed!
        parcel_details(v-bind:parcel_obj="sel_parcel_obj")
        parcel_images(v-bind:images="sel_images")
</template>

<script>
import firebase from "firebase";
import moment from "moment";

import tableComp from "../html_utils/tabel_comp.vue";
import parcelDetailsModal from "../modals/parcel_details.vue";
import parcelImages from      "../modals/parcel_images.vue";

export default {
  name: "progress_request",
  components: {
    table_comp: tableComp,
    parcel_details: parcelDetailsModal,
    parcel_images:parcelImages
  },
  created() {
    this.loadPendRequest();
  },
  data() {
    const db = firebase.database();
    return {
      userRef: db.ref("/users"),
      userReqRef: db.ref("/user_requests"),
      activeReqRef: db.ref("/user_active_requests"),
      bidsRef: db.ref("/driver_bids"),

      dataLoad: true,
      all: [],
      sel_parcel_obj: {},
      sel_images:[],
    };
  },
  methods: {
    loadPendRequest() {
      const self = this;
      self.activeReqRef.on("value", function(snap) {
        if (snap.numChildren() > 0) {
          let process_complete = 0;
          let grabData = [];
          snap.forEach(function(pendReqSnap) {
            let pendRqData = pendReqSnap.val();
            pendRqData["user_uid"] = pendReqSnap.key;
            self.userReqRef
              .child(pendReqSnap.key + "/" + pendRqData.req_id)
              .once("value")
              .then(function(reqSnap) {
                let reqData = reqSnap.val();

                self.bidsRef .child(reqData.id + "/" + pendRqData.driver_uid) .once("value", function(BidSnap) {
                    let BidData = BidSnap.val();
                    reqData["createdAt"] = moment(reqData.createdAt).format(
                      "hh:mm A DD/MMM/YYYY"
                    ); 

                self.bidsRef.child(reqData.id).on("value", function(BidsSnap) {

                    let BidsDriversIDs = Object.keys(BidsSnap.val());
                    let BidsDriversData =  Object.values( BidsSnap.val());
                    let BidsList = [];
                    for (let i = 0; i < BidsDriversIDs.length; i++) {

                        self.userRef.child(BidsDriversIDs[i]).on("value",function(DriverSnap){

                            let DriverData = DriverSnap.val();
                            DriverData['amount'] = BidsDriversData[i].amount;
                            DriverData['first_bid_time'] = BidsDriversData[i].first_bid_time;
                            DriverData['discountPrice'] = BidsDriversData[i].discountPrice;
                            DriverData['last_bid_time'] = BidsDriversData[i].last_bid_time;
                            DriverData['old_amount '] = BidsDriversData[i].old_amount;
                            BidsList.push(DriverData);
                        })

                    }
       
                     grabData.push({
                         bidsList:BidsList,
                         bid_data: BidData,
                         req_data: reqData,
                         pend_req_data: pendRqData
                    });
                  });




                  });
                process_complete++;
                if (snap.numChildren() === process_complete) {
                  self.all = grabData;
                  self.dataLoad = false;
                }
              });
          }); 
        } else {
          self.dataLoad = false;
        }
      });
    },
    statusChange(status, uid) {
      const self = this;
      let setParams = {};
      switch (status) {
        case "req.accept":
          setParams = {
            active_time: firebase.database.ServerValue.TIMESTAMP,
            status: "req.pickup"
          };
          break;
        case "req.pickup":
          setParams = {
            complete_time: firebase.database.ServerValue.TIMESTAMP,
            status: "req.active"
          };
          break;
        case "req.active":
          setParams = {
            complete_time: firebase.database.ServerValue.TIMESTAMP,
            status: "req.complete"
          };
          break;
      }

      self.activeReqRef.child(uid).update(setParams, function(err) {
        if (err) {
          console.log(err.message);
        }
      });
    },
    openDetailPP(row) {
      this.sel_parcel_obj = row;
    },
    openImagesPP(imgs){
      this.sel_images = imgs; 
    }
  }
};
</script>

<style scoped>
.mr-10 {
  margin-right: 10px;
}
</style>