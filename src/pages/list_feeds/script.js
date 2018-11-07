import firebase from 'firebase'
import moment from 'moment'
import _ from 'lodash'
import Datepicker from 'vuejs-datepicker'
export default {
    components: {
        'date_picker': Datepicker,
    },

    mounted() {
        const self = this;

        $(function () {
            $("body").on("click", ".open_row", function () {
                let grabLink = $(this).attr("data-url");
                if (grabLink !== "") {
                    self.$router.push(grabLink);
                }
            });
        });
    },

    watch: {

        IsLoading: function () {
            let self = this;
            self.$forceUpdate();
        }
    },
    created() {
        let self = this;

        self.newsRef.on('value', function (snap) {
            self.feeds = snap.val();
        })
    },
    data() {

        var storage = firebase.storage();
        var db = firebase.database();
        return {
            IsLoading: new Set(),
            newsRef: db.ref('/news'),
            NewsIMGRef: storage.ref('/news'),
            feeds: [],
        }
    },
    methods: {
        formatDate: function (date) {
            return moment(date).format('DD MMM YYYY')
        },
        statusChange: function (key, code) { 
            let self = this;
            self.IsLoading.add(key);

            self.newsRef.child(key).update({
                status: code ? 'live' : 'delete'
            }).then(() => {
                self.IsLoading.delete(key);
                self.$forceUpdate();
            }).catch(() => {
                self.IsLoading.add(key);
            });
        },
        deleteNews(key) {
            let self = this;  
            self.NewsIMGRef.child(key + '.png').delete().then(function () {console.log("done!png")}).catch(function (error) {});
            self.NewsIMGRef.child(key + '.gif').delete().then(function () {console.log("done!gif")}).catch(function (error) {});
            self.NewsIMGRef.child(key + '.jpeg').delete().then(function () {console.log("done!jpeg")}).catch(function (error) {});
            self.NewsIMGRef.child(key + '.jpg').delete().then(function () {console.log("done!jpg")}).catch(function (error) {});
            self.newsRef.child(key).remove()

        }
    },

}