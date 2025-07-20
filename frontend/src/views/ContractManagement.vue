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
            <v-row class="align-center">
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
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import apiClient from '../api';

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
    
    // Append all keys from editedItem to formData
    for (const key in editedItem.value) {
      // Ensure that we append a value, even if it is null or empty
      if (editedItem.value[key] !== null && editedItem.value[key] !== undefined) {
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
  } catch (error) {
    console.error('Error saving contract:', error);
  }
};

const onFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    imageUrl.value = URL.createObjectURL(file);
  } else {
    imageUrl.value = '';
  }
};

const deleteItem = async (item) => {
  if (confirm('Are you sure you want to delete this item?')) {
    try {
      await apiClient.delete(`/contracts/${item.id}`);
      fetchContracts(); // Refresh list
    } catch (error) {
      console.error('Error deleting contract:', error);
    }
  }
};

const exportToExcel = () => {
  const data = contracts.value.map(contract => ({
    호실: contract.room ? contract.room.room_number : '',
    임차인: contract.tenant ? contract.tenant.name : '',
    계약시작일: contract.contract_start_date,
    계약종료일: contract.contract_end_date,
    월세: contract.monthly_rent,
    보증금: contract.deposit,
    계약상태: contract.contract_status,
    특약사항: contract.special_terms,
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '계약 목록');
  XLSX.writeFile(wb, '계약_목록.xlsx');
};

onMounted(() => {
  fetchContracts();
  fetchRooms();
  fetchTenants();
});

watch(statusFilter, fetchContracts);
</script>
