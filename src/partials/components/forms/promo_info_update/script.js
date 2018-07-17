import firebase from 'firebase'
import _ from 'lodash'
import moment from 'moment';
import func from '../../../../../custom_libs/func.js'

import Promise from 'bluebird'
import SimpleVueValidation from 'simple-vue-validator'
const Validator = SimpleVueValidation.Validator;

export default {
    created: function(){
        let self = this;
        self.addaListRef.once('value', function (snap) {
            if (snap.val() !== null) {
                self.addaListData = _.map(snap.val(), function (val) {
                    let obj = val;
                    obj['place_name'] = func.toTitleCase(val.place_name);
                    return obj;
                });
            }
        });
    },
    props: [
        'formdata', 'sel_uid'
    ],
    data(){
        const db = firebase.database();
        return {
            addaListRef: db.ref("adda_list"),
            userRef: db.ref('/promo_code'),
            addaListData: [],
            formStatus: false,
            sucMsg: "",
            errMsg: "",
            v_list: ["Percentage", "Rupees"],
        }

    },
    validators: {
        'formdata.pname': function (value) {
            return Validator.value(value).required().lengthBetween(3, 20);
        },
        'formdata.amount': function (value) {
            return Validator.value(value).required().lengthBetween(1, 5);
        },
        'formdata.type': function (value) {
            return Validator.value(value).required();
        },
        'formdata.expdate': function (value) {
            return Validator.value(value).required();
        },

    },
    methods: {
        form_submit: function () {
            let self = this;
            var date = new Date(self.formdata.expdate);
            var abc = moment(date, 'dd/mm/yyyy');
            var actaldate = abc.format('x')
            self.formStatus = true;
            self.$validate().then(function (success) {
                if(success){
                    self.userRef.child(self.sel_uid).update({
                        'promo': self.formdata.pname,
                        'quantity': self.formdata.amount,
                        'type': self.formdata.type,
                        'expdate': actaldate,

                    }, function (err) {
                        if(err){
                            self.errMsg = err.message;
                        }else{
                            self.errMsg = "";
                            self.sucMsg = "Successfully updated data!";
                            setTimeout(function () {
                                self.sucMsg = "";
                            }, 1500);
                        }
                        self.formStatus = false;
                    });
                }else{
                    self.formStatus = false;
                }
            });
        }
    }
}