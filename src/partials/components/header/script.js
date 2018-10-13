import firebase from 'firebase'
import _ from 'lodash'
import moment from 'moment'
 
let LiverootUID = 'DerqRbXa2iZYe8Lw3bTrxI4jtv92';
let LiveadminUID = 'EqSMcc6A2yfgKAjiVnLMaGD82P93';
export default {
    created() {
        const self = this;
        firebase.auth().onAuthStateChanged((user) => {
            switch (user.uid) { 
 
                case LiverootUID:{ self.UserDes = "Root"; break}
                case LiveadminUID:{self.UserDes = "Admin"; break}    
            }
        })
        self.adminNotificationsRef.on('value', function (snap) {
            if (snap.val() !== null) {
                self.processNotification(snap.val());
            } else {
                self.notiLoader = false;
            }
        });
    },
    data: function () {
        const db = firebase.database();
        return {
            notiLoader: true,
            adminNotificationsRef: db.ref('admin_notifications'),
            notiData: [],
            unReadMsg: 0,
            UserDes: '',
        }
    },
    methods: {
        logout: function () {
            firebase.auth().signOut();
        },
        async processNotification(snapVal) {
            const self = this;

            self.notiData = _.reverse(_.values(snapVal));
            self.unReadMsg = _.size(_.filter(snapVal, {
                seen: false
            }));

            self.notiLoader = false;

        },
        notiClick(data) {
            if (data.seen === false) {
                this.adminNotificationsRef.child(data.id).update({
                    seen: true
                }, function (err) {
                    if (err) {
                        console.error("Notification update error: ", err);
                    }
                });
            }
        },
        genDate(string) {
            return moment(string).format("DD MMM YYYY");
        }
    }
}