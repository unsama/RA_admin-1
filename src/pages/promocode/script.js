import firebase from "firebase";
import moment from 'moment';
import SimpleVueValidation from "simple-vue-validator";

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
            quantity: 0,
            expdate: "",


        }
    },
    validators: {
        promocode_text(value) {
          return Validator.value(value)
            .required()
        },
        quantity(value) {
          return Validator.value(value)
            .digit()
        },
        expdate(value) {
            return Validator.value(value)
            .required()
        },
        
      },
    methods: {
        insertPromocode() {
            const self = this;
            let key = self.promoRef.push();
            // var date = parseInt(moment({expdate}).format('x'))
            var date = new Date(self.expdate);
            var abc = moment(date,'dd/mm/yyyy');
            var actaldate = abc.format('x')  
            key.set({
                id: key.key,
                promo: self.promocode_text,
                expdate: actaldate,
                type: self.type,
                quantity: self.quantity,

            });
        

        },
      }
}
