<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4">Rent Payment Management</h1>
      </v-col>
      <v-col cols="12">
        <v-card>
          <v-card-title>Rent Payments</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="rentPayments"
              :items-per-page="5"
              class="elevation-1"
            >
              <template v-slot:top>
                <v-toolbar flat>
                  <v-toolbar-title>Rent Payment List</v-toolbar-title>
                  <v-divider class="mx-4" inset vertical></v-divider>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" dark class="mb-2" @click="openDialog()">New Rent Payment</v-btn>
                </v-toolbar>
              </template>
              <template v-slot:item.actions="{ item }">
                <v-icon small class="mr-2" @click="editItem(item)">mdi-pencil</v-icon>
                <v-icon small @click="deleteItem(item)">mdi-delete</v-icon>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ formTitle }}</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="editedItem.contract_id" label="Contract ID"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="editedItem.payment_date" label="Payment Date" type="date"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="editedItem.amount" label="Amount"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-select
                  v-model="editedItem.payment_method"
                  :items="['현금', '계좌이체', '카드']"
                  label="Payment Method"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-select
                  v-model="editedItem.payment_status"
                  :items="['완료', '미납', '연체']"
                  label="Payment Status"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="editedItem.due_date" label="Due Date" type="date"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="editedItem.memo" label="Memo"></v-textarea>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDialog">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="saveItem">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const rentPayments = ref([]);
const dialog = ref(false);
const editedIndex = ref(-1);
const editedItem = ref({
  contract_id: '',
  payment_date: '',
  amount: '',
  payment_method: '',
  payment_status: '',
  due_date: '',
  memo: '',
});
const defaultItem = {
  contract_id: '',
  payment_date: '',
  amount: '',
  payment_method: '',
  payment_status: '',
  due_date: '',
  memo: '',
};

const headers = [
  { title: 'Contract ID', key: 'contract_id' },
  { title: 'Payment Date', key: 'payment_date' },
  { title: 'Amount', key: 'amount' },
  { title: 'Payment Method', key: 'payment_method' },
  { title: 'Payment Status', key: 'payment_status' },
  { title: 'Due Date', key: 'due_date' },
  { title: 'Actions', key: 'actions', sortable: false },
];

const formTitle = computed(() => {
  return editedIndex.value === -1 ? 'New Rent Payment' : 'Edit Rent Payment';
});

const fetchRentPayments = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/rent-payments');
    rentPayments.value = response.data;
  } catch (error) {
    console.error('Error fetching rent payments:', error);
  }
};

const openDialog = (item) => {
  editedIndex.value = rentPayments.value.indexOf(item);
  editedItem.value = item ? { ...item } : { ...defaultItem };
  dialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
  editedIndex.value = -1;
  editedItem.value = { ...defaultItem };
};

const saveItem = async () => {
  try {
    if (editedIndex.value > -1) {
      // Update item
      await axios.put(`http://localhost:3000/api/rent-payments/${editedItem.value.id}`, editedItem.value);
    } else {
      // Create new item
      await axios.post('http://localhost:3000/api/rent-payments', editedItem.value);
    }
    closeDialog();
    fetchRentPayments(); // Refresh list
  } catch (error) {
    console.error('Error saving rent payment:', error);
  }
};

const editItem = (item) => {
  openDialog(item);
};

const deleteItem = async (item) => {
  if (confirm('Are you sure you want to delete this item?')) {
    try {
      await axios.delete(`http://localhost:3000/api/rent-payments/${item.id}`);
      fetchRentPayments(); // Refresh list
    } catch (error) {
      console.error('Error deleting rent payment:', error);
    }
  }
};

onMounted(fetchRentPayments);
</script>
