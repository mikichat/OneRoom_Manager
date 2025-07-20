<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4">계약 관리</h1>
      </v-col>
      <v-col cols="12">
        <v-card>
          <v-card-title>계약</v-card-title>
          <v-card-text>
            <v-row class="align-center mb-4">
              <v-col cols="12" sm="4">
                <v-select
                  v-model="statusFilter"
                  :items="['전체', '활성', '만료', '해지']"
                  label="상태 필터"
                  dense
                  outlined
                  hide-details
                ></v-select>
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="searchQuery"
                  label="호실 또는 임차인 검색"
                  dense
                  outlined
                  clearable
                  hide-details
                  @keyup.enter="fetchContracts"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="2">
                  <v-btn @click="fetchContracts">검색</v-btn>
              </v-col>
              <v-col cols="12" sm="2" class="d-flex justify-end align-center">
                <v-btn color="green" dark class="mr-2" @click="downloadExcelData" :loading="loading">엑셀 다운로드</v-btn>
                <input type="file" ref="excelUploadInput" style="display: none;" @change="handleFileUpload" accept=".xlsx, .xls" />
                <v-btn color="blue" dark @click="triggerFileUpload" :loading="loading">엑셀 업로드</v-btn>
              </v-col>
            </v-row>
            <v-data-table
              :headers="filteredHeaders"
              :items="contracts"
              :items-per-page="5"
              class="elevation-1"
            >
              <template v-slot:top>
                <v-toolbar flat>
                  <v-toolbar-title>계약 목록</v-toolbar-title>
                  <v-divider class="mx-4" inset vertical></v-divider>
                  <v-spacer></v-spacer>
                  <v-btn v-if="isAdmin" color="primary" dark class="mb-2" @click="openDialog()">새 계약</v-btn>
                </v-toolbar>
              </template>
              <template v-slot:item.contract_image_path="{ item }">
                <a :href="`http://localhost:3000/${item.contract_image_path}`" target="_blank" v-if="item.contract_image_path">
                  <v-icon>mdi-file-document</v-icon>
                </a>
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
              <v-col cols="12" sm="6">
                <v-autocomplete
                  v-model="editedItem.room_id"
                  :items="rooms"
                  item-title="room_number"
                  item-value="id"
                  label="호실 선택"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" sm="6">
                <v-autocomplete
                  v-model="editedItem.tenant_id"
                  :items="tenants"
                  item-title="name"
                  item-value="id"
                  label="임차인 선택"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="editedItem.contract_start_date" label="계약 시작일" type="date"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="editedItem.contract_end_date" label="계약 종료일" type="date"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="editedItem.monthly_rent" label="월세" type="number"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="editedItem.deposit" label="보증금" type="number"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-file-input v-model="contractImage" label="계약서 이미지" prepend-icon="mdi-paperclip" clearable @change="onFileChange"></v-file-input>
                <v-img :src="imageUrl" v-if="imageUrl" height="200px" class="mt-2"></v-img>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedItem.contract_status"
                  :items="['활성', '만료', '해지']"
                  label="계약 상태"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="editedItem.special_terms" label="특약사항"></v-textarea>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDialog">취소</v-btn>
          <v-btn color="blue darken-1" text @click="saveItem">저장</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import apiClient, { downloadExcel, uploadExcel } from '../api';

const store = useStore();

const contracts = ref([]);
const rooms = ref([]);
const tenants = ref([]);
const dialog = ref(false);
const statusFilter = ref('전체');
const searchQuery = ref('');
const editedIndex = ref(-1);
const contractImage = ref([]);
const imageUrl = ref('');
const loading = ref(false);
const excelUploadInput = ref(null);
const snackbar = ref({
  show: false,
  message: '',
  color: '',
});

const editedItem = ref({
  room_id: null,
  tenant_id: null,
  contract_start_date: '',
  contract_end_date: '',
  monthly_rent: '',
  deposit: '',
  contract_image_path: '',
  contract_status: '활성',
  special_terms: '',
});
const defaultItem = {
  room_id: null,
  tenant_id: null,
  contract_start_date: '',
  contract_end_date: '',
  monthly_rent: '',
  deposit: '',
  contract_image_path: '',
  contract_status: '활성',
  special_terms: '',
};

