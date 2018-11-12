import firebase from 'firebase' 
import moment from 'moment'
import _ from 'lodash' 
import Datepicker from 'vuejs-datepicker'
export default {
    components: {
        'date_picker': Datepicker,
    },

    watch: {
        Heading: function (e) {
            let self = this;
            if (self.Heading.length < 5 || self.Heading.length > 25) {
                self.ERRs.add('Heading');
            } else {
                self.ERRs.delete('Heading');
            }
            self.$forceUpdate();
        },
        Description: function (e) {
            let self = this;
            if (self.Description.length < 10 || self.Description.length > 500) {
                self.ERRs.add('Description');
            } else {
                self.ERRs.delete('Description');
            }
            self.$forceUpdate();
        },
        TermsConditions: function (e) {
            let self = this;
            if (self.TermsConditions.length < 10 || self.TermsConditions.length > 500) {
                self.ERRs.add('TermsConditions');
            } else {
                self.ERRs.delete('TermsConditions');
            }
            self.$forceUpdate();
        },
        ExpDate: function (e) {
            let self = this;
            if (moment(e).isValid()) {
                self.ERRs.delete('ExpDate');
            } else {
                self.ERRs.add('ExpDate');
            }
            self.$forceUpdate();
        },
        IsSubmited: function (e) {
            let self = this
            if (e) {

                self.SubmitActions.delete('NotDone');
            } else {
                self.SubmitActions.add('NotDone');
            }
            self.$forceUpdate();
        }
    },

    data() {
        var storage = firebase.storage();
        var db = firebase.database();
        return {
            ERRs: new Set(['Heading', 'Description', 'TermsConditions', 'ExpDate', 'IMG']),
            SubmitActions: new Set(['NotDone']),
            Heading: '',
            Description: '',
            TermsConditions: '',
            ExpDate: '',
            newsRef: db.ref('/news'),
            NewsIMGRef: storage.ref('/news'),
            state: {
                disabledDates: {
                    to: new Date(Date.now() - 8640000)
                }
            },
            file: null,
            img: null,
            IsSubmited: false,
        }
    },
    mounted() {
        let self = this;
        var _URL = window.URL || window.webkitURL;
        $("#file").change(function (e) {
            // var file, img;
            if ((self.file = this.files[0])) {
                self.img = new Image();
                self.img.onload = function () {
                    //let img = this;
                    if (self.img.width == 1080 && self.img.height == 720) {
                        self.ERRs.delete('IMG');
                    } else {
                        alert("not a valid Image Size ");
                        self.img.onerror();
                    }
                };
                self.img.onerror = function () {
                    alert("not a valid file : " + self.file.type);
                    $("#file").replaceWith($("#file").val('').clone(true));
                    self.ERRs.add('IMG');
                };
                self.img.src = _URL.createObjectURL(self.file);
            }
        });
    },
    methods: {
        MaxLength() {
            let self = this;
            self.Heading = self.Heading.substring(0, Math.min(self.Heading.length, 25));
            self.Description = self.Description.substring(0, Math.min(self.Description.length, 500));
            self.TermsConditions = self.TermsConditions.substring(0, Math.min(self.TermsConditions.length, 500));
        },
        PushData() {
            let self = this;
            self.IsSubmited = true;

            var newPostRef = self.newsRef.push({
                Heading: self.Heading,
                Description: self.Description,
                TermsConditions: self.TermsConditions,
                ExpDate: moment(self.ExpDate).endOf('day').valueOf(),
            });
            var newsId = newPostRef.key;

            let ext = self.file.name.split('.').pop();


            self.NewsIMGRef.child(newsId + '.' + ext).put(self.file).then((e) => {
                self.newsRef.child(newsId).set({
                    createdDate: moment().valueOf(), 
                    heading: self.Heading,
                    description: self.Description,
                    termsConditions: self.TermsConditions,
                    expDate: moment(self.ExpDate).endOf('day').valueOf(),
                    downloadURL: e.downloadURL,
                    status:'live'
                }).then((e) => {
                    alert("Data Has Been Saved!!!")
                    self.IsSubmited = true;
                    self.$router.push({
                        path: '/admin/feeds'
                    });
                }).catch((e) => {
                    self.IsSubmited = false;
                })
            }).catch((e) => {
                self.IsSubmited = false;
            });

        }
    }
}