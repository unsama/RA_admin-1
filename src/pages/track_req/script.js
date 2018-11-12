import firebase from 'firebase'
import moment from 'moment'
import _ from 'lodash'
import {
    setInterval
} from 'timers';
export default {

    created: function () {
        let self = this;
        if (self.$route.params.id) {
            $(function () {
                if (!self.$root.mapLoaded) {
                    $.getScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyCeDfncmN-9FXb-1Gv4wcRpDWZ4AUnrqws")
                        .done(function (script, textStatus) {
                            self.$root.mapLoaded = true;
                            self.mapInit();
                        })
                        .fail(function (jqxhr, settings, exception) {
                            console.log("Triggered ajaxError handler.");
                        });
                } else {
                    self.mapInit();
                }
            })
        }
    },
    watch: {
        reqStatus: function (e) {
            let self = this;
            try {
                self.CreateRoute();
            } catch (e) {

            }

        },
        driverDirection: function (e) {
            let self = this;
            self.Vehicle = new google.maps.LatLng(e.lat, e.lng);

            self.vehicleMarker = new google.maps.Marker({
                position: self.Vehicle,
                map: self.map,
                draggable: false,
                icon: {
                    url: self.vehicleimg,
                    setOpacity: 0.2,
                    scaledSize: new google.maps.Size(35, 35)
                },
            });



            self.CreateRoute();
        },
        destinationorigin: function (e) {
            let self = this;
            self.Start = new google.maps.LatLng(e.org.lat, e.org.lng);
            self.End = new google.maps.LatLng(e.dec.lat, e.dec.lng);


            self.startMarker = new google.maps.Marker({
                position: self.Start,
                map: self.map,
                draggable: true,
                icon: {
                    url: "/images/icons/pin_yellow.png",
                    setOpacity: 0.2,
                    scaledSize: new google.maps.Size(35, 35)
                },
            });


            self.endMarker = new google.maps.Marker({
                position: self.End,
                map: self.map,
                draggable: true,
                icon: {
                    url: "/images/icons/pin_black.png",
                    setOpacity: 0.2,
                    scaledSize: new google.maps.Size(35, 35)
                },
            });
            self.CreateRoute();
        }

    },

    data: function () {

        const db = firebase.database();
        return {
            map: null,
            infoWindows: null,
            directionsDisplay: null,
            directionsService: null,
            D1: null,
            D2: null,
            activeReqRef: db.ref('/user_active_requests'),
            activeDriverRef: db.ref('active_driver/'),
            driverRef: db.ref('/users'),
            requestsRef: db.ref('user_requests/'),
            desLat: null,
            desLng: null,
            orgLat: null,
            orgLng: null,
            destinationorigin: null,

            driverDirection: null,
            driLat: null,
            driLng: null,
            vehicleimg: null,
            reqStatus: null,
            driverID: null,
            Start: null,
            End: null,
            Vehicle: null,
            startMarker: null,
            endMarker: null,
            vehicleMarker: null,


        }
    },
    methods: {
        mapInit: function () {
            let self = this;
            self.infoWindows = new google.maps.InfoWindow;
            var karachi = new google.maps.LatLng(24.8607, 67.0011);
            let mapOptions = {
                zoom: 12,
                center: karachi
            };
            self.directionsService = new google.maps.DirectionsService();
            self.directionsDisplay = new google.maps.DirectionsRenderer({
                polylineOptions: {
                    strokeColor: "black"
                }
            });
            self.directionsDisplay.setMap(self.map);
            self.directionsDisplay.setOptions({
                suppressMarkers: true
            });
            self.map = new google.maps.Map(document.getElementById('map'), mapOptions);

            self.LoadLiveRequest();

            //self.calcRoute();
        },
        CreateRoute() {
            let self = this;

            let st;
            let nd; 
            switch (self.reqStatus) {
                case 'req.accept':
                    {
                        st = self.vehicleMarker.getPosition();
                        nd = self.startMarker.getPosition()

                        break
                    } //D O
                case 'req.pickup':
                    {
                        st = self.vehicleMarker.getPosition();
                        nd = self.startMarker.getPosition()

                        break
                    } //D O
                case 'req.active':
                    {
                        st = self.vehicleMarker.getPosition();
                        nd = self.endMarker.getPosition()

                        break
                    } //D D
                case 'req.complete':
                    {
                        st = self.startMarker.getPosition();
                        nd = self.endMarker.getPosition();
                    } //O D
            }

            if (self.startMarker && self.endMarker) {
                var requestData = {
                    origin: st,
                    destination: nd,
                    travelMode: google.maps.TravelMode.DRIVING
                };
                self.directionsService.route(requestData, function (response, status) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        self.directionsDisplay.setDirections(response);
                        self.directionsDisplay.setMap(self.map);
                    } else {
                        alert("Directions Request from " + start.toUrlValue(6) + " to " + end.toUrlValue(6) + " failed: " + status);
                    }
                });

            }

        },
        LoadLiveRequest: function () {
            let self = this;
            self.activeReqRef.orderByChild('req_id').equalTo(self.$route.params.id).on('value', function (snapshot) {
                //console.log(snapshot.val());
                self.reqStatus = Object.values(snapshot.val())[0].status;
                self.driverID = Object.values(snapshot.val())[0].driver_uid;

                self.driverRef.child(self.driverID).once('value', snapdriver => {


                    let vehicles = {
                        Bike: "/images/icons/bike_pin.png",
                        Car: "/images/icons/car_pin.png",
                        Pickup: "/images/icons/pickup_pin.png",
                        Truck: "/images/icons/truck_pin.png"
                    };

                    self.vehicleimg = vehicles[snapdriver.val().vehicle]; 
                })

                self.activeDriverRef.on('value', function (snapshotdrivers) {
                    snapshotdrivers.forEach(driver => {
                        if (self.driverID == driver.key) {
                            self.driverDirection = {
                                'lat': driver.val().lat,
                                'lng': driver.val().lng
                            }
                        }
                    });
                });



            });
            self.requestsRef.once('value', function (requestsnap) {
                requestsnap.forEach(user => {
                    user.forEach(req => {
                        if (req.key == self.$route.params.id) {
                            self.destinationorigin = {
                                'dec': {
                                    'lat': req.val().desLat,
                                    'lng': req.val().desLng,
                                },
                                'org': {
                                    'lat': req.val().orgLat,
                                    'lng': req.val().orgLng,
                                }
                            }
                        }
                    });
                });
            })
        },




        calcRoute: function () {
            var start = new google.maps.LatLng(self.orgLat, self.orgLng);
            var vehicle = new google.maps.LatLng(self.driLat, self.driLng);
            var end = new google.maps.LatLng(self.desLat, self.desLng);
            var startMarker = new google.maps.Marker({
                position: start,
                map: self.map,
                draggable: true,
                icon: {
                    url: "/images/icons/pin_yellow.png",
                    setOpacity: 0.2,
                    scaledSize: new google.maps.Size(35, 35)
                },
            });
            setInterval(function () {
                var vehicleMarker = new google.maps.Marker({
                    position: vehicle,
                    map: self.map,
                    draggable: false,
                    icon: {
                        url: self.vehicleimg,
                        setOpacity: 0.2,
                        scaledSize: new google.maps.Size(35, 35)
                    },
                });
                vehicleMarker.addListener('click', function () {
                    var requestData = {
                        origin: vehicleMarker.getPosition(),
                        destination: end,
                        travelMode: google.maps.TravelMode.DRIVING
                    };
                    self.directionsService.route(requestData, function (response, status) {
                        if (status == google.maps.DirectionsStatus.OK) {
                            self.directionsDisplay.setDirections(response);
                            self.directionsDisplay.setMap(self.map);
                        } else {
                            alert("Directions Request from " + start.toUrlValue(6) + " to " + end.toUrlValue(6) + " failed: " + status);
                        }
                    });
                });
            }, 3000);
            startMarker.addListener('click', function () {
                var requestData = {
                    origin: startMarker.getPosition(),
                    destination: end,
                    travelMode: google.maps.TravelMode.DRIVING
                };
                self.directionsService.route(requestData, function (response, status) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        self.directionsDisplay.setDirections(response);
                        self.directionsDisplay.setMap(self.map);
                    } else {
                        alert("Directions Request from " + start.toUrlValue(6) + " to " + end.toUrlValue(6) + " failed: " + status);
                    }
                });
            });
            var endMarker = new google.maps.Marker({
                position: end,
                map: self.map,
                draggable: true,
                icon: {
                    url: "/images/icons/pin_black.png",
                    setOpacity: 0.2,
                    scaledSize: new google.maps.Size(35, 35)
                },
            });
            endMarker.addListener('mouseover', function () {
                GetDec(start, end, vehicle);
                setTimeout(function () {
                    self.infoWindows.setContent(
                        `<div id='map_content'>
                            <p><b>vehicle distance: </b>${self.D1 ==null ? "":self.D1.distance.text }</p>
                            <p><b>Total Distance:  </b>${self.D2 ==null ? "":self.D2.distance.text } </p>
                        </div>`
                    );
                }, 1500);
                self.infoWindows.open(self.map, endMarker);
            });
            var bounds = new google.maps.LatLngBounds();
            bounds.extend(start);
            bounds.extend(end);
            self.map.fitBounds(bounds);
            var vehicleData = {
                origin: vehicle,
                destination: end,
                travelMode: google.maps.TravelMode.DRIVING
            };
            var requestData = {
                origin: start,
                destination: end,
                travelMode: google.maps.TravelMode.DRIVING
            };
            self.directionsService.route(requestData, function (response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    self.directionsDisplay.setDirections(response);
                    self.directionsDisplay.setMap(self.map);
                } else {
                    alert("Directions Request from " + start.toUrlValue(6) + " to " + end.toUrlValue(6) + " failed: " + status);
                }
            });

            function GetDec(startData, endData, vehicleData) {
                var service = new google.maps.DistanceMatrixService();
                service.getDistanceMatrix({
                    origins: [startData],
                    destinations: [endData],
                    travelMode: google.maps.TravelMode.DRIVING,
                    unitSystem: google.maps.UnitSystem.METRIC
                }, callback);

                function callback(response) {
                    self.D2 = response.rows[0].elements[0];
                }
                service.getDistanceMatrix({
                    origins: [vehicle],
                    destinations: [endData],
                    travelMode: google.maps.TravelMode.DRIVING,
                    unitSystem: google.maps.UnitSystem.METRIC
                }, callback2);

                function callback2(response) {
                    self.D1 = response.rows[0].elements[0];
                }
            }
        },


    }
}