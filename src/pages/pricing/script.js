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
        vehicle_txt: {
            handler(val, oldVal) {
                let self = this;

                self.vehicle = {
                    Price: val.Price,
                    MinDistance: {
                        empty: val.MinDistance.empty * 1000,
                        loaded: val.MinDistance.loaded * 1000,
                    },
                    CancelFees: {
                        driver: {
                            fee: {
                                isRs:  val.CancelFees.driver.fee.isRs,
                                value: val.CancelFees.driver.fee.value,
                            },
                            duration: val.CancelFees.driver.duration*60000,
                        },
                        client: {
                            fee: {
                                isRs:  val.CancelFees.client.fee.isRs,
                                value: val.CancelFees.client.fee.value,
                            },
                            duration: val.CancelFees.client.duration*60000,
                        },
                    }
                };
                 
            },
            deep: true

        },

        vehicleName: function (value) {
            let self = this;
            let forUpdate = false;
            Object.keys(self.pricingData).forEach(vehicle => {
                if (vehicle == value.trim().toLowerCase().replace(/^\w/, c => c.toUpperCase())) forUpdate = true;
            });
            if (forUpdate) {
                self.btnValue = "Update";

                $(self.rowElement).css("background-color", "white");

                self.rowElement = $("td").filter(function () {
                    return $(this).html() == value.trim().toLowerCase().replace(/^\w/, c => c.toUpperCase());
                }).closest("tr");


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

            vehicle_txt: {
                Price: {
                    empty: 0,
                    floor: 0,
                    labour: 0,
                    loaded: 0,
                    min_empty: 0,
                    min_loaded: 0,
                },
                MinDistance: {
                    empty: 0,
                    loaded: 0
                },
                CancelFees: {
                    driver: {
                        fee: {
                            isRs: "true",
                            value: 0,
                        },
                        duration: 0
                    },
                    client: {
                        fee: {
                            isRs: "true",
                            value: 0,
                        },
                        duration: 0
                    },
                }
            },
            vehicle: {

            },

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
            //self.vehicle_txt = self.pricingData[key];

            self.vehicle_txt = {
                Price: self.pricingData[key].Price,
                MinDistance: {
                    empty: self.pricingData[key].MinDistance.empty / 1000,
                    loaded: self.pricingData[key].MinDistance.loaded / 1000,
                },
                CancelFees: {
                    driver: {
                        fee: {
                            isRs:  self.pricingData[key].CancelFees.driver.fee.isRs,
                            value: self.pricingData[key].CancelFees.driver.fee.value,
                        },
                        duration: self.pricingData[key].CancelFees.driver.duration/60000,
                    },
                    client: {
                        fee: {
                            isRs:  self.pricingData[key].CancelFees.client.fee.isRs,
                            value: self.pricingData[key].CancelFees.client.fee.value,
                        },
                        duration: self.pricingData[key].CancelFees.client.duration/60000,
                    },
                }
            };


        },
        AddPrice: function () {
            let self = this;
            let vehicleName = self.vehicleName.trim().toLowerCase().replace(/^\w/, c => c.toUpperCase());


            var pricing = {
                Price: {
                    empty: parseInt(self.vehicle.Price.empty),
                    floor: parseInt(self.vehicle.Price.floor),
                    labour: parseInt(self.vehicle.Price.labour),
                    loaded: parseInt(self.vehicle.Price.loaded),
                    min_empty: parseInt(self.vehicle.Price.min_empty),
                    min_loaded: parseInt(self.vehicle.Price.min_loaded),
                },
                MinDistance: {
                    empty: parseInt(self.vehicle.MinDistance.empty),
                    loaded: parseInt(self.vehicle.MinDistance.loaded)
                },
                CancelFees: {
                    driver: {
                        fee: {
                            isRs: self.vehicle.CancelFees.driver.fee.isRs,
                            value: parseInt(self.vehicle.CancelFees.driver.fee.value),
                        },
                        duration: parseInt(self.vehicle.CancelFees.driver.duration),
                    },
                    client: {
                        fee: {
                            isRs: self.vehicle.CancelFees.client.fee.isRs,
                            value: parseInt(self.vehicle.CancelFees.client.fee.value),
                        },
                        duration: parseInt(self.vehicle.CancelFees.client.duration),
                    },
                }
            }


            self.pricingRef.child(vehicleName).set(pricing).then(() => {}).catch((e) => {
                console.log(e);
            })
        },
    }
}