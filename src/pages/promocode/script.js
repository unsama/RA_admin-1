import firebase from "firebase";


export default {
    components: {},
    created: function () {
        let self = this;


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
    methods: {
        insertPromocode() {
            const self = this;
            let key = self.promoRef.push();
            key.set({
                promo: self.promocode_text,
                type: self.type,
                quantity: self.quantity,

            });
        }
    }
}
