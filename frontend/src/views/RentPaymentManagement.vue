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
              :items="filteredRentPayments"
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
                  <v-text-field
                    v-model="search"
                    label="Search"
                    single-line
                    hide-details
                    density="compact"
                    class="mx-4"
                  ></v-text-field>
                  <v-select
                    v-model="statusFilter"
                    :items="statusOptions"
                    label="Filter by Status"
                    clearable
                    single-line
                    hide-details
                    density="compact"
                    class="mx-4"
                  ></v-select>
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
        <v-form ref="form">
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
                  :rules="[rules.required]"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="editedItem.payment_date"
                  label="Payment Date"
                  type="date"
                  :rules="[rules.required]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="editedItem.amount"
                  label="Amount"
                  :rules="[rules.required, rules.number]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-select
                  v-model="editedItem.payment_method"
                  :items="['현금', '계좌이체', '카드']"
                  label="Payment Method"
                  :rules="[rules.required]"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-select
                  v-model="editedItem.payment_status"
                  :items="['완료', '미납', '연체']"
                  label="Payment Status"
                  :rules="[rules.required]"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="editedItem.due_date"
                  label="Due Date"
                  type="date"
                  :rules="[rules.required]"
                ></v-text-field>
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
        </v-form>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="snackbar.timeout">
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn color="white" text @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import apiClient from '../api';

const store = useStore();

const rentPayments = ref([]);
const contracts = ref([]);
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

const search = ref(''); // 검색어 ref 추가
const statusFilter = ref(null); // 상태 필터 ref 추가
const statusOptions = ['완료', '미납', '연체']; // 상태 필터 옵션

const snackbar = ref({
  show: false,
  message: '',
  color: '',
  timeout: 3000,
});

const form = ref(null); // v-form 참조를 위한 ref

const rules = {
  required: value => !!value || '필수 항목입니다.',
  number: value => !isNaN(parseFloat(value)) && isFinite(value) || '숫자만 입력해주세요.',
};

const baseHeaders = [
  { title: 'Room Number', key: 'contract.room.room_number', sortable: true, filterable: true }, // 정렬 및 필터링 가능하도록 수정
  { title: 'Tenant Name', key: 'contract.tenant.name', sortable: true, filterable: true },     // 정렬 및 필터링 가능하도록 수정
  { title: 'Payment Date', key: 'payment_date', sortable: true },
  { title: 'Amount', key: 'amount', sortable: true },
  { title: 'Payment Method', key: 'payment_method', sortable: true, filterable: true },
  { title: 'Payment Status', key: 'payment_status', sortable: true, filterable: true },
  { title: 'Due Date', key: 'due_date', sortable: true },
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

const filteredRentPayments = computed(() => {
  let filtered = rentPayments.value;

  if (statusFilter.value) {
    filtered = filtered.filter(payment => payment.payment_status === statusFilter.value);
  }

  if (search.value) {
    const searchTerm = search.value.toLowerCase();
    filtered = filtered.filter(payment => 
      payment.contract.room.room_number.toLowerCase().includes(searchTerm) ||
      payment.contract.tenant.name.toLowerCase().includes(searchTerm) ||
      payment.payment_method.toLowerCase().includes(searchTerm) ||
      payment.payment_status.toLowerCase().includes(searchTerm) ||
      payment.memo.toLowerCase().includes(searchTerm)
    );
  }

  return filtered;
});

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
  // 폼 유효성 검사 초기화
  if (form.value) {
    form.value.resetValidation();
  }
};

const saveItem = async () => {
  // 폼 유효성 검사
  const { valid } = await form.value.validate();
  if (!valid) return;

  try {
    if (editedIndex.value > -1) {
      // Update item
      await apiClient.put(`/rent-payments/${editedItem.value.id}`, editedItem.value);
      snackbar.value = { show: true, message: '월세 납부 내역이 성공적으로 업데이트되었습니다.', color: 'success' };
    } else {
      // Create new item
      await apiClient.post('/rent-payments', editedItem.value);
      snackbar.value = { show: true, message: '월세 납부 내역이 성공적으로 추가되었습니다.', color: 'success' };
    }
    closeDialog();
    fetchRentPayments(); // Refresh list
  } catch (error) {
    console.error('Error saving rent payment:', error);
    snackbar.value = { show: true, message: `월세 납부 내역 저장 중 오류가 발생했습니다: ${error.message}`, color: 'error' };
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
      snackbar.value = { show: true, message: '월세 납부 내역이 성공적으로 삭제되었습니다.', color: 'success' };
    } catch (error) {
      console.error('Error deleting rent payment:', error);
      snackbar.value = { show: true, message: `월세 납부 내역 삭제 중 오류가 발생했습니다: ${error.message}`, color: 'error' };
    }
  }
};

onMounted(() => {
  fetchRentPayments();
  fetchContracts(); // 계약 목록도 가져오도록 추가
});
</script>
