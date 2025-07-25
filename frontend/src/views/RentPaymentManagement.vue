<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4">임대료 납부 관리</h1>
      </v-col>
      <v-col cols="12">
        <v-card>
          <v-card-title>임대료 납부 내역</v-card-title>
          <v-card-text>
            <v-row class="mb-4">
              <v-col cols="12" md="6"></v-col>
              <v-col cols="12" md="6" class="d-flex justify-end align-center">
                <v-btn color="green" dark class="mr-2" @click="downloadExcelData" :loading="loading">엑셀 다운로드</v-btn>
                <input type="file" ref="excelUploadInput" style="display: none;" @change="handleFileUpload" accept=".xlsx, .xls" />
                <v-btn color="blue" dark @click="triggerFileUpload" :loading="loading">엑셀 업로드</v-btn>
              </v-col>
            </v-row>
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
                  <v-toolbar-title>임대료 납부 목록</v-toolbar-title>
                  <v-divider class="mx-4" inset vertical></v-divider>
                  <v-text-field
                    v-model="search"
                    label="검색"
                    single-line
                    hide-details
                    density="compact"
                    class="mx-4"
                  ></v-text-field>
                  <v-select
                    v-model="statusFilter"
                    :items="statusOptions"
                    label="상태별 필터"
                    clearable
                    single-line
                    hide-details
                    density="compact"
                    class="mx-4"
                  ></v-select>
                  <v-spacer></v-spacer>
                  <v-btn v-if="isAdmin" color="primary" dark class="mb-2" @click="openDialog()">새 임대료 납부</v-btn>
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
                  label="계약"
                  :rules="[rules.required]"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="editedItem.payment_date"
                  label="납부일"
                  type="date"
                  :rules="[rules.required]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="editedItem.amount"
                  label="금액"
                  :rules="[rules.required, rules.number]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-select
                  v-model="editedItem.payment_method"
                  :items="['현금', '계좌이체', '카드']"
                  label="납부 방법"
                  :rules="[rules.required]"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-select
                  v-model="editedItem.payment_status"
                  :items="['완료', '미납', '연체']"
                  label="납부 상태"
                  :rules="[rules.required]"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="editedItem.due_date"
                  label="납부 기한"
                  type="date"
                  :rules="[rules.required]"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="editedItem.memo" label="메모"></v-textarea>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDialog">취소</v-btn>
          <v-btn color="blue darken-1" text @click="saveItem">저장</v-btn>
        </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="snackbar.timeout">
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn color="white" text @click="snackbar.show = false">닫기</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import apiClient, { downloadExcel, uploadExcel } from '../api';

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

const search = ref('');
const statusFilter = ref(null);
const statusOptions = ['완료', '미납', '연체'];

const loading = ref(false);
const excelUploadInput = ref(null);

const snackbar = ref({
  show: false,
  message: '',
  color: '',
  timeout: 3000,
});

const form = ref(null);

const rules = {
  required: value => !!value || '필수 항목입니다.',
  number: value => !isNaN(parseFloat(value)) && isFinite(value) || '숫자만 입력해주세요.',
};

const baseHeaders = [
  { title: '호실', key: 'contract.room.room_number', sortable: true, filterable: true },
  { title: '세입자 이름', key: 'contract.tenant.name', sortable: true, filterable: true },
  { title: '납부일', key: 'payment_date', sortable: true },
  { title: '금액', key: 'amount', sortable: true },
  { title: '납부 방법', key: 'payment_method', sortable: true, filterable: true },
  { title: '납부 상태', key: 'payment_status', sortable: true, filterable: true },
  { title: '납부 기한', key: 'due_date', sortable: true },
];

const filteredHeaders = computed(() => {
  if (isAdmin.value) {
    return [...baseHeaders, { title: '작업', key: 'actions', sortable: false }];
  } else {
    return baseHeaders;
  }
});

const isAdmin = computed(() => {
  return store.state.auth.user && store.state.auth.user.role === 'admin';
});

const formTitle = computed(() => {
  return editedIndex.value === -1 ? '새 임대료 납부' : '임대료 납부 수정';
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
  // form 유효성 초기화
  if (form.value) {
    form.value.resetValidation();
  }
};

const fetchContracts = async () => {
  try {
    const response = await apiClient.get('/contracts');
    contracts.value = response.data.map(contract => ({
      ...contract,
      contractDisplay: `${contract.room.room_number}호 - ${contract.tenant.name}`
    }));
  } catch (error) {
    console.error('Error fetching contracts:', error);
  }
};

const saveItem = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;

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
    showSnackbar('저장되었습니다.', 'success');
  } catch (error) {
    console.error('Error saving rent payment:', error);
    showSnackbar('저장 중 오류가 발생했습니다.', 'error');
  }
};

const editItem = (item) => {
  openDialog(item);
};

const deleteItem = async (item) => {
  if (confirm('정말 이 납부 내역을 삭제하시겠습니까?')) {
    try {
      await apiClient.delete(`/rent-payments/${item.id}`);
      fetchRentPayments(); // Refresh list
      showSnackbar('삭제되었습니다.', 'success');
    } catch (error) {
      console.error('Error deleting rent payment:', error);
      showSnackbar('삭제 중 오류가 발생했습니다.', 'error');
    }
  }
};

const fetchRentPayments = async () => {
  try {
    const response = await apiClient.get('/rent-payments');
    rentPayments.value = response.data;
  } catch (error) {
    console.error('Error fetching rent payments:', error);
  }
};

const downloadExcelData = async () => {
  loading.value = true;
  try {
    const response = await downloadExcel('/rent-payments');
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '월세_납부_내역.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    showSnackbar('엑셀 다운로드가 완료되었습니다.', 'success');
  } catch (error) {
    console.error('Error downloading excel:', error);
    showSnackbar('엑셀 다운로드 중 오류가 발생했습니다.', 'error');
  } finally {
    loading.value = false;
  }
};

const triggerFileUpload = () => {
  excelUploadInput.value.click();
};

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  loading.value = true;
  try {
    await uploadExcel('/rent-payments', file);
    showSnackbar('엑셀 업로드가 완료되었습니다.', 'success');
    fetchRentPayments(); // Refresh list after upload
  } catch (error) {
    console.error('Error uploading excel:', error);
    showSnackbar('엑셀 업로드 중 오류가 발생했습니다.', 'error');
  } finally {
    loading.value = false;
    event.target.value = null; // Clear the input so the same file can be uploaded again
  }
};

const showSnackbar = (message, color) => {
  snackbar.value.message = message;
  snackbar.value.color = color;
  snackbar.value.show = true;
};

onMounted(() => {
  fetchRentPayments();
  fetchContracts();
});
</script>
