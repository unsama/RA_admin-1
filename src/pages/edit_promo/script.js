import firebase from 'firebase'

import promoinfoupdate from '../../partials/components/forms/promo_info_update/promo_info_update.vue'


export default {
    created: function(){
        let self = this;

        const db = firebase.database();
        self.userRef = db.ref('/promo_code');
        self.userRef.child(self.$route.params.id).on('value', function (snap) {
            let renderData = snap.val();
            if (renderData !== null) {
                self.sel_uid = snap.key;
                self.formdata.pname = renderData.promo;
                self.formdata.amount = renderData.quantity;
                self.formdata.type = renderData.type;
                self.formdata.expdate = renderData.expdate;
                self.dataLoad = false;
            } else {
                self.$router.push('/admin');
            }
        });
    },
    data(){
        return {
            dataLoad: true,
            sel_uid: null,
            formdata: {
                fname: "",
                lname: "",
                email: "",
                mobile_number: "",
                cnic_number: "",
                driving_license: "",
                vehicle: "",
                model_year: "",
                vehicle_number: "",
                make: "",
                sel_adda: "",
                offline_driver: false
            },
            userRef: null
        }

    },
    methods: {
        checkField: function(val, assignVal){
            return (typeof val !== 'undefined') ? val: ((assignVal) ? assignVal: '');
        }
    },
    components: {
        'promoinfoupdate': promoinfoupdate,
    }
}