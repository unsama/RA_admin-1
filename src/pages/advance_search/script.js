import firebase from 'firebase'
import _ from 'lodash'
import moment from 'moment'

import tableComp from '../../partials/components/html_utils/tabel_comp.vue'

export default {
    components: {
        table_comp: tableComp
    },
    mounted() {
        const self = this

        self.mounted_async();
    },
    methods: {
        dateFormat(ms) {
            return moment(ms).format("hh:mm A, DD/MMM/YYYY")
        },
        async mounted_async() {
            const self = this

            const snap = await self.addaListRef.once('value')
            let grabAdda = []
            await Promise.all(_.map(snap.val(), async (row, key) => {
                grabAdda.push({ value: row.id, title: row.place_name })
            }))
            self.asyncData.addaListData = grabAdda
        },
        async search_users() {
            const self = this
            const db = firebase.database();

            let dataSnap = await db.ref(self.sel_table).once('value')

            let grab_map_data = []
            await Promise.all(_.map(dataSnap.val(), async (row, key) => {
                let render = row
                render['id'] = key

                grab_map_data.push(render)
            }))

            let grabSearchField = {}
            if (self.table_list[self.sel_table].fields) {
                for (let field of self.table_list[self.sel_table].fields) {
                    if (field.sel_value !== "") {
                        grabSearchField[field.id] = field.sel_value
                    }
                }
            }
            let grabFilterData = await _.filter(grab_map_data, grabSearchField);

            let tableSet = {
                thead: [],
                tbody: grabFilterData
            }
            // Data template
            if (self.table_list[self.sel_table].data_template) {
                for (let d_temp_val of self.table_list[self.sel_table].data_template) {
                    tableSet['thead'].push(d_temp_val.thead)
                }

                let mapData = []
                await Promise.all(_.map(grabFilterData, async (row, key) => {
                    let item = {}
                    await Promise.all(_.map(self.table_list[self.sel_table].data_template, async (d_temp_val) => {
                        if (d_temp_val.hasOwnProperty('field')) {
                            item[d_temp_val.field] = row[d_temp_val.field]
                            if (d_temp_val.hasOwnProperty('ref')) {
                                let adda = _.find(self.asyncData[d_temp_val.ref], { value: row[d_temp_val.field] })
                                if (adda) {
                                    item[d_temp_val.field] = adda.title
                                }
                            }
                        }
                    }))
                    mapData.push(item)
                }))

                tableSet['tbody'] = mapData
            }

            self.searchResult = tableSet
            self.searchHit = true

        },
        async search_requests() {
            const self = this
            const db = firebase.database();

            let dataSnap = await db.ref(self.sel_table).once('value')

            let grab_map_data = []
            await Promise.all(_.map(dataSnap.val(), async (row_1, key_1) => {
                await Promise.all(_.map(row_1, async (row_2) => {
                    let render = row_2
                    render['uid'] = key_1
                    render['createdAt'] = self.dateFormat(row_2.createdAt)
                    render['canceledAt'] = (row_2.canceledAt) ? self.dateFormat(row_2.canceledAt) : ''

                    grab_map_data.push(render)
                }))
            }))
            let grabSearchField = {}
            if (self.table_list[self.sel_table].fields) {
                for (let field of self.table_list[self.sel_table].fields) {
                    if (field.sel_value !== "") {
                        grabSearchField[field.id] = field.sel_value
                    }
                }
            }
            let grabFilterData = await _.filter(grab_map_data, grabSearchField);

            let tableSet = {
                thead: [],
                tbody: grabFilterData
            }
            // Data template
            if (self.table_list[self.sel_table].data_template) {
                for (let d_temp_val of self.table_list[self.sel_table].data_template) {
                    tableSet['thead'].push(d_temp_val.thead)
                }

                let mapData = []
                await Promise.all(_.map(grabFilterData, async (row, key) => {
                    let item = {}
                    await Promise.all(_.map(self.table_list[self.sel_table].data_template, async (d_temp_val) => {
                        if (d_temp_val.hasOwnProperty('field')) {
                            item[d_temp_val.field] = row[d_temp_val.field]
                        }
                    }))
                    mapData.push(item)
                }))

                tableSet['tbody'] = mapData
            }

            self.searchResult = tableSet
            self.searchHit = true

        },
        async search_bids() {
            const self = this
            const db = firebase.database();

            let dataSnap = await db.ref(self.sel_table).once('value')
            
            let grab_map_data = []
            await Promise.all(_.map(dataSnap.val(), async (row_1, key_1) => {
                await Promise.all(_.map(row_1, async (row_2, key_2) => {
                    let render = row_2
                    render['req_id'] = key_1
                    render['driver_id'] = key_2
                    render['first_bid_time'] = self.dateFormat(row_2.first_bid_time)

                    grab_map_data.push(render)
                }))
            }))

            let grabSearchField = {}
            if (self.table_list[self.sel_table].fields) {
                for (let field of self.table_list[self.sel_table].fields) {
                    if (field.sel_value !== "") {
                        grabSearchField[field.id] = field.sel_value
                    }
                }
            }
            let grabFilterData = await _.filter(grab_map_data, grabSearchField);
            
            let tableSet = {
                thead: [],
                tbody: grabFilterData
            }
            // Data template
            if (self.table_list[self.sel_table].data_template) {
                for (let d_temp_val of self.table_list[self.sel_table].data_template) {
                    tableSet['thead'].push(d_temp_val.thead)
                }

                let mapData = []
                await Promise.all(_.map(grabFilterData, async (row, key) => {
                    let item = {}
                    await Promise.all(_.map(self.table_list[self.sel_table].data_template, async (d_temp_val) => {
                        if (d_temp_val.hasOwnProperty('field')) {
                            item[d_temp_val.field] = row[d_temp_val.field]
                        }
                    }))
                    mapData.push(item)
                }))

                tableSet['tbody'] = mapData
            }

            self.searchResult = tableSet
            self.searchHit = true
            
        },
        async search_table() {
            const self = this;
            if (self.sel_table === "users") {
                self.search_users()
            } else if (self.sel_table === "user_requests") {
                self.search_requests()
            } else if (self.sel_table === "driver_bids") {
                self.search_bids()
            }
        }
    },
    data() {
        const db = firebase.database();
        return {
            usersRef: db.ref("users"),
            addaListRef: db.ref("adda_list"),

            asyncData: {
                addaListData: [],
            },


            table_list: {
                'users': {
                    name: "Users",
                    fields: [
                        {
                            label: 'Select Type',
                            tag_type: 'select',
                            id: 'type',
                            sel_value: '',
                            options: [
                                { value: 'driver', title: 'Driver' },
                                { value: 'client', title: 'Client' }
                            ]
                        },
                        {
                            label: 'Select Status',
                            tag_type: 'select',
                            id: 'status',
                            sel_value: '',
                            options: [
                                { value: 1, title: 'Activate User' },
                                { value: 0, title: 'Deactivate User' }
                            ]
                        },
                        {
                            label: 'Select Block',
                            tag_type: 'select',
                            id: 'blocked',
                            sel_value: '',
                            options: [
                                { value: true, title: 'Blocked User' },
                                { value: false, title: 'Unblocked User' }
                            ]
                        },
                        {
                            label: 'Select Offline Status',
                            tag_type: 'select',
                            id: 'offline',
                            sel_value: '',
                            options: [
                                { value: true, title: 'Offline Driver' },
                                { value: false, title: 'Online Driver' }
                            ]
                        },
                        {
                            label: 'Select Adda',
                            tag_type: 'select',
                            id: 'adda_ref',
                            sel_value: '',
                            ref: 'addaListData'
                        }
                    ],
                    data_template: [
                        {
                            thead: 'S.NO#'
                        },
                        {
                            thead: 'ID',
                            field: 'id'
                        },
                        {
                            thead: 'Email',
                            field: 'email'
                        },
                        {
                            thead: 'First Name',
                            field: 'first_name'
                        },
                        {
                            thead: 'Last Name',
                            field: 'last_name'
                        },
                        {
                            thead: 'Block/Unblock',
                            field: 'blocked'
                        },
                        {
                            thead: 'CNIC',
                            field: 'cnic_no'
                        },
                        {
                            thead: 'Driving License',
                            field: 'driving_license'
                        },
                        {
                            thead: 'Mobile Number',
                            field: 'mob_no'
                        },
                        {
                            thead: 'Offline',
                            field: 'offline'
                        },
                        {
                            thead: 'Status(Activate/Deactivate)',
                            field: 'status'
                        },
                        {
                            thead: 'Type',
                            field: 'type'
                        },
                        {
                            thead: 'Vehicle Make',
                            field: 'v_make'
                        },
                        {
                            thead: 'Vehicle Model Year',
                            field: 'v_model_year'
                        },
                        {
                            thead: 'Vehicle Number',
                            field: 'v_number'
                        },
                        {
                            thead: 'Vehicle Owner',
                            field: 'v_owner'
                        },
                        {
                            thead: 'Vehicle Type',
                            field: 'vehicle'
                        },
                        {
                            thead: 'Adda',
                            field: 'adda_ref',
                            ref: 'addaListData'
                        }
                    ]
                },
                'user_requests': {
                    name: "Requests",
                    fields: [],
                    data_template: [
                        {
                            thead: 'S.NO#'
                        },
                        {
                            thead: 'ID',
                            field: 'id'
                        },
                        {
                            thead: 'Origin',
                            field: 'orgText'
                        },
                        {
                            thead: 'Destination',
                            field: 'desText'
                        },
                        {
                            thead: 'Distance Est.',
                            field: 'disText'
                        },
                        {
                            thead: 'Duration Est.',
                            field: 'durText'
                        },
                        {
                            thead: 'Floors',
                            field: 'floors'
                        },
                        {
                            thead: 'Labours',
                            field: 'labours'
                        },
                        {
                            thead: 'Vechile Required',
                            field: 'vecType'
                        },
                        {
                            thead: 'Created Time',
                            field: 'createdAt'
                        },
                        {
                            thead: 'Canceled Time',
                            field: 'canceledAt'
                        }
                    ]
                },
                'driver_bids': {
                    name: "Bids",
                    fields: [],
                    data_template: [
                        {
                            thead: 'S.NO#'
                        },
                        {
                            thead: 'Request ID',
                            field: 'req_id'
                        },
                        {
                            thead: 'Amount',
                            field: 'amount'
                        },
                        {
                            thead: 'First Bid Time',
                            field: 'first_bid_time'
                        },
                        {
                            thead: 'Driver ID',
                            field: 'driver_id'
                        }
                    ]
                }
            },
            sel_table: '',
            searchResult: [],
            searchHit: false
        }
    }
}