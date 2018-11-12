<template lang="pug">
    // Modal
    #push_modal.modal.fade.bs-example-modal-lg(role='dialog')
        .modal-dialog.modal-lg
            // Modal content
            .modal-content
                .modal-header
                    button.close(type='button', data-dismiss='modal') ×
                    h4.modal-title List Bids
                .modal-body
                    div.table-responsive
                        div.text-center(v-if='dataLoad1')
                            i.fa.fa-refresh.fa-spin.fa-3x.fa-fw
                        h3.text-center(style='margin: 15px 0;' v-if='!dataLoad1 && reqBidsData.length === 0')
                            | No Data Found!
                        table.table.table-striped.table-bordered(v-if='!dataLoad1 && reqBidsData.length > 0')
                            thead
                                tr
                                    th S.No#
                                    th Driver Name
                                    th Vehicle Type
                                    th Bid Amount
                                    th Bid Date
                                    th Difference
                            tbody
                                tr(v-for='(row, ind) in reqBidsData')
                                    td {{ ind+1 }}
                                    td
                                        router-link(v-bind:to="'/admin/drivers/profile/'+row.user.id" target="_blank") {{ row.user.first_name+" "+row.user.last_name }}
                                    td {{ row.user.vehicle }}
                                    td {{ row.bid_amount }}
                                    td {{ msToDate(row.bid_time) }}
                                    td {{timeFormat(getdef(row.bid_time,req_time))}}
                    br
                    div.table-responsive(v-if='ReqLoad')
                        table.table.table-striped.table-bordered
                            tbody
                                tr
                                  th Reach Time:
                                  td {{msToDate(CompleteRequestData.reach_time)}}
                                tr
                                  th Pickup Time:
                                  td {{msToDate(CompleteRequestData.active_time )}}
                                tr
                                  th Deliverer Time:
                                  td {{msToDate(CompleteRequestData.complete_time)}}

 
                .modal-footer
                    button.btn.btn-default(type='button', data-dismiss='modal') Close
</template>

<script>
import firebase from "firebase";
import _ from "lodash";
import moment from "moment";

import SimpleVueValidation from "simple-vue-validator";

const Validator = SimpleVueValidation.Validator;