const baseHeaders = [
  { title: '호실', key: 'room.room_number' },
  { title: '임차인', key: 'tenant.name' },
  { title: '계약 시작일', key: 'contract_start_date' },
  { title: '계약 종료일', key: 'contract_end_date' },
  { title: '월세', key: 'monthly_rent' },
  { title: '상태', key: 'contract_status' },
  { title: '계약서', key: 'contract_image_path', sortable: false },
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
  return editedIndex.value === -1 ? '새 계약' : '계약 수정';
});

const fetchContracts = async () => {
  try {
    const params = new URLSearchParams();
    if (statusFilter.value && statusFilter.value !== '전체') {
      params.append('contract_status', statusFilter.value);
    }
    if (searchQuery.value) {
      params.append('search', searchQuery.value);
    }
    const response = await apiClient.get(`/contracts?${params.toString()}`);
    contracts.value = response.data;
  } catch (error) {
    console.error('Error fetching contracts:', error);
  }
};

const fetchRooms = async () => {
  try {
    const response = await apiClient.get('/rooms');
    rooms.value = response.data;
  } catch (error) {
    console.error('Error fetching rooms:', error);
  }
};

const fetchTenants = async () => {
  try {
    const response = await apiClient.get('/tenants');
    tenants.value = response.data;
  } catch (error) {
    console.error('Error fetching tenants:', error);
  }
};

const onFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    imageUrl.value = URL.createObjectURL(file);
  } else {
    imageUrl.value = editedItem.value.contract_image_path ? `http://localhost:3000/${editedItem.value.contract_image_path}` : '';
  }
};

const openDialog = (item) => {
  editedIndex.value = contracts.value.indexOf(item);
  editedItem.value = item ? { ...item } : { ...defaultItem };
  if (editedItem.value.contract_image_path) {
    imageUrl.value = `http://localhost:3000/${editedItem.value.contract_image_path}`;
  } else {
    imageUrl.value = '';
  }
  dialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
  editedIndex.value = -1;
  editedItem.value = { ...defaultItem };
  contractImage.value = [];
  imageUrl.value = '';
};

const saveItem = async () => {
  try {
    const formData = new FormData();
    for (const key in editedItem.value) {
      if (key !== 'contract_image_path') {
        formData.append(key, editedItem.value[key]);
      }
    }
    if (contractImage.value && contractImage.value.length > 0) {
      formData.append('contract_image', contractImage.value[0]);
    }

    if (editedIndex.value > -1) {
      // Update item
      await apiClient.put(`/contracts/${editedItem.value.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      // Create new item
      await apiClient.post('/contracts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    closeDialog();
    fetchContracts(); // Refresh list
    showSnackbar('저장되었습니다.', 'success');
  } catch (error) {
    console.error('Error saving contract:', error);
    showSnackbar('저장 중 오류가 발생했습니다.', 'error');
  }
};

const editItem = (item) => {
  openDialog(item);
};

const deleteItem = async (item) => {
  if (confirm('Are you sure you want to delete this item?')) {
    try {
      await apiClient.delete(`/contracts/${item.id}`);
      fetchContracts(); // Refresh list
      showSnackbar('삭제되었습니다.', 'success');
    } catch (error) {
      console.error('Error deleting contract:', error);
      showSnackbar('삭제 중 오류가 발생했습니다.', 'error');
    }
  }
};

const downloadExcelData = async () => {
  loading.value = true;
  try {
    const response = await downloadExcel('/contracts');
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '계약_목록.xlsx');
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
    await uploadExcel('/contracts', file);
    showSnackbar('엑셀 업로드가 완료되었습니다.', 'success');
    fetchContracts(); // Refresh list after upload
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
  fetchContracts();
  fetchRooms();
  fetchTenants();
});

watch(statusFilter, fetchContracts);
</script>
