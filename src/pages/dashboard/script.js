import firabase from 'firebase'
import _ from 'lodash'
import dashboardLayout from '../../partials/layouts/dashboardLayout/dashboardLayout.vue'
import {
    GChart
} from 'vue-google-charts'
import func from '../../../custom_libs/func';
import moment from 'moment';
import axios from 'axios';
import Datepicker from 'vuejs-datepicker';
//var tks = [0];
export default {
    components: {
        dashboardLayout,
        'date_picker': Datepicker,
        'gchart': GChart
    },
    watch: {
        FromDate: function (val) {
            this.startDate = moment(val).startOf('day').valueOf();
        },
        ToDate: function (val) {
            this.endDate = moment(val).endOf('day').valueOf();
        },
    },
    created() {

        const self = this;
        self.userRef.once('value', function (snap) {

            self.UsersData = snap;
            if (snap.val() !== null) {
                self.user.active.count = _.filter(snap.val(), {
                    status: 1
                }).length;
                self.user.inactive.count = _.filter(snap.val(), {
                    status: 0
                }).length;
            }
            self.user.loader = false;
        }).then(() => {
            self.driverRef.once('value', function (snap) {
                self.DriversData = snap;
                if (snap.val() !== null) {
                    self.driver.active.count = _.filter(snap.val(), {
                        status: 1
                    }).length;
                    self.driver.blocked.count = _.filter(snap.val(), {
                        blocked: true
                    }).length;
                    self.driver.inactive.count = _.filter(snap.val(), {
                        status: 0
                    }).length;
                    self.driver.bikers.count = _.filter(snap.val(), {
                        vehicle: "Bike"
                    }).length;
                    self.driver.cars.count = _.filter(snap.val(), {
                        vehicle: "Car"
                    }).length;
                    self.driver.pickup.count = _.filter(snap.val(), {
                        vehicle: "Pickup"
                    }).length;
                    self.driver.truck.count = _.filter(snap.val(), {
                        vehicle: "Truck"
                    }).length;
                }
                self.driver.loader = false;
            }).then(() => {
                self.requestsRef.once('value', function (snap) {

                    if (snap.val() !== null) {
                        let grab = 0;
                        let Canceled = 0;
                        snap.forEach(function (c_snap) {
                            let user_jobs = c_snap.val();
                            c_snap.forEach(function (reqsnap) {
                                let reqKey = reqsnap.key;
                                let reqData = reqsnap.val();
                                let Request = [];
                                Request[reqKey] = reqData;
                                self.requestsData.push(Request);
                                if (reqData.hasOwnProperty('canceledAt')) {
                                    Canceled++;
                                    self.canceledRequestData.push(Request);
                                }
                            })
                            grab += Object.keys(user_jobs).length;
                        });
                        self.jobs.total.count = grab;
                        self.jobs.Canceled.count = Canceled;
                    }
                    self.jobs.loader = false;
                }).then(() => {
                    self.setValues();
                });
            });
        });
    },
    data: function () {
        const db = firabase.database();
        return {
            FromDate: '',
            ToDate: '',
            startDate: 0,
            endDate: 0, 
            requestsData: [],
            DriversData: [],
            UsersData: [],
            canceledRequestData: [],
            canceledrequestListData: [],
            requestListData: [],
            driverListData: [],
            userListData: [],
            chartData: [
                ['Date', 'Users', 'Drivers', 'Requests', 'Canceled Requests']
            ],
            ChartOpt: ['D', 'U', 'R', 'C'],
            ChartOpts: "All",
            chartOptions: {
                chart: {
                    title: 'Roadioapp Charts',
                    subtitle: 'Sales, Expenses, and Profit: 2014-2017',

                },
                colors: ['#f4b400', '#4285f4', '#0f9d58', '#db4437'],
                curveType: 'function',
                legend: {
                    position: 'bottom'
                },
                height: 400,
                is3D: true,
                pointSize: 3,
                vAxis: {
                    minValue: 0,
                },
                vAxis: {
                    scaleType: 'Continuous'
                },

                vAxis: {
                    format: 'short',
                    gridlines: {
                        count: 4
                    }, 
                },

            },
            userRef: db.ref("users").orderByChild("type").equalTo("client"),
            driverRef: db.ref("users").orderByChild("type").equalTo("driver"),
            requestsRef: db.ref("user_requests"),
            user: {
                active: {
                    count: 0
                },
                inactive: {
                    count: 0
                },
                loader: true
            },
            driver: {
                blocked: {
                    count: 0
                },
                bikers: {
                    count: 0
                },
                cars: {
                    count: 0
                },
                pickup: {
                    count: 0
                },
                truck: {
                    count: 0
                },
                active: {
                    count: 0
                },
                inactive: {
                    count: 0
                },
                loader: true,
            },
            jobs: {
                loader: true,
                total: {
                    count: 0
                },
                Canceled:{
                    count:0
                }
            }
        }
    },
    methods: {
        filterData: function () {
            let self = this;
            let Users = self.UsersData;
 

            if (Users.val() !== null) {
                self.user.active.count = _.filter(Users.val(), {
                    status: 1,
                }).length;
                self.user.inactive.count = _.filter(Users.val(), {
                    status: 0
                }).length;
            }

            let UserDataWithDate = [];
            self.UsersData.forEach(element => {
                let user = {}
                let data = element.val();

                if (data.hasOwnProperty('createdAt') == false && element.key.length == 20) {
                    data['createdAt'] = func.decode_key(element.key)
                } else if (data.hasOwnProperty('createdAt')) {

                } else {
                    axios.get(`https://localhost/api/test?uid=` + element.key)
                        .then(response => {
                            data['createdAt'] = moment(response.data['Time']).valueOf();
                        }).catch(e => {
                            console.log(e);
                        })
                }
                UserDataWithDate.push(user[element.key] = data)
            });
            setTimeout(function () {
                self.user.active.count = _.filter(UserDataWithDate, function (user) {
                    if (user.createdAt >= self.startDate && user.createdAt <= self.endDate && user.status == 1) {
                        return user;
                    }
                }).length;
                self.user.inactive.count = _.filter(UserDataWithDate, function (user) {
                    if (user.createdAt >= self.startDate && user.createdAt <= self.endDate && user.status == 0) {
                        return user;
                    }
                }).length;
            }, 2000);

            let DriversDataWithDate = [];
            self.DriversData.forEach(element => {
                let driver = {}
                let data = element.val();

                if (data.hasOwnProperty('createdAt') == false && element.key.length == 20) {
                    data['createdAt'] = func.decode_key(element.key)
                } else if (data.hasOwnProperty('createdAt')) {

                } else {
                    axios.get(`https://localhost/api/test?uid=` + element.key)
                        .then(response => {
                            data['createdAt'] = moment(response.data['Time']).valueOf();
                        }).catch(e => {
                            console.log(e);
                        })
                }
                DriversDataWithDate.push(driver[element.key] = data)
            });




            setTimeout(function () {
                self.driver.active.count = _.filter(DriversDataWithDate, function (driver) {
                    if (driver.createdAt >= self.startDate && driver.createdAt <= self.endDate && driver.status == 1) return driver;
                }).length;
                self.driver.inactive.count = _.filter(DriversDataWithDate, function (driver) {
                    if (driver.createdAt >= self.startDate && driver.createdAt <= self.endDate && driver.status == 0) return driver;
                }).length;
                self.driver.bikers.count = _.filter(DriversDataWithDate, function (driver) {
                    if (driver.createdAt >= self.startDate && driver.createdAt <= self.endDate  && driver.vehicle == "Bike") return driver;
                }).length;
                self.driver.cars.count = _.filter(DriversDataWithDate, function (driver) {
                    if (driver.createdAt >= self.startDate && driver.createdAt <= self.endDate  && driver.vehicle == "Car") return driver;
                }).length;
                self.driver.pickup.count = _.filter(DriversDataWithDate, function (driver) {
                    if (driver.createdAt >= self.startDate && driver.createdAt <= self.endDate  && driver.vehicle == "Pickup") return driver;
                }).length;
                self.driver.truck.count = _.filter(DriversDataWithDate, function (driver) {
                    if (driver.createdAt >= self.startDate && driver.createdAt <= self.endDate  && driver.vehicle == "Truck") return driver;
                }).length;



                self.jobs.total.count = _.filter(self.requestsData, function (req) {
                    req = Object.values(req)[0];
                    if (req.createdAt >= self.startDate && req.createdAt <= self.endDate) return req;

                }).length;

                self.jobs.Canceled.count = _.filter(self.requestsData, function (req) {
                    req = Object.values(req)[0];
                    if (req.createdAt >= self.startDate && req.createdAt <= self.endDate && req.hasOwnProperty('canceledAt')) return req;

                }).length;

                
            }, 1000);
            self.ChartOpts = 'filter';
            self.RefreshChartx(self.ChartOpt, self.ChartOpts);


        },
        AddDataInChart(startDATE_moment, ENDDATE_timestemp, Columns_array, SecQuence_type) {

            let self = this;
            let Countdrivers = 0;
            let Countusers = 0;
            while (startDATE_moment.unix() <= ENDDATE_timestemp) {

                let Countcanceledrequests = 0;
                let Countrequests = 0;


                let StartMonth = moment(startDATE_moment).startOf(SecQuence_type);
                let EndMonth = moment(startDATE_moment).endOf(SecQuence_type);

                self.canceledrequestListData.forEach(element => {
                    if (moment(element).unix() >= StartMonth.unix() && moment(element).unix() <= EndMonth.unix()) {
                        Countcanceledrequests++;
                    }
                });
                self.requestListData.forEach(element => {
                    if (moment(element).unix() >= StartMonth.unix() && moment(element).unix() <= EndMonth.unix()) {
                        Countrequests++;
                    }
                });
                self.driverListData.forEach(element => {
                    if (moment(element).unix() >= StartMonth.unix() && moment(element).unix() <= EndMonth.unix()) {
                        Countdrivers++;
                    }
                });
                self.userListData.forEach(element => {
                    if (moment(element).unix() >= StartMonth.unix() && moment(element).unix() <= EndMonth.unix()) {
                        Countusers++;
                    }
                });

                let ChartdataRow = [];

                Columns_array.forEach(element => {
                    switch (element) {
                        case "Date":
                            {
                                ChartdataRow.push(SecQuence_type == 'day' ? startDATE_moment.format('DD MMM YY') : startDATE_moment.format('MMM YY'));
                                break
                            }
                        case "Drivers":
                            {
                                ChartdataRow.push(Countdrivers);
                                break
                            }
                        case "Users":
                            {
                                ChartdataRow.push(Countusers);
                                break
                            }
                        case "Requests":
                            {
                                ChartdataRow.push(Countrequests);
                                break
                            }
                        case "Canceled Requests":
                            {
                                ChartdataRow.push(Countcanceledrequests);
                                break
                            }
                    }

                });

                self.chartData.push(ChartdataRow);
 
                startDATE_moment = startDATE_moment.add(1, SecQuence_type + 's').startOf(SecQuence_type);

            }



        },

        ResetChart: function () {
            let self = this;
            self.chartData = [

                ['Date', 'Users'],
                ['0', 0]
            ]
        },
        timestamp:function(time){
            return moment(time).unix();
    
        },
        createChart: function () {
            //'Users', 'Drivers', 'Requests', 'Canceled Requests'
            let self = this;
            let start_Date = moment([2018, 1, 1]).startOf('year');
            let end_Date = moment().unix();
            let next_date = start_Date;

            let Countdrivers = 0;
            let Countusers = 0;
            while (next_date.unix() <= end_Date) {

                let Countcanceledrequests = 0;
                let Countrequests = 0;



                let StartMonth = moment(next_date).startOf('month');
                let EndMonth = moment(next_date).endOf('month');

                self.canceledrequestListData.forEach(element => {
                    if (moment(element).unix() >= StartMonth.unix() && moment(element).unix() <= EndMonth.unix()) {
                        Countcanceledrequests++;
                    }
                });
                self.requestListData.forEach(element => {
                    if (moment(element).unix() >= StartMonth.unix() && moment(element).unix() <= EndMonth.unix()) {
                        Countrequests++; 
                    }
                });
                self.driverListData.forEach(element => {
                    if (moment(element).unix() >= StartMonth.unix() && moment(element).unix() <= EndMonth.unix()) {
                        Countdrivers++;
                    }
                });
                self.userListData.forEach(element => {
                    if (moment(element).unix() >= StartMonth.unix() && moment(element).unix() <= EndMonth.unix()) {
                        Countusers++;
                    }
                });

                self.chartData.push([next_date.format('MMM YY'), Countusers, Countdrivers, Countrequests, Countcanceledrequests]);
 
                next_date = next_date.add(1, 'months').startOf('month');

            } 
        },

        RefreshChartx: function (opt, opts) {
            let self = this;
            let startDATE_moment = moment([2018, 1, 1]).startOf('year');
            let ENDDATE_timestemp = moment();
            let ChartHead = ['Date'];
            let dataChuks = 'month';
 
            switch (opts) {
                case "All":
                    {
                        startDATE_moment = moment([2018, 1, 1]).startOf('year');
                        dataChuks = 'month';
                        break;
                    }
                case "Month":
                    {
                        startDATE_moment = moment().startOf('month');

                        dataChuks = 'day';
                        break;
                    }
                case "Week":
                    {
                        startDATE_moment = moment().startOf('week');
                        dataChuks = 'day';
                        break;
                    }
                case "filter":
                    {
                        dataChuks = 'day';
                        break;
                    }
            }
            self.chartOptions.colors = [];

            ['D', 'U', 'R', 'C'].forEach((Q_option) => {
                opt.forEach((A_option) => {
                    if (A_option == Q_option) {
                        switch (A_option) {
                            case 'D':
                                {
                                    ChartHead.push('Drivers');self.chartOptions.colors.push('#4285f4');
                                    break
                                }
                            case 'U':
                                {
                                    ChartHead.push('Users');self.chartOptions.colors.push('#f4b400');
                                    break
                                }
                            case 'R':
                                {
                                    ChartHead.push('Requests');self.chartOptions.colors.push('#0f9d58');
                                    break
                                }
                            case 'C':
                                {
                                    ChartHead.push('Canceled Requests');self.chartOptions.colors.push('#db4437');
                                    break
                                }
                        }
                    }
                });



            });
            self.chartData = [ChartHead];

            if (opts == 'filter') {
                self.AddDataInChart(moment(self.startDate), moment(self.endDate).unix(), ChartHead, dataChuks)
            } else {
                self.AddDataInChart(startDATE_moment, ENDDATE_timestemp.unix(), ChartHead, dataChuks)
            }
            if (self.chartOptions.colors.length == 0) {
                self.chartOptions.colors = ['#db4437']
            } 
        },
        RefreshChart: function (opt) {
            let self = this;
            let startDATE_moment = moment([2018, 1, 1]).startOf('year');
            let ENDDATE_timestemp = moment().unix();

            switch (opt) {
                case 'D':
                    {
                        self.chartOptions.colors = ['#4285f4'];
                        break;
                    }
                case 'U':
                    {
                        self.chartOptions.colors = ['#f4b400'];
                        break;
                    }
                case 'R':
                    {
                        self.chartOptions.colors = ['#0f9d58'];
                        break;
                    }
                case 'C':
                    {
                        self.chartOptions.colors = ['#db4437'];
                        break;
                    }
                case 'M':
                    {
                        self.chartOptions.colors = ['#f4b400', '#4285f4', '#0f9d58', '#db4437'];
                        break;
                    }

            }
            self.AddDataInChart(startDATE_moment, ENDDATE_timestemp, opt, 'month')

        },


        setValues: function () {
            let self = this;
            let canceledrequestListing = [];
            self.canceledRequestData.forEach(req => {
                if (Object.values(req)[0].hasOwnProperty('createdAt') && (Object.values(req)[0].createdAt + "").length == 13) {

                    canceledrequestListing.push(Object.values(req)[0].createdAt);
                } else {
                    console.log("x");

                }
            });
            let requestListing = [];
            self.requestsData.forEach(req => {
                if (Object.values(req)[0].hasOwnProperty('createdAt')) {
                    if (((Object.values(req)[0].createdAt) + "").length != 13) {
                        requestListing.push(func.decode_key(Object.keys(req)[0]))

                    } else {
                        requestListing.push(Object.values(req)[0].createdAt)
                    }

                } else {
                    console.log(Object.values(req));
                }
            });
            let driverListing = [];
            self.DriversData.forEach(driver => {
                if (driver.val().hasOwnProperty('createdAt')) {
                    driverListing.push(driver.val().createdAt);

                } else if (driver.key.length == 20) {
                    driverListing.push(func.decode_key(driver.key));
                } else {
                    axios.get(`https://localhost/api/test?uid=` + driver.key)
                        .then(response => {
                            driverListing.push(moment(response.data['Time']).format('DD MMM YYYY'))
                        }).catch(e => {
                            console.log(e);
                        })
                }
            });
            let userListing = [];
            self.UsersData.forEach(user => {
                if (user.val().hasOwnProperty('createdAt')) {
                    userListing.push(user.val().createdAt);
                } else if (user.key.length == 20) {
                    userListing.push(func.decode_key(user.key))
                } else {
                    axios.get(`https://localhost/api/test?uid=` + user.key)
                        .then(response => {
                            userListing.push(moment(response.data['Time']).valueOf());
                        }).catch(e => {
                            console.log(e);
                        })
                }
            });

            setTimeout(function () { 
                self.canceledrequestListData = _.sortBy(canceledrequestListing);
                self.requestListData = _.sortBy(requestListing);
                self.driverListData = _.sortBy(driverListing);
                self.userListData = _.sortBy(userListing);
                self.createChart();
            }, 5000);
        },
    }

}