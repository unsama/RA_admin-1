<template lang="pug">
    div
        // Modal
        #parcel_details.modal.fade.bs-example-modal-lg(role='dialog')
            .modal-dialog.modal-lg
                // Modal content
                .modal-content
                    .modal-header
                        button.close(type='button', data-dismiss='modal') ×
                        h4.modal-title Parcel Details 
                        //p {{parcel_obj}}
                    .modal-body
                        template(v-if="Object.keys(parcel_obj).length > 0")
                        .table-responsive
                            table.table
                                tbody
                                    tr
                                        td Created Time:
                                        td {{ parcel_obj.req_data['createdAt'] }}
                                        td Origin:
                                        td {{ parcel_obj.req_data['orgText'] }}
                                    tr
                                        th Destination
                                        td {{ parcel_obj.req_data['desText'] }}
                                        th Est. Time
                                        td {{ parcel_obj.req_data['durText'] }} 
                                    tr
                                        td Est. Distance:
                                        td {{ parcel_obj.req_data['disText'] }}
                                        td Floor:
                                        td {{ parcel_obj.req_data['floors'] }}
                                    tr
                                        td Labour:
                                        td {{ parcel_obj.req_data['labours'] }}
                                        td Vehicle Required:
                                        td {{ parcel_obj.req_data['vecType'] }}
                                    tr
                                        td Parcel Images: 
                                        td 
                                            ul(style='list-style: none;')
                                                li(v-for='(thumb) in parcel_obj.req_data["parcelThmbArray"]') 
                                                    img( :src='thumb', alt='image',style="width:32%; height: 32%;")
                                            //button.btn.btn-sm.btn-info(data-toggle='modal' data-target='#pDetailImgPP' v-on:click='openImagePP(parcel_obj.req_data["parcelUriArray"])')
                                                i.fa.fa-eye
                                            //img.img-thumbnail(src='parcel_obj.req_data["parcelUriArray"]', alt='img', width='304', height='236') 

                                        td Reach Time:
                                        td {{ formatDate( parcel_obj.pend_req_data['reach_time']) }} 
                                    tr
                                        td Pickup Time:
                                        td {{ formatDate( parcel_obj.pend_req_data['active_time'] )}} 
                                        td Deliverer Time:
                                        td {{ formatDate( parcel_obj.pend_req_data['complete_time']) }}
                                    tr                        
                                        td Amount:
                                        td Rs : {{parcel_obj.bid_data['amount']}} 
                                        td Discount:
                                        td Rs : {{ parcel_obj.bid_data['discountPrice'] }}
                                    tr
                                        td Driver Info:
                                        td 
                                            template(v-if="!loaders.driver")
                                                p Driver:&nbsp;
                                                    router-link(v-bind:to="'/admin/drivers/profile/'+data.driver['uid']" target="_blank")
                                                        b {{ data.driver['first_name'] }} {{ data.driver['last_name'] }}
                                                p Number:&nbsp;
                                                    b {{ data.driver['mob_no'] }}
                                            b(v-else) Loading...
                                            
                                        td Client Info:
                                        td 
                                            template(v-if="!loaders.client")
                                                p Client:&nbsp;
                                                    router-link(v-bind:to="'/admin/users/profile/'+data.client['uid']" target="_blank")
                                                        b {{ data.client['first_name'] }} {{ data.client['last_name'] }}
                                                p Number:&nbsp;
                                                    b {{ data.client['mob_no'] }}
                                            b(v-else) Loading...
                                    tr 
                                        th Driver Name
                                        th Amount
                                        th Discount
                                        th Date
                                    tr(v-for="data in parcel_obj.bidsList") 
                                        td {{data.first_name}} {{data.last_name}}
                                        td {{data.amount}}
                                        td {{data.discountPrice}}
                                        td {{formatDate(data.first_bid_time)}}
                        ul(style='list-style: none; padding-left: 0px;')
                            li(v-for='(thumb) in parcel_obj.req_data["parcelUriArray"]') 
                                img( :src='thumb', alt='image' ,style="width:100%; height: 100%;")
                        parcel_images(v-bind:images="sel_images" id='pDetailImgPP')
 

</template>

<script>
import firebase from "firebase";
import moment from "moment";
import parcelImages from "../modals/parcel_images.vue";

export default {
  components: {
    parcel_images: parcelImages
  },
  name: "parcel_details",
  props: {
    parcel_obj: {
      type: Object,
      default: {}
    }
  },
  data() {
    const db = firebase.database();
    
    return {v:[],
      loaders: {
        driver: true,
        client: true
      },
      data: {
        driver: {},
        client: {}
      },
      sel_images: [],
        ImGData:[],
      userRef: db.ref("/users")
    };
  }, 
  watch: {
    parcel_obj(val) {
      if (val.hasOwnProperty("pend_req_data")) {
        this.dataLoad(val.pend_req_data);
      }
    }
  },
  methods: {
    formatDate(val) {
      if (val === undefined) return "";
      if (val == 0) return "";
      return moment(val).format("hh:mm A DD/MMM/YYYY");
    },
    async dataLoad(pReqData) {
      this.loaders["driver"] = true;
      this.loaders["client"] = true;
      await this.driverDataLoad(pReqData.driver_uid);
      await this.clientDataLoad(pReqData.user_uid);
    },
    async driverDataLoad(uid) {
      const self = this;
      await self.userRef.child(uid).once("value", function(snap) {
        let item = snap.val();
        item["uid"] = uid;
        self.data["driver"] = item;
        self.loaders["driver"] = false;
      });
    },
    async clientDataLoad(uid) {
      const self = this;
      await self.userRef.child(uid).once("value", function(snap) {
        let item = snap.val();
        item["uid"] = uid;
        self.data["client"] = item;
        self.loaders["client"] = false;
      });
    },
    openImagePP(images) { 
      this.sel_images = images;
    }
  }
};
</script>
