import firebase from "firebase";
import moment from 'moment';
import SimpleVueValidation from "simple-vue-validator";
import Promise from "bluebird";
import _ from "lodash";
import bcrypt from "bcrypt-nodejs";

const Validator = SimpleVueValidation.Validator;

export default {
    components: {},
    created: function () {
        let self = this;

        // self.promoRef.on('value', function (snap) {
        //     if (snap.val() !== null) {
        //         self.data = _.values(snap.val());
        //         self.data = _.orderBy(self.data, ['promo'], ['quantity'],['expdate'] );
        //     } else {
        //         self.data = [];
        //     }
        //     self.dataLoad = false;
        // });
    },

    data() {
        const db = firebase.database();
        return {
            promoRef: db.ref("promo_code"),
            promocode_text: "",
            type: "",
            quantity: "",
            expdate: "",
            status: 0,
            v_list: ["Percentage", "Rupees"],
            formUtil: {
                submitted: false,
                err: "",
                suc: "",
                process: false
            },

        }
    },
    validators: {
        promocode_text(value) {
          return Validator.value(value)
            .required()
            // .custom(function() {
            //       if (!Validator.isEmpty(value)) {
            //           return Promise.delay(1000).then(function() {
            //               return self.promoRef.orderByChild("promo").equalTo(value).once("value").then(function(snap) {
            //                       let snapData = snap.val();
            //                       if (snapData !== null) {
            //                           if (_.find(snapData, { type: "percentage" })) {
            //                               return "Already taken!";
            //                           }
            //                       }
            //                   });
            //           });
            //       }
            //   });
        },
        type(value) {
          return Validator.value(value)
            .required()
            .in(this.v_list, "Invalid Value!");
        },
        quantity(value) {
          return Validator.value(value)
              .required().digit()
        },
        expdate(value) {
            return Validator.value(value)
            .required()
        },

      },
    methods: {
        // insertPromocode() {
        //     const self = this;
        //     let key = self.promoRef.push();
        //     // var date = parseInt(moment({expdate}).format('x'))
        //     var date = new Date(self.expdate);
        //     var abc = moment(date, 'dd/mmm/yyyy');
        //     var actaldate = abc.format('x')
        //     self.$validate().then(function (success) {
        //         if (success) {
        //             key.set({
        //                 id: key.key,
        //                 promo: self.promocode_text,
        //                 expdate: actaldate,
        //                 type: self.type,
        //                 quantity: self.quantity,
        //                 status: self.status
        //             });
        //         }
        //     });
        // },
        insertPromocode() {
            const self = this;
            self.formUtil.process = true;
            self.formUtil.err = "";
            let key = self.promoRef.push();
            // var date = parseInt(moment({expdate}).format('x'))
            var date = new Date(self.expdate);
            var abc = moment(date, 'dd/mmm/yyyy');
            var actaldate = abc.format('x')
            self.$validate().then(function(success) {
                if (success) {
                    key.set({
                            id: key.key,
                            promo: self.promocode_text,
                            expdate: actaldate,
                            type: self.type,
                            quantity: self.quantity,
                            status: self.status
                        },
                        function(err) {
                            if (err) {
                                self.formUtil.err = err.message;
                            } else {
                                self.formUtil.submitted = true;
                                self.formUtil.err = "";
                                self.formUtil.suc = "Successfully insert data!";
                                setTimeout(function() {
                                    self.formUtil.suc = "";
                                }, 1500);
                            }
                            self.formUtil.process = false;
                        }
                    );
                } else {
                    self.formUtil.process = false;
                }
            });
        }
        // form_submit: function () {
        //     let self = this;
        //     self.formStatus = true;
        //     self.$validate().then(function (success) {
        //         if(success){
        //             self.userRef.child(self.sel_uid).update({
        //                 'promo': self.formdata.pname,
        //                 'quantity': self.formdata.amount,
        //                 'type': self.formdata.type,
        //                 'expdate': self.formdata.expdate,
        //
        //             }, function (err) {
        //                 if(err){
        //                     self.errMsg = err.message;
        //                 }else{
        //                     self.errMsg = "";
        //                     self.sucMsg = "Successfully updated data!";
        //                     setTimeout(function () {
        //                         self.sucMsg = "";
        //                     }, 1500);
        //                 }
        //                 self.formStatus = false;
        //             });
        //         }else{
        //             self.formStatus = false;
        //         }
        //     });
        // }
      }
}
