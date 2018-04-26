import firebase from 'firebase'
import _ from 'lodash'

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
        async mounted_async() {
            const self = this

            const snap = await self.addaListRef.once('value')
            let grabAdda = []
            await Promise.all(_.map(snap.val(), async (row, key) => {
                grabAdda.push({ value: row.id, title: row.place_name })
            }))
            self.asyncData.addaListData = grabAdda
        },
        async search_table() {
            const db = firebase.database();
            const self = this;
            let dataSnap = await db.ref(self.sel_table).once('value')

            let grabSearchField = {}
            if (self.table_list[self.sel_table].fields) {
                for (let field of self.table_list[self.sel_table].fields) {
                    if (field.sel_value !== "") {
                        grabSearchField[field.id] = field.sel_value
                    }
                }
            }
            let grabFilterData = await _.filter(dataSnap.val(), grabSearchField);

            let tableSet = {
                thead: [],
                tbody: grabFilterData
            }
            if (self.table_list[self.sel_table].data_template) {
                for (let d_temp_val of self.table_list[self.sel_table].data_template) {
                    tableSet['thead'].push(d_temp_val.thead)
                }

                let mapData = []
                await Promise.all(_.map(grabFilterData, async (row, key) => {
                    let item = {}
                    await Promise.all(_.map(self.table_list[self.sel_table].data_template, async (d_temp_val) => {
                        item[d_temp_val.field] = row[d_temp_val.field]
                        if (d_temp_val.hasOwnProperty('ref')) {
                            let adda = _.find(self.asyncData[d_temp_val.ref], {value: row[d_temp_val.field]})
                            if(adda) {
                                item[d_temp_val.field] = adda.title
                            }
                        }
                    }))
                    mapData.push(item)
                }))


                tableSet['tbody'] = mapData
            }



            self.searchResult = tableSet
            self.searchHit = true
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
                            label: 'Select Adda',
                            tag_type: 'select',
                            id: 'adda_ref',
                            sel_value: '',
                            ref: 'addaListData'
                        }
                    ],
                    data_template: [
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
                    fields: []
                },
                'driver_bids': {
                    name: "Bids",
                    fields: []
                },
                'adda_list': {
                    name: "Adda",
                    fields: []
                }
            },
            sel_table: '',
            searchResult: [],
            searchHit: false
        }
    }
}