export default {
  name: "list_bids",
  props: ["sel_req_id","req_time"],
  data() {
    const db = firebase.database();
    return {
      // db data
      addaListRef: db.ref("/adda_list"),
      driverBidsRef: db.ref("/driver_bids"),
      completeRequestsRef: db.ref("complete_requests"), ///////////////////New Added
      userRef: db.ref("/users"),
      // data
      dataLoad1: true,
      ReqLoad: true,
      driversData: [],
      addaListData: [],
      CompleteRequestData: [],
      reqBidsData: [],
      // push bid fields
      sel_adda: "",
      sel_driver: "",
      sel_amount: 0,
      form_util: {
        err: "",
        suc: "",
        loader: false
      }
    };
  },
  created() {
    const self = this;

    setTimeout(function() {
      $("#sel_adda").selectpicker();
      $("#sel_drivers").selectpicker();
    }, 500);

    self.addaListRef.once("value", function(snap) {
      if (snap.val() !== null) {
        self.addaListData = _.values(snap.val());
        self.addaListData = _.map(
          _.orderBy(self.addaListData, ["place_name"], ["asc"]),
          function(item) {
            item["place_name"] = self.toTitleCase(item.place_name);
            return item;
          }
        );
      } else {
        self.addaListData = [];
      }
      setTimeout(function() {
        $("#sel_adda").selectpicker("refresh");
      }, 500);
    });
  },
  watch: {
    sel_req_id(val) {
      //console.log(val);
      const self = this;
      self.driverBidsRef.off();
      self.dataLoad1 = true;
      self.reqBidsData = [];
      if (val !== "") {
        self.completeRequestsRef.child(val).on("value", function(reqBidsSnap) {
          //console.log(reqBidsSnap.val() );
          try {
            self.CompleteRequestData[
              "active_time"
            ] = reqBidsSnap.val().active_time;
            //self.CompleteRequestData['client_uid']=reqBidsSnap.val().client_uid;
            self.CompleteRequestData[
              "complete_time"
            ] = reqBidsSnap.val().complete_time;
            self.CompleteRequestData[
              "reach_time"
            ] = reqBidsSnap.val().reach_time;

            //self.CompleteRequestData['driver_uid']=reqBidsSnap.val().driver_uid;
            //self.CompleteRequestData['rating']=reqBidsSnap.val().rating;
            //self.CompleteRequestData['status']=reqBidsSnap.val(). status;

            self.ReqLoad = true;
          } catch (ex) {
            self.CompleteRequestData["active_time"] = 0;
            self.CompleteRequestData["complete_time"] = 0;
            self.CompleteRequestData["reach_time"] = 0;
            self.ReqLoad = false;
          }
          
        });

        self.driverBidsRef.child(val).on("value", function(reqBidsSnap) {
          self.dataLoad1 = true;
          self.reqBidsData = [];
          if (reqBidsSnap.numChildren() > 0) {
            let processItem = 0;
            let data = [];
            reqBidsSnap.forEach(function(bidSnap) {
              self.userRef
                .child(bidSnap.key)
                .once("value")
                .then(function(userSnap) {
                  let userData = userSnap.val();
                  userData["id"] = userSnap.key;
                  data.push({
                    user: userData,
                    bid_amount: parseInt(bidSnap.val().amount),
                    bid_time: bidSnap.val().first_bid_time
                      ? bidSnap.val().first_bid_time
                      : 0
                  });
                  processItem++;
                  if (processItem === reqBidsSnap.numChildren()) {
                    self.reqBidsData = _.orderBy(
                      data,
                      ["bid_amount", "bid_time"],
                      ["asc", "desc"]
                    );
                    self.dataLoad1 = false;
                  }
                });
            });
          } else {
            self.dataLoad1 = false;
          }
        });
      } else {
        self.dataLoad1 = false;
      }
    },
    sel_adda(val) {
      const self = this;
      self.sel_driver = "";
      self.driversData = [];
      setTimeout(function() {
        $("#sel_drivers").selectpicker("refresh");
      }, 500);
      if (val !== "") {
        self.userRef
          .orderByChild("adda_ref")
          .equalTo(val)
          .once("value", function(snap) {
            let driversData = snap.val();
            if (driversData !== null) {
              let keys = Object.keys(driversData);
              keys.forEach(function(row) {
                let selDriver = driversData[row];
                //active status check
                if (selDriver.status === 1) {
                  self.driversData.push({
                    val: row,
                    option:
                      selDriver.mob_no +
                      " ~ " +
                      selDriver.vehicle +
                      " ~ " +
                      selDriver.first_name +
                      " " +
                      selDriver.last_name
                  });
                }
              });
              setTimeout(function() {
                $("#sel_drivers").selectpicker("refresh");
              }, 500);
            }
          });
      }
    }
  },
  validators: {
    sel_adda: function(value) {
      return Validator.value(value).required();
    },
    sel_driver: function(value) {
      return Validator.value(value).required();
    },
    sel_amount: function(value) {
      return Validator.value(value)
        .required()
        .digit("Invalid Amount!")
        .greaterThanOrEqualTo(100, "Minimum Bid amount is 100!")
        .lessThanOrEqualTo(100000, "Maximum Bid amount is 100000!");
    }
  },
  methods: {            
    timeFormat: function (mDuration) {
                let hours = (mDuration.asHours().toString().length < 2) ? "0" + mDuration.asHours() : mDuration.asHours();
                let min = (mDuration.get('m').toString().length < 2) ? "0" + mDuration.get('m') : mDuration.get('m');
                let sec = (mDuration.get('s').toString().length < 2) ? "0" + mDuration.get('s') : mDuration.get('s');
                return parseInt(hours) + ":" + min + ":" + sec;
                },
            getdef(bidt,reqt){
                var a = moment(bidt);
                var b = moment(reqt);
                return  moment.duration(a.diff(b)); 
            },
    msToDate(ms) {
      if (ms === 0 || ms ===undefined) {
        return '';
      } else {
        return moment(ms).format("hh:mm A DD/MMM/YYYY");
      }
    },
    toTitleCase(str) {
      return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    },
    placeBid() {
      let self = this;
      self.form_util.err = "";
      self.form_util.loader = true;
      self.$validate().then(function(success) {
        if (success) {
          self.userRef
            .child(self.sel_driver)
            .once("value")
            .then(function(selDriverSnap) {
              let driverData = selDriverSnap.val();
              if (driverData !== null) {
                self.driverBidsRef
                  .child(self.sel_req_id)
                  .child(self.sel_driver)
                  .set(
                    {
                      amount: self.sel_amount.toString(),
                      first_bid_time: firebase.database.ServerValue.TIMESTAMP
                    },
                    function(err) {
                      if (err) {
                        self.form_util.err = "Invalid Driver Select!";
                        self.form_util.loader = false;
                      } else {
                        self.form_util.loader = false;
                        self.sel_driver = "";
                        self.sel_adda = "";
                        self.sel_amount = 0;
                        self.validation.reset();
                        self.form_util.suc = "Successfully place bid!";
                        setTimeout(function() {
                          $("#sel_drivers").selectpicker("refresh");
                          $("#sel_adda").selectpicker("refresh");
                        }, 500);
                        setTimeout(function() {
                          self.form_util.suc = "";
                        }, 3000);
                      }
                    }
                  );
              } else {
                self.form_util.err = "Invalid Driver Select!";
                self.form_util.loader = false;
              }
            });
        } else {
          self.form_util.loader = false;
        }
      });
    }
  }
};
</script>

<style>
.dropup .dropdown-menu,
.navbar-fixed-bottom .dropdown .dropdown-menu {
  top: 0 !important;
  bottom: auto !important;
}
</style>