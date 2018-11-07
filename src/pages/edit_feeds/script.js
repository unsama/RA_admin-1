import firebase from 'firebase'
import moment from 'moment'
import _ from 'lodash'
import Datepicker from 'vuejs-datepicker'
import VeeValidate from 'vee-validate';


export default {
    components: {
        'date_picker': Datepicker,
    },
    watch: {
        Heading: function (e) {
            let self = this;
            self.Updated.add("Heading");
            if (self.Heading == self.Old_Heading) {
                self.Updated.delete("Heading");
            }
            if (self.Heading.length < 5 || self.Heading.length > 25) {
                self.ERRs.add('Heading');
            } else {
                self.ERRs.delete('Heading');
            }
            self.$forceUpdate();
        },
        Description: function (e) {
            let self = this;

            self.Updated.add("Description");
            if (self.Description == self.Old_Description) {
                self.Updated.delete("Description");
            }


            if (self.Description.length < 10 || self.Description.length > 500) {
                self.ERRs.add('Description');
            } else {
                self.ERRs.delete('Description');
            }
            self.$forceUpdate();
        },
        TermsConditions: function (e) {
            let self = this;

            self.Updated.add("TermsConditions");
            if (self.TermsConditions == self.Old_TermsConditions) {
                self.Updated.delete("TermsConditions");
            }

            if (self.TermsConditions.length < 10 || self.TermsConditions.length > 500) {
                self.ERRs.add('TermsConditions');
            } else {
                self.ERRs.delete('TermsConditions');
            }
            self.$forceUpdate();
        },
        ExpDate: function (e) {
            let self = this;

            self.Updated.add("ExpDate");
            if (self.ExpDate == self.Old_ExpDate) {
                self.Updated.delete("ExpDate");
            }
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
        },
        file: function (e) {
            let self = this;
            if (e !== 'Not IMG') {
                self.Updated.add("IMG");
                self.ERRs.delete('IMG');

            } else {

                self.Updated.delete("IMG");
                self.ERRs.add('IMG');
            }
            self.$forceUpdate();
        }


    },
    data() {
        var storage = firebase.storage();
        var db = firebase.database();
        return {
            IMD: null,
            ERRs: new Set(['Heading', 'Description', 'TermsConditions', 'ExpDate']),
            Updated: new Set(),
            SubmitActions: new Set(['NotDone']),

            Heading: '',
            Description: '',
            TermsConditions: '',
            ExpDate: '',

            Old_Heading: '',
            Old_Description: '',
            Old_TermsConditions: '',
            Old_ExpDate: '',

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
    /* mounted() {
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
                         //alert("not a valid Image Size ");
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



     },*/


    created() {
        let self = this;
        self.newsRef.child(self.$route.params.id).once('value').then((snap) => {
            let data = snap.val();

            self.Heading = data.heading;
            self.Description = data.description;
            self.TermsConditions = data.termsConditions;
            self.ExpDate = moment(new Date(data.expDate)).format('DD MMM YYYY');

            self.Old_Heading = data.heading;
            self.Old_Description = data.description;
            self.Old_TermsConditions = data.termsConditions;
            self.Old_ExpDate = moment(new Date(data.expDate)).format('DD MMM YYYY');


        })
    },
    methods: {
        onChange() {
            let self = this;
            self.$validator.validate().then(result => {
                if (!result) {
                    alert(self.$validator.errors.first('dimensions_field'))
                    self.ERRs.add('IMG');
                    self.file = 'Not IMG';
                } else {
                    let x = document.getElementById('file');
                    self.file = x.files[0]
                }

            })
            self.$forceUpdate();
        },
        MaxLength() {
            let self = this;
            self.Heading = self.Heading.substring(0, Math.min(self.Heading.length, 25));
            self.Description = self.Description.substring(0, Math.min(self.Description.length, 500));
            self.TermsConditions = self.TermsConditions.substring(0, Math.min(self.TermsConditions.length, 500));
        },
        PushData() {
            let self = this;
            self.IsSubmited = true;

            self.newsRef.child(self.$route.params.id).update({
                heading: self.Heading,
                description: self.Description,
                termsConditions: self.TermsConditions,
                expDate: moment(self.ExpDate).endOf('day').valueOf(),
            }).then((e) => {

                if (self.file == null || self.file == 'Not IMG') {
                    self.IsSubmited = true;
                    alert('Data Has Been Updated!!!');

                    self.$router.push({
                        path: '/admin/feeds'
                    });


                } else {
                    let ext = self.file.name.split('.').pop();

                    self.NewsIMGRef.child(self.$route.params.id + '.' + ext).put(self.file).then((e) => {

                        self.newsRef.child(self.$route.params.id).update({
                            downloadURL: e.downloadURL
                        }).then(() => {
                            self.IsSubmited = true;
                            alert('Data Has Been Updated With Image!!!');

                            self.$router.push({
                                path: '/admin/feeds'
                            });
                        }).catch((e) => {
                            self.IsSubmited = false;
                            console.log(e)
                        });
                    })
                }

            }).catch((e) => {
                self.IsSubmited = false;
                console.log(e)
            });

            /*
                        


                        self.NewsIMGRef.child(newsId + '.' + ext).put(self.file).then((e) => {
                            self.newsRef.child(newsId).set({ 
                                heading: self.Heading,
                                description: self.Description,
                                termsConditions: self.TermsConditions,
                                expDate: moment(self.ExpDate).endOf('day').valueOf(),
                                downloadURL: e.downloadURL,
                                status: 'live',
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
            */
        }
    }
}