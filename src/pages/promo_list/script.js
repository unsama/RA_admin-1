import firebase from 'firebase'
import func from '../../../custom_libs/func'
import moment from 'moment'
import progressbar from 'vue-progress-bar'


import tableComp from '../../partials/components/html_utils/tabel_comp.vue'

export default {
    components: {
        'table_comp': tableComp,
        'progress-bar': progressbar,
    },
    created: function () {
        let self = this;

        const db = firebase.database();
        self.PromoRef = db.ref('/promo_code');
        self.PromoRef.on('value', function(snap){
            let renderData = snap.val();
            self.data1 = [];
            if(renderData !== null) {
                let renderDataKeys = Object.keys(renderData);
                let process_item = 0;
                let grabData = [];
                renderDataKeys.forEach(function (val) { 
                    let item = renderData[val];
                    item['key'] = val;
                    if (item['expdate'].indexOf('-') > -1)
                    item['expdate'] = func.set_date_ser( item['expdate'])
                    else
                    item['expdate'] = func.set_date_ser(parseInt(item['expdate'])) 
                   // console.log(item['expdate']);
                    item['created'] = func.set_date_ser(new Date(func.decode_key(val)));
                    grabData.push(item);
                    process_item++;
                    if (process_item === renderDataKeys.length) {
                        self.data1 = grabData; 
                        self.dataLoad = false;
                    }
                });
            }
        });
    },
    data: function () {
        return {
            dataLoad: true,
            data1: [],
            userRef: null,
            profile: [],
            PromoRef: null,
            counter: 45,
            max: 100,
            progressValue: [],
            removeID: "",
        }
    },
    methods: {
        deActive: function (key, index, event) {
            event.stopPropagation();
            let self = this;
            if(self.PromoRef){
                self.PromoRef.child(key).update({
                    status: 1
                }, function (err) {
                    if(err){
                        console.log(err)
                    }
                });
            }
        },
        active: function (key, index, event) {
            event.stopPropagation();
            let self = this;
            if(self.PromoRef){
                self.PromoRef.child(key).update({
                    status: 0
                }, function (err) {
                    if(err){
                        console.log(err)
                    }
                });
            }
        },
       
    }
}