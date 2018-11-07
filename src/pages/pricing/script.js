import firebase from 'firebase'
import moment from 'moment'
import _ from 'lodash'
export default {
    components: {

    },
    mounted() {
        let self = this;
        self.pricingRef.on('value', (pricingSnap) => {
            self.pricingData = pricingSnap.val();
        });
        self.commissionRef.on('value', (commissionSnap) => {
            self.commission = commissionSnap.val().percent;
            self.commissionData = commissionSnap.val().percent;
            self.updatedAt = commissionSnap.val().updatedAt;
        })
    },
    created() {



    },
    watch: {
        vehicleName: function (value) {
            let self = this;
            let forUpdate = false;
            Object.keys(self.pricingData).forEach(vehicle => {
                if (vehicle == value.trim().toLowerCase().replace(/^\w/, c => c.toUpperCase())) forUpdate = true;
            });
            if (forUpdate) {
                self.btnValue = "Update";

                $(self.rowElement).css("background-color", "white");

                self.rowElement = $("td").filter(function() { return $(this).html() ==  value.trim().toLowerCase().replace(/^\w/, c => c.toUpperCase()); } ).closest("tr");


               // self.rowElement = $("td:contains(" + value.trim().toLowerCase().replace(/^\w/, c => c.toUpperCase()) + ")").closest("tr")

                $(self.rowElement).css("background-color", "#C0C0C0");
            } else {
                self.btnValue = "Add";

                $(self.rowElement).css("background-color", "white");
            }
            self.$forceUpdate();
        }
    },
    data() {
        var db = firebase.database();
        return {
            pricingRef: db.ref('/pricing'),
            commissionRef: db.ref('/commission'),
            vehicleName: "",
            commission: 0,
            emptyPrice: 0,
            loadedPrice: 0,
            labourCharges: 0,
            perFloorCharges: 0,
            minCharges: 0,
            minDistance: 0,
            btnValue: "Add",
            rowElement: null,
            pricingData: [],
            commissionData: 0,
            updatedAt: moment().format('DD MMM YYYY hh:mm:ss a'),
        }
    },
    methods: {
        TimeFormat: function (Time) {
            return moment.unix(Time).format('DD MMM YYYY hh:mm:ss a')
        },
        UpdateCommission: function () {
            let self = this;
            let c = self.commissionData;
            let u = moment().unix();
            console.log(c + ":" + u);
            var commission = {
                'percent': c,
                'updatedAt': u
            }
            self.commissionRef.update(commission).then(() => {}).catch((e) => {
                console.log(e);
            })
        },
        GoForEdit: function (key, event) {
            let self = this;
            if (self.rowElement) {
                $(self.rowElement).css("background-color", "white");
                self.rowElement = $(event.target).closest("tr").css("background-color", "#C0C0C0");
            } else {
                self.rowElement = $(event.target).closest("tr").css("background-color", "#C0C0C0");
            }




            self.vehicleName = key;
            self.emptyPrice = self.pricingData[key].emptyPrice;
            self.loadedPrice = self.pricingData[key].loadedPrice;
            self.labourCharges = self.pricingData[key].labourCharges;
            self.perFloorCharges = self.pricingData[key].perFloorCharges;
            self.minCharges = self.pricingData[key].minCharges;
            self.minDistance = self.pricingData[key].minDistance;
        },
        AddPrice: function () {
            let self = this;
            let vehicleName = self.vehicleName.trim().toLowerCase().replace(/^\w/, c => c.toUpperCase());
            var pricing = {
                emptyPrice: parseInt(self.emptyPrice),
                loadedPrice: parseInt(self.loadedPrice),
                labourCharges: parseInt(self.labourCharges),
                perFloorCharges: parseInt(self.perFloorCharges),
                minCharges: parseInt(self.minCharges),
                minDistance: parseInt(self.minDistance),
            }
            self.pricingRef.child(vehicleName).set(pricing).then(() => {}).catch((e) => {
                console.log(e);
            })
        },
    }
}