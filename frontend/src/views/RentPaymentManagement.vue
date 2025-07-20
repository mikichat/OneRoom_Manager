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
              :headers="filteredHeaders"
              :items="rentPayments"
              :items-per-page="5"
              class="elevation-1"
            >
              <template v-slot:item.payment_date="{ item }">
                {{ formatDate(item.payment_date) }}
              </template>
              <template v-slot:item.due_date="{ item }">
                {{ formatDate(item.due_date) }}
              </template>
              <template v-slot:top>
                <v-toolbar flat>
                  <v-toolbar-title>Rent Payment List</v-toolbar-title>
                  <v-divider class="mx-4" inset vertical></v-divider>
                  <v-spacer></v-spacer>
                  <v-btn v-if="isAdmin" color="primary" dark class="mb-2" @click="openDialog()">New Rent Payment</v-btn>
                </v-toolbar>
              </template>
              <template v-slot:item.actions="{ item }">
                <v-icon v-if="isAdmin" small class="mr-2" @click="editItem(item)">mdi-pencil</v-icon>
                <v-icon v-if="isAdmin" small @click="deleteItem(item)">mdi-delete</v-icon>
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
                <v-select
                  v-model="editedItem.contract_id"
                  :items="contracts"
                  item-title="contractDisplay"
                  item-value="id"
                  label="Contract"
                ></v-select>
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
import { useStore } from 'vuex'; // useStore import 추가
import apiClient from '../api';

const store = useStore(); // store 초기화

const rentPayments = ref([]);
const contracts = ref([]); // 계약 목록을 저장할 ref 추가
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

const baseHeaders = [
  { title: 'Room Number', key: 'contract.room.room_number' }, // 호실 번호 추가
  { title: 'Tenant Name', key: 'contract.tenant.name' },     // 임차인 이름 추가
  { title: 'Payment Date', key: 'payment_date' },
  { title: 'Amount', key: 'amount' },
  { title: 'Payment Method', key: 'payment_method' },
  { title: 'Payment Status', key: 'payment_status' },
  { title: 'Due Date', key: 'due_date' },
];

const filteredHeaders = computed(() => {
  if (isAdmin.value) {
    return [...baseHeaders, { title: 'Actions', key: 'actions', sortable: false }];
  } else {
    return baseHeaders;
  }
});

const isAdmin = computed(() => {
  return store.state.auth.user && store.state.auth.user.role === 'admin';
});

const formTitle = computed(() => {
  return editedIndex.value === -1 ? 'New Rent Payment' : 'Edit Rent Payment';
});

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const fetchRentPayments = async () => {
  try {
    const response = await apiClient.get('/rent-payments');
    rentPayments.value = response.data;
  } catch (error) {
    console.error('Error fetching rent payments:', error);
  }
};

const fetchContracts = async () => {
  try {
    const response = await apiClient.get('/contracts');
    contracts.value = response.data.map(contract => ({
      ...contract,
      contractDisplay: `Room: ${contract.room.room_number}, Tenant: ${contract.tenant.name}, Rent: ${contract.monthly_rent}`
    }));
  } catch (error) {
    console.error('Error fetching contracts:', error);
  }
};

const openDialog = (item) => {
  editedIndex.value = rentPayments.value.indexOf(item);
  editedItem.value = item ? { ...item } : { ...defaultItem };
  // 날짜 필드를 YYYY-MM-DD 형식으로 변환
  if (editedItem.value.payment_date) {
    editedItem.value.payment_date = new Date(editedItem.value.payment_date).toISOString().substr(0, 10);
  }
  if (editedItem.value.due_date) {
    editedItem.value.due_date = new Date(editedItem.value.due_date).toISOString().substr(0, 10);
  }
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
      await apiClient.put(`/rent-payments/${editedItem.value.id}`, editedItem.value);
    } else {
      // Create new item
      await apiClient.post('/rent-payments', editedItem.value);
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
      await apiClient.delete(`/rent-payments/${item.id}`);
      fetchRentPayments(); // Refresh list
    } catch (error) {
      console.error('Error deleting rent payment:', error);
    }
  }
};

onMounted(() => {
  fetchRentPayments();
  fetchContracts(); // 계약 목록도 가져오도록 추가
});
</script>
