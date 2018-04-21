import firebase from 'firebase'
import _ from 'lodash'

export default {
    mounted () {
        const self = this

        self.mounted_async();
    },
    methods: {
        async mounted_async() {
            const self = this

            const snap = await self.addaListRef.once('value')
            await Promise.all(_.map(async (row, key) => {
                console.log(row)
            }))
        }
    },
    data() {
        const db = firebase.database();
        return {
            usersRef: db.ref("users"),
            addaListRef: db.ref("adda_list"),

            asyncData: {
                addaListData: {},
            },
            

            table_list: {
                'users': {
                    name: "Users",
                    fields: [
                        {
                            label: 'Select Type',
                            tag_type: 'select',
                            id: 'sel_acc_type',
                            sel_value: '',
                            options: [
                                { value: 'driver', title: 'Driver' },
                                { value: 'client', title: 'Client' }
                            ]
                        },
                        {
                            label: 'Select Status',
                            tag_type: 'select',
                            id: 'sel_status_type',
                            sel_value: '',
                            options: [
                                { value: '1', title: 'Activate User' },
                                { value: '0', title: 'Deactivate User' }
                            ]
                        },
                        {
                            label: 'Select Adda',
                            tag_type: 'select',
                            id: 'sel_adda',
                            sel_value: '',
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
            sel_table: ''
        }
    }
}